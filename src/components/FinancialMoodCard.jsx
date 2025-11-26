// ============================================================================
// FINANCIAL MOOD CARD - React Component
// ============================================================================
// Muestra el estado emocional financiero del usuario con explicaciones
// generadas por IA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';

// ============================================================================
// CONFIGURACIÓN DE MOODS
// ============================================================================
const MOOD_CONFIG = {
  modo_ahorro: {
    emoji: '💰',
    color: '#10B981', // green
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-700 dark:text-green-400',
    label: 'Modo Ahorro',
    description: '¡Excelente! Estás ahorrando activamente',
  },
  disciplinado: {
    emoji: '🎯',
    color: '#3B82F6', // blue
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-400',
    label: 'Disciplinado',
    description: 'Siguiendo tus presupuestos consistentemente',
  },
  estable: {
    emoji: '✅',
    color: '#8B5CF6', // purple
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-400',
    label: 'Estable',
    description: 'Comportamiento financiero saludable',
  },
  calmado: {
    emoji: '😌',
    color: '#06B6D4', // cyan
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    label: 'Calmado',
    description: 'Gastos bajo control, sigue así',
  },
  impulsivo: {
    emoji: '🛍️',
    color: '#F59E0B', // amber
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-400',
    label: 'Impulsivo',
    description: 'Muchos gastos no planificados',
  },
  estresado: {
    emoji: '😰',
    color: '#EF4444', // red
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-400',
    label: 'Estresado',
    description: 'Superando límites, cuidado',
  },
  descontrolado: {
    emoji: '🚨',
    color: '#DC2626', // dark red
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
    textColor: 'text-red-800 dark:text-red-300',
    label: 'Descontrolado',
    description: 'Múltiples señales de alarma',
  },
  recuperacion: {
    emoji: '🌱',
    color: '#84CC16', // lime
    bgColor: 'bg-lime-50 dark:bg-lime-900/20',
    borderColor: 'border-lime-200 dark:border-lime-800',
    textColor: 'text-lime-700 dark:text-lime-400',
    label: 'Recuperación',
    description: 'Mejorando después de período difícil',
  },
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function FinancialMoodCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [mood, setMood] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [error, setError] = useState(null);

  // Cargar mood al montar
  useEffect(() => {
    if (user?.id) {
      loadMood();
    }
  }, [user?.id]);

  // ========================================================================
  // Cargar mood desde la base de datos
  // ========================================================================
  const loadMood = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('financial_mood_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        setMood(data);
        // Generar explicación con IA
        await generateAIExplanation(data);
      } else {
        // No hay mood, calcular uno nuevo
        await calculateMood();
      }
    } catch (err) {
      console.error('Error loading mood:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Calcular mood llamando a Edge Function
  // ========================================================================
  const calculateMood = async () => {
    try {
      setCalculating(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke(
        'calculate-financial-mood',
        {
          body: { user_id: user.id },
        }
      );

      if (error) throw error;

      if (data?.mood) {
        setMood({
          ...data.snapshot,
          mood_label: data.mood.label,
          score: data.mood.score,
          trend: data.mood.trend,
          reasons: data.mood.reasons,
          alerts: data.mood.alerts,
          metrics: data.mood.metrics,
        });

        // Generar explicación con IA
        await generateAIExplanation({
          mood_label: data.mood.label,
          score: data.mood.score,
          reasons: data.mood.reasons,
          metrics: data.mood.metrics,
        });
      }
    } catch (err) {
      console.error('Error calculating mood:', err);
      setError(err.message);
    } finally {
      setCalculating(false);
    }
  };

  // ========================================================================
  // Generar explicación con IA (OpenAI GPT)
  // ========================================================================
  const generateAIExplanation = async (moodData) => {
    try {
      // Construir prompt para la IA
      const prompt = buildAIPrompt(moodData);

      // Llamar a OpenAI (puedes usar tu Edge Function existente)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un asesor financiero amigable y cercano. Tu trabajo es explicar en 2-3 frases cortas el estado financiero emocional del usuario. Usa un tono motivador y empático.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiExplanation(data.choices[0].message.content);
      }
    } catch (err) {
      console.error('Error generating AI explanation:', err);
      // Usar explicación por defecto
      setAiExplanation(MOOD_CONFIG[moodData.mood_label]?.description || '');
    }
  };

  // ========================================================================
  // Construir prompt para IA
  // ========================================================================
  const buildAIPrompt = (moodData) => {
    const config = MOOD_CONFIG[moodData.mood_label];
    const topReasons = moodData.reasons?.slice(0, 3) || [];

    return `
El usuario tiene un estado financiero "${config?.label || moodData.mood_label}" con un score de ${moodData.score}/100.

Principales factores:
${topReasons.map((r) => `- ${r.description} (impacto: ${r.impact > 0 ? '+' : ''}${r.impact})`).join('\n')}

Métricas clave:
- Gastos impulsivos: ${moodData.metrics?.impulse_percentage || 0}%
- Cumplimiento de presupuestos: ${moodData.metrics?.budget_compliance || 0}%
- Tasa de ahorro: ${moodData.metrics?.saving_rate || 0}%

Explica en 2-3 frases cortas y motivadoras qué significa esto para el usuario y qué puede hacer.
`.trim();
  };

  // ========================================================================
  // Renderizar icono de tendencia
  // ========================================================================
  const renderTrendIcon = () => {
    if (!mood?.trend) return null;

    switch (mood.trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  // ========================================================================
  // Renderizar barra de score
  // ========================================================================
  const renderScoreBar = () => {
    if (!mood) return null;

    const config = MOOD_CONFIG[mood.mood_label] || MOOD_CONFIG.estable;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#6E6E73] dark:text-gray-400">
            Salud Financiera
          </span>
          <span className="text-lg font-bold" style={{ color: config.color }}>
            {mood.score}/100
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${mood.score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: config.color }}
          />
        </div>
      </div>
    );
  };

  // ========================================================================
  // Render
  // ========================================================================
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C8FA0]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
        <Button onClick={loadMood} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!mood) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 p-6">
        <div className="text-center">
          <Info className="w-12 h-12 text-[#6E6E73] dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-2">
            Sin datos suficientes
          </h3>
          <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
            Necesitas al menos 3 transacciones para calcular tu estado financiero
          </p>
          <Button onClick={calculateMood} disabled={calculating}>
            {calculating ? 'Calculando...' : 'Calcular Ahora'}
          </Button>
        </div>
      </div>
    );
  }

  const config = MOOD_CONFIG[mood.mood_label] || MOOD_CONFIG.estable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bgColor} rounded-[22px] border-2 ${config.borderColor} p-6 shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{config.emoji}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-2xl font-bold ${config.textColor}`}>
                {config.label}
              </h3>
              {renderTrendIcon()}
            </div>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
              Estado financiero actual
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={calculateMood}
          disabled={calculating}
          className="hover:bg-white/50 dark:hover:bg-black/20"
        >
          <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Score Bar */}
      <div className="mb-6">{renderScoreBar()}</div>

      {/* AI Explanation */}
      {aiExplanation && (
        <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#1C8FA0] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#1a1a1a] dark:text-white leading-relaxed">
              {aiExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Top Reasons */}
      {mood.reasons && mood.reasons.length > 0 && (
        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider">
            Principales Factores
          </h4>
          {mood.reasons.slice(0, 3).map((reason, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white/30 dark:bg-black/10 rounded-lg p-3"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  reason.impact > 0
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    reason.impact > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {reason.impact > 0 ? '+' : ''}
                  {reason.impact}
                </span>
              </div>
              <p className="text-sm text-[#1a1a1a] dark:text-white flex-1">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {mood.alerts && mood.alerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider">
            Alertas
          </h4>
          {mood.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-lg p-3 ${
                alert.severity === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : alert.severity === 'medium'
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  alert.severity === 'high'
                    ? 'text-red-600'
                    : alert.severity === 'medium'
                    ? 'text-amber-600'
                    : 'text-blue-600'
                }`}
              />
              <p className="text-sm text-[#1a1a1a] dark:text-white flex-1">
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer - Trend info */}
      {mood.trend && mood.trend !== 'unknown' && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6E6E73] dark:text-gray-400">Tendencia:</span>
            <span
              className={`font-medium ${
                mood.trend === 'improving'
                  ? 'text-green-600'
                  : mood.trend === 'declining'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {mood.trend === 'improving'
                ? 'Mejorando'
                : mood.trend === 'declining'
                ? 'Empeorando'
                : 'Estable'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
