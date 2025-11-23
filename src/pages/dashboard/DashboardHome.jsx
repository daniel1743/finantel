import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  Sparkles, 
  Search, 
  MoreHorizontal,
  ShoppingBag,
  Car,
  Home,
  Coffee,
  Plane,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  DollarSign,
  PieChart,
  BarChart3,
  LineChart,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// =====================================================
// KPIs Cards - Tarjetas de Métricas Principales
// =====================================================
const KPICard = ({ title, value, subtitle, trend, trendValue, trendUp, icon: Icon, color, delay, gradient }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
  >
    {gradient && (
      <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
    )}
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trendValue}
        </div>
      </div>
      <h3 className="text-[#6E6E73] dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight'] tracking-tight mb-1">{value}</p>
      {subtitle && <p className="text-xs text-[#6E6E73] dark:text-gray-400">{subtitle}</p>}
      
      {/* Mini Sparkline Chart */}
      <div className="h-10 mt-4 flex items-end gap-1">
        {trend.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.5, delay: delay + (i * 0.05) }}
            className={`flex-1 rounded-t-sm ${trendUp ? 'bg-[#1C8FA0]/20 dark:bg-[#1C8FA0]/30' : 'bg-[#E47B45]/20 dark:bg-[#E47B45]/30'} group-hover:opacity-80 transition-opacity`}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// =====================================================
// Gauge Chart Component
// =====================================================
const GaugeChart = ({ value, max, label, color, size = 200, delay = 0 }) => {
  const percentage = Math.min(100, (value / max) * 100);
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let gaugeColor = color;
  if (percentage > 90) gaugeColor = "#ef4444";
  else if (percentage > 70) gaugeColor = "#f59e0b";
  else if (percentage > 50) gaugeColor = "#3b82f6";
  else gaugeColor = "#10b981";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: size, height: size / 2 }}>
        <svg width={size} height={size / 2} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${size * 0.1} ${size * 0.5} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size * 0.5}`}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d={`M ${size * 0.1} ${size * 0.5} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size * 0.5}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.5 }}
            className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']"
          >
            {value}%
          </motion.p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 font-medium mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// =====================================================
