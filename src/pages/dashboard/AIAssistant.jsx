import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  Send, 
  Loader2, 
  LifeBuoy, 
  Smile, 
  Paperclip,
  Bot,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessageToAI } from '@/lib/ai-service';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useFinance } from '@/hooks/useFinance';

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
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
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

const MessageBubble = ({ message, user }) => {
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2.5 mb-3 w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar IA (Solo izquierda) */}
      {!isUser && (
        <div className="shrink-0 w-6 h-6 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center mt-1">
          <Bot size={14} className="text-[#1C8FA0]" />
        </div>
      )}

      {/* Burbuja */}
      <div className={cn(
        "px-4 py-2.5 shadow-sm text-[14px] leading-normal max-w-[90%] break-words", // max-w-90% permite que sea larga
        isUser 
          ? "bg-[#1C8FA0] text-white rounded-2xl rounded-tr-sm" // Color marca usuario
          : "bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-gray-100"
      )}>
        <div className="whitespace-pre-wrap">
          {message.content}
        </div>
        {/* Hora sutil */}
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
  const topic = searchParams.get('topic');
  const { user } = useAuth();
  const { tickets, loading: ticketsLoading } = useSupportTickets(user?.id);
  const { transactions } = useFinance(user?.id);
  const isSupportMode = topic === 'support';
  const [isInitialized, setIsInitialized] = useState(false);
  const initialMessageFromState = location.state?.initialMessage;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Inicialización (Simplificada)
  useEffect(() => {
    if (!isInitialized && !ticketsLoading) {
      const initialMsgs = [];
      if (initialMessageFromState) {
        initialMsgs.push({ role: 'assistant', content: "¡Hola! He recibido tu consulta." });
        initialMsgs.push({ role: 'user', content: initialMessageFromState });
      } else {
        const welcomeText = isSupportMode 
          ? "Hola, soy el soporte de Finantel. ¿En qué puedo ayudarte hoy?"
          : `¡Hola ${user?.user_metadata?.full_name?.split(' ')[0] || ''}! Soy tu Coach Financiero. ¿Revisamos tus gastos?`;
        initialMsgs.push({ role: 'assistant', content: welcomeText });
      }
      setMessages(initialMsgs);
      setIsInitialized(true);
    }
  }, [ticketsLoading, isInitialized, initialMessageFromState, isSupportMode, user]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulación de envío
      const contextMessages = [...messages, userMessage];
      const aiResponseText = await sendMessageToAI(contextMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponseText }]);
    } catch (error) {
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

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] p-4 font-sans">
      {/* Contenedor Principal */}
      <div className="w-full max-w-[420px] h-[650px] bg-[#F5F7F9] rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-gray-200 relative">
        
        {/* 1. Header Blanco y Limpio */}
        <Header isSupportMode={isSupportMode} />

        {/* 2. Área de Chat */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} user={user} />
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

        {/* 3. Área de Input Refinada */}
        <div className="p-3 bg-white border-t border-gray-100"> 
          
          <div className="relative flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#1C8FA0] focus-within:ring-1 focus-within:ring-[#1C8FA0]/20 transition-all px-3 py-2">
            
            {/* Botones de acción (Izquierda) */}
            <button className="p-1.5 text-gray-400 hover:text-[#1C8FA0] hover:bg-[#1C8FA0]/10 rounded-lg transition-colors mb-0.5">
              <Paperclip size={18} />
            </button>

            {/* Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe aquí..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder:text-gray-400 py-1.5 resize-none max-h-24 min-h-[36px]"
              style={{ lineHeight: '1.5' }}
            />
            
            {/* Botón Enviar (Derecha) */}
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
  );
};

export default AIAssistant;