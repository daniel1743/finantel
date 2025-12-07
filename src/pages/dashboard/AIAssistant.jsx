import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Loader2, 
  LifeBuoy, 
  Smile, 
  Paperclip,
  Bot,
  X,
  Plus,
  MessageSquare,
  Menu,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessageToAI } from '@/lib/ai-service';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useFinance } from '@/hooks/useFinance';
import { useAIConversations } from '@/hooks/useAIConversations';

// --- COMPONENTES VISUALES ---

const Header = ({ isSupportMode, onClose }) => (
  <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-[20px] sticky top-0 z-20">
    <div className="flex items-center gap-3">
      {/* Avatar Reducido y Elegante */}
      <div className="relative">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1C8FA0]/10 flex items-center justify-center border border-[#1C8FA0]/20">
          <Icon 
            component={isSupportMode ? LifeBuoy : Bot} 
            size="sm" 
            className="text-[#1C8FA0]" // Color de tu marca
          />
        </div>
        {/* Punto verde sutil: 80% fuera, 20% dentro */}
        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500/80 rounded-full border border-white shadow-sm"></div>
      </div>
      
      <div className="flex flex-col">
        <h1 className="text-[#1a1a1a] font-bold text-sm leading-tight">
          {isSupportMode ? 'Soporte Finantel' : 'Coach Financiero'}
        </h1>
        <p className="text-gray-400 text-[11px] font-medium">En línea</p>
      </div>
    </div>

    {/* Botón Cerrar (Opcional si es modal) */}
    {onClose && (
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X size={20} />
      </button>
    )}
  </div>
);

