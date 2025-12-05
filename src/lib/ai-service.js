
import { supabase } from '@/lib/customSupabaseClient';

export const sendMessageToAI = async (messages) => {
  try {
    // Llamar a la Edge Function de Supabase (resuelve CORS y protege API keys)
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { messages }
    });

    if (error) {
      console.error('AI Service Error:', error);
      return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
    }

    // Retornar el contenido de la respuesta
    return data?.content || "Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.";

  } catch (error) {
    console.error('AI Service Error:', error);
    return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
  }
};
