
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Filter, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  MoreHorizontal,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ExpenseTimelineItem = ({ expense, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative pl-8 pb-8 border-l-2 border-gray-100 dark:border-white/10 last:border-0 last:pb-0"
  >
    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-[#1C8FA0]" />
    
    <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
            <img src={expense.avatar} alt={expense.user} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-bold text-[#1a1a1a] dark:text-white text-sm">{expense.title}</h4>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">Pagado por <span className="font-medium text-[#1a1a1a] dark:text-white">{expense.user}</span> • {expense.date}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-[#1a1a1a] dark:text-white">${expense.amount}</p>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
            expense.status === 'settled' 
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
              : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
          )}>
            {expense.status === 'settled' ? 'Pagado' : 'Pendiente'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-white/5">
        <div className="flex -space-x-2">
          {expense.splitWith.map((person, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a1a1a] bg-gray-200 dark:bg-white/20 overflow-hidden" title={person}>
              <img src={`https://i.pravatar.cc/150?u=${person}`} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a1a1a] bg-gray-50 dark:bg-white/10 flex items-center justify-center text-[10px] text-[#6E6E73] dark:text-gray-400 font-bold">
            +{expense.splitWith.length}
          </div>
        </div>
        <button className="text-xs font-bold text-[#1C8FA0] hover:underline flex items-center gap-1">
          Ver detalles <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  </motion.div>
);

const SharedExpenses = () => {
  const expenses = [
    { id: 1, title: "Cena Fin de Año", amount: 145.50, user: "Diego", avatar: "https://i.pravatar.cc/150?u=diego", date: "Ayer", status: "pending", splitWith: ["Maria", "Lucas"] },
    { id: 2, title: "Compra Supermercado", amount: 89.20, user: "Maria", avatar: "https://i.pravatar.cc/150?u=maria", date: "20 Nov", status: "settled", splitWith: ["Diego"] },
    { id: 3, title: "Internet Fibra", amount: 45.00, user: "Tú", avatar: "https://i.pravatar.cc/150?u=me", date: "15 Nov", status: "settled", splitWith: ["Diego", "Maria"] },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Gastos Compartidos</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Historial completo de gastos divididos</p>
        </div>
        <Button className="bg-[#1a1a1a] dark:bg-white text-white dark:text-black px-6 py-6 h-auto rounded-xl shadow-lg transition-transform hover:-translate-y-1">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] rounded-[22px] p-6 text-white shadow-lg shadow-[#1C8FA0]/20"
        >
          <p className="text-white/80 text-sm font-medium mb-1">Total Compartido (Mes)</p>
          <p className="text-3xl font-bold font-['Inter_Tight']">$1,240.50</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className="text-[#6E6E73] dark:text-gray-400 text-sm font-medium mb-1">Tu Balance</p>
          <p className="text-3xl font-bold text-green-600 font-['Inter_Tight']">+$120.00</p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">Te deben dinero</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className="text-[#6E6E73] dark:text-gray-400 text-sm font-medium mb-1">Deudas Pendientes</p>
          <p className="text-3xl font-bold text-red-500 font-['Inter_Tight']">-$45.00</p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">Debes a 1 persona</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Timeline Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white text-lg">Actividad Reciente</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-[#6E6E73] dark:text-gray-400 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-[#6E6E73] dark:text-gray-400 transition-colors">
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
            {expenses.map((expense, index) => (
              <ExpenseTimelineItem key={expense.id} expense={expense} index={index} />
            ))}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-6">Estadísticas Rápidas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <span className="text-sm text-[#6E6E73] dark:text-gray-400">Promedio por persona</span>
                <span className="font-bold text-[#1a1a1a] dark:text-white">$413.50</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <span className="text-sm text-[#6E6E73] dark:text-gray-400">Mayor contribuyente</span>
                <span className="font-bold text-[#1C8FA0]">Diego</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1C8FA0]/5 rounded-[26px] p-6 border border-[#1C8FA0]/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1C8FA0]" />
              </div>
              <h3 className="font-bold text-[#1a1a1a] dark:text-white">Grupo Familiar</h3>
            </div>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
              Hay 2 gastos pendientes de liquidación en el grupo.
            </p>
            <Button variant="outline" className="w-full border-[#1C8FA0] text-[#1C8FA0] hover:bg-[#1C8FA0]/10">
              Ver Grupo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedExpenses;
