import React from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const COLORS = {
  primary: '#1C8FA0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const ImprovedGaugeChart = ({ value, max, label, color, size = 220, delay = 0 }) => {
  const safeValue = isNaN(value) || value === null || value === undefined ? 0 : Number(value);
  const safeMax = isNaN(max) || max === null || max === undefined || max === 0 ? 1 : Number(max);
  const percentage = Math.min(100, Math.max(0, (safeValue / safeMax) * 100));

  // Determine color, zone and emoji by percentage
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

  const data = [{ name: 'Actual', value: percentage, fill: gaugeColor }];

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
            <linearGradient id={`gaugeGradient-${label}`} x1="0" y1="0" x2="1" y2="1">
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
            fill={`url(#gaugeGradient-${label})`}
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

export default ImprovedGaugeChart;
