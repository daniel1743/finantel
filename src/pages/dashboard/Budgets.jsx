import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Sparkles,
  Home,
  ShoppingBag,
  Car,
  Coffee,
  Zap,
  Loader2,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/components/ui/use-toast';
import AddBudgetModal from '@/components/modals/AddBudgetModal';

// Iconos por defecto para categorías
const DEFAULT_ICONS = {
  'Hogar': Home,
  'Alimentación': ShoppingBag,
  'Transporte': Car,
  'Ocio': Coffee,
  'Servicios': Zap,
};

const DEFAULT_COLORS = {
  'Hogar': 'text-[#1C8FA0]',
  'Alimentación': 'text-[#E47B45]',
  'Transporte': 'text-[#1a1a1a] dark:text-white',
  'Ocio': 'text-purple-500',
  'Servicios': 'text-yellow-500',
};

const RingChart = ({ percentage, color, size = 200, strokeWidth = 16 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-100 dark:text-gray-800"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={cn("transition-colors duration-500", color)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">{percentage}%</span>
        <span className="text-xs text-[#6E6E73] dark:text-gray-400 font-medium uppercase tracking-wider mt-1">Utilizado</span>
      </div>
    </div>
  );
};

const BudgetCard = ({ budget, spent, onUpdate }) => {
  const percentage = Math.min(100, Math.round((spent / budget.amount) * 100));
  let statusColor = "bg-[#1C8FA0]";
  if (percentage > 100) statusColor = "bg-red-500";
  else if (percentage > 90) statusColor = "bg-[#E47B45]";
  else if (percentage > 70) statusColor = "bg-yellow-500";

  const IconComponent = DEFAULT_ICONS[budget.name] || DollarSign;
  const iconColor = DEFAULT_COLORS[budget.name] || 'text-[#1C8FA0]';

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg dark:hover:shadow-black/20 transition-all group cursor-pointer relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
            <IconComponent className={cn("w-5 h-5", iconColor)} />
          </div>
          <div>
            <h3 className="font-bold text-[#1a1a1a] dark:text-white text-sm">{budget.name}</h3>
            <div className="flex items-baseline gap-1 text-xs text-[#6E6E73] dark:text-gray-400">
              <span className="font-medium text-[#1a1a1a] dark:text-white">${spent.toFixed(2)}</span>
              <span>/ ${parseFloat(budget.amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className={cn("w-2 h-2 rounded-full", statusColor)} />
      </div>

      <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
          className={cn("h-full rounded-full transition-colors", statusColor)}
        />
      </div>
      
      <div className="flex justify-between text-xs font-medium">
        <span className={percentage > 100 ? "text-red-500" : "text-[#6E6E73] dark:text-gray-400"}>
          {percentage > 100 ? `${percentage - 100}% Excedido` : `${100 - percentage}% Restante`}
        </span>
        <span className="text-[#1a1a1a] dark:text-white">${Math.max(0, parseFloat(budget.amount) - spent).toFixed(2)} disp.</span>
      </div>
    </motion.div>
  );
};

const Budgets = () => {
  const { user } = useAuth();
  const { budgets, transactions, categories, loading, addBudget, updateBudget, refresh } = useFinance(user?.id);
  const { toast } = useToast();
  const [period, setPeriod] = useState('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applyingRecommendation, setApplyingRecommendation] = useState(false);

  // Calcular datos reales de presupuestos
  const budgetData = useMemo(() => {
    if (!budgets || !transactions) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgets
      .filter(budget => budget.is_active && budget.period === period)
      .map(budget => {
        // Calcular gastos del mes actual para este presupuesto
        const monthTransactions = transactions.filter(tx => {
          if (tx.type !== 'expense') return false;
          const txDate = new Date(tx.date);
          const txMonth = txDate.getMonth();
          const txYear = txDate.getFullYear();
          
          // Si el presupuesto tiene category_id, filtrar por categoría
          if (budget.category_id) {
            return tx.category_id === budget.category_id && txMonth === currentMonth && txYear === currentYear;
          }
          // Si no tiene category_id, usar el nombre del presupuesto para buscar categorías
          const matchingCategory = categories.find(cat => cat.name === budget.name);
          if (matchingCategory) {
            return tx.category_id === matchingCategory.id && txMonth === currentMonth && txYear === currentYear;
          }
          return false;
        });

        const spent = monthTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

        return {
          ...budget,
          spent,
        };
      });
  }, [budgets, transactions, categories, period]);

  // Calcular totales
  const totalBudget = budgetData.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
  const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  
  let ringColor = "text-[#1C8FA0]";
  if (totalPercentage > 90) ringColor = "text-[#E47B45]";
  if (totalPercentage > 100) ringColor = "text-red-500";

  // Calcular recomendación inteligente
  const recommendation = useMemo(() => {
    if (budgetData.length === 0) return null;

    // Encontrar el presupuesto más excedido o cercano al límite
    const sortedBudgets = [...budgetData].sort((a, b) => {
      const aPercent = (a.spent / parseFloat(a.amount)) * 100;
      const bPercent = (b.spent / parseFloat(b.amount)) * 100;
      return bPercent - aPercent;
    });

    const topBudget = sortedBudgets[0];
    if (!topBudget) return null;

    const budgetPercent = (topBudget.spent / parseFloat(topBudget.amount)) * 100;
    
    // Solo recomendar si está por encima del 80%
    if (budgetPercent < 80) return null;

    // Calcular reducción del 10%
    const reduction = parseFloat(topBudget.amount) * 0.1;
    const newAmount = parseFloat(topBudget.amount) - reduction;
    const savings = reduction;

    return {
      budget: topBudget,
      reduction: reduction.toFixed(2),
      newAmount: newAmount.toFixed(2),
      savings: savings.toFixed(2),
      message: `Si reduces tu presupuesto de ${topBudget.name} un 10%, podrías destinar $${savings.toFixed(2)} extra a tus metas cada mes.`
    };
  }, [budgetData]);

  // Aplicar recomendación
  const handleApplyRecommendation = async () => {
    if (!recommendation) return;

    setApplyingRecommendation(true);
    try {
      await updateBudget(recommendation.budget.id, {
        amount: parseFloat(recommendation.newAmount)
      });
      
      toast({
        title: "¡Recomendación aplicada!",
        description: `El presupuesto de ${recommendation.budget.name} se ha reducido en $${recommendation.reduction}.`
      });
    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aplicar la recomendación."
      });
    } finally {
      setApplyingRecommendation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon component={Loader2} size="md" color="primary" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Presupuestos</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Controla cada centavo con precisión</p>
        </div>
        
        <div className="bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-gray-200 dark:border-white/10 flex shadow-sm">
          {['Mensual', 'Trimestral', 'Anual'].map((p) => {
            const periodMap = { 'Mensual': 'monthly', 'Trimestral': 'quarterly', 'Anual': 'yearly' };
            return (
            <button
              key={p}
                onClick={() => setPeriod(periodMap[p])}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  period === periodMap[p]
                  ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-black shadow-md" 
                  : "text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              {p}
            </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Ring Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1C8FA0] to-[#E47B45] opacity-50" />
          <h2 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-8 self-start">Resumen Global</h2>
          
          <RingChart percentage={totalPercentage} color={ringColor} size={240} />
          
          <div className="grid grid-cols-2 gap-8 w-full mt-8 pt-8 border-t border-gray-50 dark:border-white/5">
            <div className="text-center">
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Gastado</p>
              <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Disponible</p>
              <p className="text-2xl font-bold text-[#1C8FA0] font-['Inter_Tight']">${(totalBudget - totalSpent).toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="lg:col-span-8 space-y-6">
           {/* AI Recommendation */}
          {recommendation && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center shrink-0">
                <Icon component={Sparkles} size="lg" color="primary" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] dark:text-white">Oportunidad de Ahorro</h3>
                <p className="text-sm text-[#6E6E73] dark:text-gray-400 max-w-md mt-1">
                    Si reduces tu presupuesto de <span className="font-bold text-[#1a1a1a] dark:text-white">{recommendation.budget.name}</span> un 10%, podrías destinar <span className="font-bold text-[#1C8FA0]">${recommendation.savings} extra</span> a tus metas cada mes.
                </p>
              </div>
            </div>
              <button 
                onClick={handleApplyRecommendation}
                disabled={applyingRecommendation}
                className="px-6 py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {applyingRecommendation ? (
                  <>
                    <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  'Aplicar recomendación'
                )}
            </button>
          </motion.div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            {budgetData.length > 0 ? (
              budgetData.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} spent={budget.spent} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-[#6E6E73] dark:text-gray-400">
                <p className="text-lg mb-2">No tienes presupuestos creados aún</p>
                <p className="text-sm">Crea tu primer presupuesto para comenzar a controlar tus gastos</p>
              </div>
            )}
            
            {/* Add New Budget */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[22px] p-6 flex flex-col items-center justify-center gap-3 text-[#6E6E73] dark:text-gray-400 hover:border-[#1C8FA0] hover:text-[#1C8FA0] dark:hover:text-[#1C8FA0] hover:bg-[#1C8FA0]/5 transition-all group min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
                <Icon component={TrendingUp} size="md" color="default" />
              </div>
              <span className="font-medium">Nuevo Presupuesto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddBudgetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refresh();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Budgets;