// Bar Chart Component
// =====================================================
const BarChart = ({ data, title, height = 200, delay = 0 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-4"
    >
      {title && <h4 className="text-sm font-bold text-[#1a1a1a] dark:text-white">{title}</h4>}
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#1a1a1a] dark:text-white">{item.label}</span>
              <span className="text-[#6E6E73] dark:text-gray-400">{item.value}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: delay + (i * 0.1) }}
                className={`h-full rounded-full ${item.color || 'bg-[#1C8FA0]'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// =====================================================
// Line Chart Component
// =====================================================
const LineChartComponent = ({ data, title, height = 200, delay = 0 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const width = 100;
  const stepX = width / (data.length - 1);
  
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d.value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-4"
    >
      {title && <h4 className="text-sm font-bold text-[#1a1a1a] dark:text-white">{title}</h4>}
      <div className="relative" style={{ height, width: '100%' }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((p, i) => (
            <line
              key={i}
              x1="0"
              y1={(p / 100) * height}
              x2="100%"
              y2={(p / 100) * height}
              stroke="#f3f4f6"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {/* Area */}
          <motion.path
            d={`M 0,${height} L ${points} L ${width},${height} Z`}
            fill="url(#gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1, delay: delay + 0.3 }}
          />
          {/* Line */}
          <motion.path
            d={`M ${points}`}
            fill="none"
            stroke="#1C8FA0"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: delay + 0.2 }}
          />
          {/* Points */}
          {data.map((d, i) => {
            const x = i * stepX;
            const y = height - ((d.value - minValue) / range) * height;
            return (
              <motion.circle
                key={i}
                cx={`${x}%`}
                cy={y}
                r="4"
                fill="#1C8FA0"
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.5 + (i * 0.05) }}
              />
            );
          })}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1C8FA0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1C8FA0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between text-xs text-[#6E6E73] dark:text-gray-400">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        )).filter((_, i) => i % Math.ceil(data.length / 6) === 0)}
      </div>
    </motion.div>
  );
};

// =====================================================
// Donut Chart Component
// =====================================================
const DonutChart = ({ data, size = 180, delay = 0 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);
  
  let currentAngle = -90;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 20) / 2}
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth="16"
        />
        {data.map((item, i) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          const radius = (size - 20) / 2;
          const dashArray = 2 * Math.PI * radius;
          const finalDashOffset = dashArray - (dashArray * percentage) / 100;
          
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth="16"
              strokeDasharray={dashArray}
              strokeDashoffset={isVisible ? finalDashOffset : dashArray}
              strokeLinecap="round"
              style={{ 
                transformOrigin: `${size / 2}px ${size / 2}px`, 
                transform: `rotate(${startAngle}deg)`,
                transition: `stroke-dashoffset 1.5s ease-out ${(delay + (i * 0.1))}s`
              }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">{total}%</span>
        <span className="text-xs text-[#6E6E73] dark:text-gray-400">Total</span>
      </div>
    </motion.div>
  );
};

// =====================================================
// Main Dashboard Component
// =====================================================
const DashboardHome = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const handleAddTransaction = () => {
    toast({
      title: "Nueva Transacción",
      description: "Abriendo modal de registro...",
    });
  };

  // Mock data - En producción esto vendría de Supabase
  const monthlyData = [
    { label: 'Ene', value: 3.92 },
    { label: 'Feb', value: 3.97 },
    { label: 'Mar', value: 3.98 },
    { label: 'Abr', value: 3.94 },
    { label: 'May', value: 3.95 },
    { label: 'Jun', value: 3.86 },
    { label: 'Jul', value: 3.99 },
    { label: 'Ago', value: 3.86 },
    { label: 'Sep', value: 3.86 },
    { label: 'Oct', value: 3.98 },
  ];

  const categoryData = [
    { label: 'Hogar', value: 45, color: '#1C8FA0' },
    { label: 'Comida', value: 25, color: '#E47B45' },
    { label: 'Ocio', value: 15, color: '#1a1a1a' },
    { label: 'Otros', value: 15, color: '#9CA3AF' },
  ];

  const departmentData = [
    { label: 'Hogar & Servicios', value: 75 },
    { label: 'Alimentación', value: 45 },
    { label: 'Transporte', value: 30 },
    { label: 'Ocio', value: 20 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header con Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Dashboard Ejecutivo</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1">Visión completa de tu salud financiera</p>
        </div>
        <div className="flex gap-2">
          {['Mes', 'Trimestre', 'Año'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period.toLowerCase())}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPeriod === period.toLowerCase()
                  ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-md'
                  : 'bg-white dark:bg-[#1a1a1a] text-[#6E6E73] dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-gray-300'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs Row - 5 Tarjetas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Gastos Totales"
          value="$2,450.00"
          subtitle="Este mes"
          trendValue="+4.5%"
          trendUp={false}
          icon={DollarSign}
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          gradient="bg-blue-500"
          trend={[40, 45, 50, 55, 60, 65, 70, 75, 80, 85]}
          delay={0.1}
        />
        <KPICard
          title="Ingresos Totales"
          value="$4,200.00"
          subtitle="Este mes"
          trendValue="+12.3%"
          trendUp={true}
          icon={TrendingUp}
          color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          gradient="bg-green-500"
          trend={[50, 55, 60, 65, 70, 75, 80, 85, 90, 95]}
          delay={0.2}
        />
        <KPICard
          title="Tasa de Ahorro"
          value="41.7%"
          subtitle="vs 35% objetivo"
          trendValue="+6.7%"
          trendUp={true}
          icon={Target}
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          gradient="bg-purple-500"
          trend={[30, 32, 35, 38, 40, 42, 45, 48, 50, 52]}
          delay={0.3}
        />
        <KPICard
          title="Presupuesto Usado"
          value="76.6%"
          subtitle="$750 disponible"
          trendValue="-2.1%"
          trendUp={true}
          icon={Activity}
          color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
          gradient="bg-orange-500"
          trend={[70, 72, 74, 76, 78, 80, 82, 84, 86, 88]}
          delay={0.4}
        />
        <KPICard
          title="Transacciones"
          value="124"
          subtitle="Este mes"
          trendValue="+8.2%"
          trendUp={true}
          icon={CreditCard}
          color="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
          gradient="bg-teal-500"
          trend={[60, 65, 70, 75, 80, 85, 90, 95, 100, 100]}
          delay={0.5}
        />
      </div>

      {/* Charts Row 1 - Gauge, Bar, Donut */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gauge Chart - Tasa de Ahorro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Tasa de Ahorro</h3>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <GaugeChart value={41.7} max={100} label="Ahorro" color="#10b981" size={200} delay={0.7} />
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-[#6E6E73] dark:text-gray-400">Objetivo</span>
              <span className="font-bold text-[#1a1a1a] dark:text-white">35%</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-[#6E6E73] dark:text-gray-400">Actual</span>
              <span className="font-bold text-green-600 dark:text-green-400">41.7%</span>
            </div>
          </div>
        </motion.div>

        {/* Bar Chart - Gastos por Categoría */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Gastos por Categoría</h3>
            <PieChart className="w-5 h-5 text-[#1C8FA0]" />
          </div>
          <BarChart data={departmentData} height={200} delay={0.8} />
        </motion.div>

        {/* Donut Chart - Distribución */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] flex flex-col items-center"
        >
          <div className="flex justify-between items-center w-full mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Distribución</h3>
            <BarChart3 className="w-5 h-5 text-[#E47B45]" />
          </div>
          <DonutChart data={categoryData} size={180} delay={0.9} />
          <div className="mt-6 w-full space-y-2">
            {categoryData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#6E6E73] dark:text-gray-400">{item.label}</span>
                </div>
                <span className="font-bold text-[#1a1a1a] dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 - Line Chart y Comparativas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart - Tendencias Mensuales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Tendencia de Ahorro</h3>
            <LineChart className="w-5 h-5 text-[#1C8FA0]" />
          </div>
          <LineChartComponent 
            data={monthlyData.map(d => ({ label: d.label, value: d.value * 100 }))} 
            height={200} 
            delay={1.1}
          />
        </motion.div>

        {/* Comparativa de Presupuestos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Presupuesto vs Real</h3>
            <Activity className="w-5 h-5 text-[#E47B45]" />
          </div>
          <div className="space-y-4">
            {[
              { name: 'Hogar', budget: 1200, spent: 980, color: '#1C8FA0' },
              { name: 'Alimentación', budget: 500, spent: 450, color: '#E47B45' },
              { name: 'Transporte', budget: 300, spent: 320, color: '#1a1a1a' },
              { name: 'Ocio', budget: 200, spent: 210, color: '#9CA3AF' },
            ].map((item, i) => {
              const percentage = (item.spent / item.budget) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-[#1a1a1a] dark:text-white">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6E6E73] dark:text-gray-400">${item.spent}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[#6E6E73] dark:text-gray-400">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, percentage)}%` }}
                      transition={{ duration: 1, delay: 1.2 + (i * 0.1) }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#6E6E73] dark:text-gray-400">
                    <span>Presupuesto: ${item.budget}</span>
                    <span>Restante: ${Math.max(0, item.budget - item.spent)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Transacciones Recientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-[26px] border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-sm">
          <h3 className="font-bold text-[#1a1a1a] dark:text-white">Transacciones Recientes</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-[#6E6E73] dark:text-gray-400">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-[#6E6E73] dark:text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-2">
          {[
            { icon: ShoppingBag, name: "Supermercado Metro", category: "Alimentación", date: "Hoy, 10:23 AM", amount: "-$124.50" },
            { icon: Car, name: "Uber Trip", category: "Transporte", date: "Ayer, 8:45 PM", amount: "-$15.20" },
            { icon: Home, name: "Internet Fibra", category: "Servicios", date: "Ayer, 9:00 AM", amount: "-$45.00" },
            { icon: Coffee, name: "Starbucks", category: "Ocio", date: "20 Nov, 4:30 PM", amount: "-$8.50" },
            { icon: Plane, name: "Vuelo a Madrid", category: "Viajes", date: "18 Nov, 2:15 PM", amount: "-$450.00" },
          ].map((tx, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 1.3 + (i * 0.05) }}
              className="flex items-center justify-between p-4 hover:bg-gray-50/80 dark:hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <tx.icon className="w-4 h-4 text-[#6E6E73] dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a] dark:text-white">{tx.name}</p>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400">{tx.category} • {tx.date}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#1a1a1a] dark:text-white font-mono">{tx.amount}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1.5 }}
        onClick={handleAddTransaction}
        className="fixed bottom-8 right-8 w-[68px] h-[68px] bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 hover:bg-black dark:hover:bg-gray-100 transition-all duration-300 z-50 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>
    </div>
  );
};

export default DashboardHome;
