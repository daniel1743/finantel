
import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  CreditCard, 
  Activity,
  CheckCircle2,
  ArrowRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AlertCard = ({ type, title, subtitle, icon: Icon, color, recommendation }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg dark:hover:shadow-black/20 transition-all group relative overflow-hidden"
  >
    {/* Left Border Indicator */}
    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", color.replace('text-', 'bg-').replace('500', '500'))} />
    
    <div className="flex items-start gap-4 mb-4 pl-2">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", color.replace('text-', 'bg-').replace('600', '100').replace('500', '100'))}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div>
        <h3 className="font-bold text-[#1a1a1a] dark:text-white text-lg">{title}</h3>
        <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-sm">{subtitle}</p>
      </div>
    </div>

    {recommendation && (
      <div className="ml-14 bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon component={Zap} size="sm" color="default" />
          <p className="text-xs font-medium text-[#1a1a1a] dark:text-white">{recommendation}</p>
        </div>
        <button className="text-xs font-bold text-[#1C8FA0] hover:underline whitespace-nowrap">
          Revisar
        </button>
      </div>
    )}
  </motion.div>
);

const TrendCard = ({ title, value, subtitle, positive }) => (
  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
    <p className="text-xs text-[#6E6E73] dark:text-gray-400 font-bold uppercase tracking-wider mb-2">{title}</p>
    <div className="flex items-baseline gap-2 mb-1">
      <span className="text-2xl font-bold text-[#1a1a1a] dark:text-white">{value}</span>
      <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-md", positive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400")}>
        {positive ? '+' : ''}{subtitle}
      </span>
    </div>
  </div>
);

const Alerts = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Alertas Inteligentes</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Monitoreo proactivo de tu salud financiera</p>
        </div>
      </div>

      {/* Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] rounded-[26px] p-8 text-white shadow-xl shadow-[#1C8FA0]/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
            <Icon component={Activity} size="xl" color="white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Tu ritmo de gasto es estable</h2>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              Has mantenido tus gastos dentro del rango normal durante los últimos 15 días. No detectamos anomalías críticas que requieran tu atención inmediata.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Alerts List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {['Todas', '🔥 Críticas', '⚠️ Riesgos', '📈 Tendencias', '💡 Oportunidades'].map((filter, i) => (
              <button 
                key={i}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  i === 0 
                    ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-md" 
                    : "bg-white dark:bg-[#1a1a1a] text-[#6E6E73] dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <AlertCard 
              type="critical"
              title="Suscripción duplicada detectada"
              subtitle="Parece que te cobraron dos veces por 'Netflix' este mes ($15.99)."
              icon={CreditCard}
              color="text-red-500"
              recommendation="Verificar transacción"
            />
            <AlertCard 
              type="warning"
              title="85% del presupuesto de Ocio utilizado"
              subtitle="Aún quedan 12 días del mes. Considera reducir salidas."
              icon={AlertTriangle}
              color="text-[#E47B45]"
              recommendation="Ajustar presupuesto"
            />
            <AlertCard 
              type="opportunity"
              title="Tendencia de ahorro positiva"
              subtitle="Has ahorrado un 5% más que el mes pasado en la categoría Hogar."
              icon={TrendingUp}
              color="text-green-500"
            />
          </div>
        </div>

        {/* Right Column: Trends & Anomalies */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-6 flex items-center gap-2">
              <Icon component={TrendingUp} size="md" color="primary" />
              Tendencias del Mes
            </h3>
            <div className="space-y-4">
              <TrendCard 
                title="Gasto Fines de Semana" 
                value="+33%" 
                subtitle="vs días semana" 
                positive={false}
              />
              <TrendCard 
                title="Consistencia Ahorro" 
                value="Alta" 
                subtitle="Top 10% usuarios" 
                positive={true}
              />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 rounded-[26px] p-6 border border-red-100 dark:border-red-900/20 relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                 <Icon component={AlertTriangle} size="sm" color="default" />
                 Anomalía
               </div>
               <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-2">Transacción inusualmente alta</h3>
               <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
                 Detectamos un cargo de $450.00 en "Viajes" que sale de tu patrón habitual.
               </p>
               <button className="w-full py-2.5 bg-white dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">
                 Revisar Cargo
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
