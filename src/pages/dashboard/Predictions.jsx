
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScenarioCard = ({ title, description, impact, type, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 group cursor-pointer h-full flex flex-col"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        type === 'positive' ? 'bg-green-50 text-green-600' : 
        type === 'warning' ? 'bg-orange-50 text-orange-600' : 
        'bg-[#1C8FA0]/10 text-[#1C8FA0]'
      }`}>
        {type === 'positive' ? <TrendingUp className="w-5 h-5" /> : 
         type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
         <Sparkles className="w-5 h-5" />}
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
        type === 'positive' ? 'bg-green-100 text-green-700' : 
        type === 'warning' ? 'bg-orange-100 text-orange-700' : 
        'bg-[#1C8FA0]/10 text-[#1C8FA0]'
      }`}>
        {impact}
      </span>
    </div>
    <h3 className="font-bold text-[#1a1a1a] mb-2">{title}</h3>
    <p className="text-sm text-[#6E6E73] leading-relaxed mb-4 flex-1">{description}</p>
    <div className="flex items-center text-sm font-medium text-[#1a1a1a] group-hover:gap-2 transition-all mt-auto">
      Simular escenario <ArrowRight className="w-4 h-4 ml-1" />
    </div>
  </motion.div>
);

const Predictions = () => {
  const [timeHorizon, setTimeHorizon] = useState('90d');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Predicciones</h1>
          <p className="text-[#6E6E73] mt-1 text-lg">Cómo se verá tu dinero si sigues como hasta ahora</p>
        </div>
        
        <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
          {[
            { id: '30d', label: '30 Días' },
            { id: '90d', label: '90 Días' },
            { id: '12m', label: '12 Meses' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeHorizon(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeHorizon === t.id 
                  ? 'bg-[#1a1a1a] text-white shadow-md' 
                  : 'text-[#6E6E73] hover:text-[#1a1a1a] hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-[26px] p-8 border border-gray-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">Proyección de Balance</h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="text-[#6E6E73]">Histórico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1C8FA0]" />
                <span className="text-[#6E6E73]">Proyectado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E47B45] border border-dashed border-white" />
                <span className="text-[#6E6E73]">Optimizado (IA)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#6E6E73]">Balance estimado en {timeHorizon === '30d' ? '30 días' : timeHorizon === '90d' ? '90 días' : '1 año'}</p>
            <p className="text-3xl font-bold text-[#1C8FA0] font-['Inter_Tight']">$15,240.00</p>
          </div>
        </div>

        {/* Custom CSS Chart Visualization */}
        <div className="h-64 w-full relative mt-8">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300">
            {[4, 3, 2, 1, 0].map((i) => (
              <div key={i} className="border-b border-gray-100 w-full h-0 relative">
                <span className="absolute -top-2.5 -left-8">${i * 5}k</span>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="absolute inset-0 ml-8 flex items-end">
            {/* Historical Line (Gray) */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <path 
                d="M0,180 C50,170 100,190 150,150 C200,110 250,130 300,100" 
                fill="none" 
                stroke="#E5E7EB" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              {/* Projected Line (Teal) */}
              <path 
                d="M300,100 C350,70 400,80 450,60 C500,40 550,50 600,20" 
                fill="none" 
                stroke="#1C8FA0" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeDasharray="6 4"
              />
              {/* Area under projected */}
              <path 
                d="M300,100 C350,70 400,80 450,60 C500,40 550,50 600,20 V256 H300 Z" 
                fill="url(#tealGradient)" 
                opacity="0.1"
              />
              {/* Optimized Line (Orange) */}
              <path 
                d="M300,100 C350,60 400,50 450,30 C500,10 550,15 600,0" 
                fill="none" 
                stroke="#E47B45" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              
              <defs>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1C8FA0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Points */}
              <circle cx="300" cy="100" r="6" fill="#1a1a1a" stroke="white" strokeWidth="2" />
              <circle cx="600" cy="20" r="6" fill="#1C8FA0" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Scenarios Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <ScenarioCard 
          title="Si mantienes este ritmo..."
          description="Llegarás a fin de año con un excedente de $2,400, suficiente para cubrir el 50% de tu meta 'Viaje a Japón'."
          impact="+12% Ahorro"
          type="default"
          delay={0.2}
        />
        <ScenarioCard 
          title="Si reduces Ocio en 20%..."
          description="Podrías redirigir $150 mensuales a tu fondo de inversión, generando $1,800 extra al año."
          impact="+$1,800/año"
          type="positive"
          delay={0.3}
        />
        <ScenarioCard 
          title="Alerta de Suscripciones"
          description="Tus gastos fijos han subido un 5% este mes. Si sigue así, podrías comprometer tu meta de ahorro."
          impact="Riesgo Medio"
          type="warning"
          delay={0.4}
        />
      </div>

      {/* Risk Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-red-50 rounded-[26px] p-8 border border-red-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600 text-sm font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Riesgos Detectados
            </div>
            <h3 className="text-2xl font-bold text-[#1a1a1a]">Probabilidad de flujo negativo en 45 días</h3>
            <p className="text-[#6E6E73] max-w-xl">
              Hemos detectado que tus gastos en "Hogar" suelen dispararse en Diciembre. Con tu saldo actual, podrías quedar en descubierto si no reservas $500 extra.
            </p>
          </div>
          <Button className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm h-12 px-6 rounded-xl font-bold transition-all">
            <Zap className="w-4 h-4 mr-2" />
            Hablar con la IA sobre esto
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Predictions;
