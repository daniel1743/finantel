
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const goalsData = [
  { 
    id: 1, 
    name: "Viaje a Japón", 
    target: 5000, 
    saved: 2450, 
    date: "Oct 2024", 
    imageAlt: "Cherry blossoms in Japan",
    color: "bg-pink-500"
  },
  { 
    id: 2, 
    name: "Fondo de Emergencia", 
    target: 10000, 
    saved: 8200, 
    date: "Dic 2024", 
    imageAlt: "Safe vault concept",
    color: "bg-[#1C8FA0]"
  },
  { 
    id: 3, 
    name: "MacBook Pro M3", 
    target: 2500, 
    saved: 400, 
    date: "Mar 2024", 
    imageAlt: "Modern laptop on desk",
    color: "bg-gray-800"
  },
  { 
    id: 4, 
    name: "Renovación Cocina", 
    target: 15000, 
    saved: 1200, 
    date: "Jun 2025", 
    imageAlt: "Modern kitchen interior",
    color: "bg-[#E47B45]"
  }
];

const GoalCard = ({ goal, index }) => {
  const percentage = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  const remaining = goal.target - goal.saved;
  const monthsLeft = 8; // Mock calculation
  const monthlyNeeded = Math.ceil(remaining / monthsLeft);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white rounded-[22px] overflow-hidden border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(28,143,160,0.15)] transition-all duration-500 h-[320px] flex flex-col"
    >
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/90 to-white z-10" />
        <img 
          alt={goal.imageAlt} 
          className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
         src="https://images.unsplash.com/photo-1614717295997-5959e57472e5" />
      </div>

      <div className="relative z-20 p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg", goal.color)}>
            <Target className="w-5 h-5" />
          </div>
          <span className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 text-xs font-bold text-[#6E6E73]">
            {goal.date}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#1a1a1a] mb-1 font-['Inter_Tight']">{goal.name}</h3>
        <p className="text-sm text-[#6E6E73] mb-auto">Meta: ${goal.target.toLocaleString()}</p>

        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-end">
            <span className="text-3xl font-bold text-[#1a1a1a] tracking-tight">${goal.saved.toLocaleString()}</span>
            <span className="text-sm font-bold text-[#1C8FA0] mb-1">{percentage}%</span>
          </div>

          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
              className={cn("h-full rounded-full", goal.color)}
            />
          </div>
        </div>

        {/* Hover Overlay Info */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-white/95 backdrop-blur-md border-t border-gray-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#E47B45] shrink-0 mt-0.5" />
            <p className="text-sm text-[#6E6E73] leading-relaxed">
              Si aportas <span className="font-bold text-[#1a1a1a]">${monthlyNeeded}</span> cada mes, llegarás a tu meta en <span className="font-bold text-[#1a1a1a]">{monthsLeft} meses</span>.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CreateGoalModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-[26px] p-8 w-full max-w-lg shadow-2xl border border-gray-100 z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Nueva Meta</h2>
            <p className="text-sm text-[#6E6E73]">Define tu próximo objetivo financiero</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-[#6E6E73]" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] mb-2">Nombre de la meta</label>
            <input 
              type="text" 
              placeholder="Ej. Viaje a Europa" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6E6E73] mb-2">Monto objetivo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input 
                  type="number" 
                  placeholder="5000" 
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6E6E73] mb-2">Fecha objetivo</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-[#6E6E73]"
              />
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="bg-[#1C8FA0]/5 rounded-xl p-4 border border-[#1C8FA0]/10 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#1C8FA0]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a] mb-1">Sugerencia Inteligente</p>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Basado en tus ingresos, te sugiero aportar <span className="font-bold text-[#1C8FA0]">$450/mes</span> para alcanzar esta meta cómodamente sin afectar tus gastos fijos.
              </p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl border-gray-200 text-[#6E6E73]">
              Cancelar
            </Button>
            <Button className="flex-1 h-12 rounded-xl bg-[#1a1a1a] hover:bg-black text-white shadow-lg">
              Crear Meta
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Goals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      <AnimatePresence>
        {isModalOpen && <CreateGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Metas y Ahorros</h1>
          <p className="text-[#6E6E73] mt-1 text-lg">Dale propósito a tu dinero y construye tu futuro</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1a1a1a] hover:bg-black text-white px-6 py-6 h-auto rounded-xl shadow-xl shadow-black/10 text-base font-medium transition-transform hover:-translate-y-1"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear nueva meta
        </Button>
      </div>

      {/* AI Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-[#1C8FA0] to-[#167a8a] rounded-[26px] p-8 text-white relative overflow-hidden shadow-2xl shadow-[#1C8FA0]/20"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/10">
              <Sparkles className="w-3 h-3" />
              Análisis de Metas
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Con tus aportes actuales, lograrás <span className="text-[#E47B45] bg-white/10 px-2 rounded-lg">3 metas</span> a tiempo.
            </h2>
            <p className="text-white/80 text-lg max-w-xl">
              El "Fondo de Emergencia" va un 12% adelantado. Sin embargo, "Renovación Cocina" podría retrasarse 2 meses si no ajustamos el aporte.
            </p>
            <button className="flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all mt-2">
              Ver detalles del plan <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-5 h-32 flex items-end gap-2 pb-2 px-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
            {/* Simple CSS Chart */}
            {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 100].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className="flex-1 bg-white/80 rounded-t-sm hover:bg-[#E47B45] transition-colors cursor-pointer relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#1C8FA0] text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ${h * 100}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {goalsData.map((goal, index) => (
          <GoalCard key={goal.id} goal={goal} index={index} />
        ))}
        
        {/* Add New Placeholder */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-200 rounded-[22px] flex flex-col items-center justify-center gap-4 text-[#6E6E73] hover:border-[#1C8FA0] hover:text-[#1C8FA0] hover:bg-[#1C8FA0]/5 transition-all group min-h-[320px]"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-medium text-lg">Crear Nueva Meta</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Goals;
