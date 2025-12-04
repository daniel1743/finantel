import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import customSupabaseClient from '@/lib/customSupabaseClient';

const VoiceRecordingModal = ({ isOpen, onClose, onSuccess, userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const { toast } = useToast();

  // Limpiar recursos al cerrar
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar AudioContext para analizar el nivel de audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Crear MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Animar ondas de audio
      const updateAudioLevel = () => {
        if (!analyserRef.current || !isRecording) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calcular nivel promedio
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(100, (average / 255) * 100);
        setAudioLevel(normalizedLevel);
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();

      toast({
        title: "🎤 Grabando...",
        description: "Di algo como: 'Gasté 50 mil en Jumbo'",
      });
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      cleanup();
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("userId", userId);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await customSupabaseClient.auth.getSession();
      
      const headers = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/voice-to-transaction`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Error procesando audio");
      }

      toast({
        title: "✅ Gasto agregado",
        description: `"${data.transcript}"`,
      });

      if (onSuccess) {
        onSuccess(data.transaction || data);
      }

      // Cerrar modal después de 1 segundo
      setTimeout(() => {
        onClose();
        setIsProcessing(false);
        setAudioLevel(0);
      }, 1000);

    } catch (error) {
      console.error('Error procesando audio:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el audio",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-to-br from-[#1C8FA0] via-[#167a8a] to-[#0d5a66] flex items-center justify-center"
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
        >
          <Icon component={X} size="lg" color="white" />
        </button>

        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          {/* Contenido principal - Mobile: centrado, Desktop: línea horizontal */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            
            {/* Icono de micrófono */}
            <motion.div
              animate={{
                scale: isRecording ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isRecording ? Infinity : 0,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`
                  w-24 h-24 md:w-20 md:h-20 rounded-full
                  ${isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white hover:bg-gray-100'
                  }
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                  flex items-center justify-center
                  shadow-2xl transition-all duration-300
                  ${isRecording ? 'ring-4 ring-red-300 ring-opacity-50' : ''}
                `}
              >
                {isProcessing ? (
                  <Icon component={Loader2} size="md" color="white" className="md: md:  animate-spin" />
                ) : isRecording ? (
                  <Icon component={Square} size="md" color="white" className="md: md:" />
                ) : (
                  <Icon component={Mic} size="md" color="primary" className="md: md:" />
                )}
              </button>

              {/* Ondas circulares animadas - Solo en mobile */}
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:hidden">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-24 h-24 rounded-full border-2 border-white/30"
                      animate={{
                        scale: [1, 2, 2.5],
                        opacity: [0.8, 0.4, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Ondas de audio - Desktop: línea horizontal, Mobile: círculos */}
            <div className="flex items-center gap-2 md:flex-1 md:max-w-md">
              {isRecording ? (
                // Desktop: Línea de ondas horizontales
                <div className="hidden md:flex items-center justify-center gap-1 w-full h-16">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const delay = i * 0.05;
                    const baseHeight = 4;
                    const maxHeight = 40;
                    const height = baseHeight + (audioLevel / 100) * (maxHeight - baseHeight);
                    const randomVariation = Math.sin((Date.now() / 1000) + i) * 5;
                    const finalHeight = Math.max(4, height + randomVariation);
                    
                    return (
                      <motion.div
                        key={i}
                        className="bg-white rounded-full"
                        style={{ width: '4px' }}
                        animate={{
                          height: [`${finalHeight}px`, `${Math.max(4, finalHeight * 0.7)}px`, `${finalHeight}px`],
                        }}
                        transition={{
                          duration: 0.3,
                          delay,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                // Estado inicial: mensaje
                <div className="text-center md:text-left">
                  <p className="text-white text-lg md:text-xl font-semibold mb-2">
                    {isProcessing ? 'Procesando...' : 'Presiona para grabar'}
                  </p>
                  <p className="text-white/80 text-sm">
                    {isProcessing 
                      ? 'Analizando tu mensaje...' 
                      : 'Di algo como: "Gasté 50 mil en Jumbo"'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Indicador de estado - Mobile */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 md:hidden text-center"
            >
              <p className="text-white text-sm font-medium">Grabando...</p>
              <p className="text-white/60 text-xs mt-1">Toca el botón para detener</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceRecordingModal;

