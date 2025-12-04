import React, { useState, useRef } from 'react';
import Icon from '@/components/ui/Icon';
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
      console.log('🎤 [VoiceInput] Iniciando grabación de audio...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const startTime = Date.now();
      console.log('🎤 [VoiceInput] MediaRecorder creado:', {
        mimeType: 'audio/webm;codecs=opus',
        state: mediaRecorder.state,
        timestamp: new Date().toISOString()
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('🎤 [VoiceInput] Chunk de audio recibido:', {
            size: event.data.size,
            type: event.data.type,
            chunksAcumulados: audioChunksRef.current.length,
            tiempoGrabacion: ((Date.now() - startTime) / 1000).toFixed(2) + 's'
          });
        }
      };

      mediaRecorder.onstop = async () => {
        const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('🎤 [VoiceInput] Grabación detenida:', {
          duracion: duration + 's',
          totalChunks: audioChunksRef.current.length,
          tamañoTotal: totalSize + ' bytes',
          tamañoFormateado: (totalSize / 1024).toFixed(2) + ' KB'
        });

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('🎤 [VoiceInput] Blob de audio creado:', {
          size: audioBlob.size,
          type: audioBlob.type,
          timestamp: new Date().toISOString()
        });

        await processAudio(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');
      console.log('🎤 [VoiceInput] Grabación iniciada, estado:', mediaRecorder.state);

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
      console.log('🔄 [VoiceInput] Iniciando procesamiento de audio...');
      
      if (!userId) {
        throw new Error('No se detectó el usuario actual.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Falta configurar VITE_SUPABASE_URL.');
      }

      console.log('📤 [VoiceInput] Preparando envío a Edge Function:', {
        url: `${supabaseUrl}/functions/v1/voice-to-transaction`,
        audioSize: audioBlob.size,
        audioType: audioBlob.type,
        userId: userId,
        timestamp: new Date().toISOString()
      });

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
        console.log('🔐 [VoiceInput] Token de autenticación obtenido:', {
          tokenLength: session.access_token.length,
          hasToken: true
        });
      } else {
        console.warn('⚠️ [VoiceInput] No se obtuvo token de autenticación');
      }

      console.log('📡 [VoiceInput] Enviando audio a Edge Function...');
      const requestStartTime = Date.now();
      
      const response = await fetch(`${supabaseUrl}/functions/v1/voice-to-transaction`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const requestDuration = ((Date.now() - requestStartTime) / 1000).toFixed(2);
      console.log('📥 [VoiceInput] Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        duracion: requestDuration + 's',
        headers: Object.fromEntries(response.headers.entries())
      });

      const payloadText = await response.text();
      console.log('📄 [VoiceInput] Payload recibido (raw):', {
        length: payloadText.length,
        preview: payloadText.substring(0, 200) + (payloadText.length > 200 ? '...' : '')
      });

      const data = payloadText ? JSON.parse(payloadText) : null;
      console.log('📊 [VoiceInput] Datos parseados:', {
        success: data?.success,
        hasTranscript: !!data?.transcript,
        hasTransaction: !!data?.transaction,
        hasParsed: !!data?.parsed,
        error: data?.error
      });

      if (!response.ok || !data?.success) {
        console.error('❌ [VoiceInput] Error en la respuesta:', {
          status: response.status,
          error: data?.error,
          data: data
        });
        throw new Error(data?.error || 'No se pudo procesar el audio');
      }

      // Log detallado de la transcripción
      console.log('📝 [VoiceInput] TRANSCRIPCIÓN:', {
        textoOriginal: data.transcript,
        longitud: data.transcript?.length || 0,
        timestamp: new Date().toISOString()
      });

      // Log detallado de los datos parseados
      if (data.parsed) {
        console.log('🔍 [VoiceInput] DATOS PARSEADOS:', {
          descripcion: data.parsed.description,
          monto: data.parsed.amount,
          tipo: data.parsed.type,
          categoria: data.parsed.category,
          moneda: data.parsed.currency,
          fecha: data.parsed.date,
          metadata: data.parsed.metadata
        });
      }

      // Log detallado de la transacción creada
      if (data.transaction) {
        console.log('💾 [VoiceInput] TRANSACCIÓN GUARDADA EN BD:', {
          id: data.transaction.id,
          user_id: data.transaction.user_id,
          description: data.transaction.description,
          amount: data.transaction.amount,
          type: data.transaction.type,
          date: data.transaction.date,
          category_id: data.transaction.category_id,
          currency: data.transaction.currency,
          created_at: data.transaction.created_at,
          metadata: data.transaction.metadata
        });
      }

      // ============================================
      // RESUMEN VISUAL COMPLETO EN CONSOLA
      // ============================================
      console.log('%c' + '═'.repeat(60), 'color: #1C8FA0; font-weight: bold; font-size: 14px;');
      console.log('%c🎤 RESUMEN COMPLETO - PROCESAMIENTO DE VOZ', 'color: #1C8FA0; font-weight: bold; font-size: 16px;');
      console.log('%c' + '═'.repeat(60), 'color: #1C8FA0; font-weight: bold; font-size: 14px;');
      
      console.group('%c📝 TRANSCRIPCIÓN', 'color: #4CAF50; font-weight: bold;');
      console.log('%cTexto original:', 'color: #666; font-weight: bold;', data.transcript);
      console.log('%cLongitud:', 'color: #666; font-weight: bold;', data.transcript?.length || 0, 'caracteres');
      console.groupEnd();
      
      if (data.parsed) {
        console.group('%c🔍 DATOS PARSEADOS', 'color: #2196F3; font-weight: bold;');
        console.log('%c💰 Monto:', 'color: #FF9800; font-weight: bold; font-size: 14px;', 
          new Intl.NumberFormat('es-CL', { style: 'currency', currency: data.currency || 'CLP' }).format(data.parsed.amount));
        console.log('%c📋 Tipo:', 'color: #666; font-weight: bold;', 
          data.parsed.type === 'expense' ? '💰 Gasto' : '💵 Ingreso');
        console.log('%c📝 Descripción:', 'color: #666; font-weight: bold;', data.parsed.description);
        console.log('%c🏷️ Categoría:', 'color: #666; font-weight: bold;', data.parsed.category || 'N/A');
        console.log('%c💱 Moneda:', 'color: #666; font-weight: bold;', data.parsed.currency || 'CLP');
        console.groupEnd();
      }
      
      if (data.transaction) {
        console.group('%c💾 TRANSACCIÓN GUARDADA', 'color: #9C27B0; font-weight: bold;');
        console.log('%c🆔 ID:', 'color: #666; font-weight: bold;', data.transaction.id);
        console.log('%c💰 Monto guardado:', 'color: #FF9800; font-weight: bold; font-size: 14px;', 
          new Intl.NumberFormat('es-CL', { style: 'currency', currency: data.transaction.currency || 'CLP' }).format(data.transaction.amount));
        console.log('%c📝 Descripción:', 'color: #666; font-weight: bold;', data.transaction.description);
        console.log('%c📅 Fecha:', 'color: #666; font-weight: bold;', data.transaction.date);
        console.log('%c📋 Tipo:', 'color: #666; font-weight: bold;', 
          data.transaction.type === 'expense' ? '💰 Gasto' : '💵 Ingreso');
        console.log('%c🏷️ Categoría ID:', 'color: #666; font-weight: bold;', data.transaction.category_id || 'N/A');
        console.log('%c💱 Moneda:', 'color: #666; font-weight: bold;', data.transaction.currency || 'CLP');
        console.log('%c⏰ Creada:', 'color: #666; font-weight: bold;', 
          new Date(data.transaction.created_at).toLocaleString('es-CL'));
        if (data.transaction.metadata) {
          console.log('%c📦 Metadata:', 'color: #666; font-weight: bold;', data.transaction.metadata);
        }
        console.groupEnd();
      }
      
      console.group('%c⏱️ TIEMPOS DE PROCESAMIENTO', 'color: #FF5722; font-weight: bold;');
      console.log('%c📡 Duración de la petición:', 'color: #666; font-weight: bold;', 
        ((Date.now() - requestStartTime) / 1000).toFixed(2) + ' segundos');
      console.log('%c🎤 Tamaño del audio:', 'color: #666; font-weight: bold;', 
        (audioBlob.size / 1024).toFixed(2) + ' KB');
      console.groupEnd();
      
      console.log('%c' + '═'.repeat(60), 'color: #1C8FA0; font-weight: bold; font-size: 14px;');
      console.log('%c✅ PROCESO COMPLETADO EXITOSAMENTE', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
      console.log('%c' + '═'.repeat(60), 'color: #1C8FA0; font-weight: bold; font-size: 14px;');

      setTranscript(data.transcript);
      setStatus('success');

      toast({
        title: '✅ Gasto agregado',
        description: `"${data.transcript}" → ${formatCurrency(data.transaction?.amount || 0, currency)}`,
      });

      if (onTransactionCreated && data.transaction) {
        console.log('✅ [VoiceInput] Llamando callback onTransactionCreated con:', data.transaction);
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
              <Icon component={Loader2} size="md" color="white" className="animate-spin" />
            ) : isRecording ? (
              <Icon component={Square} size="md" color="white" />
            ) : (
              <Icon component={Mic} size="md" color="white" />
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
