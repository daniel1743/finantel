import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  MoreHorizontal, 
  ShoppingBag, 
  Coffee, 
  Home, 
  Car, 
  Plane,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Copy,
  Trash2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const transactionsData = [
  { id: 1, name: "Supermercado Metro", category: "Alimentación", type: "Gasto", amount: -124.50, date: "21 Nov, 2023", icon: ShoppingBag, color: "bg-orange-100 text-orange-600" },
  { id: 2, name: "Freelance Project", category: "Ingresos", type: "Ingreso", amount: 850.00, date: "20 Nov, 2023", icon: ArrowUpRight, color: "bg-green-100 text-green-600" },
  { id: 3, name: "Starbucks Coffee", category: "Ocio", type: "Gasto", amount: -8.50, date: "20 Nov, 2023", icon: Coffee, color: "bg-purple-100 text-purple-600" },
  { id: 4, name: "Internet Fibra", category: "Servicios", type: "Gasto", amount: -45.00, date: "19 Nov, 2023", icon: Home, color: "bg-blue-100 text-blue-600" },
  { id: 5, name: "Uber Trip", category: "Transporte", type: "Gasto", amount: -15.20, date: "18 Nov, 2023", icon: Car, color: "bg-gray-100 text-gray-600" },
  { id: 6, name: "Vuelo a Madrid", category: "Viajes", type: "Gasto", amount: -450.00, date: "15 Nov, 2023", icon: Plane, color: "bg-sky-100 text-sky-600" },
  { id: 7, name: "Spotify Premium", category: "Suscripciones", type: "Gasto", amount: -9.99, date: "14 Nov, 2023", icon: ShoppingBag, color: "bg-pink-100 text-pink-600" },
];

const FilterButton = ({ label, active }) => (
  <button className={cn(
    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
    active 
      ? "bg-[#1C8FA0]/10 text-[#1C8FA0] border border-[#1C8FA0]/20" 
      : "bg-white border border-gray-200 text-[#6E6E73] hover:border-gray-300 hover:text-[#1a1a1a]"
  )}>
    {label}
    <ChevronDown className="w-3 h-3" />
  </button>
);

const Transactions = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Transacciones</h1>
          <p className="text-[#6E6E73]">Gestiona y revisa todos tus movimientos financieros</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-[#6E6E73] hover:text-[#1a1a1a] transition-colors shadow-sm">
            <Download className="w-5 h-5" />
          </button>
          <button className="px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10">
            + Nueva Transacción
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <FilterButton label="Este Mes" active={true} />
          <FilterButton label="Tipo" />
          <FilterButton label="Categoría" />
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E73]" />
          <input 
            type="text" 
            placeholder="Buscar transacciones..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-[#6E6E73] uppercase tracking-wider sticky top-0 z-10">
          <div className="col-span-5 sm:col-span-4">Descripción</div>
          <div className="col-span-3 hidden sm:block">Categoría</div>
          <div className="col-span-2 hidden lg:block">Tipo</div>
          <div className="col-span-4 sm:col-span-3 lg:col-span-2 text-right">Monto</div>
          <div className="col-span-3 sm:col-span-2 lg:col-span-1 text-right hidden sm:block">Fecha</div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1">
          {transactionsData.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedRow(tx.id === selectedRow ? null : tx.id)}
              className={cn(
                "grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-50 last:border-0 transition-all duration-200 cursor-pointer group relative",
                selectedRow === tx.id ? "bg-[#1C8FA0]/5" : "hover:bg-white hover:shadow-sm"
              )}
            >
              {/* Hover Indicator Line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1C8FA0] opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Description */}
              <div className="col-span-5 sm:col-span-4 flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", tx.color)}>
                  <tx.icon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="font-bold text-[#1a1a1a] text-sm truncate">{tx.name}</p>
                  <p className="text-xs text-[#6E6E73] sm:hidden">{tx.date}</p>
                </div>
              </div>

              {/* Category */}
              <div className="col-span-3 hidden sm:flex items-center">
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                  {tx.category}
                </span>
              </div>

              {/* Type */}
              <div className="col-span-2 hidden lg:flex items-center">
                <span className="text-sm text-[#6E6E73]">{tx.type}</span>
              </div>

              {/* Amount */}
              <div className="col-span-4 sm:col-span-3 lg:col-span-2 text-right">
                <span className={cn(
                  "font-bold font-mono text-sm",
                  tx.amount > 0 ? "text-[#1C8FA0]" : "text-[#1a1a1a]"
                )}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-3 sm:col-span-2 lg:col-span-1 text-right hidden sm:block">
                <span className="text-sm text-[#6E6E73]">{tx.date.split(',')[0]}</span>
              </div>

              {/* Hover Actions */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-[#6E6E73] hover:text-[#1C8FA0] transition-colors" title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-[#6E6E73] hover:text-[#1a1a1a] transition-colors" title="Duplicar">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-red-50 rounded-md text-[#6E6E73] hover:text-red-600 transition-colors" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <span className="text-xs text-[#6E6E73]">Mostrando 1-7 de 124 transacciones</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1a1a1a] disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-md shadow-sm text-[#1a1a1a]">1</button>
            <button className="px-3 py-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1a1a1a]">2</button>
            <button className="px-3 py-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1a1a1a]">3</button>
            <button className="px-3 py-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1a1a1a]">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;