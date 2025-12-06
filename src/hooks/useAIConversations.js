import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { sendMessageToAI } from '@/lib/ai-service';

/**
 * Hook para manejar conversaciones de IA
 * - Carga conversaciones desde la BD
 * - Crea nuevas conversaciones
 * - Guarda mensajes
 * - Renombra automáticamente después de 3 interacciones del usuario
 */
export const useAIConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar conversaciones del usuario
  const loadConversations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      setConversations(data || []);
      
      // Si hay conversaciones y no hay una actual seleccionada, seleccionar la más reciente
      if (data && data.length > 0 && !currentConversationId) {
        setCurrentConversationId(data[0].id);
      }
    } catch (err) {
      console.error('Error cargando conversaciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva conversación
  const createConversation = async (initialMessage = null) => {
    if (!userId) return null;

    try {
      const newConversation = {
        user_id: userId,
        title: 'Nueva conversación',
        preview: initialMessage || '¡Hola! Soy tu Coach Financiero...',
        messages: initialMessage 
          ? [
              { role: 'assistant', content: "¡Hola! He recibido tu consulta." },
              { role: 'user', content: initialMessage }
            ]
          : [],
        user_interaction_count: initialMessage ? 1 : 0,
        is_renamed: false
      };

      const { data, error: insertError } = await supabase
        .from('ai_conversations')
        .insert(newConversation)
        .select()
        .single();

      if (insertError) throw insertError;

      setConversations(prev => [data, ...prev]);
      setCurrentConversationId(data.id);
      return data;
    } catch (err) {
      console.error('Error creando conversación:', err);
      setError(err.message);
      return null;
    }
  };

  // Guardar mensajes en la conversación
  const saveMessages = async (conversationId, messages) => {
    if (!conversationId || !messages) return;

    try {
      // Contar interacciones del usuario
      const userInteractions = messages.filter(m => m.role === 'user').length;
      
      // Obtener preview (último mensaje del usuario o del asistente)
      const lastMessage = messages[messages.length - 1];
      const preview = lastMessage?.content?.substring(0, 50) || '';

      const { error: updateError } = await supabase
        .from('ai_conversations')
        .update({
          messages: messages,
          user_interaction_count: userInteractions,
          preview: preview,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;

      // Actualizar estado local
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, messages, user_interaction_count: userInteractions, preview }
          : conv
      ));
    } catch (err) {
      console.error('Error guardando mensajes:', err);
      setError(err.message);
    }
  };

  // Generar nombre para la conversación usando IA
  const generateConversationName = async (messages) => {
    try {
      // Construir contexto de los primeros mensajes (máximo 6 para tener contexto)
      const contextMessages = messages.slice(0, 6);
      const contextText = contextMessages
        .map(m => `${m.role === 'user' ? 'Usuario' : 'IA'}: ${m.content}`)
        .join('\n');

      // Prompt para generar nombre
      const namePrompt = `Basándote en esta conversación, genera un nombre corto y descriptivo (máximo 4 palabras) que resuma el tema principal. Responde SOLO con el nombre, sin explicaciones ni comillas:

${contextText}

Nombre:`;

      const nameResponse = await sendMessageToAI([
        { role: 'system', content: 'Eres un asistente que genera nombres descriptivos y cortos para conversaciones. Responde SOLO con el nombre, sin explicaciones.' },
        { role: 'user', content: namePrompt }
      ]);

      // Limpiar la respuesta (quitar comillas, espacios extra, etc.)
      let cleanName = nameResponse.trim();
      cleanName = cleanName.replace(/^["']|["']$/g, ''); // Quitar comillas
      cleanName = cleanName.substring(0, 50); // Limitar a 50 caracteres
      
      return cleanName || 'Nueva conversación';
    } catch (err) {
      console.error('Error generando nombre:', err);
      return 'Nueva conversación';
    }
  };

  // Renombrar conversación después de 3 interacciones
  const renameConversationIfNeeded = async (conversationId, messages) => {
    if (!conversationId) return;

    try {
      // Obtener la conversación actual
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation || conversation.is_renamed) return;

      // Verificar si tiene 3 o más interacciones del usuario
      const userInteractions = messages.filter(m => m.role === 'user').length;
      if (userInteractions < 3) return;

      // Generar nombre con IA
      const newName = await generateConversationName(messages);

      // Actualizar en BD
      const { error: updateError } = await supabase
        .from('ai_conversations')
        .update({
          title: newName,
          is_renamed: true
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;

      // Actualizar estado local
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, title: newName, is_renamed: true }
          : conv
      ));
    } catch (err) {
      console.error('Error renombrando conversación:', err);
      setError(err.message);
    }
  };

  // Cargar conversaciones al montar
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    loading,
    error,
    createConversation,
    saveMessages,
    renameConversationIfNeeded,
    loadConversations
  };
};

