
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ChartCard = ({ title, children, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-white dark:bg-[#1a1a1a] p-6 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all",
      className
    )}
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">{title}</h3>
      <button className="p-1.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-[#6E6E73] dark:text-gray-400 transition-colors">
        <Download className="w-4 h-4" />
      </button>
    </div>
    {children}
  </motion.div>
);

const HeatMap = () => {
  // Mock data for heatmap
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const weeks = [1, 2, 3, 4];
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2">
        {days.map(d => (
          <span key={d} className="text-xs font-medium text-[#6E6E73] dark:text-gray-400 w-8 text-center">{d}</span>
        ))}
      </div>
      {weeks.map((w, i) => (
        <div key={w} className="flex justify-between gap-2">
          {days.map((d, j) => {
            const intensity = Math.random();
            const bg = intensity > 0.8 ? 'bg-[#1C8FA0]' : 
                      intensity > 0.5 ? 'bg-[#1C8FA0]/60' : 
                      intensity > 0.2 ? 'bg-[#1C8FA0]/30' : 'bg-gray-100 dark:bg-white/5';
            return (
              <motion.div
                key={`${i}-${j}`}
                whileHover={{ scale: 1.2 }}
                className={cn("w-8 h-8 rounded-md cursor-pointer transition-colors", bg)}
                title={`Gasto: $${Math.round(intensity * 100)}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Analysis = () => {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Análisis Profundo</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Descubre patrones ocultos en tus finanzas</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-gray-200 dark:border-white/10 flex shadow-sm">
            {['Semana', 'Mes', 'Año'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t.toLowerCase())}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  timeRange === t.toLowerCase()
                    ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-md" 
                    : "text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="p-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-xl shadow-lg hover:opacity-90 transition-opacity">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Patrón Detectado", desc: "Gastas un 35% más los viernes", icon: Calendar, color: "text-[#E47B45]" },
          { title: "Categoría Top", desc: "Hogar consume el 40% de tu ingreso", icon: Layers, color: "text-[#1C8FA0]" },
          { title: "Hábito de Ahorro", desc: "Ahorras consistentemente el 15%", icon: TrendingUp, color: "text-green-500" }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm flex items-start gap-4"
          >
            <div className={cn("w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm uppercase tracking-wider opacity-70">{item.title}</h3>
              <p className="text-lg font-bold text-[#1a1a1a] dark:text-white mt-1 leading-tight">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <ChartCard title="Tendencias Mensuales" className="lg:col-span-2 min-h-[300px]">
          <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
            {[35, 45, 30, 60, 75, 50, 65, 80, 70, 85, 90, 60].map((h, i) => (
              <div key={i} className="w-full flex flex-col justify-end gap-2 group cursor-pointer">
                <div className="relative w-full bg-gray-100 dark:bg-white/5 rounded-t-lg overflow-hidden" style={{ height: '100%' }}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="absolute bottom-0 w-full bg-[#1C8FA0] opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <span className="text-[10px] text-center text-[#6E6E73] dark:text-gray-400">{i + 1}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Heatmap */}
        <ChartCard title="Intensidad de Gasto">
          <HeatMap />
          <div className="mt-6 pt-6 border-t border-gray-50 dark:border-white/5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6E6E73] dark:text-gray-400">Menor</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-gray-100 dark:bg-white/5" />
                <div className="w-4 h-4 rounded bg-[#1C8FA0]/30" />
                <div className="w-4 h-4 rounded bg-[#1C8FA0]/60" />
                <div className="w-4 h-4 rounded bg-[#1C8FA0]" />
              </div>
              <span className="text-[#6E6E73] dark:text-gray-400">Mayor</span>
            </div>
          </div>
        </ChartCard>

        {/* Distribution */}
        <ChartCard title="Distribución de Gastos">
          <div className="flex items-center justify-center py-4">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="20" className="dark:stroke-white/5" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1C8FA0" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="100" className="opacity-100" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E47B45" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="200" className="opacity-100" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a1a1a" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="230" className="opacity-100 dark:stroke-gray-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#1a1a1a] dark:text-white">$2.4k</span>
                <span className="text-xs text-[#6E6E73] dark:text-gray-400">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {[
              { label: 'Hogar', val: '60%', color: 'bg-[#1C8FA0]' },
              { label: 'Comida', val: '25%', color: 'bg-[#E47B45]' },
              { label: 'Otros', val: '15%', color: 'bg-[#1a1a1a] dark:bg-gray-500' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", item.color)} />
                  <span className="text-[#6E6E73] dark:text-gray-400">{item.label}</span>
                </div>
                <span className="font-bold text-[#1a1a1a] dark:text-white">{item.val}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Top Categories */}
        <ChartCard title="Top Categorías" className="lg:col-span-2">
          <div className="space-y-4">
            {[
              { name: 'Alquiler & Servicios', amount: 1200, max: 1500 },
              { name: 'Supermercado', amount: 450, max: 1500 },
              { name: 'Transporte', amount: 320, max: 1500 },
              { name: 'Ocio', amount: 210, max: 1500 },
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#1a1a1a] dark:text-white">{cat.name}</span>
                  <span className="text-[#6E6E73] dark:text-gray-400">${cat.amount}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.amount / cat.max) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-[#1C8FA0] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analysis;
