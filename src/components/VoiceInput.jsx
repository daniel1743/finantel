import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import customSupabaseClient from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/utils';

const VoiceInput = ({ onTransactionCreated, userId, currency = 'USD' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
      setStatus('recording');

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
      if (!userId) {
        throw new Error('No se detectó el usuario actual.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Falta configurar VITE_SUPABASE_URL.');
      }

      // Construir FormData con el audio sin transformar
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('userId', userId);

      // Adjuntar token del usuario autentificado
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
      setStatus('success');

      toast({
        title: '✅ Gasto agregado',
        description: `"${data.transcript}" → ${formatCurrency(data.transaction?.amount || 0, currency)}`,
      });

      if (onTransactionCreated && data.transaction) {
        onTransactionCreated(data.transaction);
      }

      setTimeout(() => {
        setStatus('idle');
        setTranscript('');
      }, 3000);

    } catch (error) {
      console.error('Error procesando audio:', error);

      setStatus('error');
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      setTimeout(() => setStatus('idle'), 3000);

    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div whileTap={{ scale: 0.95 }} className="relative">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            w-14 h-14 rounded-2xl relative overflow-hidden
            ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1C8FA0] hover:bg-[#167a8a]'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isRecording && (
            <motion.div
              className="absolute inset-0 bg-red-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          <div className="relative z-10">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : isRecording ? (
              <Square className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </div>
        </Button>
      </motion.div>

      <p className="text-[11px] font-semibold text-[#1a1a1a] dark:text-gray-200">Gasto por voz</p>

      {/* Mensajes visuales */}
      <AnimatePresence mode="wait">
        {status === 'recording' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm font-semibold text-red-500">Grabando...</p>
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm font-semibold text-[#1C8FA0]">Procesando...</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm font-semibold text-emerald-500">¡Listo!</p>
            {transcript && <p className="text-xs text-gray-600 mt-1">"{transcript}"</p>}
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm font-semibold text-red-500">Error, intenta de nuevo</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
