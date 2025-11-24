import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  Sparkles,
  Search,
  MoreHorizontal,
  ShoppingBag,
  Car,
  Home,
  Coffee,
  Plane,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  DollarSign,
  PieChart,
  BarChart3,
  LineChart,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  Loader2,
  Zap,
  Heart,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';

// =====================================================
// KPIs Cards - Tarjetas de Métricas Principales
// =====================================================
const KPICard = ({ title, value, subtitle, trend, trendValue, trendUp, icon: Icon, color, delay, gradient }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
  >
    {gradient && (
      <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
    )}
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trendValue}
        </div>
      </div>
      <h3 className="text-[#6E6E73] dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight'] tracking-tight mb-1">{value}</p>
      {subtitle && <p className="text-xs text-[#6E6E73] dark:text-gray-400">{subtitle}</p>}
      
      {/* Mini Sparkline Chart */}
      <div className="h-10 mt-4 flex items-end gap-1">
        {trend.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.5, delay: delay + (i * 0.05) }}
            className={`flex-1 rounded-t-sm ${trendUp ? 'bg-[#1C8FA0]/20 dark:bg-[#1C8FA0]/30' : 'bg-[#E47B45]/20 dark:bg-[#E47B45]/30'} group-hover:opacity-80 transition-opacity`}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// =====================================================
// Gauge Chart Component
// =====================================================
const GaugeChart = ({ value, max, label, color, size = 200, delay = 0 }) => {
  const percentage = Math.min(100, (value / max) * 100);
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let gaugeColor = color;
  if (percentage > 90) gaugeColor = "#ef4444";
  else if (percentage > 70) gaugeColor = "#f59e0b";
  else if (percentage > 50) gaugeColor = "#3b82f6";
  else gaugeColor = "#10b981";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: size, height: size / 2 }}>
        <svg width={size} height={size / 2} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${size * 0.1} ${size * 0.5} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size * 0.5}`}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d={`M ${size * 0.1} ${size * 0.5} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size * 0.5}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.5 }}
            className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']"
          >
            {value}%
          </motion.p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 font-medium mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// =====================================================
// Paleta de colores para categorías
// =====================================================
// Paleta de colores vibrantes y diferenciados para categorías
const CATEGORY_COLORS = [
  '#1C8FA0', // Teal - Azul verdoso
  '#E47B45', // Orange - Naranja
  '#8B5CF6', // Purple - Morado
  '#10B981', // Green - Verde
  '#F59E0B', // Amber - Ámbar
  '#EF4444', // Red - Rojo
  '#3B82F6', // Blue - Azul
  '#EC4899', // Pink - Rosa
  '#14B8A6', // Cyan - Cian
  '#6366F1', // Indigo - Índigo
  '#F97316', // Orange-600 - Naranja oscuro
  '#84CC16', // Lime - Lima
];

