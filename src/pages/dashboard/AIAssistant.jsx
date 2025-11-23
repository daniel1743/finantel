
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  TrendingUp, 
  PieChart, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessageToAI } from '@/lib/ai-service';

const QuickPill = ({ text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-[#6E6E73] hover:border-[#1C8FA0] hover:text-[#1C8FA0] hover:bg-[#1C8FA0]/5 transition-all whitespace-nowrap shadow-sm"
  >
    {text}
  </button>
);

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex gap-4 max-w-3xl mb-6",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
        isUser ? "bg-[#1a1a1a] text-white" : "bg-white border border-gray-100 text-[#1C8FA0]"
      )}>
        {isUser ? <span className="font-bold text-sm">YO</span> : <Bot className="w-6 h-6" />}
      </div>

      {/* Content */}
      <div className={cn(
        "p-5 rounded-2xl text-sm leading-relaxed shadow-sm",
        isUser 
          ? "bg-[#1C8FA0] text-white rounded-tr-none" 
          : "bg-white/80 backdrop-blur-md border border-white/50 text-[#1a1a1a] rounded-tl-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
      )}>
        <div className="whitespace-pre-wrap font-medium">
          {message.content}
        </div>
        
        {/* Embedded Visuals Simulation */}
        {!isUser && message.content.includes('[SHOW_CHART]') && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#6E6E73] uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              Tendencia de Gastos
            </div>
            <div className="h-24 flex items-end gap-1">
              {[40, 60, 45, 80, 55, 75, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-[#1C8FA0]/20 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hola, soy tu asistente financiero personal. ¿En qué puedo ayudarte hoy a optimizar tu dinero?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToAI([...messages, userMessage]);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error al procesar tu solicitud." }]);
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
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Asistente Financiero IA</h1>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <p className="text-[#6E6E73] text-sm mt-1">Potenciado por DeepSeek & Qwen Intelligence</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#F5F7F9] rounded-[26px] border border-gray-200 shadow-inner overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1C8FA0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex gap-4 mr-auto max-w-3xl mb-6"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 text-[#1C8FA0] flex items-center justify-center shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-sm text-[#6E6E73]">
                <span className="animate-pulse">Analizando tus finanzas...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 relative z-10">
          {/* Quick Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
            <QuickPill text="¿En qué gasto más?" onClick={setInput} />
            <QuickPill text="¿Voy bien con mi ahorro?" onClick={setInput} />
            <QuickPill text="Explícame mi mes en sencillo" onClick={setInput} />
            <QuickPill text="Hazme un plan para pagar deudas" onClick={setInput} />
          </div>

          <div className="relative flex items-end gap-2 bg-gray-50 p-2 rounded-[20px] border border-gray-200 focus-within:border-[#1C8FA0] focus-within:ring-4 focus-within:ring-[#1C8FA0]/10 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta financiera aquí..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-3 text-sm text-[#1a1a1a] placeholder:text-gray-400"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-[#1a1a1a] text-white rounded-xl hover:bg-[#1C8FA0] disabled:opacity-50 disabled:hover:bg-[#1a1a1a] transition-colors shadow-lg shadow-black/5 mb-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            La IA puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
