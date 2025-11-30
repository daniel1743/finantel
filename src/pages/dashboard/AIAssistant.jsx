
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  TrendingUp, 
  PieChart, 
  AlertCircle,
  Loader2,
  LifeBuoy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessageToAI } from '@/lib/ai-service';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useFinance } from '@/hooks/useFinance';

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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const topic = searchParams.get('topic');
  const { user } = useAuth();
  const { tickets, loading: ticketsLoading } = useSupportTickets(user?.id);
  const { transactions, categories, budgets, goals, loading: financeLoading } = useFinance(user?.id);
  const isSupportMode = topic === 'support';
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Obtener mensaje inicial desde el estado de navegación (si existe)
  const initialMessageFromState = location.state?.initialMessage;
  
  // Construir mensaje inicial basado en el contexto
  const getInitialMessage = (ticketsData) => {
    if (isSupportMode) {
      const openTickets = ticketsData?.filter(t => t.status !== 'resuelto' && t.status !== 'archivado') || [];
      if (openTickets.length > 0) {
        return `Hola, soy FinanBot y estoy aquí para ayudarte con tus solicitudes de soporte. Veo que tienes ${openTickets.length} ticket(s) abierto(s). ¿En qué puedo asistirte hoy?`;
      }
      return "Hola, soy FinanBot, tu asistente de soporte. Puedo ayudarte con consultas sobre tu cuenta, tickets, facturación o cualquier problema técnico. ¿En qué puedo ayudarte?";
    }
    // Mensaje inicial más cálido y personalizado según el nuevo prompt
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
    if (userName) {
      return `Hola ${userName}, qué gusto verte por aquí. Cuéntame cómo te has sentido últimamente con tus gastos. Estoy contigo para ordenar todo sin estrés y ayudarte a planear lo que necesites.`;
    }
    return "Hola, qué gusto verte por aquí. Cuéntame cómo te has sentido últimamente con tus gastos. Estoy contigo para ordenar todo sin estrés y ayudarte a planear lo que necesites.";
  };

  const [messages, setMessages] = useState(() => {
    // Si hay un mensaje inicial desde el estado, usarlo
    if (initialMessageFromState) {
      return [
        { role: 'assistant', content: "Entiendo tu preocupación. Déjame ayudarte con eso." },
        { role: 'user', content: initialMessageFromState }
      ];
    }
    return [
      { role: 'assistant', content: isSupportMode ? "Cargando contexto de soporte..." : getInitialMessage([]) }
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Actualizar mensaje inicial cuando se carga el contexto de soporte o hay mensaje inicial
  useEffect(() => {
    if (initialMessageFromState && !isInitialized) {
      // Si hay mensaje inicial, ya está configurado en el estado inicial
      setIsInitialized(true);
    } else if (isSupportMode && !ticketsLoading && !isInitialized) {
      const newMessage = getInitialMessage(tickets);
      setMessages([{ role: 'assistant', content: newMessage }]);
      setIsInitialized(true);
    } else if (!isSupportMode && !isInitialized) {
      setIsInitialized(true);
    }
  }, [tickets, ticketsLoading, isSupportMode, isInitialized, initialMessageFromState]);
  
  // Si hay mensaje inicial, enviarlo automáticamente al cargar
  useEffect(() => {
    if (initialMessageFromState && isInitialized && messages.length === 2 && messages[1].role === 'user') {
      // El mensaje ya está en el estado, solo necesitamos procesarlo
      // El efecto de handleSend se encargará si es necesario
    }
  }, [initialMessageFromState, isInitialized, messages]);

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
      // Construir contexto adicional
      let contextMessages = [...messages, userMessage];
      
      if (isSupportMode && tickets && tickets.length > 0) {
        // Agregar contexto de tickets al inicio del sistema
        const supportContext = {
          role: 'system',
          content: `CONTEXTO DE SOPORTE DEL USUARIO:
- Tickets totales: ${tickets.length}
- Tickets abiertos: ${tickets.filter(t => t.status !== 'resuelto' && t.status !== 'archivado').length}
- Últimos tickets:
${tickets.slice(0, 3).map(t => `  - [${t.status}] ${t.subject} (${t.category}, prioridad: ${t.priority}) - ${t.message.substring(0, 100)}...`).join('\n')}

El usuario está en el Centro de Ayuda. Responde como asistente de soporte técnico, siendo empático y resolutivo. Si el usuario pregunta por un ticket específico, usa la información de arriba. Si necesita escalar a un humano, sugiere crear un nuevo ticket o contactar por WhatsApp/email.`
        };
        
        // Insertar contexto al principio
        contextMessages = [supportContext, ...contextMessages];
      } else {
        // Modo Coach Financiero - Agregar datos reales de transacciones (LIMITADO para rendimiento)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        
        // Limitar a últimas 100 transacciones para rendimiento
        const recentTransactions = transactions?.slice(0, 100) || [];
        
        // Filtrar transacciones del mes actual (de las recientes)
        const monthTransactions = recentTransactions.filter(t => {
          const txDate = new Date(t.date);
          return txDate >= startOfMonth;
        });
        
        // Filtrar transacciones de la semana
        const weekTransactions = recentTransactions.filter(t => {
          const txDate = new Date(t.date);
          return txDate >= startOfWeek;
        });
        
        // Calcular resumen de gastos por categoría del mes (máximo 10 categorías)
        const categoryTotals = {};
        monthTransactions.slice(0, 50).forEach(tx => {
          if (tx.type === 'expense' && tx.amount) {
            const catName = tx.categories?.name || 'Sin categoría';
            categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(tx.amount);
          }
        });
        
        // Formatear transacciones para el contexto (máximo 30 para no sobrecargar)
        const transactionsContext = monthTransactions.length > 0 
          ? monthTransactions.slice(0, 30).map(tx => ({
              id: tx.id,
              date: tx.date,
              description: tx.description,
              amount: tx.amount,
              type: tx.type,
              category: tx.categories?.name || 'Sin categoría'
            }))
          : [];
        
        const financialContext = {
          role: 'system',
          content: `DATOS FINANCIEROS REALES DEL USUARIO (${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}):

IMPORTANTE: SOLO usa estos datos reales. NUNCA inventes, asumas o generes información financiera que no esté aquí.

TRANSACCIONES DEL MES ACTUAL (${monthTransactions.length} transacciones):
${transactionsContext.length > 0 
  ? JSON.stringify(transactionsContext, null, 2)
  : 'El usuario NO tiene transacciones registradas este mes.'}

RESUMEN DE GASTOS POR CATEGORÍA (mes actual):
${Object.keys(categoryTotals).length > 0
  ? Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, total]) => `- ${cat}: $${total.toLocaleString('es-CL')}`)
      .join('\n')
  : 'No hay gastos registrados este mes.'}

TOTAL DE TRANSACCIONES:
- Mes actual: ${monthTransactions.length}
- Última semana: ${weekTransactions.length}
- Total histórico: ${transactions?.length || 0}

CATEGORÍAS DISPONIBLES: ${categories?.map(c => c.name).join(', ') || 'Ninguna categoría creada'}

PRESUPUESTOS: ${budgets?.length || 0} presupuesto(s) activo(s)

METAS: ${goals?.length || 0} meta(s) financiera(s)

REGLAS CRÍTICAS:
1. SOLO menciona datos que estén en la información de arriba
2. Si no hay transacciones, di claramente: "Aún no tienes transacciones registradas este mes"
3. Si el usuario pregunta por gastos y no hay datos, NO inventes números ni categorías
4. Si hay datos, úsalos exactamente como aparecen
5. NUNCA digas "aproximadamente" o "alrededor de" con números que no estén en los datos reales
6. Si no sabes algo porque no hay datos, sé honesto: "No tengo esa información porque aún no has registrado transacciones en esa categoría"

El usuario está en el Coach Financiero. Responde como coach-amigo usando SOLO los datos reales proporcionados arriba.`
        };
        
        // Insertar contexto financiero al principio
        contextMessages = [financialContext, ...contextMessages];
      }

      const aiResponseText = await sendMessageToAI(contextMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponseText }]);
    } catch (error) {
      console.error('Error sending message:', error);
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
            {isSupportMode ? (
              <>
                <LifeBuoy className="w-6 h-6 text-[#1C8FA0]" />
                <h1 className="text-2xl font-bold text-[#1a1a1a] font-['Inter_Tight']">FinanBot - Soporte</h1>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Coach Financiero Finantel</h1>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </>
            )}
          </div>
          <p className="text-[#6E6E73] text-sm mt-1">
            {isSupportMode 
              ? "Con contexto de tus tickets y alertas • Potenciado por GPT-5"
              : "Potenciado por GPT-5"
            }
          </p>
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
            {isSupportMode ? (
              <>
                <QuickPill text="¿Cuál es el estado de mis tickets?" onClick={setInput} />
                <QuickPill text="Necesito ayuda con facturación" onClick={setInput} />
                <QuickPill text="Reportar un error en la app" onClick={setInput} />
                <QuickPill text="¿Cómo cambio mi contraseña?" onClick={setInput} />
              </>
            ) : (
              <>
                <QuickPill text="¿En qué gasto más?" onClick={setInput} />
                <QuickPill text="¿Voy bien con mi ahorro?" onClick={setInput} />
                <QuickPill text="Explícame mi mes en sencillo" onClick={setInput} />
                <QuickPill text="Hazme un plan para pagar deudas" onClick={setInput} />
              </>
            )}
          </div>

          <div className="relative flex items-end gap-2 bg-gray-50 p-2 rounded-[20px] border border-gray-200 focus-within:border-[#1C8FA0] focus-within:ring-4 focus-within:ring-[#1C8FA0]/10 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSupportMode ? "Describe tu problema o consulta de soporte..." : "Escribe tu consulta financiera aquí..."}
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
