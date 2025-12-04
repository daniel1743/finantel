
import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  ArrowRight, 
  DollarSign, 
  PieChart, 
  Receipt, 
  Share2,
  Check,
  X,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MemberCard = ({ name, role, status, amount, image }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-white/5">
    <div className="flex items-center gap-4">
      <div className="relative">
        <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#1a1a1a] shadow-md" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
      </div>
      <div>
        <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">{name}</h3>
        <p className="text-xs text-[#6E6E73] dark:text-gray-400">{role}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={cn("text-sm font-bold", amount > 0 ? "text-green-600" : "text-red-500")}>
        {amount > 0 ? `Te debe $${amount}` : `Debes $${Math.abs(amount)}`}
      </p>
      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-[#6E6E73] transition-all">
        <Icon component={MoreHorizontal} size="sm" color="default" />
      </button>
    </div>
  </div>
);

const Family = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Mi Familia</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Gestiona gastos compartidos y deudas</p>
        </div>
        <Button className="bg-[#1a1a1a] dark:bg-white text-white dark:text-black px-6 py-6 h-auto rounded-xl shadow-lg transition-transform hover:-translate-y-1">
          <Icon component={Plus} size="md" color="default" className="mr-2" />
          Invitar miembro
        </Button>
      </div>

      {/* Main Group Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1C8FA0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-white dark:border-[#1a1a1a] bg-gray-200 shadow-lg overflow-hidden">
                    <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=100&h=100&fit=crop`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-[#1a1a1a] bg-gray-50 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-[#6E6E73] dark:text-gray-400">
                  +2
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-[#1C8FA0]/10 text-[#1C8FA0] text-sm font-bold">
                Familia García
              </div>
            </div>

            <div className="space-y-2">
               <p className="text-[#6E6E73] dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Gasto Compartido (Oct)</p>
               <p className="text-4xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">$2,450.00</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
             <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-4">Estado de Deudas</h3>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" className="w-8 h-8 rounded-full" />
                   <span className="text-sm text-[#6E6E73] dark:text-gray-400">Tú debes a <span className="font-bold text-[#1a1a1a] dark:text-white">Diego</span></span>
                 </div>
                 <span className="text-red-500 font-bold">-$24.50</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" className="w-8 h-8 rounded-full" />
                   <span className="text-sm text-[#6E6E73] dark:text-gray-400"><span className="font-bold text-[#1a1a1a] dark:text-white">María</span> te debe</span>
                 </div>
                 <span className="text-green-600 font-bold">+$120.00</span>
               </div>
             </div>
             <div className="mt-6 flex gap-3">
               <Button className="flex-1 bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-lg h-10 text-sm">Registrar Pago</Button>
               <Button variant="outline" className="bg-white dark:bg-transparent border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 h-10 w-10 p-0 flex items-center justify-center">
                 <Icon component={MessageCircle} size="md" color="default" />
               </Button>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 h-fit">
          <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-6 px-2">Miembros (4)</h3>
          <div className="space-y-2">
            <MemberCard name="Diego García" role="Admin" amount={-24.50} image="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" />
            <MemberCard name="María Rodriguez" role="Pareja" amount={120.00} image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
            <MemberCard name="Lucas García" role="Hijo" amount={0} image="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100" />
          </div>
        </div>

        {/* Shared Expenses Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-[26px] border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Últimos Gastos Compartidos</h3>
            <button className="text-sm font-bold text-[#1C8FA0] hover:text-[#167a8a]">Ver todos</button>
          </div>
          <div className="p-2">
            {[
              { name: "Supermercado", amount: 156.00, by: "María", date: "Hoy", split: "3 personas" },
              { name: "Cena Fin de Semana", amount: 85.50, by: "Diego", date: "Ayer", split: "2 personas" },
              { name: "Internet Fibra", amount: 45.00, by: "Tú", date: "20 Nov", split: "Todos" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors border-b border-gray-50 dark:border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-[#6E6E73] dark:text-gray-400 text-xs">
                    {tx.by[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">{tx.name}</p>
                    <p className="text-xs text-[#6E6E73] dark:text-gray-400">Pagado por {tx.by} • {tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1a1a1a] dark:text-white">${tx.amount}</p>
                  <div className="flex items-center gap-1 text-xs text-[#6E6E73] dark:text-gray-400 justify-end">
                    <Icon component={Share2} size="xs" color="default" />
                    {tx.split}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Family;
