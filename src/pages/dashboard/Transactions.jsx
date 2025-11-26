import React, { useState, useRef, useEffect } from 'react';
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
import { supabase } from '@/lib/customSupabaseClient';
import VoiceInput from '@/components/VoiceInput';
import { useUserCurrency } from '@/hooks/useUserCurrency';

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
// Componente Dropdown Personalizado
// =====================================================
const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false,
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const selectedOption = options.find(opt => opt.id === value || opt.value === value);

  // Cerrar al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option.id || option.value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl",
          "focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0]",
          "transition-all disabled:opacity-50 text-left flex items-center justify-between",
          "cursor-pointer",
          isOpen && "ring-2 ring-[#1C8FA0]/20 border-[#1C8FA0]"
        )}
      >
        <span className={cn(
          "truncate",
          !selectedOption && "text-gray-400 dark:text-gray-500"
        )}>
          {selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}
        </span>
        <ChevronDown className={cn(
          "w-5 h-5 text-[#6E6E73] dark:text-gray-400 transition-transform flex-shrink-0 ml-2",
          isOpen && "transform rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[60] w-full mt-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden max-h-60 overflow-y-auto"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            {options.map((option) => {
              const optionValue = option.id || option.value;
              const optionLabel = option.name || option.label;
              const isSelected = value === optionValue;
              
              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    "hover:bg-gray-50 dark:hover:bg-white/5",
                    isSelected && "bg-[#1C8FA0]/10 text-[#1C8FA0] dark:bg-[#1C8FA0]/20",
                    !isSelected && "text-[#1a1a1a] dark:text-white"
                  )}
                >
                  {optionLabel}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =====================================================
// Modal de Transacción (Crear/Editar)
// =====================================================
const getInitialFormData = () => ({
    description: '',
    amount: '',
    category_id: '',
    custom_category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    necessity_level: '',
    notes: ''
  });

const AddTransactionModal = ({ isOpen, onClose, onSuccess, mode = 'add', transaction = null }) => {
  const { user } = useAuth();
  const { addTransaction, updateTransaction } = useFinance(user?.id);
  const { toast } = useToast();
  const isEditMode = mode === 'edit' && Boolean(transaction);

  const [formData, setFormData] = useState(getInitialFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && transaction) {
      const categoryName = transaction.categories?.name || '';
      const normalizedCategory = categoryName?.toLowerCase();
      const availableCategories = transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      const matchedCategory = availableCategories.find(cat => cat.name.toLowerCase() === normalizedCategory);
      const isCustom = !!categoryName && !matchedCategory;

      setFormData({
        description: transaction.description || '',
        amount: transaction.amount ? parseFloat(transaction.amount).toString() : '',
        category_id: matchedCategory
          ? matchedCategory.id
          : transaction.type === 'income'
            ? 'personalizar-ingreso'
            : 'personalizar-gasto',
        custom_category: isCustom ? categoryName : '',
        date: transaction.date ? transaction.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        type: transaction.type || 'expense',
        necessity_level: transaction.type === 'expense'
          ? transaction.metadata?.necessity_level || transaction.metadata?.necessityLevel || ''
          : '',
        notes: transaction.notes || ''
      });
      setShowCustomCategory(isCustom);
    } else {
      setFormData(getInitialFormData());
      setShowCustomCategory(false);
    }
  }, [isOpen, isEditMode, transaction]);

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
      // Buscar o crear el category_id
      let categoryId = null;
      let categoryName = null;
      
      if (showCustomCategory && formData.custom_category) {
        // Categoría personalizada
        categoryName = formData.custom_category.trim();
      } else if (formData.category_id) {
        // Categoría predefinida
        categoryName = formData.type === 'income'
          ? INCOME_CATEGORIES.find(cat => cat.id === formData.category_id)?.name
          : EXPENSE_CATEGORIES.find(cat => cat.id === formData.category_id)?.name;
      }
      
      // Buscar la categoría en Supabase o crearla si no existe
      if (categoryName) {
        // Buscar si ya existe (SIN usar 'type' porque puede no existir)
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', categoryName)
          .maybeSingle();
        
        // Si no existe, crearla
        if (!categoryData) {
          // Crear categoría SIN type (la columna puede no existir)
          const insertData = {
            user_id: user.id,
            name: categoryName,
            color: formData.type === 'expense' ? '#E47B45' : '#1C8FA0',
            icon: '💰',
          };
          
          // Intentar crear sin type primero
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert(insertData)
            .select('id')
            .single();
          
          if (categoryError) {
            throw new Error(`Error al crear categoría: ${categoryError.message}`);
          }
          
          categoryId = newCategory.id;
          
          // Intentar actualizar con type si la columna existe (no crítico si falla)
          try {
            await supabase
              .from('categories')
              .update({ type: formData.type })
              .eq('id', categoryId);
          } catch (err) {
            // Ignorar si falla (la columna type no existe aún)
            console.log('No se pudo actualizar type (columna puede no existir aún)');
          }
        } else {
          categoryId = categoryData.id;
        }
      }

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category_id: categoryId, // UUID de la categoría
        date: formData.date,
        type: formData.type,
        // necessity_level no existe en el schema, guardarlo en metadata JSONB
        metadata: formData.type === 'expense' && formData.necessity_level 
          ? { necessity_level: formData.necessity_level }
          : {},
        notes: formData.notes.trim() || null,
      };

      if (isEditMode) {
        await updateTransaction(transaction.id, transactionData);
      } else {
      await addTransaction(transactionData);
      }

      toast({
        title: "¡Éxito!",
        description: isEditMode ? "Transacción actualizada correctamente" : "Transacción creada correctamente",
      });

      setFormData(getInitialFormData());
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
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
            {isEditMode ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" style={{ position: 'relative', zIndex: 1 }}>
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
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
              Categoría
            </label>
            <CustomDropdown
              value={formData.category_id}
              onChange={(value) => handleCategoryChange(value)}
              options={formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
              placeholder="Selecciona una categoría"
              disabled={isLoading}
              required
            />
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
            >
              <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
                Nivel de Necesidad
              </label>
              <CustomDropdown
                value={formData.necessity_level}
                onChange={(value) => setFormData({ ...formData, necessity_level: value })}
                options={NECESSITY_LEVELS}
                placeholder="Selecciona nivel de necesidad"
                disabled={isLoading}
                required
              />
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
                isEditMode ? 'Guardar cambios' : 'Guardar transacción'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Función para formatear montos según la moneda
const formatCurrency = (amount, currency = 'CLP') => {
  const absAmount = Math.abs(amount);
  
  // Para CLP y otras monedas sin decimales, no mostrar decimales si es un número entero
  if (currency === 'CLP' || currency === 'JPY' || currency === 'KRW') {
    // Si es un número entero, no mostrar decimales
    if (absAmount % 1 === 0) {
      return absAmount.toLocaleString('es-CL', { maximumFractionDigits: 0 });
    }
    // Si tiene decimales, mostrar hasta 2 decimales
    return absAmount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  
  // Para USD y otras monedas con decimales, siempre mostrar 2 decimales
  return absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Transactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currency: userCurrency } = useUserCurrency();
  const {
    transactions,
    loading,
    refresh,
    duplicateTransaction,
    deleteTransaction
  } = useFinance(user?.id);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionModalMode, setTransactionModalMode] = useState('add');
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const handleTransactionAdded = () => {
    refresh();
  };

  const openNewTransactionModal = () => {
    setTransactionModalMode('add');
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setTransactionModalMode('edit');
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleDuplicateTransaction = async (transaction) => {
    try {
      await duplicateTransaction(transaction);
    } catch (error) {
      console.error('Error duplicating transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo duplicar la transacción.'
      });
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar esta transacción?');
    if (!confirmed) return;
    try {
      await deleteTransaction(transaction.id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo eliminar la transacción.'
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
    setTransactionModalMode('add');
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      <AnimatePresence>
        {isModalOpen && (
          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSuccess={handleTransactionAdded}
            mode={transactionModalMode}
            transaction={transactionToEdit}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Transacciones</h1>
          <p className="text-[#6E6E73] dark:text-gray-400">Gestiona y revisa todos tus movimientos financieros</p>
        </div>

        {/* Voice Input + Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Componente de Voz */}
          <div className="bg-gradient-to-br from-[#1C8FA0]/5 to-purple-500/5 rounded-2xl px-4 py-3 border border-[#1C8FA0]/15 shadow-sm w-full sm:w-auto flex items-center gap-3">
            <VoiceInput
              onTransactionCreated={handleTransactionAdded}
              userId={user?.id}
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">Registrar por voz</span>
              <span className="text-xs text-[#6E6E73] dark:text-gray-400">Captura gastos con tu micrófono</span>
            </div>
          </div>

          {/* Botones tradicionales */}
        <div className="flex gap-3">
            <button className="p-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors shadow-sm">
            <Download className="w-5 h-5" />
          </button>
          <button
              onClick={openNewTransactionModal}
              className="px-4 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-xl text-sm font-medium hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-lg shadow-black/10 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Transacción
          </button>
          </div>
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
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex-1 flex flex-col min-h-[700px]">
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx, index) => {
              // Mapear datos de Supabase a formato de UI
              const categoryName = tx.categories?.name || 'Sin categoría';
              const categoryColor = tx.categories?.color || '#3B82F6';
              const categoryIcon = tx.categories?.icon || '💰';
              
              // Determinar icono y color según tipo
              const isIncome = tx.type === 'income';
              
              // Mapear icono desde string a componente
              const iconMap = {
                'Home': Home,
                'ShoppingBag': ShoppingBag,
                'Car': Car,
                'Coffee': Coffee,
                'Plane': Plane,
                'Zap': DollarSign,
                'Heart': DollarSign,
                'Smartphone': DollarSign,
              };
              
              const displayIcon = isIncome 
                ? ArrowUpRight 
                : (tx.categories?.icon && iconMap[tx.categories.icon]) 
                  ? iconMap[tx.categories.icon] 
                  : DollarSign;
              
              const iconColor = isIncome 
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
              
              // Formatear fecha
              const formattedDate = tx.date ? new Date(tx.date).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              }) : 'Sin fecha';
              
              // Formatear monto
              const amount = parseFloat(tx.amount) || 0;
              const displayAmount = isIncome ? amount : -Math.abs(amount);
              
              return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedRow(tx.id === selectedRow ? null : tx.id)}
              className={cn(
                    "grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-50 dark:border-white/5 last:border-0 transition-all duration-200 cursor-pointer group relative",
                    selectedRow === tx.id ? "bg-[#1C8FA0]/5 dark:bg-[#1C8FA0]/10" : "hover:bg-white dark:hover:bg-white/5 hover:shadow-sm"
              )}
            >
              {/* Hover Indicator Line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1C8FA0] opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Description */}
              <div className="col-span-5 sm:col-span-4 flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", iconColor)}>
                      {React.createElement(displayIcon, { className: "w-5 h-5" })}
                </div>
                <div className="truncate">
                      <p className="font-bold text-[#1a1a1a] dark:text-white text-sm truncate">{tx.description || 'Sin descripción'}</p>
                      <p className="text-xs text-[#6E6E73] dark:text-gray-400 sm:hidden">{formattedDate}</p>
                </div>
              </div>

              {/* Category */}
              <div className="col-span-3 hidden sm:flex items-center">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-white/10">
                      {categoryName}
                </span>
              </div>

              {/* Type */}
              <div className="col-span-2 hidden lg:flex items-center">
                    <span className="text-sm text-[#6E6E73] dark:text-gray-400">
                      {isIncome ? 'Ingreso' : 'Gasto'}
                    </span>
              </div>

              {/* Amount */}
              <div className="col-span-4 sm:col-span-3 lg:col-span-2 text-right">
                <span className={cn(
                  "font-bold font-mono text-sm",
                      displayAmount > 0 ? "text-green-600 dark:text-green-400" : "text-[#1a1a1a] dark:text-white"
                )}>
                      {displayAmount > 0 ? '+' : ''}${formatCurrency(displayAmount, tx.currency || userCurrency)}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-3 sm:col-span-2 lg:col-span-1 text-right hidden sm:block">
                    <span className="text-sm text-[#6E6E73] dark:text-gray-400">{formattedDate}</span>
              </div>

              {/* Hover Actions */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTransaction(tx);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-[#6E6E73] dark:text-gray-400 hover:text-[#1C8FA0] transition-colors"
                      title="Editar"
                    >
                  <Edit2 className="w-4 h-4" />
                </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateTransaction(tx);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                      title="Duplicar"
                    >
                  <Copy className="w-4 h-4" />
                </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTransaction(tx);
                      }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-[#6E6E73] dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-[#6E6E73] dark:text-gray-400 font-medium">No hay transacciones aún</p>
              <p className="text-sm text-[#6E6E73] dark:text-gray-500 mt-1">Crea tu primera transacción para comenzar</p>
            </div>
          )}
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
