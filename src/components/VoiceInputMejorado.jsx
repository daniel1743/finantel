import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import customSupabaseClient from '@/lib/customSupabaseClient';

const VoiceInput = ({ onTransactionCreated, userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const [showHelp, setShowHelp] = useState(false);

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
        description: "Di algo como: 'Comida 50 mil pesos necesario'",
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
      setStatus('success');

      const currencySymbol = data.currency === 'CLP' || data.currency === 'COP' ? '$' : data.currency;

      toast({
        title: '✅ Gasto agregado',
        description: `"${data.transcript}" → ${currencySymbol}${data.transaction?.amount?.toLocaleString?.() || ''}`,
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
    <div className="flex flex-col items-center gap-4 relative">
      {/* Botón de ayuda */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute -top-12 right-0 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
        title="Cómo usar el micrófono"
      >
        <HelpCircle className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
      </button>

      {/* Botón principal de grabación */}
      <motion.div whileTap={{ scale: 0.95 }} className="relative">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            w-16 h-16 rounded-2xl relative overflow-hidden
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
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : isRecording ? (
              <Square className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </div>
        </Button>
      </motion.div>

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
            {transcript && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">"{transcript}"</p>}
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm font-semibold text-red-500">Error, intenta de nuevo</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de ayuda */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowHelp(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                    🎤 Cómo usar el micrófono
                  </h3>
                  <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
                    Di tus gastos de forma natural
                  </p>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Formato básico */}
                <div>
                  <h4 className="font-bold text-[#1a1a1a] dark:text-white mb-2">
                    📝 Formato básico
                  </h4>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                      <span className="font-semibold text-[#1C8FA0]">"[Descripción]"</span>
                      {' '}+{' '}
                      <span className="font-semibold text-[#1C8FA0]">"[Monto]"</span>
                    </p>
                  </div>
                </div>

                {/* Ejemplos */}
                <div>
                  <h4 className="font-bold text-[#1a1a1a] dark:text-white mb-2">
                    ✅ Ejemplos correctos
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                        "Comida 50 mil pesos"
                      </p>
                      <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
                        → $50,000 • Comida • Alimentación
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                        "Uber 15 mil"
                      </p>
                      <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
                        → $15,000 • Uber • Transporte
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                        "Zapatos 60 mil pesos necesario"
                      </p>
                      <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
                        → $60,000 • Zapatos • Ropa • Esencial
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formatos de monto */}
                <div>
                  <h4 className="font-bold text-[#1a1a1a] dark:text-white mb-2">
                    💰 Formatos de monto
                  </h4>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                    <ul className="space-y-1 text-sm text-[#6E6E73] dark:text-gray-400">
                      <li>• "50 mil" → $50,000</li>
                      <li>• "50k" → $50,000</li>
                      <li>• "mil pesos" → $1,000</li>
                      <li>• "5000" → $5,000</li>
                    </ul>
                  </div>
                </div>

                {/* Nivel de necesidad */}
                <div>
                  <h4 className="font-bold text-[#1a1a1a] dark:text-white mb-2">
                    🎯 Nivel de necesidad (opcional)
                  </h4>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                    <ul className="space-y-2 text-sm text-[#6E6E73] dark:text-gray-400">
                      <li>
                        <span className="font-semibold text-emerald-600">• "necesario"</span> o{' '}
                        <span className="font-semibold text-emerald-600">"esencial"</span>
                        {' '}→ Gastos básicos
                      </li>
                      <li>
                        <span className="font-semibold text-amber-600">• "importante"</span>
                        {' '}→ Gastos importantes
                      </li>
                      <li>
                        <span className="font-semibold text-blue-600">• "opcional"</span>
                        {' '}→ Gastos discrecionales
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Consejo */}
                <div className="bg-[#1C8FA0]/10 border border-[#1C8FA0]/20 rounded-xl p-4">
                  <p className="text-sm text-[#1a1a1a] dark:text-white">
                    <span className="font-bold">💡 Consejo:</span> Habla claro y menciona primero
                    la descripción, luego el monto. La app detectará automáticamente la categoría
                    y nivel de necesidad.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowHelp(false)}
                className="w-full mt-6 bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100"
              >
                Entendido
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
