import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical,
  Calendar,
  Palette,
  Layout,
  Save,
  Loader2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const CustomizeDashboardModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Configuración de tarjetas de métricas
  const [visibleCards, setVisibleCards] = useState({
    balance: true,
    expenses: true,
    savings: true,
    income: false,
    goals: false,
    budgets: false
  });

  // Período de tiempo
  const [timePeriod, setTimePeriod] = useState('month'); // 'week', 'month', 'quarter', 'year'

  // Orden de tarjetas
  const [cardOrder, setCardOrder] = useState([
    'balance',
    'expenses',
    'savings',
    'income',
    'goals',
    'budgets'
  ]);

  // Cargar preferencias guardadas
  useEffect(() => {
    if (isOpen && user?.id) {
      loadPreferences();
    }
  }, [isOpen, user?.id]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('dashboard_settings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.dashboard_settings) {
        const settings = data.dashboard_settings;
        if (settings.visibleCards) setVisibleCards(settings.visibleCards);
        if (settings.timePeriod) setTimePeriod(settings.timePeriod);
        if (settings.cardOrder) setCardOrder(settings.cardOrder);
      }
    } catch (error) {
      console.error('Error loading dashboard preferences:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo identificar el usuario",
      });
      return;
    }

    setIsSaving(true);
    try {
      const dashboardSettings = {
        visibleCards,
        timePeriod,
        cardOrder
      };

      // Actualizar o crear preferencias
      const { error } = await supabase
        .from('profile_preferences')
        .upsert({
          user_id: user.id,
          dashboard_settings: dashboardSettings
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "¡Guardado!",
        description: "Tus preferencias del dashboard han sido guardadas",
      });

      // Recargar la página después de un breve delay para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving dashboard preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar las preferencias. Intenta de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCard = (cardKey) => {
    setVisibleCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const moveCard = (index, direction) => {
    const newOrder = [...cardOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setCardOrder(newOrder);
  };

  const cardLabels = {
    balance: 'Balance Total',
    expenses: 'Gastos Mensuales',
    savings: 'Tasa de Ahorro',
    income: 'Ingresos Mensuales',
    goals: 'Progreso de Metas',
    budgets: 'Estado de Presupuestos'
  };

  const timePeriods = [
    { value: 'week', label: 'Semanal' },
    { value: 'month', label: 'Mensual' },
    { value: 'quarter', label: 'Trimestral' },
    { value: 'year', label: 'Anual' }
  ];

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
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Personalizar Dashboard</h2>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400">Configura tu vista según tus preferencias</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Sección: Tarjetas Visibles */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-[#1C8FA0]" />
              <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Tarjetas de Métricas</h3>
            </div>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
              Selecciona qué métricas quieres ver en tu dashboard
            </p>
            <div className="space-y-3">
              {cardOrder.map((cardKey, index) => (
                <div
                  key={cardKey}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    visibleCards[cardKey]
                      ? "bg-[#1C8FA0]/5 dark:bg-[#1C8FA0]/10 border-[#1C8FA0]/20"
                      : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="w-5 h-5 text-[#6E6E73] dark:text-gray-400 cursor-move" />
                    <div className="flex-1">
                      <p className="font-medium text-[#1a1a1a] dark:text-white">
                        {cardLabels[cardKey]}
                      </p>
                      <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                        {index + 1} de {cardOrder.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveCard(index, 'up')}
                      disabled={index === 0}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        index === 0
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-gray-100 dark:hover:bg-white/10 text-[#6E6E73] dark:text-gray-400"
                      )}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveCard(index, 'down')}
                      disabled={index === cardOrder.length - 1}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        index === cardOrder.length - 1
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-gray-100 dark:hover:bg-white/10 text-[#6E6E73] dark:text-gray-400"
                      )}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => toggleCard(cardKey)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        visibleCards[cardKey]
                          ? "bg-[#1C8FA0] text-white hover:bg-[#167a8a]"
                          : "bg-gray-200 dark:bg-white/10 text-gray-400 hover:bg-gray-300 dark:hover:bg-white/20"
                      )}
                    >
                      {visibleCards[cardKey] ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección: Período de Tiempo */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#1C8FA0]" />
              <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Período de Tiempo</h3>
            </div>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
              Selecciona el período predeterminado para mostrar datos
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {timePeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setTimePeriod(period.value)}
                  className={cn(
                    "px-4 py-3 rounded-xl border transition-all text-sm font-medium",
                    timePeriod === period.value
                      ? "bg-[#1C8FA0] text-white border-[#1C8FA0] shadow-lg shadow-[#1C8FA0]/20"
                      : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-[#1C8FA0]/5 dark:bg-[#1C8FA0]/10 rounded-xl p-4 border border-[#1C8FA0]/10">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-[#1C8FA0] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#1a1a1a] dark:text-white mb-1">Nota</p>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                  Los cambios se aplicarán después de guardar. Puedes cambiar estas preferencias en cualquier momento desde este menú.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 flex gap-3 border-t border-gray-100 dark:border-white/10">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-[#1C8FA0] hover:bg-[#167a8a] text-white font-medium shadow-lg shadow-[#1C8FA0]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomizeDashboardModal;

