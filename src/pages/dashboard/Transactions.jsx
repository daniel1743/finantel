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
  X,
  Plus,
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/components/ui/use-toast';

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

// =====================================================
// Categorías Predefinidas
// =====================================================
const INCOME_CATEGORIES = [
  { id: 'sueldo', name: 'Sueldo' },
  { id: 'bono', name: 'Bono' },
  { id: 'vacaciones', name: 'Vacaciones' },
  { id: 'sumer-extra', name: 'Sumer Extra' },
  { id: 'personalizar-ingreso', name: '+ Personalizar' }
];

const EXPENSE_CATEGORIES = [
  { id: 'hogar', name: 'Hogar' },
  { id: 'alimentacion', name: 'Alimentación' },
  { id: 'medicinas', name: 'Medicinas' },
  { id: 'salud', name: 'Salud' },
  { id: 'deudas', name: 'Deudas' },
  { id: 'gasolina', name: 'Gasolina' },
  { id: 'compras-extras', name: 'Compras Extras' },
  { id: 'personalizar-gasto', name: '+ Personalizar' }
];

const NECESSITY_LEVELS = [
  { id: 'muy-necesario', name: 'Muy Necesario', color: 'text-red-600' },
  { id: 'necesario', name: 'Necesario', color: 'text-orange-600' },
  { id: 'poco-necesario', name: 'Poco Necesario', color: 'text-yellow-600' },
  { id: 'nada-necesario', name: 'Nada Necesario', color: 'text-blue-600' },
  { id: 'innecesario', name: 'Innecesario', color: 'text-purple-600' },
  { id: 'impulso', name: 'Compra por Impulso', color: 'text-pink-600' },
  { id: 'arrepentimiento', name: 'Arrepentimiento/Malgasto', color: 'text-gray-600' }
];

// =====================================================
// Modal de Nueva Transacción
// =====================================================
const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { addTransaction, categories } = useFinance(user?.id);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    custom_category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    necessity_level: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const handleCategoryChange = (value) => {
    if (value === 'personalizar-ingreso' || value === 'personalizar-gasto') {
      setShowCustomCategory(true);
      setFormData({ ...formData, category_id: value, custom_category: '' });
    } else {
      setShowCustomCategory(false);
      setFormData({ ...formData, category_id: value, custom_category: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa una descripción",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un monto válido",
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona una categoría",
      });
      return;
    }

    if (showCustomCategory && !formData.custom_category.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa el nombre de la categoría personalizada",
      });
      return;
    }

    if (formData.type === 'expense' && !formData.necessity_level) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona el nivel de necesidad",
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo identificar el usuario",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Determinar el nombre final de la categoría
      const finalCategory = showCustomCategory
        ? formData.custom_category.trim()
        : formData.category_id;

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: finalCategory,
        date: formData.date,
        type: formData.type,
        necessity_level: formData.type === 'expense' ? formData.necessity_level : null,
        notes: formData.notes.trim() || null,
      };

      await addTransaction(transactionData);

      toast({
        title: "¡Éxito!",
        description: "Transacción creada correctamente",
      });

      // Reset form
      setFormData({
        description: '',
        amount: '',
        category_id: '',
        custom_category: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        necessity_level: '',
        notes: ''
      });
      setShowCustomCategory(false);

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear la transacción. Intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
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
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10 max-h-[90vh] overflow-y-auto overflow-x-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Nueva Transacción</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
              Descripción
            </label>
            <input
              type="text"
              placeholder="Ej. Compra de supermercado"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all",
                  formData.type === 'expense'
                    ? "bg-[#E47B45] text-white shadow-lg shadow-[#E47B45]/20"
                    : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all",
                  formData.type === 'income'
                    ? "bg-[#1C8FA0] text-white shadow-lg shadow-[#1C8FA0]/20"
                    : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                Ingreso
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
              Monto
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="relative">
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
              Categoría
            </label>
            <div className="relative">
              <select
                value={formData.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50 appearance-none cursor-pointer pr-10"
                style={{
                  borderRadius: '12px',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
              >
                <option value="" className="rounded-xl">Selecciona una categoría</option>
                {formData.type === 'income'
                  ? INCOME_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id} className="rounded-xl">
                        {cat.name}
                      </option>
                    ))
                  : EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id} className="rounded-xl">
                        {cat.name}
                      </option>
                    ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Categoría Personalizada (si se selecciona "Personalizar") */}
          {showCustomCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                Nombre de Categoría Personalizada
              </label>
              <input
                type="text"
                placeholder="Ej. Entretenimiento, Mascotas..."
                required
                value={formData.custom_category}
                onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
              />
            </motion.div>
          )}

          {/* Nivel de Necesidad (solo para Gastos) */}
          {formData.type === 'expense' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                Nivel de Necesidad
              </label>
              <div className="relative">
                <select
                  value={formData.necessity_level}
                  onChange={(e) => setFormData({ ...formData, necessity_level: e.target.value })}
                  disabled={isLoading}
                  required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50 appearance-none cursor-pointer pr-10"
                style={{
                  borderRadius: '12px',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
                >
                  <option value="" className="rounded-xl">Selecciona nivel de necesidad</option>
                  {NECESSITY_LEVELS.map((level) => (
                    <option key={level.id} value={level.id} className="rounded-xl">
                      {level.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400 pointer-events-none" />
              </div>
            </motion.div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
              Fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Notas (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
              Notas <span className="text-xs">(opcional)</span>
            </label>
            <textarea
              placeholder="Detalles adicionales..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.description.trim() ||
                !formData.amount ||
                !formData.category_id ||
                (showCustomCategory && !formData.custom_category.trim()) ||
                (formData.type === 'expense' && !formData.necessity_level)
              }
              className="flex-1 py-3 rounded-xl bg-[#1a1a1a] dark:bg-white text-white dark:text-black font-medium hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Transacción'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Transactions = () => {
  const { user } = useAuth();
  const { transactions, loading, refresh } = useFinance(user?.id);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTransactionAdded = () => {
    refresh();
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      <AnimatePresence>
        {isModalOpen && (
          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleTransactionAdded}
          />
        )}
      </AnimatePresence>

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
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Transacción
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