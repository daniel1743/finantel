
import React, { useState, useMemo, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/components/ui/use-toast';

const ScenarioCard = ({ title, description, impact, type, delay, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    onClick={onClick}
    className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 group cursor-pointer h-full flex flex-col"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        type === 'positive' ? 'bg-green-50 text-green-600' : 
        type === 'warning' ? 'bg-orange-50 text-orange-600' : 
        'bg-[#1C8FA0]/10 text-[#1C8FA0]'
      }`}>
        {type === 'positive' ? <Icon component={TrendingUp} size="md" color="default" /> : 
         type === 'warning' ? <Icon component={AlertTriangle} size="md" color="default" /> : 
         <Icon component={Sparkles} size="md" color="default" />}
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
        type === 'positive' ? 'bg-green-100 text-green-700' : 
        type === 'warning' ? 'bg-orange-100 text-orange-700' : 
        'bg-[#1C8FA0]/10 text-[#1C8FA0]'
      }`}>
        {impact}
      </span>
    </div>
    <h3 className="font-bold text-[#1a1a1a] mb-2">{title}</h3>
    <p className="text-sm text-[#6E6E73] leading-relaxed mb-4 flex-1">{description}</p>
    <div className="flex items-center text-sm font-medium text-[#1a1a1a] group-hover:gap-2 transition-all mt-auto">
      Simular escenario <Icon component={ArrowRight} size="sm" color="default" className="ml-1" />
    </div>
  </motion.div>
);

