import React, { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Mic,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  Search,
  MoreHorizontal,
  ShoppingBag,
  Car,
  Home,
  Coffee,
  Plane,
  ArrowUpRight,
  Activity,
  Target,
  DollarSign,
  Calendar,
  X,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { cn, getLocalDateString, parseLocalDate } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import VoiceRecordingScreen from '@/components/VoiceRecordingScreen';
import { playStartRecordingSound } from '@/utils/audioEffects';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  ReferenceLine
} from 'recharts';

// =====================================================
// PALETA DE COLORES PROFESIONAL
// =====================================================
const COLORS = {
  primary: '#1C8FA0',
  primaryDark: '#167a8a',
  success: '#10b981',
  successDark: '#059669',
  warning: '#f59e0b',
  warningDark: '#d97706',
  danger: '#ef4444',
  dangerDark: '#dc2626',
  gray: '#6E6E73',
};

const CHART_COLORS = [
  '#1C8FA0', // Teal
  '#E47B45', // Orange
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#14B8A6', // Cyan
  '#6366F1', // Indigo
];

// =====================================================
// KPI CARD MEJORADO CON GRADIENTES Y CONTEXTO
// =====================================================
const ImprovedKPICard = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  trendUp,
  icon: Icon,
  gradientFrom,
  gradientTo,
  delay,
  comparisonValue,
  comparisonLabel,
  targetValue,
  targetLabel
}) => {
  const percentage = trend && trend.length > 1 ?
    ((trend[trend.length - 1] - trend[0]) / trend[0]) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-[#1a1a1a] rounded-[24px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      {/* Gradient Background */}
      <div
        className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-20"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
        }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
            }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
            trendUp
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400'
              : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-600 dark:text-red-400'
          }`}>
            {trendUp ? <Icon component={TrendingUp} size="md" color="default" className=".5 .5" /> : <Icon component={TrendingDown} size="md" color="default" className=".5 .5" />}
            {trendValue}
          </div>
        </div>

        <h3 className="text-[#6E6E73] dark:text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</h3>
        <p className="text-4xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight'] tracking-tight mb-2">
          {value}
        </p>

        {subtitle && (
          <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-3">{subtitle}</p>
        )}

        {/* Comparación con período anterior */}
        {comparisonValue && (
          <div className="flex items-center gap-2 text-xs text-[#6E6E73] dark:text-gray-400 mb-3">
            <span>{comparisonLabel}:</span>
            <span className="font-semibold text-[#1a1a1a] dark:text-white">{comparisonValue}</span>
          </div>
        )}

        {/* Meta u objetivo */}
        {targetValue && (
          <div className="flex items-center gap-2 text-xs mb-4">
            <Icon component={Target} size="md" color="primary" className=".5 .5" />
            <span className="text-[#6E6E73] dark:text-gray-400">{targetLabel}:</span>
            <span className="font-semibold text-[#1C8FA0]">{targetValue}</span>
          </div>
        )}

        {/* Sparkline Mejorado con Gradiente */}
        {trend && trend.length > 0 && (
          <div className="relative">
            <div className="h-12 flex items-end gap-0.5">
              {trend.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.6, delay: delay + (i * 0.05), ease: "easeOut" }}
                  className={`flex-1 rounded-t-md transition-all duration-300 ${
                    i === trend.length - 1
                      ? 'opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    background: i === trend.length - 1
                      ? `linear-gradient(180deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
                      : trendUp
                        ? `linear-gradient(180deg, ${COLORS.success}40 0%, ${COLORS.successDark}20 100%)`
                        : `linear-gradient(180deg, ${COLORS.danger}40 0%, ${COLORS.dangerDark}20 100%)`
                  }}
                />
              ))}
            </div>

            {/* Trend Percentage */}
            <div className="absolute -top-1 right-0 text-xs font-bold">
              <span className={percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {percentage >= 0 ? '+' : ''}{percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// =====================================================
// GAUGE CHART MEJORADO CON ZONAS DE RIESGO
// =====================================================
const ImprovedGaugeChart = ({ value, max, label, size = 220, delay = 0 }) => {
  const safeValue = isNaN(value) || value === null || value === undefined ? 0 : Number(value);
  const safeMax = isNaN(max) || max === null || max === undefined || max === 0 ? 1 : Number(max);
  const percentage = Math.min(100, Math.max(0, (safeValue / safeMax) * 100));

  // Determinar color y zona según porcentaje
  let gaugeColor, zoneName, emoji;
  if (percentage < 20) {
    gaugeColor = COLORS.danger;
    zoneName = "Crítico";
    emoji = "🔴";
  } else if (percentage < 40) {
    gaugeColor = COLORS.warning;
    zoneName = "Bajo";
    emoji = "🟡";
  } else if (percentage < 70) {
    gaugeColor = COLORS.primary;
    zoneName = "Bueno";
    emoji = "🔵";
  } else {
    gaugeColor = COLORS.success;
    zoneName = "Excelente";
    emoji = "🟢";
  }

  const data = [
    { name: 'Actual', value: percentage, fill: gaugeColor }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center"
    >
      <ResponsiveContainer width={size} height={size * 0.6}>
        <RadialBarChart
          cx="50%"
          cy="80%"
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gaugeColor} stopOpacity={1} />
              <stop offset="100%" stopColor={gaugeColor} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <RadialBar
            minAngle={15}
            background={{ fill: '#f3f4f6' }}
            clockWise
            dataKey="value"
            cornerRadius={10}
            fill="url(#gaugeGradient)"
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="text-center -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.5 }}
          className="space-y-1"
        >
          <p className="text-4xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">
            {safeValue.toFixed(1)}%
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <p className="text-sm font-bold" style={{ color: gaugeColor }}>{zoneName}</p>
          </div>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 font-medium">{label}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// =====================================================
// BULLET CHART PROFESIONAL PARA PRESUPUESTOS
// =====================================================
const BulletChart = ({ name, value, budget, delay }) => {
  const percentage = budget > 0 ? (value / budget) * 100 : 0;
  const optimalZone = 70; // 0-70% verde
  const warningZone = 90; // 70-90% amarillo
  // 90-100%+ rojo

  let color, status, emoji;
  if (percentage < optimalZone) {
    color = COLORS.success;
    status = "Óptimo";
    emoji = "✅";
  } else if (percentage < warningZone) {
    color = COLORS.warning;
    status = "Atención";
    emoji = "⚠️";
  } else {
    color = COLORS.danger;
    status = "Excedido";
    emoji = "🔴";
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white flex items-center gap-2">
          {name}
          <span className="text-xs">{emoji}</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6E6E73] dark:text-gray-400">
            ${value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="relative h-6 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
        {/* Zonas de fondo */}
        <div className="absolute inset-0 flex">
          <div className="bg-green-100 dark:bg-green-900/20" style={{ width: `${optimalZone}%` }} />
          <div className="bg-yellow-100 dark:bg-yellow-900/20" style={{ width: `${warningZone - optimalZone}%` }} />
          <div className="bg-red-100 dark:bg-red-900/20" style={{ width: `${100 - warningZone}%` }} />
        </div>

        {/* Barra de progreso con gradiente */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-1"
          style={{
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`
          }}
        >
          {percentage > 10 && (
            <span className="text-xs font-bold text-white drop-shadow">
              ${value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          )}
        </motion.div>

        {/* Marcador de objetivo */}
        {budget > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#1a1a1a] dark:bg-white opacity-50"
            style={{ left: '100%' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] dark:bg-white rounded-full" />
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-[#6E6E73] dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className={`font-semibold ${percentage < 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {status}
          </span>
        </span>
        <span>
          Presupuesto: <span className="font-semibold text-[#1a1a1a] dark:text-white">
            ${budget.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          {' • '}
          Disponible: <span className={`font-semibold ${budget - value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${Math.max(0, budget - value).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </span>
      </div>
    </motion.div>
  );
};

// =====================================================
// TOOLTIP INTELIGENTE PARA GRÁFICOS
// =====================================================
const SmartTooltip = ({ active, payload, label, comparisonData }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const previousValue = comparisonData ? comparisonData[label] : null;
  const change = previousValue ? ((data.value - previousValue) / previousValue) * 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 min-w-[200px]"
    >
      <div className="space-y-2">
        <p className="text-sm font-bold text-[#1a1a1a] dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
          {data.name || label}
        </p>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#6E6E73] dark:text-gray-400">Monto:</span>
            <span className="text-sm font-bold text-[#1C8FA0]">
              ${(data.value || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {data.payload && data.payload.percentage && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#6E6E73] dark:text-gray-400">Del total:</span>
              <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                {data.payload.percentage.toFixed(1)}%
              </span>
            </div>
          )}

          {change !== null && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/10">
              <span className="text-xs text-[#6E6E73] dark:text-gray-400">vs Mes anterior:</span>
              <span className={`text-sm font-bold flex items-center gap-1 ${
                change >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}

          {data.payload && data.payload.budget && (
            <div className="pt-2 border-t border-gray-100 dark:border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6E6E73] dark:text-gray-400">Presupuesto:</span>
                <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                  ${data.payload.budget.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-[#6E6E73] dark:text-gray-400">Estado:</span>
                <span className={`text-xs font-bold ${
                  (data.value / data.payload.budget) < 0.9
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {(data.value / data.payload.budget) < 0.9 ? '✅ Dentro' : '⚠️ Excedido'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tip inteligente */}
        {change !== null && change > 15 && (
          <div className="pt-2 border-t border-gray-100 dark:border-white/10">
            <p className="text-xs text-[#6E6E73] dark:text-gray-400 flex items-start gap-1">
              <Icon component={Zap} size="xs" color="default" className="flex-shrink-0 mt-0.5" />
              <span>Tip: Gasto aumentó {change.toFixed(0)}%. Considera reducir en esta categoría.</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// =====================================================
// ACCESO RÁPIDO (NavCards)
// =====================================================
const QuickAccessCard = ({ title, description, icon: Icon, to, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
  >
    <Link
      to={to}
      className="block h-full bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110 group-hover:opacity-10`} style={{ backgroundColor: color }} />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium group-hover:gap-2 transition-all" style={{ color }}>
          Explorar <Icon component={ChevronRight} size="sm" color="default" className="ml-1" />
        </div>
      </div>
    </Link>
  </motion.div>
);

// Continuaré con el resto del componente principal en la siguiente parte...
