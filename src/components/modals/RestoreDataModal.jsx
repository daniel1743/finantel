import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { X, RotateCcw, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const RestoreDataModal = ({ isOpen, onClose, onRestoreSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hasRestorableData, setHasRestorableData] = useState(false);
  const [restorableCount, setRestorableCount] = useState(0);
  const [alreadyRestored, setAlreadyRestored] = useState(false);

  // Verificar si hay datos restaurables al abrir el modal
  useEffect(() => {
    if (isOpen && user?.id) {
      checkRestorableData();
    }
  }, [isOpen, user?.id]);

  const checkRestorableData = async () => {
    setChecking(true);
    try {
      console.log('🔍 [RestoreModal] Verificando datos restaurables...');
      
      const { data, error } = await supabase.functions.invoke('restore-previous-cycle', {
        body: { action: 'check_restorable_data' }
      });

      if (error) {
        console.error('❌ [RestoreModal] Error en Edge Function:', error);
        // Si es un error 503, la función no está desplegada
        if (error.message?.includes('503') || error.message?.includes('Function not found')) {
          console.warn('⚠️ [RestoreModal] Edge Function no desplegada. Necesitas desplegar restore-previous-cycle');
        }
        throw error;
      }

      console.log('✅ [RestoreModal] Respuesta:', data);
      
      setHasRestorableData(data.has_restorable_data || false);
      setRestorableCount(data.count || 0);
      setAlreadyRestored(data.already_restored || false);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [RestoreModal] Estado:', {
          hasRestorableData: data.has_restorable_data,
          count: data.count,
          alreadyRestored: data.already_restored,
          dateRange: data.date_range
        });
      }
    } catch (error) {
      console.error('❌ [RestoreModal] Error checking restorable data:', error);
      // No mostrar error al usuario, solo no mostrar el botón
      setHasRestorableData(false);
    } finally {
      setChecking(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('restore-previous-cycle', {
        body: { action: 'restore_previous_cycle' }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "¡Datos restaurados!",
        description: data.message || `Se restauraron ${data.restored_count} transacciones del mes anterior.`,
      });

      // Recargar datos del dashboard
      if (onRestoreSuccess) {
        onRestoreSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Error restoring data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudieron restaurar los datos. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center">
              <Icon component={RotateCcw} size="lg" color="primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                Restaurar datos del mes anterior
              </h2>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
                Recupera transacciones del ciclo anterior
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || checking}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <Icon component={X} size="md" color="default" className="dark:" />
          </button>
        </div>

        {checking ? (
          <div className="flex items-center justify-center py-8">
            <Icon component={Loader2} size="lg" color="primary" className="animate-spin" />
            <span className="ml-3 text-[#6E6E73] dark:text-gray-400">Verificando datos...</span>
          </div>
        ) : alreadyRestored ? (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon component={CheckCircle2} size="md" color="success" className="dark: mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-400 mb-1">
                    Datos ya restaurados
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-300">
                    Ya se restauraron los datos del mes anterior para este ciclo. No es necesario restaurarlos nuevamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                className="flex-1"
              >
                Entendido
              </Button>
            </div>
          </div>
        ) : hasRestorableData ? (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon component={Info} size="md" color="default" className="dark: mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                    Hemos encontrado transacciones del mes pasado
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
                    Hemos encontrado {restorableCount} transacción{restorableCount !== 1 ? 'es' : ''} del mes pasado que no están en tu ciclo actual. ¿Deseas continuar usando esos datos para este mes?
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Esto te permitirá mantener consistencia en tu presupuesto.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRestore}
                disabled={loading}
                className="flex-1 bg-[#1C8FA0] hover:bg-[#167a8a] text-white border-none"
              >
                {loading ? (
                  <>
                    <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
                    Restaurando...
                  </>
                ) : (
                  <>
                    <Icon component={RotateCcw} size="sm" color="default" className="mr-2" />
                    Restaurar datos
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon component={Info} size="md" color="default" className="dark: mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a] dark:text-white mb-1">
                    No hay datos restaurables
                  </p>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                    No se encontraron transacciones de los últimos 7 días del mes anterior que puedan restaurarse.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RestoreDataModal;

