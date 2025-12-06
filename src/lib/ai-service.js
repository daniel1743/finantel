
import { supabase } from '@/lib/customSupabaseClient';

export const sendMessageToAI = async (messages, userId = null, transactions = null) => {
  console.log('[AI Service] 🚀 Iniciando llamada a Edge Function ai-assistant', {
    messagesCount: messages.length,
    userId: userId || 'no proporcionado',
    transactionsCount: transactions?.length || 0,
    timestamp: new Date().toISOString(),
    supabaseClientExists: !!supabase,
    supabaseFunctionsExists: !!supabase?.functions
  });

  try {
    // Verificar que el cliente de Supabase esté inicializado
    if (!supabase || !supabase.functions) {
      console.error('[AI Service] ❌ Cliente de Supabase no inicializado');
      throw new Error('Cliente de Supabase no está disponible');
    }

    console.log('[AI Service] 📡 Invocando supabase.functions.invoke("ai-assistant")...');
    console.log('[AI Service] 📊 Datos que se envían:', {
      messagesCount: messages.length,
      userId: userId || 'NO PROPORCIONADO',
      transactionsCount: transactions?.length || 0,
      hasTransactions: !!transactions && transactions.length > 0,
      sampleTransaction: transactions?.[0] || null
    });
    
    const invokeStartTime = Date.now();
    
    // Llamar a la Edge Function de Supabase (resuelve CORS y protege API keys)
    // ✅ CRÍTICO: Pasar userId y transactions para que la IA tenga datos reales
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { 
        messages,
        userId,  // Para consultar transacciones en la Edge Function si no vienen
        transactions: transactions || []  // Datos reales del usuario - NUNCA inventar (siempre array)
      }
    });

    const invokeDuration = Date.now() - invokeStartTime;
    console.log('[AI Service] ⏱️ Invoke completado en', invokeDuration + 'ms', {
      hasData: !!data,
      hasError: !!error,
      errorDetails: error ? {
        message: error.message,
        status: error.status,
        name: error.name
      } : null,
      dataKeys: data ? Object.keys(data) : null,
      dataContent: data?.content ? `Content length: ${data.content.length}` : 'No content'
    });

    if (error) {
      console.error('[AI Service] ❌ Error en invoke:', error);
      console.error('[AI Service] Error completo:', JSON.stringify(error, null, 2));
      return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
    }

    // Retornar el contenido de la respuesta
    const content = data?.content || "Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.";
    console.log('[AI Service] ✅ Retornando contenido:', { 
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...'
    });
    return content;

  } catch (error) {
    console.error('[AI Service] ❌ Excepción capturada:', error);
    console.error('[AI Service] Error name:', error?.name);
    console.error('[AI Service] Error message:', error?.message);
    console.error('[AI Service] Error stack:', error?.stack);
    console.error('[AI Service] Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
  }
};
