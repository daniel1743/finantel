
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  MoreHorizontal, 
  ChevronRight,
  Sparkles,
  Home,
  ShoppingBag,
  Car,
  Coffee,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data
const budgetData = [
  { id: 1, name: "Hogar", spent: 980, total: 1200, icon: Home, color: "text-[#1C8FA0]" },
  { id: 2, name: "Alimentación", spent: 450, total: 500, icon: ShoppingBag, color: "text-[#E47B45]" },
  { id: 3, name: "Transporte", spent: 120, total: 300, icon: Car, color: "text-[#1a1a1a] dark:text-white" },
  { id: 4, name: "Ocio", spent: 210, total: 200, icon: Coffee, color: "text-purple-500" },
  { id: 5, name: "Servicios", spent: 145, total: 150, icon: Zap, color: "text-yellow-500" },
];

const RingChart = ({ percentage, color, size = 200, strokeWidth = 16 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Ring */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-100 dark:text-gray-800"
        />
        {/* Progress Ring */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={cn("transition-colors duration-500", color)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">{percentage}%</span>
        <span className="text-xs text-[#6E6E73] dark:text-gray-400 font-medium uppercase tracking-wider mt-1">Utilizado</span>
      </div>
    </div>
  );
};

const BudgetCard = ({ category }) => {
  const percentage = Math.min(100, Math.round((category.spent / category.total) * 100));
  let statusColor = "bg-[#1C8FA0]";
  if (percentage > 100) statusColor = "bg-red-500";
  else if (percentage > 90) statusColor = "bg-[#E47B45]";
  else if (percentage > 70) statusColor = "bg-yellow-500";

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg dark:hover:shadow-black/20 transition-all group cursor-pointer relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
            <category.icon className={cn("w-5 h-5", category.color)} />
          </div>
          <div>
            <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">{category.name}</h3>
            <div className="flex items-baseline gap-1 text-xs text-[#6E6E73] dark:text-gray-400">
              <span className="font-medium text-[#1a1a1a] dark:text-white">${category.spent}</span>
              <span>/ ${category.total}</span>
            </div>
          </div>
        </div>
        <div className={cn("w-2 h-2 rounded-full", statusColor)} />
      </div>

      <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
          className={cn("h-full rounded-full transition-colors", statusColor)}
        />
      </div>
      
      <div className="flex justify-between text-xs font-medium">
        <span className={percentage > 100 ? "text-red-500" : "text-[#6E6E73] dark:text-gray-400"}>
          {percentage > 100 ? `${percentage - 100}% Excedido` : `${100 - percentage}% Restante`}
        </span>
        <span className="text-[#1a1a1a] dark:text-white">${Math.max(0, category.total - category.spent)} disp.</span>
      </div>
    </motion.div>
  );
};

const Budgets = () => {
  const [period, setPeriod] = useState('monthly');
  const totalBudget = 2350;
  const totalSpent = 1905;
  const totalPercentage = Math.round((totalSpent / totalBudget) * 100);
  
  let ringColor = "text-[#1C8FA0]";
  if (totalPercentage > 90) ringColor = "text-[#E47B45]";
  if (totalPercentage > 100) ringColor = "text-red-500";

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Presupuestos</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Controla cada centavo con precisión</p>
        </div>
        
        <div className="bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-gray-200 dark:border-white/10 flex shadow-sm">
          {['Mensual', 'Trimestral', 'Anual'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p.toLowerCase())}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                period === p.toLowerCase()
                  ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-md" 
                  : "text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Ring Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1C8FA0] to-[#E47B45] opacity-50" />
          <h2 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-8 self-start">Resumen Global</h2>
          
          <RingChart percentage={totalPercentage} color={ringColor} size={240} />
          
          <div className="grid grid-cols-2 gap-8 w-full mt-8 pt-8 border-t border-gray-50 dark:border-white/5">
            <div className="text-center">
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Gastado</p>
              <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">${totalSpent}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Disponible</p>
              <p className="text-2xl font-bold text-[#1C8FA0] font-['Inter_Tight']">${totalBudget - totalSpent}</p>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="lg:col-span-8 space-y-6">
           {/* AI Recommendation */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#1C8FA0]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] dark:text-white">Oportunidad de Ahorro</h3>
                <p className="text-sm text-[#6E6E73] dark:text-gray-400 max-w-md mt-1">
                  Si reduces tu presupuesto de <span className="font-bold text-[#1a1a1a] dark:text-white">Ocio</span> un 10%, podrías destinar <span className="font-bold text-[#1C8FA0]">$20 extra</span> a tu fondo de viaje cada mes.
                </p>
              </div>
            </div>
            <button className="px-6 py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg whitespace-nowrap">
              Aplicar recomendación
            </button>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {budgetData.map((budget) => (
              <BudgetCard key={budget.id} category={budget} />
            ))}
            
            {/* Add New Budget */}
            <button className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[22px] p-6 flex flex-col items-center justify-center gap-3 text-[#6E6E73] dark:text-gray-400 hover:border-[#1C8FA0] hover:text-[#1C8FA0] dark:hover:text-[#1C8FA0] hover:bg-[#1C8FA0]/5 transition-all group min-h-[180px]">
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-medium">Nuevo Presupuesto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
