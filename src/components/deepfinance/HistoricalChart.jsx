// =====================================================
// COMPONENTE: HistoricalChart
// =====================================================
// Gráfico de línea mostrando el score histórico
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

const HistoricalChart = ({ analyses = [] }) => {
  if (!analyses || analyses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-gray-200 dark:border-white/10 p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20">
            <TrendingUp className="w-5 h-5 text-[#1C8FA0]" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
            Evolución del Score
          </h3>
        </div>
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-[#6E6E73] dark:text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-[#6E6E73] dark:text-gray-400">
            No hay suficientes análisis para mostrar la evolución
          </p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
            Realiza más análisis para ver tu progreso
          </p>
        </div>
      </motion.div>
    );
  }

  // Procesar datos para el gráfico
  const chartData = analyses
    .map((analysis) => {
      const date = analysis.analysis_date || analysis.created_at;
      const score = parseFloat(analysis.score) || 0;
      
      return {
        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        fullDate: date,
        score: Math.round(score),
        transactions: analysis.total_transactions || 0,
      };
    })
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Calcular promedio
  const averageScore = chartData.length > 0
    ? Math.round(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length)
    : 0;

  // Determinar color según score
  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#1C8FA0'; // teal
    if (score >= 40) return '#F59E0B'; // orange
    return '#EF4444'; // red
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-gray-200 dark:border-white/10 p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20">
            <TrendingUp className="w-5 h-5 text-[#1C8FA0]" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
            Evolución del Score
          </h3>
        </div>
        {averageScore > 0 && (
          <div className="text-right">
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">Promedio</p>
            <p className="text-lg font-bold text-[#1C8FA0]">{averageScore}/100</p>
          </div>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              stroke="#6E6E73"
              className="dark:stroke-gray-400"
              tick={{ fill: '#6E6E73', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#6E6E73"
              className="dark:stroke-gray-400"
              tick={{ fill: '#6E6E73', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#1a1a1a',
              }}
              labelStyle={{ color: '#1a1a1a' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#1C8FA0"
              strokeWidth={3}
              dot={{ fill: '#1C8FA0', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#6E6E73] dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#1C8FA0]" />
          <span>Score financiero</span>
        </div>
        <span>•</span>
        <span>{chartData.length} análisis mostrados</span>
      </div>
    </motion.div>
  );
};

export default HistoricalChart;

