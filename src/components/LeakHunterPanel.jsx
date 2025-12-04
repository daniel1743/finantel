// ============================================================================
// LEAK HUNTER PANEL - React Component
// ============================================================================
// Muestra las "fugas" financieras detectadas: suscripciones ocultas,
// delivery excesivo, compras nocturnas, etc.
// ============================================================================

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  Package,
  Moon,
  Copy,
  DollarSign,
  Check,
  X,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currencyFormatter';
import { useUserCurrency } from '@/hooks/useUserCurrency';

// ============================================================================
// CONFIGURACIÓN DE TIPOS DE FUGAS
// ============================================================================
const LEAK_CONFIG = {
  suscripcion_oculta: {
    icon: Package,
    color: '#EF4444', // red
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-400',
    label: 'Suscripción Oculta',
    emoji: '📦',
  },
  suscripcion_duplicada: {
    icon: Copy,
    color: '#F59E0B', // amber
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-400',
    label: 'Servicios Duplicados',
    emoji: '🔁',
  },
  delivery_excesivo: {
    icon: TrendingDown,
    color: '#F97316', // orange
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-400',
    label: 'Delivery Excesivo',
    emoji: '🍔',
  },
  compras_nocturnas: {
    icon: Moon,
    color: '#8B5CF6', // purple
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-400',
    label: 'Compras Nocturnas',
    emoji: '🌙',
  },
  microcompras_acumuladas: {
    icon: DollarSign,
    color: '#10B981', // green (irónico)
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-700 dark:text-green-400',
    label: 'Microcompras Acumuladas',
    emoji: '💸',
  },
};