const MessageBubble = ({ message, user, isDesktop = false }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md">
          {message.content.replace('system:', '')}
        </span>
      </div>
    );
  }

  // Estilo Desktop (tipo ChatGPT)
  if (isDesktop) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-4 mb-6 w-full",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {!isUser && (
          <div className="shrink-0 w-8 h-8 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
            <Bot size={18} className="text-[#1C8FA0]" />
          </div>
        )}
        <div className={cn(
          "px-4 py-3 text-[15px] leading-relaxed max-w-[85%] break-words",
          isUser 
            ? "bg-[#1C8FA0] text-white rounded-2xl" 
            : "bg-gray-100 text-gray-800 rounded-2xl"
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        {isUser && (
          <div className="shrink-0 w-8 h-8 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-[#1C8FA0] flex items-center justify-center text-white text-xs font-semibold">
              {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Estilo Mobile (original)
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2.5 mb-3 w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="shrink-0 w-6 h-6 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center mt-1">
          <Bot size={14} className="text-[#1C8FA0]" />
        </div>
      )}
      <div className={cn(
        "px-4 py-2.5 shadow-sm text-[14px] leading-normal max-w-[90%] break-words",
        isUser 
          ? "bg-[#1C8FA0] text-white rounded-2xl rounded-tr-sm"
          : "bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-gray-100"
      )}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className={cn(
          "text-[9px] mt-1 text-right opacity-70",
          isUser ? "text-white/80" : "text-gray-400"
        )}>
          {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </motion.div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const AIAssistant = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const topic = searchParams.get('topic');
  const { user } = useAuth();
  const { tickets, loading: ticketsLoading } = useSupportTickets(user?.id);
  const { transactions } = useFinance(user?.id);
  const isSupportMode = topic === 'support';
  const [isInitialized, setIsInitialized] = useState(false);
  const initialMessageFromState = location.state?.initialMessage;

  // Hook para manejar conversaciones
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    loading: conversationsLoading,
    createConversation,
    saveMessages,
    renameConversationIfNeeded,
    loadConversations
  } = useAIConversations(user?.id);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Cargar mensajes de la conversación actual
  useEffect(() => {
    if (currentConversationId && conversations.length > 0) {
      const currentConv = conversations.find(c => c.id === currentConversationId);
      if (currentConv) {
        setMessages(currentConv.messages || []);
      }
    }
  }, [currentConversationId, conversations]);

  // Inicialización: crear conversación si no existe
  useEffect(() => {
    if (!isInitialized && !ticketsLoading && !conversationsLoading && user) {
      const initializeChat = async () => {
        let convId = currentConversationId;
        
        // Si no hay conversación actual, crear una nueva
        if (!convId) {
          const welcomeText = isSupportMode 
            ? "Hola, soy el soporte de Finantel. ¿En qué puedo ayudarte hoy?"
            : `¡Hola ${user?.user_metadata?.full_name?.split(' ')[0] || ''}! Soy tu Coach Financiero. ¿Revisamos tus gastos?`;
          
      const initialMsgs = [];
      if (initialMessageFromState) {
        initialMsgs.push({ role: 'assistant', content: "¡Hola! He recibido tu consulta." });
        initialMsgs.push({ role: 'user', content: initialMessageFromState });
      } else {
        initialMsgs.push({ role: 'assistant', content: welcomeText });
      }
          
          const newConv = await createConversation(initialMessageFromState);
          if (newConv) {
      setMessages(initialMsgs);
            await saveMessages(newConv.id, initialMsgs);
          }
        } else {
          // Cargar mensajes de la conversación existente
          const currentConv = conversations.find(c => c.id === convId);
          if (currentConv) {
            setMessages(currentConv.messages || []);
          }
        }
        
      setIsInitialized(true);
      };
      
      initializeChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsLoading, isInitialized, initialMessageFromState, isSupportMode, user, conversationsLoading]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !currentConversationId) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Guardar mensaje del usuario
      await saveMessages(currentConversationId, newMessages);

      // Obtener respuesta de IA
      // ✅ CRÍTICO: Pasar userId y transactions para que la IA tenga datos reales
      const contextMessages = newMessages;
      
      // 🔍 DEBUG: Verificar que tenemos transacciones
      console.log('[AIAssistant] 📊 Transacciones disponibles:', {
        count: transactions?.length || 0,
        userId: user?.id,
        hasTransactions: !!transactions && transactions.length > 0,
        sampleTransaction: transactions?.[0] || null
      });
      
      const aiResponseText = await sendMessageToAI(
        contextMessages,
        user?.id,  // Para consultar transacciones en la Edge Function
        transactions  // Datos reales - La IA NO debe inventar
      );
      const aiMessage = { role: 'assistant', content: aiResponseText };
      const finalMessages = [...newMessages, aiMessage];
      
      setMessages(finalMessages);
      
      // Guardar respuesta de IA
      await saveMessages(currentConversationId, finalMessages);

      // Verificar si necesita renombrar (después de 3 interacciones del usuario)
      await renameConversationIfNeeded(currentConversationId, finalMessages);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error de conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Crear nueva conversación
  const handleNewConversation = async () => {
    const welcomeText = isSupportMode 
      ? "Hola, soy el soporte de Finantel. ¿En qué puedo ayudarte hoy?"
      : `¡Hola ${user?.user_metadata?.full_name?.split(' ')[0] || ''}! Soy tu Coach Financiero. ¿Revisamos tus gastos?`;
    
    const initialMsgs = [{ role: 'assistant', content: welcomeText }];
    const newConv = await createConversation();
    if (newConv) {
      setMessages(initialMsgs);
      await saveMessages(newConv.id, initialMsgs);
    }
  };

  // Cambiar de conversación
  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    const selectedConv = conversations.find(c => c.id === conversationId);
    if (selectedConv) {
      setMessages(selectedConv.messages || []);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-white font-sans overflow-hidden">
      {/* Sidebar - Solo visible en desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-50 border-r border-gray-200 overflow-hidden">
        {/* Logo y Header del Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1C8FA0] to-[#157885] flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a1a1a]">Finantel AI</h2>
              <p className="text-xs text-gray-500 font-medium">Coach Financiero</p>
            </div>
          </div>
          <button 
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Nueva conversación</span>
          </button>
        </div>

        {/* Historial de Conversaciones */}
        <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-gray-500">No hay conversaciones aún</p>
              <p className="text-xs text-gray-400 mt-1">Crea una nueva para comenzar</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectConversation(chat.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-colors group",
                    currentConversationId === chat.id
                      ? "bg-[#1C8FA0]/10 border border-[#1C8FA0]/20"
                      : "hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      currentConversationId === chat.id ? "text-[#1C8FA0]" : "text-gray-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        currentConversationId === chat.id ? "text-[#1C8FA0]" : "text-gray-700"
                      )}>
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {chat.preview || 'Sin mensajes'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Área Principal - Desktop: pantalla completa, Mobile: contenedor centrado */}
      <div className="flex-1 flex flex-col lg:bg-white">
        {/* Header - Solo en desktop, diferente estilo */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:px-6 lg:py-4 lg:border-b lg:border-gray-200 lg:shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-[#1a1a1a]"
              title="Volver al dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1C8FA0]/10 flex items-center justify-center border border-[#1C8FA0]/20">
                <Icon 
                  component={isSupportMode ? LifeBuoy : Bot} 
                  size="md" 
                  className="text-[#1C8FA0]"
                />
              </div>
              {/* Punto verde sutil: 80% fuera, 20% dentro */}
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500/80 rounded-full border border-white shadow-sm"></div>
            </div>
            <div>
              <h1 className="text-[#1a1a1a] font-semibold text-base">
                {isSupportMode ? 'Soporte Finantel' : 'Coach Financiero'}
              </h1>
              <p className="text-gray-500 text-xs">En línea</p>
            </div>
          </div>
        </div>

        {/* Contenedor Mobile (mantiene diseño original) */}
        <div className="lg:hidden flex flex-col h-screen w-screen bg-[#F5F7F9] overflow-hidden">
          <div className="w-full h-full bg-[#F5F7F9] flex flex-col border border-gray-200 relative">
            {/* Header Mobile con botón volver */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-[#1a1a1a]"
                title="Volver"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3 flex-1 justify-center">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1C8FA0]/10 flex items-center justify-center border border-[#1C8FA0]/20">
                    <Icon 
                      component={isSupportMode ? LifeBuoy : Bot} 
                      size="sm" 
                      className="text-[#1C8FA0]"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500/80 rounded-full border border-white shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[#1a1a1a] font-bold text-sm leading-tight">
                    {isSupportMode ? 'Soporte Finantel' : 'Coach Financiero'}
                  </h1>
                  <p className="text-gray-400 text-[11px] font-medium">En línea</p>
                </div>
              </div>
              <div className="w-10"></div> {/* Spacer para centrar */}
            </div>
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-thin scrollbar-thumb-gray-200 min-h-0">
          {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} user={user} isDesktop={false} />
          ))}
          {isLoading && (
            <div className="flex gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center shrink-0 mt-1">
                 <Bot size={14} className="text-[#1C8FA0]" />
              </div>
              <div className="bg-white px-3 py-2.5 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <div className="relative flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#1C8FA0] focus-within:ring-1 focus-within:ring-[#1C8FA0]/20 transition-all px-3 py-2">
            <button className="p-1.5 text-gray-400 hover:text-[#1C8FA0] hover:bg-[#1C8FA0]/10 rounded-lg transition-colors mb-0.5">
              <Paperclip size={18} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe aquí..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder:text-gray-400 py-1.5 resize-none max-h-24 min-h-[36px]"
              style={{ lineHeight: '1.5' }}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "p-1.5 rounded-lg transition-all mb-0.5",
                input.trim() 
                  ? "bg-[#1C8FA0] text-white hover:bg-[#157885] shadow-sm" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-2">
             <span className="text-[10px] text-gray-300 font-medium">Finantel Secure Chat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Área Principal Desktop - Estilo ChatGPT */}
        <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:overflow-hidden lg:min-h-0">
          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto px-6 py-8 bg-white min-h-0">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} user={user} isDesktop={true} />
              ))}
              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-[#1C8FA0]" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area Desktop */}
          <div className="border-t border-gray-200 bg-white shrink-0">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="relative flex items-end gap-2 bg-white rounded-2xl border-2 border-gray-300 focus-within:border-[#1C8FA0] focus-within:shadow-lg transition-all px-4 py-3">
                <button className="p-2 text-gray-400 hover:text-[#1C8FA0] hover:bg-gray-50 rounded-lg transition-colors">
                  <Paperclip size={20} />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Envía un mensaje..."
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-base text-gray-800 placeholder:text-gray-400 py-2 resize-none max-h-32 min-h-[44px]"
                  style={{ lineHeight: '1.5' }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    input.trim() && !isLoading
                      ? "bg-[#1C8FA0] text-white hover:bg-[#157885] shadow-sm" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                Finantel puede cometer errores. Considera verificar la información importante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;