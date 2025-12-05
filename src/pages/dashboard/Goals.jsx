
import React, { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  X, 
  Sparkles,
  ArrowRight,
  Loader2,
  Trash2,
  // Iconos para metas
  Plane,
  Umbrella,
  Cake,
  UtensilsCrossed,
  Tv,
  Home,
  Car,
  Laptop,
  Smartphone,
  Camera,
  Gamepad2,
  Music,
  BookOpen,
  GraduationCap,
  Heart,
  Baby,
  ShoppingBag,
  Wrench,
  Building2,
  Dumbbell,
  Stethoscope,
  Palette,
  Gift,
  Briefcase,
  Wallet,
  CreditCard,
  PiggyBank,
  Coins,
  Landmark
} from 'lucide-react';
import { cn, getLocalDateString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/components/ui/use-toast';

// Iconos elegantes para metas (más de 20 opciones)
const goalIcons = [
  // Viajes y vacaciones
  { icon: Plane, name: 'Viaje', keywords: ['viaje', 'vacaciones', 'turismo', 'avión', 'japón', 'europa', 'viajar'] },
  { icon: Umbrella, name: 'Playa', keywords: ['playa', 'mar', 'verano', 'vacaciones', 'resort', 'tropical'] },
  
  // Celebración y eventos
  { icon: Cake, name: 'Cumpleaños', keywords: ['cumpleaños', 'fiesta', 'celebración', 'aniversario'] },
  { icon: Gift, name: 'Regalo', keywords: ['regalo', 'obsequio', 'presente', 'navidad'] },
  { icon: Heart, name: 'Boda', keywords: ['boda', 'matrimonio', 'compromiso', 'anillo', 'pareja'] },
  
  // Entretenimiento
  { icon: Tv, name: 'TV', keywords: ['televisor', 'tv', 'pantalla', 'entretenimiento'] },
  { icon: Gamepad2, name: 'Videojuegos', keywords: ['videojuegos', 'consola', 'gaming', 'playstation', 'xbox'] },
  { icon: Music, name: 'Música', keywords: ['música', 'instrumento', 'guitarra', 'piano', 'spotify'] },
  { icon: Camera, name: 'Fotografía', keywords: ['cámara', 'fotografía', 'fotos', 'lente'] },
  
  // Hogar y decoración
  { icon: Home, name: 'Casa', keywords: ['casa', 'hogar', 'vivienda', 'departamento', 'propiedad'] },
  { icon: Wrench, name: 'Reparación', keywords: ['reparación', 'renovación', 'cocina', 'baño', 'mejora'] },
  { icon: Palette, name: 'Decoración', keywords: ['decoración', 'diseño', 'interior', 'muebles'] },
  
  // Tecnología
  { icon: Laptop, name: 'Laptop', keywords: ['laptop', 'computadora', 'macbook', 'pc', 'portátil'] },
  { icon: Smartphone, name: 'Celular', keywords: ['celular', 'teléfono', 'iphone', 'samsung', 'smartphone'] },
  
  // Transporte
  { icon: Car, name: 'Auto', keywords: ['auto', 'carro', 'vehículo', 'coche', 'moto'] },
  
  // Educación y desarrollo
  { icon: BookOpen, name: 'Educación', keywords: ['educación', 'curso', 'libros', 'estudio', 'universidad'] },
  { icon: GraduationCap, name: 'Universidad', keywords: ['universidad', 'carrera', 'maestría', 'doctorado'] },
  
  // Salud y bienestar
  { icon: Stethoscope, name: 'Salud', keywords: ['salud', 'médico', 'tratamiento', 'hospital'] },
  { icon: Dumbbell, name: 'Gimnasio', keywords: ['gimnasio', 'fitness', 'ejercicio', 'deporte'] },
  
  // Compras y estilo
  { icon: ShoppingBag, name: 'Compras', keywords: ['compras', 'ropa', 'zapatos', 'accesorios'] },
  
  // Familia
  { icon: Baby, name: 'Bebé', keywords: ['bebé', 'niño', 'hijo', 'maternidad'] },
  { icon: Heart, name: 'Familia', keywords: ['familia', 'amor', 'pareja'] },
  
  // Restaurantes y comida
  { icon: UtensilsCrossed, name: 'Restaurante', keywords: ['restaurante', 'comida', 'cena', 'almuerzo', 'chef'] },
  
  // Finanzas
  { icon: PiggyBank, name: 'Ahorro', keywords: ['ahorro', 'fondo', 'emergencia', 'reserva'] },
  { icon: Wallet, name: 'Billetera', keywords: ['billetera', 'dinero', 'efectivo'] },
  { icon: CreditCard, name: 'Tarjeta', keywords: ['tarjeta', 'crédito', 'débito'] },
  { icon: Coins, name: 'Inversión', keywords: ['inversión', 'acciones', 'bolsa', 'ahorro'] },
  { icon: Landmark, name: 'Banco', keywords: ['banco', 'préstamo', 'hipoteca'] },
  
  // Trabajo
  { icon: Briefcase, name: 'Trabajo', keywords: ['trabajo', 'negocio', 'empresa', 'oficina'] },
  
  // Genérico
  { icon: Target, name: 'Meta', keywords: ['meta', 'objetivo', 'propósito'] }
];

// Función para sugerir icono basado en el nombre de la meta
const suggestIcon = (goalName) => {
  const nameLower = goalName.toLowerCase();
  for (const iconOption of goalIcons) {
    if (iconOption.keywords.some(keyword => nameLower.includes(keyword))) {
      return iconOption.icon;
    }
  }
  return Target; // Icono por defecto
};

const goalsData = [
  { 
    id: 1, 
    name: "Viaje a Japón", 
    target: 5000, 
    saved: 2450, 
    date: "Oct 2024", 
    imageAlt: "Cherry blossoms in Japan",
    color: "bg-pink-500",
    icon: Plane,
    icon_name: 'Viaje'
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

// Componente para meta de ejemplo (con estado local)
const ExampleGoalCard = ({ goal, index, onDelete }) => {
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar esta meta de ejemplo?')) {
      setIsDeleted(true);
      if (onDelete) {
        onDelete(goal.id);
      }
    }
  };

  if (isDeleted) return null;

  return <GoalCard goal={goal} index={index} onDelete={handleDelete} />;
};

const GoalCard = ({ goal, index, onDelete }) => {
  // Validación y cálculos seguros
  const target = Math.max(0, parseFloat(goal.target) || 0);
  const saved = Math.max(0, parseFloat(goal.saved) || 0);
  const percentage = target > 0 
    ? Math.min(100, Math.round((saved / target) * 100))
    : 0;
  const isOverTarget = saved > target;
  const remaining = Math.max(0, target - saved);
  const monthsLeft = goal.monthsLeft !== null && goal.monthsLeft !== undefined ? goal.monthsLeft : 8;
  const monthlyNeeded = goal.monthlyNeeded !== null && goal.monthlyNeeded !== undefined 
    ? goal.monthlyNeeded 
    : (monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : null);

  // Color por defecto si no está definido
  const defaultColor = goal.color || 'bg-[#1C8FA0]';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(goal.id);
    }
  };

  // Obtener el icono de la meta (si tiene icon_name, buscar el componente, sino usar sugerencia)
  const getGoalIcon = () => {
    if (goal.icon_name) {
      const iconOption = goalIcons.find(opt => opt.name === goal.icon_name);
      return iconOption ? iconOption.icon : suggestIcon(goal.name);
    }
    return goal.icon || suggestIcon(goal.name);
  };

  const GoalIcon = getGoalIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white rounded-[22px] overflow-hidden border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(28,143,160,0.15)] transition-all duration-500 flex flex-col"
    >
      {/* Fondo sutil con gradiente de color */}
      <div className="absolute inset-0 z-0">
        <div 
          className={cn(
            "absolute inset-0 opacity-5",
            defaultColor === 'bg-pink-500' && "bg-gradient-to-br from-pink-400 to-pink-600",
            defaultColor === 'bg-[#1C8FA0]' && "bg-gradient-to-br from-[#1C8FA0] to-[#167a8a]",
            defaultColor === 'bg-gray-800' && "bg-gradient-to-br from-gray-700 to-gray-900",
            defaultColor === 'bg-[#E47B45]' && "bg-gradient-to-br from-[#E47B45] to-[#d97706]",
            !['bg-pink-500', 'bg-[#1C8FA0]', 'bg-gray-800', 'bg-[#E47B45]'].includes(defaultColor) && "bg-gradient-to-br from-[#1C8FA0] to-[#167a8a]"
          )}
        />
      </div>

      <div className="relative z-20 p-6 flex flex-col">
        {/* Header con icono, fecha y botón eliminar */}
        <div className="flex justify-between items-start mb-5">
          {/* Badge con animación de pulso/latido fusionado */}
          <div className="relative w-12 h-12">
            {/* Anillos pulsantes fusionados con el badge */}
            <motion.div
              className={cn("absolute inset-0 rounded-full", defaultColor)}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ 
                width: '48px', 
                height: '48px',
              }}
            />
            <motion.div
              className={cn("absolute inset-0 rounded-full", defaultColor)}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
              style={{ 
                width: '48px', 
                height: '48px',
              }}
            />
            <motion.div
              className={cn("absolute inset-0 rounded-full", defaultColor)}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
              style={{ 
                width: '48px', 
                height: '48px',
              }}
            />
            {/* Badge principal fusionado con el pulso */}
            <motion.div
              className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg relative z-10", defaultColor)}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
              }}
              style={{
                boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.15)'
              }}
            >
              <GoalIcon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-[#6E6E73]">
              {goal.date}
            </span>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all shadow-sm border border-red-100"
                title="Eliminar meta"
              >
                <Icon component={Trash2} size="sm" color="default" />
              </button>
            )}
          </div>
        </div>

        {/* Nombre de la meta */}
        <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 font-['Inter_Tight'] leading-tight">{goal.name}</h3>
        
        {/* Meta objetivo */}
        <p className="text-sm text-[#6E6E73] mb-6 font-medium">Meta: ${goal.target.toLocaleString()}</p>

        {/* Información principal de ahorro */}
        <div className="space-y-5 mb-6">
          <div className="flex justify-between items-baseline">
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-[#1a1a1a] tracking-tight leading-none">
                ${saved.toLocaleString()}
              </span>
              <span className="text-xs text-[#6E6E73] mt-1 font-medium">Ahorrado</span>
              {isOverTarget && (
                <span className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                  Meta superada (+${(saved - target).toLocaleString()})
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#1C8FA0] block">{percentage}%</span>
              <span className="text-xs text-[#6E6E73] font-medium">Progreso</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, percentage)}%` }}
                transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                className={cn("h-full rounded-full", defaultColor)}
              />
              {isOverTarget && (
                <div className="absolute inset-0 h-full bg-green-500/30 rounded-full" />
              )}
            </div>
            <div className="flex justify-between text-xs text-[#6E6E73]">
              <span className="font-medium">${remaining.toLocaleString()} restantes</span>
              <span className="font-medium">${target.toLocaleString()} objetivo</span>
            </div>
          </div>
        </div>

        {/* Información de plan de ahorro - SIEMPRE VISIBLE */}
        {monthlyNeeded && monthsLeft > 0 && (
          <div className="mt-auto pt-5 border-t border-gray-100">
            <div className="flex items-start gap-3 bg-[#1C8FA0]/5 rounded-xl p-4 border border-[#1C8FA0]/10">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", defaultColor)}>
                <Icon component={Sparkles} size="xs" color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a] mb-1">Plan de Ahorro</p>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  Aporta <span className="font-bold text-[#1C8FA0]">${monthlyNeeded.toLocaleString()}/mes</span> para alcanzar tu meta en <span className="font-bold text-[#1C8FA0]">{monthsLeft} {monthsLeft === 1 ? 'mes' : 'meses'}</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Si no hay plan de ahorro, mostrar información adicional */}
        {(!monthlyNeeded || monthsLeft <= 0) && (
          <div className="mt-auto pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#6E6E73]">
                <Icon component={Calendar} size="xs" color="default" />
                <span className="font-medium">Fecha objetivo: {goal.date}</span>
              </div>
              {remaining > 0 && (
                <span className="text-[#1C8FA0] font-semibold">
                  ${remaining.toLocaleString()} por ahorrar
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CreateGoalModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { addGoal, transactions } = useFinance(user?.id);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    deadline: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMonthly, setSuggestedMonthly] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Sugerir icono automáticamente cuando cambia el nombre
  useEffect(() => {
    if (formData.name && !selectedIcon) {
      const suggested = suggestIcon(formData.name);
      setSelectedIcon(suggested);
    }
  }, [formData.name, selectedIcon]);

  // Resetear cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedIcon(null);
      setShowIconPicker(false);
    }
  }, [isOpen]);

  // Calcular sugerencia inteligente basada en ingresos
  useEffect(() => {
    if (isOpen && formData.target_amount && formData.deadline) {
      const target = parseFloat(formData.target_amount);
      const deadline = new Date(formData.deadline);
      const today = new Date();
      const monthsDiff = Math.max(1, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24 * 30)));
      
      // Calcular ingresos mensuales promedio
      const incomeTransactions = transactions?.filter(tx => tx.type === 'income') || [];
      const totalIncome = incomeTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      const avgMonthlyIncome = totalIncome > 0 ? totalIncome / Math.max(1, incomeTransactions.length) : 0;
      
      // Sugerir 20-30% del ingreso mensual o el monto necesario
      const monthlyNeeded = target / monthsDiff;
      const suggested = avgMonthlyIncome > 0 
        ? Math.min(monthlyNeeded, avgMonthlyIncome * 0.3) 
        : monthlyNeeded;
      
      setSuggestedMonthly(Math.ceil(suggested));
    } else {
      setSuggestedMonthly(null);
    }
  }, [isOpen, formData.target_amount, formData.deadline, transactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un nombre para la meta",
      });
      return;
    }

    // Limpiar el monto (remover espacios, comas, etc.)
    const cleanedAmount = formData.target_amount.toString().replace(/[,\s]/g, '');
    const parsedAmount = parseFloat(cleanedAmount);

    if (!cleanedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un monto objetivo válido (mayor a 0)",
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
      // Validar y formatear fecha
      let deadlineDate = null;
      if (formData.deadline) {
        const date = new Date(formData.deadline);
        if (isNaN(date.getTime())) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "La fecha ingresada no es válida",
          });
          setIsLoading(false);
          return;
        }
        // Asegurar que la fecha sea válida y esté en formato local (YYYY-MM-DD)
        deadlineDate = getLocalDateString(date);
      }

      // Encontrar el nombre del icono seleccionado
      const iconOption = goalIcons.find(opt => opt.icon === selectedIcon);
      const iconName = iconOption ? iconOption.name : null;

      const goalData = {
        name: formData.name.trim(),
        target_amount: parsedAmount,
        deadline: deadlineDate,
        description: formData.description.trim() || null,
        metadata: iconName ? { icon_name: iconName } : {}
      };

      await addGoal(goalData);
      
      // Reset form
      setFormData({
        name: '',
        target_amount: '',
        deadline: '',
        description: ''
      });
      setSuggestedMonthly(null);
      setSelectedIcon(null);
      setShowIconPicker(false);
      
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating goal:', error);
      
      // Mensajes de error más específicos
      let errorMessage = "No se pudo crear la meta. Intenta de nuevo.";
      
      if (error.message) {
        if (error.message.includes('target_amount')) {
          errorMessage = "El monto objetivo debe ser mayor a 0";
        } else if (error.message.includes('name')) {
          errorMessage = "El nombre de la meta es requerido y debe tener entre 1 y 100 caracteres";
        } else if (error.message.includes('deadline')) {
          errorMessage = "La fecha objetivo no es válida";
        } else if (error.message.includes('RLS') || error.message.includes('permission')) {
          errorMessage = "No tienes permisos para crear esta meta. Verifica tu sesión.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Error al crear meta",
        description: errorMessage,
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
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Nueva Meta</h2>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400">Define tu próximo objetivo financiero</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <Icon component={X} size="md" color="default" className="dark:" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Nombre de la meta</label>
            <input 
              type="text" 
              placeholder="Ej. Viaje a Europa" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
            />
          </div>

          {/* Selector de Iconos */}
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-3">
              Icono de la meta
            </label>
            
            {/* Icono seleccionado */}
            {selectedIcon && (
              <div className="mb-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center border-2 border-[#1C8FA0]">
                  {React.createElement(selectedIcon, { className: "w-6 h-6 text-[#1C8FA0]" })}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                    {goalIcons.find(opt => opt.icon === selectedIcon)?.name || 'Icono seleccionado'}
                  </p>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                    El icono se sugiere automáticamente según el nombre
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="px-4 py-2 text-sm font-medium text-[#1C8FA0] hover:bg-[#1C8FA0]/10 rounded-lg transition-colors"
                >
                  {showIconPicker ? 'Ocultar' : 'Cambiar'}
                </button>
              </div>
            )}

            {/* Grid de iconos */}
            {showIconPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-5 sm:grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 max-h-64 overflow-y-auto"
              >
                {goalIcons.map((iconOption, idx) => {
                  const IconComponent = iconOption.icon;
                  const isSelected = selectedIcon === iconOption.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(iconOption.icon);
                        setShowIconPicker(false);
                      }}
                      className={cn(
                        "p-3 rounded-xl transition-all hover:scale-110 flex flex-col items-center gap-2",
                        isSelected
                          ? "bg-[#1C8FA0] text-white shadow-lg"
                          : "bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-[#6E6E73] dark:text-gray-400 border border-gray-200 dark:border-white/10"
                      )}
                      title={iconOption.name}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-xs font-medium truncate w-full text-center">
                        {iconOption.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* Botón para mostrar selector si no hay icono seleccionado */}
            {!selectedIcon && (
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-medium text-[#6E6E73] dark:text-gray-400"
              >
                {showIconPicker ? 'Ocultar iconos' : 'Seleccionar icono'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Monto objetivo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">$</span>
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="5000" 
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => {
                    // Permitir solo números y punto decimal
                    const value = e.target.value.replace(/[^\d.]/g, '');
                    // Solo permitir un punto decimal
                    const parts = value.split('.');
                    const cleanedValue = parts.length > 2 
                      ? parts[0] + '.' + parts.slice(1).join('')
                      : value;
                    setFormData({ ...formData, target_amount: cleanedValue });
                  }}
                  disabled={isLoading}
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Fecha objetivo</label>
              <input 
                type="date" 
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                disabled={isLoading}
                min={getLocalDateString()}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all text-[#6E6E73] dark:text-gray-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Descripción (opcional)</label>
            <textarea 
              placeholder="Agrega una descripción para tu meta..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* AI Suggestion */}
          {suggestedMonthly && (
            <div className="bg-[#1C8FA0]/5 dark:bg-[#1C8FA0]/10 rounded-xl p-4 border border-[#1C8FA0]/10 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center shrink-0">
                <Icon component={Sparkles} size="sm" color="primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a] dark:text-white mb-1">Sugerencia Inteligente</p>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                  Basado en tus ingresos, te sugiero aportar <span className="font-bold text-[#1C8FA0]">${suggestedMonthly.toLocaleString()}/mes</span> para alcanzar esta meta cómodamente sin afectar tus gastos fijos.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.target_amount}
              className="flex-1 h-12 rounded-xl bg-[#1a1a1a] dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Meta'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Goals = () => {
  const { user } = useAuth();
  const { goals, transactions, loading, refresh, deleteGoal } = useFinance(user?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoalAdded = () => {
    refresh(); // Refrescar la lista de metas
  };

  const handleDeleteGoal = async (goalId) => {
    // Si es una meta de ejemplo (id numérico), solo eliminarla del estado local
    if (typeof goalId === 'number') {
      toast({
        title: "Meta eliminada",
        description: "La meta de ejemplo ha sido eliminada.",
      });
      return;
    }

    // Confirmar eliminación
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta meta?')) {
      return;
    }

    try {
      await deleteGoal(goalId);
      refresh(); // Refrescar la lista
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la meta. Intenta de nuevo.",
      });
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  };

  // Calcular meses restantes
  const calculateMonthsLeft = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const monthsDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, monthsDiff);
  };

  // Calcular análisis de metas (datos reales)
  const goalAnalysis = useMemo(() => {
    if (!goals || goals.length === 0 || !transactions) {
      return null;
    }

    const activeGoals = goals.filter(g => g.status === 'active' && g.deadline);
    if (activeGoals.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calcular ahorro mensual promedio (últimos 3 meses)
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const recentTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= threeMonthsAgo && txDate <= today;
    });

    const totalIncome = recentTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const totalExpenses = recentTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const monthlySavings = (totalIncome - totalExpenses) / 3;

    // Analizar cada meta
    const goalsAnalysis = activeGoals.map(goal => {
      const targetAmount = parseFloat(goal.target_amount || 0);
      const currentAmount = parseFloat(goal.current_amount || 0);
      const remaining = targetAmount - currentAmount;
      const deadline = new Date(goal.deadline);
      const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      const monthsUntilDeadline = daysUntilDeadline / 30;

      // Calcular si se logrará a tiempo
      let willAchieveOnTime = false;
      let monthsEarly = 0;
      let monthsLate = 0;
      let percentageAhead = 0;

      if (monthlySavings > 0) {
        const monthsNeeded = remaining / monthlySavings;
        if (monthsNeeded <= monthsUntilDeadline) {
          willAchieveOnTime = true;
          monthsEarly = Math.floor(monthsUntilDeadline - monthsNeeded);
        } else {
          monthsLate = Math.ceil(monthsNeeded - monthsUntilDeadline);
        }

        // Calcular porcentaje adelantado/atrasado
        if (currentAmount > 0 && targetAmount > 0) {
          const expectedProgress = (monthsUntilDeadline > 0) 
            ? (targetAmount * (1 - (monthsUntilDeadline / (monthsUntilDeadline + monthsNeeded))))
            : 0;
          if (currentAmount > expectedProgress) {
            percentageAhead = Math.round(((currentAmount - expectedProgress) / targetAmount) * 100);
          }
        }
      }

      return {
        ...goal,
        willAchieveOnTime,
        monthsEarly,
        monthsLate,
        percentageAhead,
        monthlySavings,
        remaining,
        monthsUntilDeadline
      };
    });

    const goalsOnTime = goalsAnalysis.filter(g => g.willAchieveOnTime).length;
    const goalsAhead = goalsAnalysis.filter(g => g.percentageAhead > 0);
    const goalsLate = goalsAnalysis.filter(g => g.monthsLate > 0);

    // Mensaje dinámico
    let message = '';
    if (goalsAhead.length > 0 && goalsLate.length > 0) {
      const aheadGoal = goalsAhead[0];
      const lateGoal = goalsLate[0];
      message = `"${aheadGoal.name}" va un ${aheadGoal.percentageAhead}% adelantado. Sin embargo, "${lateGoal.name}" podría retrasarse ${lateGoal.monthsLate} ${lateGoal.monthsLate === 1 ? 'mes' : 'meses'} si no ajustamos el aporte.`;
    } else if (goalsAhead.length > 0) {
      const aheadGoal = goalsAhead[0];
      message = `"${aheadGoal.name}" va un ${aheadGoal.percentageAhead}% adelantado. ¡Sigue así!`;
    } else if (goalsLate.length > 0) {
      const lateGoal = goalsLate[0];
      message = `"${lateGoal.name}" podría retrasarse ${lateGoal.monthsLate} ${lateGoal.monthsLate === 1 ? 'mes' : 'meses'} si no ajustamos el aporte.`;
    } else {
      message = 'Tus metas están en buen camino. Mantén el ritmo de ahorro.';
    }

    // Datos para el gráfico (proyección de 12 meses)
    const chartData = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(today);
      monthDate.setMonth(today.getMonth() + i);
      const projectedSavings = monthlySavings * (i + 1);
      chartData.push(Math.min(100, (projectedSavings / (activeGoals.reduce((sum, g) => sum + parseFloat(g.target_amount || 0), 0) / activeGoals.length)) * 100));
    }

    return {
      goalsOnTime,
      totalGoals: activeGoals.length,
      message,
      chartData,
      monthlySavings
    };
  }, [goals, transactions]);

  return (
    <div className="space-y-8 pb-12">
      <AnimatePresence mode="wait">
        {isModalOpen && (
          <CreateGoalModal 
            key="create-goal-modal"
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleGoalAdded}
          />
        )}
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
          <Icon component={Plus} size="md" color="default" className="mr-2" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/10 text-white">
              <Icon component={Sparkles} size="xs" color="white" />
              Análisis de Metas
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              {goalAnalysis ? (
                <>
                  Con tus aportes actuales, lograrás <span className="text-[#E47B45] bg-white/10 px-2 rounded-lg">{goalAnalysis.goalsOnTime} {goalAnalysis.goalsOnTime === 1 ? 'meta' : 'metas'}</span> a tiempo.
                </>
              ) : (
                <>
                  Crea tus primeras metas para ver un análisis personalizado de tu progreso.
                </>
              )}
            </h2>
            <p className="text-white/80 text-lg max-w-xl">
              {goalAnalysis ? goalAnalysis.message : 'Las metas te ayudan a darle propósito a tu dinero y alcanzar tus objetivos financieros.'}
            </p>
            {goalAnalysis && (
              <button 
                onClick={() => navigate('/dashboard/predictions')}
                className="flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all mt-2 cursor-pointer text-white hover:text-white/90"
              >
                Ver detalles del plan <Icon component={ArrowRight} size="sm" color="white" />
              </button>
            )}
          </div>

          <div className="lg:col-span-5">
            {/* Título del gráfico */}
            <div className="mb-2">
              <p className="text-white/90 text-xs font-semibold">Proyección de Ahorro (12 meses)</p>
              {goalAnalysis && goalAnalysis.monthlySavings > 0 && (
                <p className="text-white/70 text-xs mt-0.5">
                  Basado en ahorro mensual de ${Math.round(goalAnalysis.monthlySavings).toLocaleString()}
                </p>
              )}
            </div>
            {/* Contenedor del gráfico */}
            <div className="h-32 flex items-end gap-1.5 pb-2 px-2 bg-white/20 rounded-xl border border-white/20 backdrop-blur-sm">
              {/* Gráfico de proyección (datos reales o placeholder) */}
              {(goalAnalysis && goalAnalysis.chartData.length > 0) ? (
                goalAnalysis.chartData.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="flex-1 bg-white rounded-t-sm hover:bg-[#E47B45] transition-all cursor-pointer relative group shadow-sm min-h-[4px]"
                    title={`Mes ${i + 1}: ${Math.round(h)}% de progreso proyectado`}
                  >
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white text-[#1C8FA0] text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg pointer-events-none">
                      Mes {i + 1}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                    </div>
                    {/* Etiqueta de porcentaje en la barra */}
                    {h > 15 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#1C8FA0] opacity-0 group-hover:opacity-100 transition-opacity">
                          {Math.round(h)}%
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                // Placeholder si no hay datos - más visible con explicación
                <>
                  {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="flex-1 bg-white/70 rounded-t-sm shadow-sm min-h-[4px]"
                      title={`Ejemplo Mes ${i + 1}: ${h}%`}
                    />
                  ))}
                </>
              )}
            </div>
            {/* Leyenda del gráfico */}
            <div className="mt-2 flex items-center justify-center gap-4 text-white/80 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
                <span>Progreso proyectado</span>
              </div>
              {goalAnalysis && goalAnalysis.monthlySavings > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#E47B45] rounded-sm"></div>
                  <span>Hover para detalles</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
          </div>
        ) : goals && goals.length > 0 ? (
          goals.map((goal, index) => {
            const percentage = Math.min(100, Math.round((parseFloat(goal.current_amount || 0) / parseFloat(goal.target_amount || 1)) * 100));
            const monthsLeft = calculateMonthsLeft(goal.deadline);
            const remaining = parseFloat(goal.target_amount || 0) - parseFloat(goal.current_amount || 0);
            const monthlyNeeded = monthsLeft && monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : null;
            
            // Obtener el icono de la meta (desde metadata o sugerir)
            let goalIcon = Target;
            const iconName = goal.metadata?.icon_name || goal.icon_name;
            if (iconName) {
              const iconOption = goalIcons.find(opt => opt.name === iconName);
              goalIcon = iconOption ? iconOption.icon : suggestIcon(goal.name);
            } else {
              goalIcon = suggestIcon(goal.name);
            }
            
            const goalCardData = {
              id: goal.id,
              name: goal.name,
              target: parseFloat(goal.target_amount || 0),
              saved: parseFloat(goal.current_amount || 0),
              date: formatDate(goal.deadline),
              imageAlt: goal.description || goal.name,
              color: goal.status === 'completed' ? 'bg-green-500' : 'bg-[#1C8FA0]',
              monthsLeft,
              monthlyNeeded,
              icon: goalIcon,
              icon_name: iconName
            };
            
            return <GoalCard key={goal.id} goal={goalCardData} index={index} onDelete={handleDeleteGoal} />;
          })
        ) : null}
        
        {/* Mostrar solo una meta de ejemplo si no hay metas de Supabase */}
        {(!goals || goals.length === 0) && !loading && (
          <ExampleGoalCard goal={goalsData[0]} index={0} onDelete={handleDeleteGoal} />
        )}
        
        {/* Add New Placeholder */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[22px] flex flex-col items-center justify-center gap-4 text-[#6E6E73] dark:text-gray-400 hover:border-[#1C8FA0] hover:text-[#1C8FA0] hover:bg-[#1C8FA0]/5 transition-all group min-h-[320px]"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-white/10 group-hover:shadow-lg transition-all duration-300">
            <Icon component={Plus} size="xl" color="default" />
          </div>
          <span className="font-medium text-lg">Crear Nueva Meta</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Goals;
