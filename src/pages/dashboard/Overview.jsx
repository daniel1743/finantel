import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight,
  TrendingUp,
  Activity,
  Target,
  DollarSign,
  Loader2,
  Download,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CustomizeDashboardModal from '@/components/modals/CustomizeDashboardModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
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
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Area
} from 'recharts';

// Paleta de colores profesional
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

const NavCard = ({ title, description, icon: Icon, to, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
  >
    <Link 
      to={to}
      className="block h-full bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('/10', '')}`} />
        </div>
        <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium text-[#1C8FA0] group-hover:gap-2 transition-all">
          Explorar <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  </motion.div>
);

const Overview = () => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { user } = useAuth();
  const { transactions, categories, loading } = useFinance(user?.id);

  // Calcular datos para gráficos
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        hasData: false,
        donutData: [],
        radarData: [],
        trendData: [],
        horizontalBarData: [],
        metrics: {
          totalIncome: 0,
          totalExpenses: 0,
          availableBalance: 0,
          savingsRate: 0
        }
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar transacciones del mes actual
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // Calcular totales
    const totalExpenses = currentMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const totalIncome = currentMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const availableBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses) / totalIncome) * 100 
      : 0;

    // Datos para gráfico de dona (distribución por categoría)
    const categoryExpenses = {};
    currentMonthTransactions
      .filter(tx => tx.type === 'expense' && tx.categories)
      .forEach(tx => {
        const catName = tx.categories.name || 'Sin categoría';
        if (!categoryExpenses[catName]) {
          categoryExpenses[catName] = 0;
        }
        categoryExpenses[catName] += parseFloat(tx.amount || 0);
      });

    const totalCategoryExpenses = Object.values(categoryExpenses).reduce((sum, val) => sum + val, 0);
    const donutData = Object.entries(categoryExpenses)
      .map(([name, value], index) => ({
        name,
        value: totalCategoryExpenses > 0 ? (value / totalCategoryExpenses) * 100 : 0,
        amount: value,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Datos para gráfico de radar (clasificación de categorías)
    const radarData = donutData.slice(0, 8).map((item, index) => ({
      category: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
      value: item.value,
      fullMark: 100
    }));

    // Datos para gráfico de tendencias (últimos 6 meses)
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
      });

      const monthIncome = monthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
      const monthExpenses = monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

      trendData.push({
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        Ingresos: monthIncome,
        Gastos: monthExpenses,
        Balance: monthIncome - monthExpenses
      });
    }

    // Datos para gráfico de barras horizontales (top categorías)
    const horizontalBarData = donutData.slice(0, 8).map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      value: item.amount
    }));

    return {
      hasData: true,
      donutData,
      radarData,
      trendData,
      horizontalBarData,
      metrics: {
        totalIncome,
        totalExpenses,
        availableBalance,
        savingsRate,
        transactionsCount: currentMonthTransactions.length
      }
    };
  }, [transactions, categories]);

  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-lg shadow-lg border border-gray-200 dark:border-white/10">
          <p className="text-sm font-bold text-[#1a1a1a] dark:text-white">
            {payload[0].name || payload[0].payload.name}
          </p>
          <p className="text-sm text-[#1C8FA0]">
            {payload[0].value?.toFixed(2)}%
            {payload[0].payload.amount && ` ($${payload[0].payload.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      <AnimatePresence>
        {isCustomizeOpen && (
          <CustomizeDashboardModal 
            isOpen={isCustomizeOpen} 
            onClose={() => setIsCustomizeOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Visión General</h1>
          <p className="text-[#6E6E73] dark:text-gray-400">Resumen de tu actividad financiera este mes</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-colors shadow-sm">
            <Download className="w-4 h-4 inline mr-2" />
            Descargar Reporte
          </button>
          <button 
            onClick={() => setIsCustomizeOpen(true)}
            className="px-4 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-lg shadow-black/10"
          >
            Personalizar
          </button>
        </div>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
        </div>
      ) : !chartData.hasData ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-12 border border-gray-100 dark:border-white/5 shadow-sm text-center">
          <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">No hay datos aún</h3>
          <p className="text-[#6E6E73] dark:text-gray-400">
            Comienza agregando tus primeras transacciones para ver tu resumen completo
          </p>
        </div>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm"
            >
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">Ingresos Totales</p>
              <p className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                ${chartData.metrics.totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm"
            >
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">Gastos Totales</p>
              <p className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                ${chartData.metrics.totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm"
            >
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">Saldo Disponible</p>
              <p className={`text-xl font-bold ${chartData.metrics.availableBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${chartData.metrics.availableBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm"
            >
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">Tasa de Ahorro</p>
              <p className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                {chartData.metrics.savingsRate.toFixed(1)}%
              </p>
            </motion.div>
          </div>

          {/* Gráficos principales */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Gráfico de Dona - Distribución por Categoría */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/10 shadow-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#1a1a1a] dark:text-white">Distribución por Categoría</h3>
                <Activity className="w-5 h-5 text-[#1C8FA0]" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip />}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => <span style={{ color: '#6E6E73' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                  {chartData.donutData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400">Total Gastos</p>
              </div>
            </motion.div>

            {/* Gráfico de Radar - Clasificación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/10 shadow-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#1a1a1a] dark:text-white">Clasificación de Categorías</h3>
                <Target className="w-5 h-5 text-[#E47B45]" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData.radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: '#6E6E73', fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: '#6E6E73', fontSize: 10 }}
                  />
                  <Radar
                    name="Gastos"
                    dataKey="value"
                    stroke="#1C8FA0"
                    fill="#1C8FA0"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#1a1a1a'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Gráfico de Tendencias - Barras Apiladas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/10 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#1a1a1a] dark:text-white">Tendencias Mensuales</h3>
              <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6E6E73', fontSize: 12 }}
                  stroke="#e5e7eb"
                />
                <YAxis 
                  tick={{ fill: '#6E6E73', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#e5e7eb"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1a1a1a'
                  }}
                  formatter={(value) => `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: '#6E6E73' }}
                />
                <Bar dataKey="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="Balance" 
                  stroke="#1C8FA0" 
                  strokeWidth={2}
                  dot={{ fill: '#1C8FA0', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gráfico de Barras Horizontales - Top Categorías */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/10 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#1a1a1a] dark:text-white">Top Categorías de Gastos</h3>
              <Activity className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={chartData.horizontalBarData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  tick={{ fill: '#6E6E73', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#e5e7eb"
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  tick={{ fill: '#6E6E73', fontSize: 11 }}
                  width={70}
                  stroke="#e5e7eb"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1a1a1a'
                  }}
                  formatter={(value) => `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#1C8FA0"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick Insights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-gradient-to-r from-[#1C8FA0] to-[#167a8a] rounded-[26px] p-8 text-white relative overflow-hidden shadow-xl shadow-[#1C8FA0]/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  Insight Semanal
                </div>
                <h3 className="text-2xl font-bold">Has reducido tus gastos hormiga un 15%</h3>
                <p className="text-white/80 max-w-xl">
                  ¡Excelente trabajo! Si mantienes este ritmo, alcanzarás tu meta de ahorro para vacaciones 2 semanas antes de lo previsto.
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-[#1C8FA0] rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg">
                Ver Detalles
              </button>
            </div>
          </motion.div>

          {/* Navigation Grid */}
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-6">Accesos Directos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <NavCard 
                title="Transacciones" 
                description="Revisa y categoriza tus movimientos recientes." 
                icon={TrendingUp} 
                to="/dashboard/transactions" 
                color="bg-[#1C8FA0]" 
                delay={1.0} 
              />
              <NavCard 
                title="Presupuestos" 
                description="Gestiona tus límites de gasto por categoría." 
                icon={Target} 
                to="/dashboard/budgets" 
                color="bg-[#E47B45]" 
                delay={1.1} 
              />
              <NavCard 
                title="Metas" 
                description="Sigue el progreso de tus objetivos financieros." 
                icon={Target} 
                to="/dashboard/goals" 
                color="bg-[#1a1a1a]" 
                delay={1.2} 
              />
              <NavCard 
                title="Reportes" 
                description="Análisis detallado de tu salud financiera." 
                icon={Activity} 
                to="/dashboard/analysis" 
                color="bg-[#6E6E73]" 
                delay={1.3} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