const SEVERITY_CONFIG = {
  low: { label: 'Baja', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  medium: { label: 'Media', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  high: { label: 'Alta', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  critical: {
    label: 'Crítica',
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
};

// ============================================================================
// COMPONENTE: Leak Card Individual
// ============================================================================
function LeakCard({ leak, onResolve, onIgnore, currency }) {
  const [expanded, setExpanded] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const config = LEAK_CONFIG[leak.type] || LEAK_CONFIG.suscripcion_oculta;
  const severityConfig = SEVERITY_CONFIG[leak.severity] || SEVERITY_CONFIG.medium;
  const Icon = config.icon;

  // Generar explicación con IA al expandir
  useEffect(() => {
    if (expanded && !aiExplanation && !loadingExplanation) {
      generateAIExplanation();
    }
  }, [expanded]);

  const generateAIExplanation = async () => {
    setLoadingExplanation(true);
    try {
      // Llamar a función auxiliar con fallback DeepSeek → Qwen → OpenAI
      const explanation = await callAIWithFallback(leak);
      setAiExplanation(explanation);
    } catch (err) {
      console.error('Error generating explanation:', err);
      setAiExplanation(
        'No se pudo generar explicación automática. Revisa los detalles arriba.'
      );
    } finally {
      setLoadingExplanation(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${config.bgColor} rounded-xl border ${config.borderColor} overflow-hidden`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: config.color }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">
                  {config.label}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${severityConfig.bg} ${severityConfig.color} font-medium`}>
                  {severityConfig.label}
                </span>
              </div>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-2">
                {leak.description}
              </p>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[#6E6E73] dark:text-gray-400">Fuga mensual:</span>
                  <span className="ml-1 font-bold" style={{ color: config.color }}>
                    {formatCurrency(leak.monthly_estimated_leak, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[#6E6E73] dark:text-gray-400">Al año:</span>
                  <span className="ml-1 font-bold" style={{ color: config.color }}>
                    {formatCurrency(leak.monthly_estimated_leak * 12, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[#6E6E73] dark:text-gray-400">Confianza:</span>
                  <span className="ml-1 font-medium text-[#1a1a1a] dark:text-white">
                    {leak.confidence_score}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors">
            {expanded ? (
              <Icon component={ChevronUp} size="md" color="default" />
            ) : (
              <Icon component={ChevronDown} size="md" color="default" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* AI Explanation */}
              {loadingExplanation ? (
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1C8FA0]"></div>
                  <span className="text-sm text-[#6E6E73]">Generando explicación...</span>
                </div>
              ) : aiExplanation ? (
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon component={Sparkles} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#1a1a1a] dark:text-white leading-relaxed">
                      {aiExplanation}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Details */}
              {leak.details && Object.keys(leak.details).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider mb-2">
                    Detalles
                  </h4>
                  <div className="bg-white/30 dark:bg-black/10 rounded-lg p-3 space-y-1">
                    {Object.entries(leak.details).map(([key, value]) => {
                      // Skip arrays and large objects in simple view
                      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                        return null;
                      }
                      return (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-[#6E6E73] dark:text-gray-400 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-medium text-[#1a1a1a] dark:text-white">
                            {typeof value === 'number' && key.includes('amount')
                              ? formatCurrency(value, currency)
                              : value.toString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              {leak.suggested_actions && leak.suggested_actions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider mb-2">
                    Acciones Sugeridas
                  </h4>
                  <div className="space-y-2">
                    {leak.suggested_actions.map((action, idx) => (
                      <div
                        key={idx}
                        className="bg-white/30 dark:bg-black/10 rounded-lg p-3 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#1C8FA0]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#1C8FA0]">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#1a1a1a] dark:text-white font-medium mb-1">
                            {action.description}
                          </p>
                          {action.estimated_saving > 0 && (
                            <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                              Ahorro estimado:{' '}
                              <span className="font-bold text-green-600">
                                {formatCurrency(action.estimated_saving, currency)}/mes
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => onResolve(leak.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Icon component={Check} size="sm" color="default" className="mr-2" />
                  Marcar como Resuelto
                </Button>
                <Button
                  onClick={() => onIgnore(leak.id)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Icon component={X} size="sm" color="default" className="mr-2" />
                  Ignorar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// HELPER: Llamar IA con fallback DeepSeek → Qwen → OpenAI
// ============================================================================
async function callAIWithFallback(leak) {
  const prompt = buildLeakPrompt(leak);

  // 1. Intentar con DeepSeek
  try {
    console.log('🤖 Trying DeepSeek...');
    const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (deepseekKey) {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Eres un asesor financiero especializado en detectar fugas de dinero. Explica las fugas de forma clara, empática y accionable en 2-3 párrafos.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ DeepSeek success');
        return data.choices[0].message.content;
      }
    }
  } catch (err) {
    console.warn('DeepSeek failed, trying Qwen...', err);
  }

  // 2. Intentar con Qwen
  try {
    console.log('🤖 Trying Qwen...');
    const qwenKey = import.meta.env.VITE_QWEN_API_KEY;
    if (qwenKey) {
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${qwenKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'system',
                content: 'Eres un asesor financiero especializado en detectar fugas de dinero.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          parameters: {
            max_tokens: 300,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Qwen success');
        return data.output.text;
      }
    }
  } catch (err) {
    console.warn('Qwen failed, trying OpenAI...', err);
  }

  // 3. Fallback a OpenAI
  try {
    console.log('🤖 Trying OpenAI (fallback)...');
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un asesor financiero especializado en detectar fugas de dinero.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ OpenAI success');
        return data.choices[0].message.content;
      }
    }
  } catch (err) {
    console.error('All AI providers failed:', err);
  }

  // Si todo falla, retornar mensaje estático
  return 'Detectamos un patrón de gasto que puede estar afectando tu presupuesto. Revisa los detalles y acciones sugeridas arriba para recuperar este dinero.';
}

function buildLeakPrompt(leak) {
  const monthlyLeak = leak.monthly_estimated_leak;
  const yearlyLeak = monthlyLeak * 12;

  return `
Detecté una fuga financiera:

TIPO: ${leak.type}
DESCRIPCIÓN: ${leak.description}
FUGA MENSUAL: $${monthlyLeak.toLocaleString()}
FUGA ANUAL: $${yearlyLeak.toLocaleString()}
SEVERIDAD: ${leak.severity}

DETALLES:
${JSON.stringify(leak.details, null, 2)}

Genera un mensaje de 2-3 párrafos que:
1. Explique esta fuga de forma clara y empática
2. Cuantifique el impacto anual
3. Sugiera 1-2 acciones concretas

Tono: revelador pero no alarmista, empático, práctico.
`;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function LeakHunterPanel() {
  const { user } = useAuth();
  const { currency } = useUserCurrency();
  const [loading, setLoading] = useState(true);
  const [hunting, setHunting] = useState(false);
  const [leaks, setLeaks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, resolved

  useEffect(() => {
    if (user?.id) {
      loadLeaks();
    }
  }, [user?.id]);

  const loadLeaks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leak_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('monthly_estimated_leak', { ascending: false });

      if (error) throw error;

      setLeaks(data || []);
      calculateSummary(data || []);
    } catch (err) {
      console.error('Error loading leaks:', err);
    } finally {
      setLoading(false);
    }
  };

  const huntLeaks = async () => {
    try {
      setHunting(true);
      const { data, error } = await supabase.functions.invoke('leak-hunter', {
        body: { user_id: user.id },
      });

      if (error) throw error;

      if (data?.success) {
        setSummary(data.summary);
        await loadLeaks();
      }
    } catch (err) {
      console.error('Error hunting leaks:', err);
    } finally {
      setHunting(false);
    }
  };

  const calculateSummary = (leakData) => {
    const activeLeaks = leakData.filter((l) => l.status === 'active');
    const totalMonthly = activeLeaks.reduce((sum, l) => sum + l.monthly_estimated_leak, 0);

    setSummary({
      total_leaks: activeLeaks.length,
      monthly_leak: totalMonthly,
      yearly_leak: totalMonthly * 12,
    });
  };

  const handleResolve = async (leakId) => {
    try {
      const { error } = await supabase
        .from('leak_insights')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', leakId);

      if (error) throw error;

      await loadLeaks();
    } catch (err) {
      console.error('Error resolving leak:', err);
    }
  };

  const handleIgnore = async (leakId) => {
    try {
      const { error } = await supabase
        .from('leak_insights')
        .update({ status: 'ignored' })
        .eq('id', leakId);

      if (error) throw error;

      await loadLeaks();
    } catch (err) {
      console.error('Error ignoring leak:', err);
    }
  };

  const filteredLeaks = leaks.filter((leak) => {
    if (filter === 'all') return true;
    return leak.status === filter;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C8FA0]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-[22px] p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">🔍 Leak Hunter</h2>
            <p className="text-white/90 text-sm">
              Detecta gastos invisibles que se "fugan" sin que lo notes
            </p>
          </div>
          <Button
            onClick={huntLeaks}
            disabled={hunting}
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${hunting ? 'animate-spin' : ''}`} />
            {hunting ? 'Buscando...' : 'Buscar Fugas'}
          </Button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/80 text-xs mb-1">Fugas Detectadas</p>
              <p className="text-3xl font-bold">{summary.total_leaks}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/80 text-xs mb-1">Fuga Mensual</p>
              <p className="text-3xl font-bold">{formatCurrency(summary.monthly_leak, currency)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/80 text-xs mb-1">Fuga Anual</p>
              <p className="text-3xl font-bold">{formatCurrency(summary.yearly_leak, currency)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#1C8FA0] text-white'
                : 'bg-gray-100 dark:bg-white/5 text-[#6E6E73] hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Resueltas'}
          </button>
        ))}
      </div>

      {/* Leak Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredLeaks.map((leak) => (
            <LeakCard
              key={leak.id}
              leak={leak}
              onResolve={handleResolve}
              onIgnore={handleIgnore}
              currency={currency}
            />
          ))}
        </AnimatePresence>

        {filteredLeaks.length === 0 && (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-12 text-center">
            <Icon component={AlertTriangle} size="md" color="default" className="dark: mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-2">
              {filter === 'active' ? 'Sin fugas activas' : 'Sin fugas detectadas'}
            </h3>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
              {filter === 'active'
                ? '¡Excelente! No hay fugas activas en este momento.'
                : 'Haz clic en "Buscar Fugas" para analizar tus transacciones.'}
            </p>
            {filter === 'all' && (
              <Button onClick={huntLeaks} disabled={hunting}>
                Buscar Fugas Ahora
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
