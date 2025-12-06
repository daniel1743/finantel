import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { useToolTracking } from '@/hooks/useToolTracking';

const ChartCard = ({ title, children, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-white dark:bg-[#1a1a1a] p-4 md:p-6 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all",
      className
    )}
  >
    <div className="flex justify-between items-center mb-4 md:mb-6">
      <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">{title}</h3>
      <button className="p-1.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-[#6E6E73] dark:text-gray-400 transition-colors">
        <Icon component={Download} size="sm" color="default" />
      </button>
    </div>
    {children}
  </motion.div>
);

const ColorLegendItem = ({ label, bgColor }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div 
        className={cn("w-5 h-5 rounded cursor-help transition-all hover:scale-110 hover:shadow-md", bgColor)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
      />
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1a1a1a] dark:bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 shadow-lg"
        >
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1a1a1a] dark:border-t-gray-800" />
        </motion.div>
      )}
    </div>
  );
};

const HeatMap = ({ transactions, timeRange }) => {
  const heatMapData = useMemo(() => {
    if (!transactions || transactions.length === 0) return {};

    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const dayMap = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' };
    const data = {};

    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'semana') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredTransactions = transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });

    // Agrupar por día de la semana
    const dayTotals = {};
    filteredTransactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const dayOfWeek = txDate.getDay();
      const dayKey = dayMap[dayOfWeek];
      if (!dayTotals[dayKey]) dayTotals[dayKey] = 0;
      dayTotals[dayKey] += parseFloat(tx.amount || 0);
    });

    // Calcular máximo para normalizar
    const maxAmount = Math.max(...Object.values(dayTotals), 1);

    days.forEach(day => {
      const amount = dayTotals[day] || 0;
      const intensity = amount / maxAmount;
      data[day] = { amount, intensity };
    });

    return { data, maxAmount };
  }, [transactions, timeRange]);

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
            const dayData = heatMapData.data?.[d];
            const intensity = dayData?.intensity || 0;
            // Esquema de semáforo: Verde (bajo) → Amarillo → Naranja → Rojo (alto)
            const bg = intensity > 0.8 ? 'bg-red-500' :      // Rojo: Peligro (gasto muy alto)
                      intensity > 0.6 ? 'bg-orange-500' :     // Naranja: Alerta (gasto alto)
                      intensity > 0.3 ? 'bg-yellow-400' :    // Amarillo: Atención (gasto moderado)
                      intensity > 0 ? 'bg-green-500' :        // Verde: Bueno (gasto bajo)
                      'bg-gray-100 dark:bg-white/5';           // Gris: Sin gastos
            return (
              <motion.div
                key={`${i}-${j}`}
                whileHover={{ scale: 1.2 }}
                className={cn("w-8 h-8 rounded-md cursor-pointer transition-colors", bg)}
                title={dayData ? `Gasto: $${dayData.amount.toFixed(2)}` : 'Sin gastos'}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Analysis = () => {
  const { user } = useAuth();
  const { transactions, categories, loading } = useFinance(user?.id);
  const [timeRange, setTimeRange] = useState('mes');

  // Calcular insights reales
  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      console.log('[Analysis] No hay transacciones');
      return [];
    }

    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'semana') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });

    console.log('[Analysis] Transacciones filtradas:', {
      total: transactions.length,
      filtradas: filteredTransactions.length,
      periodo: timeRange,
      desde: startDate.toLocaleDateString(),
      hasta: now.toLocaleDateString()
    });

    const expenses = filteredTransactions.filter(tx => tx.type === 'expense');
    const income = filteredTransactions.filter(tx => tx.type === 'income');
    
    console.log('[Analysis] Desglose:', {
      gastos: expenses.length,
      ingresos: income.length
    });

    const totalIncome = income.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    console.log('[Analysis] Totales:', {
      ingresos: totalIncome,
      gastos: totalExpenses,
      ahorro: savings,
      tasaAhorro: savingsRate
    });

    const insightsList = [];

    // 1. Patrón por día de la semana - SIEMPRE mostrar si hay gastos
    if (expenses.length > 0) {
      const dayTotals = {};
      const dayMap = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };
      
      expenses.forEach(tx => {
        const txDate = new Date(tx.date);
        const dayOfWeek = txDate.getDay();
        if (!dayTotals[dayOfWeek]) dayTotals[dayOfWeek] = 0;
        dayTotals[dayOfWeek] += parseFloat(tx.amount || 0);
      });

      if (Object.keys(dayTotals).length > 0) {
        const avgDayExpense = Object.values(dayTotals).reduce((a, b) => a + b, 0) / Object.keys(dayTotals).length;
        const maxDay = Object.entries(dayTotals).reduce((a, b) => dayTotals[a[0]] > dayTotals[b[0]] ? a : b);
        const maxDayName = dayMap[maxDay[0]];
        const maxDayAmount = dayTotals[maxDay[0]];
        const percentMore = avgDayExpense > 0 ? ((maxDayAmount - avgDayExpense) / avgDayExpense) * 100 : 0;
        
        // Mostrar siempre, con diferentes mensajes según el caso
        if (percentMore > 5 && expenses.length >= 2) {
          insightsList.push({
            title: "PATRÓN DETECTADO",
            desc: `Gastas un ${Math.round(percentMore)}% más los ${maxDayName.toLowerCase()}s`,
            icon: Calendar,
            color: "text-[#E47B45]"
          });
        } else if (expenses.length >= 1) {
          // Si no hay patrón claro, mostrar el día con más gastos
          insightsList.push({
            title: "PATRÓN DETECTADO",
            desc: `Tu mayor gasto es los ${maxDayName.toLowerCase()}s`,
            icon: Calendar,
            color: "text-[#E47B45]"
          });
        }
      } else {
        // Si no se puede determinar el día
        insightsList.push({
          title: "PATRÓN DETECTADO",
          desc: `Agrega más gastos para detectar patrones`,
          icon: Calendar,
          color: "text-[#E47B45]"
        });
      }
    } else if (filteredTransactions.length > 0) {
      // Si hay transacciones pero no gastos
      insightsList.push({
        title: "PATRÓN DETECTADO",
        desc: `No hay gastos en este período`,
        icon: Calendar,
        color: "text-[#6E6E73]"
      });
    }

    // 2. Categoría que consume más porcentaje del ingreso - SIEMPRE mostrar si hay gastos
    if (expenses.length > 0) {
      const categoryTotals = {};
      
      expenses.forEach(tx => {
        if (tx.categories) {
          const catName = tx.categories.name || 'Sin categoría';
          if (!categoryTotals[catName]) categoryTotals[catName] = 0;
          categoryTotals[catName] += parseFloat(tx.amount || 0);
        } else {
          // Contar gastos sin categoría
          if (!categoryTotals['Sin categoría']) categoryTotals['Sin categoría'] = 0;
          categoryTotals['Sin categoría'] += parseFloat(tx.amount || 0);
        }
      });

      if (Object.keys(categoryTotals).length > 0) {
        const topCategory = Object.entries(categoryTotals).reduce((a, b) => 
          categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b
        );
        
        // Mostrar siempre la categoría top, con diferentes mensajes según el caso
        if (totalIncome > 0) {
          const topCategoryPercent = (categoryTotals[topCategory[0]] / totalIncome) * 100;
          insightsList.push({
            title: "CATEGORÍA TOP",
            desc: `${topCategory[0]} consume el ${Math.round(topCategoryPercent)}% de tu ingreso`,
            icon: Layers,
            color: "text-[#1C8FA0]"
          });
        } else {
          // Si no hay ingresos, mostrar el monto absoluto
          const topCategoryAmount = categoryTotals[topCategory[0]];
          insightsList.push({
            title: "CATEGORÍA TOP",
            desc: `${topCategory[0]} es tu mayor gasto con $${topCategoryAmount.toLocaleString('es-CL')}`,
            icon: Layers,
            color: "text-[#1C8FA0]"
          });
        }
      } else {
        // Si no hay categorías
        insightsList.push({
          title: "CATEGORÍA TOP",
          desc: `Asigna categorías a tus gastos para ver análisis detallado`,
          icon: Layers,
          color: "text-[#6E6E73]"
        });
      }
    } else if (filteredTransactions.length > 0) {
      // Si hay transacciones pero no gastos
      insightsList.push({
        title: "CATEGORÍA TOP",
        desc: `No hay gastos en este período`,
        icon: Layers,
        color: "text-[#6E6E73]"
      });
    }

    // 3. Hábito de ahorro - SIEMPRE mostrar, incluso si es negativo
    // Esta tarjeta SIEMPRE debe aparecer si hay transacciones
    if (totalIncome > 0) {
      if (savingsRate > 0) {
        insightsList.push({
          title: "HÁBITO DE AHORRO",
          desc: `Ahorras consistentemente el ${Math.round(savingsRate)}%`,
          icon: TrendingUp,
          color: "text-green-500"
        });
      } else if (savingsRate < 0) {
        // Mostrar alerta si gastas más de lo que ganas
        insightsList.push({
          title: "HÁBITO DE AHORRO",
          desc: `Estás gastando ${Math.abs(Math.round(savingsRate))}% más de lo que ganas`,
          icon: TrendingDown,
          color: "text-red-500"
        });
      } else {
        // Si ahorras 0%
        insightsList.push({
          title: "HÁBITO DE AHORRO",
          desc: `Gastas exactamente lo que ganas (0% de ahorro)`,
          icon: Activity,
          color: "text-yellow-500"
        });
      }
    } else if (expenses.length > 0 && income.length === 0) {
      // Si solo hay gastos y no hay ingresos registrados
      insightsList.push({
        title: "HÁBITO DE AHORRO",
        desc: `No hay ingresos registrados en este período`,
        icon: AlertCircle,
        color: "text-[#6E6E73]"
      });
    } else if (expenses.length === 0 && income.length > 0) {
      // Si solo hay ingresos
      insightsList.push({
        title: "HÁBITO DE AHORRO",
        desc: `Solo hay ingresos registrados (100% de ahorro potencial)`,
        icon: TrendingUp,
        color: "text-green-500"
      });
    } else if (filteredTransactions.length > 0) {
      // Si hay transacciones pero no se pudo calcular
      insightsList.push({
        title: "HÁBITO DE AHORRO",
        desc: `Agrega ingresos y gastos para calcular tu tasa de ahorro`,
        icon: Activity,
        color: "text-[#6E6E73]"
      });
    }

    console.log('[Analysis] Insights generados:', insightsList.length, insightsList);
    
    return insightsList;
  }, [transactions, timeRange]);

  // Tendencias mensuales
  const monthlyTrends = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    const months = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === date.getMonth() && 
               txDate.getFullYear() === date.getFullYear() &&
               tx.type === 'expense';
      });
      
      const monthTotal = monthTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      months.push(monthTotal);
    }

    const maxMonth = Math.max(...months, 1);
    return months.map(amount => (amount / maxMonth) * 100);
  }, [transactions]);

  // Distribución de gastos por categoría
  const categoryDistribution = useMemo(() => {
    if (!transactions || !categories || transactions.length === 0) return [];

    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'semana') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredExpenses = transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });

    const categoryTotals = {};
    filteredExpenses.forEach(tx => {
      if (tx.categories) {
        const catName = tx.categories.name || 'Sin categoría';
        if (!categoryTotals[catName]) categoryTotals[catName] = 0;
        categoryTotals[catName] += parseFloat(tx.amount || 0);
      }
    });

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    const colors = ['#1C8FA0', '#E47B45', '#1a1a1a', '#10b981', '#8b5cf6', '#f59e0b'];
    
    return Object.entries(categoryTotals)
      .map(([name, amount], index) => ({
        name,
        amount,
        percent: (amount / total) * 100,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions, categories, timeRange]);

  // Top categorías
  const topCategories = useMemo(() => {
    return categoryDistribution.slice(0, 4);
  }, [categoryDistribution]);

  // Total de gastos para el gráfico circular
  const totalExpensesForChart = categoryDistribution.reduce((sum, cat) => sum + cat.amount, 0);

  // Calcular stroke-dasharray para el gráfico circular
  const calculateCircleData = () => {
    if (categoryDistribution.length === 0) return [];
    
    const circumference = 2 * Math.PI * 40; // radio 40
    let offset = 0;
    
    return categoryDistribution.map(cat => {
      const dashLength = (cat.percent / 100) * circumference;
      const currentOffset = offset;
      offset += dashLength;
      return {
        ...cat,
        dashLength,
        offset: circumference - currentOffset
      };
    });
  };

  const circleData = calculateCircleData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon component={Loader2} size="md" color="primary" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Análisis Profundo</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-base md:text-lg">Descubre patrones ocultos en tus finanzas</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-gray-200 dark:border-white/10 flex shadow-sm w-full sm:w-auto">
            {['Semana', 'Mes', 'Año'].map((t) => {
              const rangeMap = { 'Semana': 'semana', 'Mes': 'mes', 'Año': 'año' };
              return (
              <button
                key={t}
                  onClick={() => setTimeRange(rangeMap[t])}
                className={cn(
                  "px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex-1 sm:flex-none",
                    timeRange === rangeMap[t]
                    ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-md" 
                    : "text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                {t}
              </button>
              );
            })}
          </div>
          <button className="p-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-xl shadow-lg hover:opacity-90 transition-opacity w-full sm:w-auto flex items-center justify-center">
            <Icon component={Filter} size="md" color="default" />
          </button>
        </div>
      </div>

      {/* Insights Cards */}
      {insights.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {insights.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] p-4 md:p-6 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm flex items-start gap-3 md:gap-4"
          >
            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0", item.color)}>
              <item.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#1a1a1a] dark:text-white text-xs md:text-sm uppercase tracking-wider opacity-70">{item.title}</h3>
              <p className="text-base md:text-lg font-bold text-[#1a1a1a] dark:text-white mt-1 leading-tight break-words">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[22px] border border-gray-100 dark:border-white/5 text-center text-[#6E6E73] dark:text-gray-400">
          <p>No hay suficientes datos para generar insights. Agrega más transacciones para ver patrones.</p>
        </div>
      )}

      <div className="flex flex-col gap-4 md:gap-6">
        {/* Main Chart Area */}
        <ChartCard title="Tendencias Mensuales" className="w-full min-h-[250px] md:min-h-[300px]">
          {monthlyTrends.length > 0 ? (
          <div className="h-48 md:h-64 w-full flex items-end justify-between gap-1 md:gap-2 px-1 md:px-2 overflow-x-auto">
              {monthlyTrends.map((h, i) => (
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
          ) : (
            <div className="h-48 md:h-64 flex items-center justify-center text-[#6E6E73] dark:text-gray-400">
              <p className="text-sm md:text-base">No hay datos para mostrar</p>
            </div>
          )}
        </ChartCard>

        {/* Heatmap */}
        <ChartCard title="Intensidad de Gasto">
          <HeatMap transactions={transactions} timeRange={timeRange} />
          <div className="mt-6 pt-6 border-t border-gray-50 dark:border-white/5">
            <div className="flex items-center justify-center gap-1.5">
              <ColorLegendItem 
                bgColor="bg-gray-100 dark:bg-white/5" 
                label="Sin gasto" 
              />
              <ColorLegendItem 
                bgColor="bg-green-500" 
                label="Controlado" 
              />
              <ColorLegendItem 
                bgColor="bg-yellow-400" 
                label="Moderado" 
              />
              <ColorLegendItem 
                bgColor="bg-orange-500" 
                label="Riesgo" 
              />
              <ColorLegendItem 
                bgColor="bg-red-500" 
                label="Excesivo" 
              />
            </div>
          </div>
        </ChartCard>

        {/* Distribution */}
        <ChartCard title="Distribución de Gastos">
          {circleData.length > 0 ? (
            <>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="20" className="dark:stroke-white/5" />
                    {circleData.map((cat, i) => (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth="20"
                        strokeDasharray={`${cat.dashLength} 251.2`}
                        strokeDashoffset={cat.offset}
                        className="opacity-100"
                      />
                    ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#1a1a1a] dark:text-white">${(totalExpensesForChart / 1000).toFixed(1)}k</span>
                <span className="text-xs text-[#6E6E73] dark:text-gray-400">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
                {categoryDistribution.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[#6E6E73] dark:text-gray-400">{item.name}</span>
                </div>
                    <span className="font-bold text-[#1a1a1a] dark:text-white">{Math.round(item.percent)}%</span>
              </div>
            ))}
          </div>
            </>
          ) : (
            <div className="py-8 text-center text-[#6E6E73] dark:text-gray-400">
              <p>No hay datos para mostrar</p>
            </div>
          )}
        </ChartCard>

        {/* Top Categories */}
        <ChartCard title="Top Categorías" className="w-full">
          {topCategories.length > 0 ? (
          <div className="space-y-4">
              {topCategories.map((cat, i) => {
                const maxAmount = Math.max(...topCategories.map(c => c.amount), 1);
                return (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#1a1a1a] dark:text-white">{cat.name}</span>
                      <span className="text-[#6E6E73] dark:text-gray-400">${cat.amount.toFixed(2)}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                        animate={{ width: `${(cat.amount / maxAmount) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-[#1C8FA0] rounded-full"
                  />
                </div>
              </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-[#6E6E73] dark:text-gray-400">
              <p>No hay categorías para mostrar</p>
          </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Analysis;
