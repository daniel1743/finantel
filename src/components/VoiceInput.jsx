import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import customSupabaseClient from '@/lib/customSupabaseClient';

const VoiceInput = ({ onTransactionCreated, userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle, recording, processing, success, error

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Solicitar permiso de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Crear MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Capturar chunks de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Cuando termina la grabación
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);

        // Detener el stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Iniciar grabación
      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');

      toast({
        title: "🎤 Grabando...",
        description: "Di algo como: 'Gasté 50 mil en Jumbo'",
      });

    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono. Verifica los permisos.",
        variant: "destructive",
      });
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setStatus('processing');
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      // Convertir blob a base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];

        // Llamar a la Edge Function
        const { data, error } = await customSupabaseClient.functions.invoke('voice-to-transaction', {
          body: {
            audio: base64Audio,
            userId: userId,
          }
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          setTranscript(data.transcript);
          setStatus('success');

          toast({
            title: "✅ Gasto agregado",
            description: `"${data.transcript}" → $${data.transaction.amount.toLocaleString()}`,
          });

          // Notificar al componente padre
          if (onTransactionCreated) {
            onTransactionCreated(data.transaction);
          }

          // Resetear después de 3 segundos
          setTimeout(() => {
            setStatus('idle');
            setTranscript('');
          }, 3000);
        } else {
          throw new Error(data.error || 'No se pudo procesar el audio');
        }

      };

      reader.onerror = () => {
        throw new Error('Error al leer el archivo de audio');
      };

    } catch (error) {
      console.error('Error procesando audio:', error);
      setStatus('error');
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el audio",
        variant: "destructive",
      });

      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Botón principal */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            w-20 h-20 rounded-full relative overflow-hidden
            ${isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-[#1C8FA0] hover:bg-[#167a8a]'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {/* Animación de pulso cuando está grabando */}
          {isRecording && (
            <motion.div
              className="absolute inset-0 bg-red-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Icono */}
          <div className="relative z-10">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </div>
        </Button>
      </motion.div>

      {/* Estado visual */}
      <AnimatePresence mode="wait">
        {status === 'recording' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-sm font-semibold text-red-500 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Grabando...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Presiona nuevamente para detener
            </p>
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-sm font-semibold text-[#1C8FA0]">
              Procesando...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Analizando tu mensaje
            </p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center max-w-xs"
          >
            <p className="text-sm font-semibold text-emerald-500 flex items-center gap-2 justify-center">
              <CheckCircle2 className="w-4 h-4" />
              ¡Listo!
            </p>
            {transcript && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                "{transcript}"
              </p>
            )}
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-sm font-semibold text-red-500 flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4" />
              Error
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Intenta nuevamente
            </p>
          </motion.div>
        )}

        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Agregar gasto por voz
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Di algo como "Gasté 50k en Jumbo"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