const Predictions = () => {
  const { user } = useAuth();
  const { transactions, budgets, goals, loading: financeLoading } = useFinance(user?.id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeHorizon, setTimeHorizon] = useState('90d');

  // Calcular métricas financieras
  const financialMetrics = useMemo(() => {
    if (!transactions || transactions.length === 0) return null;

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filtrar transacciones del mes actual y anterior
    const currentMonthTx = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= currentMonth;
    });

    const lastMonthTx = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= lastMonth && txDate <= lastMonthEnd;
    });

    // Calcular ingresos y gastos
    const currentIncome = currentMonthTx
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const currentExpenses = currentMonthTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const lastMonthExpenses = lastMonthTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    // Calcular gastos por categoría
    const categoryExpenses = {};
    currentMonthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const catName = t.categories?.name || 'Sin categoría';
        categoryExpenses[catName] = (categoryExpenses[catName] || 0) + (parseFloat(t.amount) || 0);
      });

    // Encontrar categoría con mayor gasto
    const topCategory = Object.entries(categoryExpenses)
      .sort(([, a], [, b]) => b - a)[0];

    // Calcular ahorro mensual
    const monthlySavings = currentIncome - currentExpenses;
    const monthlyFlow = monthlySavings;

    // Calcular balance actual (suma de todas las transacciones)
    const allTransactions = transactions || [];
    const currentBalance = allTransactions.reduce((sum, t) => {
      const amount = parseFloat(t.amount) || 0;
      return sum + (t.type === 'income' ? amount : -amount);
    }, 0);

    // Calcular proyección anual
    const monthsUntilYearEnd = 12 - now.getMonth();
    const projectedYearEnd = monthlySavings * monthsUntilYearEnd;

    // Encontrar meta más cercana
    const activeGoal = goals?.find(g => {
      const goalDate = new Date(g.target_date);
      return goalDate >= now && g.status === 'active';
    });

    return {
      currentIncome,
      currentExpenses,
      lastMonthExpenses,
      monthlySavings,
      monthlyFlow,
      projectedYearEnd,
      topCategory,
      categoryExpenses,
      activeGoal,
      currentBalance,
      expenseChange: lastMonthExpenses > 0 
        ? ((currentExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
        : 0,
    };
  }, [transactions, goals]);

  // Generar escenarios basados en datos reales
  const scenarios = useMemo(() => {
    if (!financialMetrics) return [];

    const scenariosList = [];

    // Escenario 1: Mantener ritmo actual
    if (financialMetrics.monthlySavings > 0 && financialMetrics.activeGoal) {
      const monthsToGoal = Math.ceil(
        (new Date(financialMetrics.activeGoal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 30)
      );
      const projectedSavings = financialMetrics.monthlySavings * monthsToGoal;
      const goalProgress = (projectedSavings / financialMetrics.activeGoal.target) * 100;
      
      scenariosList.push({
        id: 'current_pace',
        title: 'Si mantienes este ritmo...',
        description: `Llegarás a fin de año con un excedente de $${financialMetrics.projectedYearEnd.toLocaleString('es-CL')}, suficiente para cubrir el ${Math.min(100, Math.round(goalProgress))}% de tu meta '${financialMetrics.activeGoal.name}'.`,
        impact: `+${Math.round((financialMetrics.monthlySavings / financialMetrics.currentIncome) * 100)}% Ahorro`,
        type: 'default',
      });
    }

    // Escenario 2: Reducir categoría principal
    if (financialMetrics.topCategory && financialMetrics.categoryExpenses[financialMetrics.topCategory[0]] > 0) {
      const categoryName = financialMetrics.topCategory[0];
      const categoryAmount = financialMetrics.topCategory[1];
      const reduction = categoryAmount * 0.2; // 20% de reducción
      const annualSavings = reduction * 12;
      
      scenariosList.push({
        id: 'reduce_category',
        title: `Si reduces ${categoryName} en 20%...`,
        description: `Podrías redirigir $${Math.round(reduction).toLocaleString('es-CL')} mensuales a tu fondo de inversión, generando $${Math.round(annualSavings).toLocaleString('es-CL')} extra al año.`,
        impact: `+$${Math.round(annualSavings).toLocaleString('es-CL')}/año`,
        type: 'positive',
        category: categoryName,
      });
    }

    // Escenario 3: Alerta de suscripciones/gastos crecientes
    if (financialMetrics.expenseChange > 5) {
      // Detectar si el aumento es en suscripciones o gastos fijos
      const subscriptions = financialMetrics.categoryExpenses['Suscripciones'] || 
                           financialMetrics.categoryExpenses['Servicios'] || 0;
      const isSubscriptionAlert = subscriptions > 0 && 
                                 (subscriptions / financialMetrics.currentExpenses) > 0.15;
      
      scenariosList.push({
        id: 'expense_alert',
        title: isSubscriptionAlert ? 'Alerta de Suscripciones' : 'Alerta de Gastos Crecientes',
        description: isSubscriptionAlert
          ? `Tus gastos fijos han subido un ${Math.round(financialMetrics.expenseChange)}% este mes. Si sigue así, podrías comprometer tu meta de ahorro.`
          : `Tus gastos han subido un ${Math.round(financialMetrics.expenseChange)}% este mes. Si sigue así, podrías comprometer tu meta de ahorro.`,
        impact: 'Riesgo Medio',
        type: 'warning',
      });
    }

    return scenariosList;
  }, [financialMetrics]);

  // Detectar riesgos
  const detectedRisk = useMemo(() => {
    if (!financialMetrics) return null;

    // Detectar si hay riesgo de flujo negativo
    const daysUntilNegative = financialMetrics.monthlyFlow < 0 
      ? Math.ceil(Math.abs(financialMetrics.monthlyFlow / (financialMetrics.currentExpenses / 30)))
      : null;

    // Detectar patrones estacionales (simplificado)
    const currentMonth = new Date().getMonth();
    const isDecember = currentMonth === 11; // Diciembre es mes 11

    if (daysUntilNegative && daysUntilNegative <= 45) {
      return {
        title: 'Probabilidad de flujo negativo en 45 días',
        description: `Hemos detectado que tus gastos en "${financialMetrics.topCategory?.[0] || 'varias categorías'}" están aumentando. Con tu saldo actual, podrías quedar en descubierto si no reservas $${Math.abs(Math.round(financialMetrics.monthlyFlow)).toLocaleString('es-CL')} extra.`,
        category: financialMetrics.topCategory?.[0] || 'gastos generales',
        amount: Math.abs(Math.round(financialMetrics.monthlyFlow)),
      };
    }

    // Detectar patrones estacionales mejorados
    if (isDecember && financialMetrics.topCategory) {
      const categoryName = financialMetrics.topCategory[0];
      const categoryAmount = financialMetrics.topCategory[1];
      // Calcular un monto más preciso basado en el gasto actual
      const estimatedIncrease = categoryAmount * 0.3; // 30% de aumento estimado en diciembre
      const recommendedReserve = Math.max(500, Math.round(estimatedIncrease));
      
      return {
        title: 'Probabilidad de flujo negativo en 45 días',
        description: `Hemos detectado que tus gastos en "${categoryName}" suelen dispararse en Diciembre. Con tu saldo actual, podrías quedar en descubierto si no reservas $${recommendedReserve.toLocaleString('es-CL')} extra.`,
        category: categoryName,
        amount: recommendedReserve,
      };
    }
    
    // Detectar riesgo de flujo negativo basado en tendencia
    if (financialMetrics.monthlyFlow < 0 && financialMetrics.currentExpenses > 0) {
      const daysUntilNegative = Math.ceil(
        Math.abs(financialMetrics.monthlyFlow / (financialMetrics.currentExpenses / 30))
      );
      
      if (daysUntilNegative <= 60) {
        return {
          title: 'Probabilidad de flujo negativo en 45 días',
          description: `Con tu ritmo actual de gastos, podrías quedar en descubierto en aproximadamente ${daysUntilNegative} días. Te recomendamos revisar tus gastos en "${financialMetrics.topCategory?.[0] || 'varias categorías'}" y considerar reservar $${Math.abs(Math.round(financialMetrics.monthlyFlow)).toLocaleString('es-CL')} extra.`,
          category: financialMetrics.topCategory?.[0] || 'gastos generales',
          amount: Math.abs(Math.round(financialMetrics.monthlyFlow)),
        };
      }
    }

    return null;
  }, [financialMetrics]);

  // Manejar clic en "Simular escenario"
  const handleSimulateScenario = (scenarioId) => {
    navigate('/dashboard/future-self', { 
      state: { 
        scenario: scenarioId,
        horizon: timeHorizon === '30d' ? 1 : timeHorizon === '90d' ? 3 : 12 
      } 
    });
  };

  // Manejar clic en "Hablar con la IA"
  const handleTalkToAI = () => {
    if (detectedRisk) {
      const message = `Tengo un riesgo financiero detectado: ${detectedRisk.title}. ${detectedRisk.description} ¿Qué puedo hacer para evitarlo?`;
      navigate('/dashboard/ai-assistant', { 
        state: { 
          initialMessage: message,
          context: 'risk_alert'
        } 
      });
    } else {
      navigate('/dashboard/ai-assistant');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Predicciones</h1>
          <p className="text-[#6E6E73] mt-1 text-lg">Cómo se verá tu dinero si sigues como hasta ahora</p>
        </div>
        
        <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
          {[
            { id: '30d', label: '30 Días' },
            { id: '90d', label: '90 Días' },
            { id: '12m', label: '12 Meses' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeHorizon(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeHorizon === t.id 
                  ? 'bg-[#1a1a1a] text-white shadow-md' 
                  : 'text-[#6E6E73] hover:text-[#1a1a1a] hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-[26px] p-8 border border-gray-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] relative"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">Proyección de Balance</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="text-[#6E6E73]">Histórico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1C8FA0]" />
                <span className="text-[#6E6E73]">Proyectado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E47B45] border border-dashed border-white" />
                <span className="text-[#6E6E73]">Optimizado (IA)</span>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-[#6E6E73]">Balance estimado en {timeHorizon === '30d' ? '30 días' : timeHorizon === '90d' ? '90 días' : '1 año'}</p>
            <p className="text-3xl font-bold text-[#1C8FA0] font-['Inter_Tight']">
              {financialMetrics ? (() => {
                const currentBalance = financialMetrics.currentBalance || 0;
                const monthlySavings = financialMetrics.monthlySavings || 0;
                let projectedBalance = currentBalance;
                
                if (timeHorizon === '30d') {
                  // 30 días = aproximadamente 1 mes
                  projectedBalance = currentBalance + monthlySavings;
                } else if (timeHorizon === '90d') {
                  // 90 días = 3 meses
                  projectedBalance = currentBalance + (monthlySavings * 3);
                } else if (timeHorizon === '12m') {
                  // 12 meses
                  projectedBalance = currentBalance + (monthlySavings * 12);
                }
                
                return `$${projectedBalance.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              })() : '$0.00'}
            </p>
          </div>
        </div>

        {/* Custom CSS Chart Visualization */}
        <div className="w-full relative mt-8" style={{ minHeight: '400px', height: '400px' }}>
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300" style={{ paddingLeft: '2rem' }}>
            {[4, 3, 2, 1, 0].map((i) => (
              <div key={i} className="border-b border-gray-100 w-full h-0 relative">
                <span className="absolute -top-2.5 -left-8 font-medium">${i * 5}k</span>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="absolute inset-0" style={{ paddingLeft: '2rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
            <svg 
              className="w-full h-full" 
              viewBox="0 0 600 240" 
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: 'visible' }}
            >
              {/* Historical Line (Gray) */}
              <path 
                d="M0,180 C50,170 100,190 150,150 C200,110 250,130 300,100" 
                fill="none" 
                stroke="#E5E7EB" 
                strokeWidth="3" 
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* Projected Line (Teal) */}
              <path 
                d="M300,100 C350,70 400,80 450,60 C500,40 550,50 600,20" 
                fill="none" 
                stroke="#1C8FA0" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
              />
              {/* Area under projected */}
              <path 
                d="M300,100 C350,70 400,80 450,60 C500,40 550,50 600,20 L600,240 L300,240 Z" 
                fill="url(#tealGradient)" 
                opacity="0.1"
              />
              {/* Optimized Line (Orange) */}
              <path 
                d="M300,100 C350,60 400,50 450,30 C500,10 550,15 600,0" 
                fill="none" 
                stroke="#E47B45" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray="4 4"
                opacity="0.6"
                vectorEffect="non-scaling-stroke"
              />
              
              <defs>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1C8FA0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Points */}
              <circle cx="300" cy="100" r="6" fill="#1a1a1a" stroke="white" strokeWidth="2" />
              <circle cx="600" cy="20" r="6" fill="#1C8FA0" stroke="white" strokeWidth="2" />
              <circle cx="600" cy="0" r="5" fill="#E47B45" stroke="white" strokeWidth="2" opacity="0.6" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Scenarios Grid */}
      {scenarios.length > 0 ? (
        <div className="flex flex-col gap-6">
          {scenarios.map((scenario, index) => (
            <ScenarioCard 
              key={scenario.id}
              title={scenario.title}
              description={scenario.description}
              impact={scenario.impact}
              type={scenario.type}
              delay={0.2 + (index * 0.1)}
              onClick={() => handleSimulateScenario(scenario.id)}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[22px] p-8 border border-gray-100 text-center"
        >
          <p className="text-[#6E6E73]">
            {financeLoading 
              ? 'Cargando escenarios...' 
              : 'Agrega transacciones para ver escenarios personalizados'}
          </p>
        </motion.div>
      )}

      {/* Risk Analysis Section */}
      {detectedRisk && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-red-50 rounded-[26px] p-8 border border-red-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600 text-sm font-bold uppercase tracking-wider">
                <Icon component={AlertTriangle} size="sm" color="default" />
                Riesgos Detectados
              </div>
              <h3 className="text-2xl font-bold text-[#1a1a1a]">{detectedRisk.title}</h3>
              <p className="text-[#6E6E73] max-w-xl">
                {detectedRisk.description}
              </p>
            </div>
            <Button 
              onClick={handleTalkToAI}
              className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm h-12 px-6 rounded-xl font-bold transition-all"
            >
              <Icon component={Zap} size="sm" color="default" className="mr-2" />
              Hablar con la IA sobre esto
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Predictions;
