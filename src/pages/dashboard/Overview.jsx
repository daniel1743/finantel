import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PiggyBank, 
  CreditCard, 
  ChevronRight,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MetricCard = ({ title, value, subtext, trend, trendUp, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white rounded-xl shadow-sm">
        <Icon className="w-6 h-6 text-[#1C8FA0]" />
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <h3 className="text-[#6E6E73] text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-[#1a1a1a] font-['Inter_Tight'] tracking-tight">{value}</p>
    <p className="text-xs text-[#6E6E73] mt-2">{subtext}</p>
    
    {/* Mini Chart Visualization */}
    <div className="h-10 mt-4 flex items-end gap-1">
      {[40, 70, 45, 90, 60, 75, 50, 80, 65, 85].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.5, delay: delay + (i * 0.05) }}
          className={`flex-1 rounded-t-sm ${trendUp ? 'bg-[#1C8FA0]/20' : 'bg-[#E47B45]/20'}`}
        />
      ))}
    </div>
  </motion.div>
);

const NavCard = ({ title, description, icon: Icon, to, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
  >
    <Link 
      to={to}
      className="block h-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('/10', '')}`} />
        </div>
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{title}</h3>
        <p className="text-sm text-[#6E6E73] mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium text-[#1C8FA0] group-hover:gap-2 transition-all">
          Explorar <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  </motion.div>
);

const Overview = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Visión General</h1>
          <p className="text-[#6E6E73]">Resumen de tu actividad financiera este mes</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#6E6E73] hover:text-[#1a1a1a] hover:border-gray-300 transition-colors shadow-sm">
            Descargar Reporte
          </button>
          <button className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10">
            Personalizar
          </button>
        </div>
      </div>

      {/* Hero Metrics Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <MetricCard 
          title="Balance Total" 
          value="$24,500.00" 
          subtext="+$2,450 vs mes anterior" 
          trend="12.5%" 
          trendUp={true} 
          icon={Wallet} 
          delay={0.1} 
        />
        <MetricCard 
          title="Gastos Mensuales" 
          value="$3,240.50" 
          subtext="85% del presupuesto" 
          trend="4.2%" 
          trendUp={false} 
          icon={CreditCard} 
          delay={0.2} 
        />
        <MetricCard 
          title="Tasa de Ahorro" 
          value="24.8%" 
          subtext="Objetivo: 30%" 
          trend="2.1%" 
          trendUp={true} 
          icon={PiggyBank} 
          delay={0.3} 
        />
      </div>

      {/* Quick Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
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
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-6">Accesos Directos</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NavCard 
            title="Transacciones" 
            description="Revisa y categoriza tus movimientos recientes." 
            icon={TrendingUp} 
            to="/dashboard/transactions" 
            color="bg-[#1C8FA0]" 
            delay={0.5} 
          />
          <NavCard 
            title="Presupuestos" 
            description="Gestiona tus límites de gasto por categoría." 
            icon={Target} 
            to="/dashboard/budgets" 
            color="bg-[#E47B45]" 
            delay={0.6} 
          />
          <NavCard 
            title="Metas" 
            description="Sigue el progreso de tus objetivos financieros." 
            icon={PiggyBank} 
            to="/dashboard/goals" 
            color="bg-[#1a1a1a]" 
            delay={0.7} 
          />
          <NavCard 
            title="Reportes" 
            description="Análisis detallado de tu salud financiera." 
            icon={Activity} 
            to="/dashboard/analysis" 
            color="bg-[#6E6E73]" 
            delay={0.8} 
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;