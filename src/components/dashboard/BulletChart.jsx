import React from 'react';
import { motion } from 'framer-motion';

const COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const BulletChart = ({ name, value, budget, delay }) => {
  const percentage = budget > 0 ? (value / budget) * 100 : 0;
  const optimalZone = 70; // 0-70% green
  const warningZone = 90; // 70-90% yellow

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
            ${value.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
          </span>
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="relative h-6 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
        {/* Background zones */}
        <div className="absolute inset-0 flex">
          <div className="bg-green-100 dark:bg-green-900/20" style={{ width: `${optimalZone}%` }} />
          <div className="bg-yellow-100 dark:bg-yellow-900/20" style={{ width: `${warningZone - optimalZone}%` }} />
          <div className="bg-red-100 dark:bg-red-900/20" style={{ width: `${100 - warningZone}%` }} />
        </div>

        {/* Progress bar with gradient */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-1"
          style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)` }}
        >
          {percentage > 10 && (
            <span className="text-xs font-bold text-white drop-shadow">
              ${value.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
            </span>
          )}
        </motion.div>
      </div>

      <div className="flex justify-between text-xs text-[#6E6E73] dark:text-gray-400">
        <span className={`font-semibold ${percentage < 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {status}
        </span>
        <span>
          Disponible:{' '}
          <span className={`font-semibold ${budget - value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${Math.max(0, budget - value).toLocaleString('es-ES', { minimumFractionDigits: 0 })}
          </span>
        </span>
      </div>
    </motion.div>
  );
};

export default BulletChart;
