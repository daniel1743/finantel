import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, TrendingUp } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const AddBudgetModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { categories, addBudget } = useFinance(user?.id);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    amount: '',
    period: 'monthly',
    alert_threshold: 80,
    start_date: new Date().toISOString().split('T')[0],
  });

  // Resetear formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        category_id: '',
        amount: '',
        period: 'monthly',
        alert_threshold: 80,
        start_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen]);

  // Filtrar solo categorías de gastos
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos."
      });
      return;
    }

    setIsLoading(true);
    try {
      await addBudget({
        name: formData.name.trim(),
        category_id: formData.category_id || null,
        amount: parseFloat(formData.amount),
        period: formData.period,
        alert_threshold: parseFloat(formData.alert_threshold),
        start_date: formData.start_date,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear el presupuesto."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#1C8FA0]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Nuevo Presupuesto</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Nombre del Presupuesto */}
                <div>
                  <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                    Nombre del Presupuesto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Presupuesto Mensual"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-[#1a1a1a] dark:text-white"
                  />
                </div>

                {/* Categoría (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                    Categoría <span className="text-xs">(opcional)</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-[#1a1a1a] dark:text-white"
                  >
                    <option value="">Sin categoría</option>
                    {expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                    Monto del Presupuesto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73] dark:text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-[#1a1a1a] dark:text-white"
                    />
                  </div>
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                    Período <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-[#1a1a1a] dark:text-white"
                  >
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>

                {/* Alerta en % */}
                <div>
                  <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                    Alerta cuando se use <span className="text-xs">(porcentaje)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={formData.alert_threshold}
                      onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-[#1a1a1a] dark:text-white"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] dark:text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
                    Recibirás una alerta cuando el presupuesto alcance este porcentaje
                  </p>
                </div>

                {/* Fecha de Inicio */}
                <div>
                  <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-[#1a1a1a] dark:text-white"
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
                    disabled={isLoading || !formData.name.trim() || !formData.amount}
                    className="flex-1 py-3 rounded-xl bg-[#1a1a1a] dark:bg-white text-white dark:text-black font-medium hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Presupuesto'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddBudgetModal;

