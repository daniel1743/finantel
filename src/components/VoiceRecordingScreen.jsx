import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import customSupabaseClient from '@/lib/customSupabaseClient';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import {
  playStartRecordingSound,
  playStopRecordingSound,
  playSuccessSound,
  playErrorSound
} from '@/utils/audioEffects';

/**
 * Pantalla completa de grabación de voz
 * Estilo ChatGPT/Gemini con ondas de audio animadas
 */
const VoiceRecordingScreen = ({ isOpen, onClose, onTransactionCreated, userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [stream, setStream] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { toast } = useToast();

  // Hook para visualización de audio
  const audioData = useAudioVisualizer(stream, isRecording);

  // Auto-iniciar grabación al abrir
  useEffect(() => {
    if (isOpen && !isRecording) {
      startRecording();
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);

      const mediaRecorder = new MediaRecorder(mediaStream, {
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
        mediaStream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // 🔊 Reproducir sonido de inicio
      playStartRecordingSound();

    } catch (error) {
      console.error('Error al acceder al micrófono:', error);

      // 🔊 Reproducir sonido de error
      playErrorSound();

      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono.",
        variant: "destructive",
      });
      onClose();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);

      // 🔊 Reproducir sonido de detención
      playStopRecordingSound();
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      if (!userId) {
        throw new Error('No se detectó el usuario actual.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Falta configurar VITE_SUPABASE_URL.');
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('userId', userId);

      const {
        data: { session },
      } = await customSupabaseClient.auth.getSession();

      const headers = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/voice-to-transaction`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const payloadText = await response.text();
      const data = payloadText ? JSON.parse(payloadText) : null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'No se pudo procesar el audio');
      }

      setTranscript(data.transcript);

      // 🔊 Reproducir sonido de éxito
      playSuccessSound();

      const currencySymbol = data.currency === 'CLP' || data.currency === 'COP' ? '$' : data.currency;

      toast({
        title: '✅ Gasto agregado',
        description: `${currencySymbol}${data.transaction?.amount?.toLocaleString?.()} • ${data.parsed?.description}`,
      });

      if (onTransactionCreated && data.transaction) {
        onTransactionCreated(data.transaction);
      }

      // Cerrar después de 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error procesando audio:', error);

      // 🔊 Reproducir sonido de error
      playErrorSound();

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      setTimeout(() => {
        onClose();
      }, 2000);

    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Fondo con gradiente animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#1C8FA0]/20 via-[#6E56CF]/20 to-[#E47B45]/20"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(28,143,160,0.2) 0%, rgba(110,86,207,0.2) 50%, rgba(228,123,69,0.2) 100%)',
              'linear-gradient(135deg, rgba(110,86,207,0.2) 0%, rgba(228,123,69,0.2) 50%, rgba(28,143,160,0.2) 100%)',
              'linear-gradient(135deg, rgba(228,123,69,0.2) 0%, rgba(28,143,160,0.2) 50%, rgba(110,86,207,0.2) 100%)',
              'linear-gradient(135deg, rgba(28,143,160,0.2) 0%, rgba(110,86,207,0.2) 50%, rgba(228,123,69,0.2) 100%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Blur backdrop */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/80 dark:bg-black/80" />

        {/* Contenido */}
        <div className="relative h-full flex flex-col items-center justify-center p-6">
          {/* Botón de cerrar */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </motion.button>

          {/* Contenedor principal */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-8">

            {/* Visualización de ondas - Mobile (pantalla completa) */}
            <div className="md:hidden w-full flex-1 flex flex-col items-center justify-center gap-8">
              {/* Ondas circulares */}
              <div className="relative w-64 h-64">
                {/* Círculo central */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#6E56CF] flex items-center justify-center"
                  animate={{
                    scale: isRecording ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isProcessing ? (
                    <Check className="w-20 h-20 text-white" />
                  ) : (
                    <Mic className="w-20 h-20 text-white" />
                  )}
                </motion.div>

                {/* Ondas circulares animadas */}
                {isRecording && audioData.map((amplitude, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0 rounded-full border-2 border-[#1C8FA0]/30"
                    animate={{
                      scale: [1, 1.3 + (amplitude * 0.5), 1],
                      opacity: [0.5, 0.2, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.15,
                    }}
                  />
                ))}
              </div>

              {/* Barras de frecuencia */}
              <div className="flex items-center justify-center gap-1 h-24">
                {audioData.slice(0, 16).map((amplitude, index) => (
                  <motion.div
                    key={index}
                    className="w-2 rounded-full bg-gradient-to-t from-[#1C8FA0] to-[#6E56CF]"
                    animate={{
                      height: isRecording ? `${20 + amplitude * 80}px` : '4px',
                    }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            </div>

            {/* Visualización de ondas - Desktop (línea horizontal) */}
            <div className="hidden md:flex w-full items-center justify-center h-32">
              <div className="flex items-center justify-center gap-2">
                {audioData.map((amplitude, index) => (
                  <motion.div
                    key={index}
                    className="w-3 rounded-full bg-gradient-to-t from-[#1C8FA0] to-[#6E56CF]"
                    animate={{
                      height: isRecording ? `${20 + amplitude * 100}px` : '4px',
                    }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            </div>

            {/* Botón central - Solo desktop */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              disabled={isProcessing}
              className="hidden md:flex w-24 h-24 bg-gradient-to-br from-[#1C8FA0] to-[#6E56CF] hover:from-[#167a8a] hover:to-[#5a44b0] rounded-full items-center justify-center shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <Check className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </motion.button>

            {/* Estado y transcripción */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isProcessing ? (
                  <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                    Procesando...
                  </p>
                ) : isRecording ? (
                  <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                    Escuchando...
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                    ¡Listo!
                  </p>
                )}
              </motion.div>

              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-6 py-4 max-w-md mx-auto"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Transcripción:
                  </p>
                  <p className="text-lg font-medium text-[#1a1a1a] dark:text-white">
                    "{transcript}"
                  </p>
                </motion.div>
              )}

              {/* Instrucciones */}
              {!transcript && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center space-y-2"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Di algo como:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-700 dark:text-gray-300">
                      "Comida 50 mil pesos"
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-700 dark:text-gray-300">
                      "Uber 15 mil"
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-700 dark:text-gray-300">
                      "Zapatos 60k"
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Botón de detener - Mobile */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                disabled={isProcessing}
                className="md:hidden w-20 h-20 bg-gradient-to-br from-[#1C8FA0] to-[#6E56CF] hover:from-[#167a8a] hover:to-[#5a44b0] rounded-full flex items-center justify-center shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all mx-auto"
              >
                {isProcessing ? (
                  <Check className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceRecordingScreen;