// Función para obtener un color único para cada categoría
// SIEMPRE asigna colores únicos basados en el índice, ignorando colores de BD
const getCategoryColor = (categoryName, index, existingColor = null) => {
  // SIEMPRE usar la paleta de colores basada en el índice para garantizar diferencias visuales
  // Esto asegura que cada categoría tenga un color único y diferenciado
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

// =====================================================
// Bar Chart Component
// =====================================================
const BarChart = ({ data, title, height = 200, delay = 0 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Evitar división por 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-4"
    >
      {title && <h4 className="text-sm font-bold text-[#1a1a1a] dark:text-white">{title}</h4>}
      <div className="space-y-3">
        {data.map((item, i) => {
          const barColor = item.color || getCategoryColor(item.label, i);
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#1a1a1a] dark:text-white">{item.label}</span>
                <span className="text-[#6E6E73] dark:text-gray-400">
                  {typeof item.value === 'number' ? `$${item.value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${item.value}%`}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 1, delay: delay + (i * 0.1) }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// =====================================================
// Line Chart Component
// =====================================================
const LineChartComponent = ({ data, title, height = 200, delay = 0 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const width = 100;
  const stepX = width / (data.length - 1);
  
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d.value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-4"
    >
      {title && <h4 className="text-sm font-bold text-[#1a1a1a] dark:text-white">{title}</h4>}
      <div className="relative" style={{ height, width: '100%' }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((p, i) => (
            <line
              key={i}
              x1="0"
              y1={(p / 100) * height}
              x2="100%"
              y2={(p / 100) * height}
              stroke="#f3f4f6"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {/* Area */}
          <motion.path
            d={`M 0,${height} L ${points} L ${width},${height} Z`}
            fill="url(#gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1, delay: delay + 0.3 }}
          />
          {/* Line */}
          <motion.path
            d={`M ${points}`}
            fill="none"
            stroke="#1C8FA0"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: delay + 0.2 }}
          />
          {/* Points */}
          {data.map((d, i) => {
            const x = i * stepX;
            const y = height - ((d.value - minValue) / range) * height;
            return (
              <motion.circle
                key={i}
                cx={`${x}%`}
                cy={y}
                r="4"
                fill="#1C8FA0"
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.5 + (i * 0.05) }}
              />
            );
          })}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1C8FA0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1C8FA0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between text-xs text-[#6E6E73] dark:text-gray-400">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        )).filter((_, i) => i % Math.ceil(data.length / 6) === 0)}
      </div>
    </motion.div>
  );
};

// =====================================================
// Donut Chart Component
// =====================================================
const DonutChart = ({ data, size = 180, delay = 0 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);
  
  let currentAngle = -90;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 20) / 2}
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth="16"
        />
        {data.map((item, i) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          const radius = (size - 20) / 2;
          const dashArray = 2 * Math.PI * radius;
          const finalDashOffset = dashArray - (dashArray * percentage) / 100;
          
          // Asegurar que siempre haya un color único
          const segmentColor = item.color || getCategoryColor(item.label || `Category ${i}`, i);
          
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={segmentColor}
              strokeWidth="16"
              strokeDasharray={dashArray}
              strokeDashoffset={isVisible ? finalDashOffset : dashArray}
              strokeLinecap="round"
              style={{ 
                transformOrigin: `${size / 2}px ${size / 2}px`, 
                transform: `rotate(${startAngle}deg)`,
                transition: `stroke-dashoffset 1.5s ease-out ${(delay + (i * 0.1))}s`
              }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">100%</span>
        <span className="text-xs text-[#6E6E73] dark:text-gray-400">Total</span>
      </div>
    </motion.div>
  );
};

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
      // Buscar o crear el category_id
      let categoryId = null;
      let categoryName = null;

      if (showCustomCategory && formData.custom_category) {
        // Categoría personalizada
        categoryName = formData.custom_category.trim();
      } else if (formData.category_id) {
        // Categoría predefinida
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

        categoryName = formData.type === 'income'
          ? INCOME_CATEGORIES.find(cat => cat.id === formData.category_id)?.name
          : EXPENSE_CATEGORIES.find(cat => cat.id === formData.category_id)?.name;
      }

      // Buscar la categoría en Supabase o crearla si no existe
      if (categoryName) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', categoryName)
          .maybeSingle();

        // Si no existe, crearla
        if (!categoryData) {
          const insertData = {
            user_id: user.id,
            name: categoryName,
            color: formData.type === 'expense' ? '#E47B45' : '#1C8FA0',
            icon: '💰',
          };

          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert(insertData)
            .select('id')
            .single();

          if (categoryError) {
            throw new Error(`Error al crear categoría: ${categoryError.message}`);
          }

          categoryId = newCategory?.id;
        } else {
          categoryId = categoryData.id;
        }
      }

      if (!categoryId) {
        throw new Error('No se pudo determinar la categoría');
      }

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category_id: categoryId,
        date: formData.date,
        type: formData.type,
        metadata: formData.type === 'expense' && formData.necessity_level
          ? { necessity_level: formData.necessity_level }
          : {},
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
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10 max-h-[90vh] overflow-y-auto"
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

        <form onSubmit={handleSubmit} className="space-y-5">
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
                onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
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
                onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
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
            <select
              value={formData.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
            >
              <option value="">Selecciona una categoría</option>
              {formData.type === 'income'
                ? INCOME_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                : EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
            </select>
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
              <select
                value={formData.necessity_level}
                onChange={(e) => setFormData({ ...formData, necessity_level: e.target.value })}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
              >
                <option value="">Selecciona nivel de necesidad</option>
                {NECESSITY_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">
              Fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400 pointer-events-none" />
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
              rows={2}
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

// =====================================================
// Main Dashboard Component
// =====================================================
const DashboardHome = () => {
  const { user } = useAuth();
  const { transactions, categories, loading, refresh } = useFinance(user?.id);
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTransactionAdded = () => {
    refresh();
    toast({
      title: "¡Éxito!",
      description: "Los datos se han actualizado",
    });
  };

  // Calcular datos reales desde transacciones
  const calculateRealData = () => {
    if (!transactions || transactions.length === 0) {
      return {
        hasData: false,
        totalExpenses: 0,
        totalIncome: 0,
        savingsRate: 0,
        transactionsCount: 0,
        categoryData: [],
        departmentData: [],
        monthlyData: []
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar transacciones del mes actual
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // Calcular totales
    const totalExpenses = currentMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const totalIncome = currentMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses) / totalIncome) * 100 
      : 0;

    // Calcular gastos por categoría
    const categoryExpenses = {};
    currentMonthTransactions
      .filter(tx => tx.type === 'expense' && tx.categories)
      .forEach(tx => {
        const catName = tx.categories.name || 'Sin categoría';
        const catColor = tx.categories.color || '#9CA3AF';
        if (!categoryExpenses[catName]) {
          categoryExpenses[catName] = { amount: 0, color: catColor };
        }
        categoryExpenses[catName].amount += parseFloat(tx.amount || 0);
      });

    const totalCategoryExpenses = Object.values(categoryExpenses)
      .reduce((sum, cat) => sum + cat.amount, 0);

    // Primero ordenar por cantidad para tener un orden consistente
    const sortedCategories = Object.entries(categoryExpenses)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 4); // Top 4 categorías

    // Asignar colores únicos basados en la posición en el array ordenado
    const categoryData = sortedCategories.map(([name, data], index) => {
      const categoryColor = getCategoryColor(name, index);
      return {
        label: name,
        value: totalCategoryExpenses > 0 ? (data.amount / totalCategoryExpenses) * 100 : 0,
        color: categoryColor
      };
    });

    // Datos para gráfico de barras (gastos por categoría) - CON COLORES ÚNICOS
    // Usar el mismo orden y colores que categoryData para consistencia
    const departmentData = sortedCategories.map(([name, data], index) => ({
      label: name,
      value: data.amount,
      color: getCategoryColor(name, index) // Mismo índice = mismo color
    }));

    // Calcular datos mensuales (últimos 6 meses)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
      });

      const monthIncome = monthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
      const monthExpenses = monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

      const monthSavingsRate = monthIncome > 0 
        ? ((monthIncome - monthExpenses) / monthIncome) * 100 
        : 0;

      monthlyData.push({
        label: date.toLocaleDateString('es-ES', { month: 'short' }),
        value: monthSavingsRate / 100 // Normalizar para el gráfico
      });
    }

    return {
      hasData: true,
      totalExpenses,
      totalIncome,
      savingsRate,
      transactionsCount: currentMonthTransactions.length,
      categoryData,
      departmentData,
      monthlyData
    };
  };

  const realData = calculateRealData();

  // Datos por defecto si no hay datos reales - CON COLORES DIFERENTES
  const defaultCategoryData = [
    { label: 'Hogar', value: 0, color: CATEGORY_COLORS[0] },
    { label: 'Alimentación', value: 0, color: CATEGORY_COLORS[1] },
    { label: 'Transporte', value: 0, color: CATEGORY_COLORS[2] },
    { label: 'Otros', value: 0, color: CATEGORY_COLORS[3] },
  ];

  const defaultDepartmentData = [
    { label: 'Hogar & Servicios', value: 0, color: CATEGORY_COLORS[0] },
    { label: 'Alimentación', value: 0, color: CATEGORY_COLORS[1] },
    { label: 'Transporte', value: 0, color: CATEGORY_COLORS[2] },
    { label: 'Ocio', value: 0, color: CATEGORY_COLORS[3] },
  ];

  const defaultMonthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      label: date.toLocaleDateString('es-ES', { month: 'short' }),
      value: 0
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <AnimatePresence>
        {isModalOpen && (
          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleTransactionAdded}
          />
        )}
      </AnimatePresence>

      {/* Header con Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Dashboard Ejecutivo</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1">Visión completa de tu salud financiera</p>
        </div>
        <div className="flex gap-2">
          {['Mes', 'Trimestre', 'Año'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period.toLowerCase())}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPeriod === period.toLowerCase()
                  ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-md'
                  : 'bg-white dark:bg-[#1a1a1a] text-[#6E6E73] dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-gray-300'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Estado de carga o sin datos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
        </div>
      ) : !realData.hasData ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-12 border border-gray-100 dark:border-white/5 shadow-sm text-center">
          <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">No hay datos aún</h3>
          <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
            Comienza agregando tus primeras transacciones para ver tu dashboard completo
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Transacción
          </Button>
        </div>
      ) : (
        <>
          {/* KPIs Row - 6 Tarjetas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Ingresos Totales - PRIMERA */}
            <KPICard
              title="Ingresos Totales"
              value={`$${realData.totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Este mes"
              trendValue={realData.totalIncome > 0 ? "Actual" : "Sin datos"}
              trendUp={true}
              icon={TrendingUp}
              color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              gradient="bg-green-500"
              trend={[50, 55, 60, 65, 70, 75, 80, 85, 90, 95]}
              delay={0.1}
            />
            
            {/* 2. Saldo Disponible - NUEVA TARJETA */}
            <KPICard
              title="Saldo Disponible"
              value={`$${(realData.totalIncome - realData.totalExpenses).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Cuánto te va quedando"
              trendValue={(realData.totalIncome - realData.totalExpenses) >= 0 ? "Positivo" : "Negativo"}
              trendUp={(realData.totalIncome - realData.totalExpenses) >= 0}
              icon={Wallet}
              color={(realData.totalIncome - realData.totalExpenses) >= 0 
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}
              gradient={(realData.totalIncome - realData.totalExpenses) >= 0 ? "bg-emerald-500" : "bg-red-500"}
              trend={(realData.totalIncome - realData.totalExpenses) >= 0 
                ? [60, 65, 70, 75, 80, 85, 90, 95, 100, 100]
                : [100, 95, 90, 85, 80, 75, 70, 65, 60, 55]}
              delay={0.2}
            />
            
            {/* 3. Gastos Totales */}
            <KPICard
              title="Gastos Totales"
              value={`$${realData.totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Este mes"
              trendValue={realData.totalExpenses > 0 ? "Actual" : "Sin datos"}
              trendUp={false}
              icon={DollarSign}
              color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              gradient="bg-blue-500"
              trend={[40, 45, 50, 55, 60, 65, 70, 75, 80, 85]}
              delay={0.3}
            />
            
            {/* 4. Tasa de Ahorro */}
            <KPICard
              title="Tasa de Ahorro"
              value={`${realData.savingsRate.toFixed(1)}%`}
              subtitle={realData.savingsRate >= 0 ? "vs objetivo" : "Gastos superan ingresos"}
              trendValue={realData.savingsRate >= 0 ? "Positivo" : "Negativo"}
              trendUp={realData.savingsRate >= 0}
              icon={Target}
              color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
              gradient="bg-purple-500"
              trend={[30, 32, 35, 38, 40, 42, 45, 48, 50, 52]}
              delay={0.4}
            />
            
            {/* 5. Presupuesto Usado */}
            <KPICard
              title="Presupuesto Usado"
              value="N/A"
              subtitle="Configura presupuestos"
              trendValue="—"
              trendUp={true}
              icon={Activity}
              color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              gradient="bg-orange-500"
              trend={[70, 72, 74, 76, 78, 80, 82, 84, 86, 88]}
              delay={0.5}
            />
            
            {/* 6. Transacciones */}
            <KPICard
              title="Transacciones"
              value={realData.transactionsCount.toString()}
              subtitle="Este mes"
              trendValue="Actual"
              trendUp={true}
              icon={CreditCard}
              color="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
              gradient="bg-teal-500"
              trend={[60, 65, 70, 75, 80, 85, 90, 95, 100, 100]}
              delay={0.6}
            />
          </div>

      {/* Charts Row 1 - Gauge, Bar, Donut */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gauge Chart - Tasa de Ahorro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Tasa de Ahorro</h3>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <GaugeChart 
            value={Math.max(0, Math.min(100, realData.savingsRate))} 
            max={100} 
            label="Ahorro" 
            color={realData.savingsRate >= 0 ? "#10b981" : "#ef4444"} 
            size={200} 
            delay={0.7} 
          />
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-[#6E6E73] dark:text-gray-400">Objetivo</span>
              <span className="font-bold text-[#1a1a1a] dark:text-white">35%</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-[#6E6E73] dark:text-gray-400">Actual</span>
              <span className={`font-bold ${realData.savingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {realData.savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bar Chart - Gastos por Categoría */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Gastos por Categoría</h3>
            <PieChart className="w-5 h-5 text-[#1C8FA0]" />
          </div>
          <BarChart 
            data={realData.departmentData.length > 0 ? realData.departmentData : defaultDepartmentData} 
            height={200} 
            delay={0.8} 
          />
        </motion.div>

        {/* Donut Chart - Distribución */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] flex flex-col items-center"
        >
          <div className="flex justify-between items-center w-full mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Distribución</h3>
            <BarChart3 className="w-5 h-5 text-[#E47B45]" />
          </div>
          <DonutChart 
            data={realData.categoryData.length > 0 ? realData.categoryData : defaultCategoryData} 
            size={180} 
            delay={0.9} 
          />
          <div className="mt-6 w-full space-y-2">
            {(realData.categoryData.length > 0 ? realData.categoryData : defaultCategoryData).map((item, i) => {
              const displayValue = typeof item.value === 'number' ? item.value.toFixed(2) : item.value;
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color || getCategoryColor(item.label, i) }} 
                    />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item.label}</span>
                  </div>
                  <span className="font-bold text-[#1a1a1a] dark:text-white">{displayValue}%</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 - Line Chart y Comparativas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart - Tendencias Mensuales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Tendencia de Ahorro</h3>
            <LineChart className="w-5 h-5 text-[#1C8FA0]" />
          </div>
          <LineChartComponent 
            data={realData.monthlyData.length > 0 
              ? realData.monthlyData.map(d => ({ label: d.label, value: d.value * 100 }))
              : defaultMonthlyData.map(d => ({ label: d.label, value: d.value * 100 }))
            } 
            height={200} 
            delay={1.1}
          />
        </motion.div>

        {/* Comparativa de Presupuestos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">Presupuesto vs Real</h3>
            <Activity className="w-5 h-5 text-[#E47B45]" />
          </div>
          <div className="space-y-4">
            {realData.departmentData.length > 0 ? (
              realData.departmentData.map((item, i) => {
                // Calcular presupuesto estimado (esto debería venir de la tabla budgets)
                const estimatedBudget = item.value * 1.2; // Estimación del 20% más
                return {
                  name: item.label,
                  budget: estimatedBudget,
                  spent: item.value,
                  color: realData.categoryData[i]?.color || '#9CA3AF'
                };
              }).map((item, i) => {
              const percentage = (item.spent / item.budget) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-[#1a1a1a] dark:text-white">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6E6E73] dark:text-gray-400">${item.spent}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[#6E6E73] dark:text-gray-400">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, percentage)}%` }}
                      transition={{ duration: 1, delay: 1.2 + (i * 0.1) }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#6E6E73] dark:text-gray-400">
                    <span>Presupuesto: ${item.budget}</span>
                    <span>Restante: ${Math.max(0, item.budget - item.spent)}</span>
                  </div>
                </div>
              );
            })
            ) : (
              <div className="text-center py-8 text-[#6E6E73] dark:text-gray-400">
                <p>No hay datos de presupuesto aún</p>
                <p className="text-sm mt-2">Configura presupuestos para ver comparativas</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
        </>
      )}

      {/* Transacciones Recientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-[26px] border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-sm">
          <h3 className="font-bold text-[#1a1a1a] dark:text-white">Transacciones Recientes</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-[#6E6E73] dark:text-gray-400">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-[#6E6E73] dark:text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-2">
          {realData.hasData && transactions && transactions.length > 0 ? (
            transactions.slice(0, 5).map((tx, i) => {
              const categoryName = tx.categories?.name || 'Sin categoría';
              const categoryIcon = tx.categories?.icon || 'DollarSign';
              const isIncome = tx.type === 'income';
              const txDate = new Date(tx.date);
              const now = new Date();
              const isToday = txDate.toDateString() === now.toDateString();
              const isYesterday = txDate.toDateString() === new Date(now.getTime() - 86400000).toDateString();
              
              let dateStr = '';
              if (isToday) {
                dateStr = `Hoy, ${txDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
              } else if (isYesterday) {
                dateStr = `Ayer, ${txDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
              } else {
                dateStr = txDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
              }

              // Mapeo de iconos disponibles
              const iconMap = {
                'Home': Home,
                'ShoppingBag': ShoppingBag,
                'Car': Car,
                'Coffee': Coffee,
                'Plane': Plane,
                'Zap': Zap,
                'DollarSign': DollarSign
              };
              const IconComponent = iconMap[categoryIcon] || DollarSign;

              return {
                icon: IconComponent,
                name: tx.description || 'Sin descripción',
                category: categoryName,
                date: dateStr,
                amount: `${isIncome ? '+' : '-'}$${parseFloat(tx.amount || 0).toFixed(2)}`,
                isIncome
              };
            }).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.3 + (i * 0.05) }}
                className="flex items-center justify-between p-4 hover:bg-gray-50/80 dark:hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    {React.isValidElement(item.icon) 
                      ? item.icon 
                      : React.createElement(item.icon, { className: "w-4 h-4 text-[#6E6E73] dark:text-gray-400" })}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a] dark:text-white">{item.name}</p>
                    <p className="text-xs text-[#6E6E73] dark:text-gray-400">{item.category} • {item.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold font-mono ${item.isIncome ? 'text-green-600 dark:text-green-400' : 'text-[#1a1a1a] dark:text-white'}`}>
                  {item.amount}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-[#6E6E73] dark:text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay transacciones recientes</p>
              <p className="text-sm mt-2">Agrega tu primera transacción para comenzar</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1.5 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-[68px] h-[68px] bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 hover:bg-black dark:hover:bg-gray-100 transition-all duration-300 z-50 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>
    </div>
  );
};

export default DashboardHome;
