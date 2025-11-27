import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Pause, Play, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const PauseAccountModal = ({ isOpen, onClose, isPaused, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handlePause = async () => {
    setLoading(true);
    try {
      // Actualizar metadata del usuario para marcar como pausado
      const { error } = await supabase.auth.updateUser({
        data: {
          account_paused: true,
          account_paused_at: new Date().toISOString(),
          account_pause_reason: reason || 'Usuario solicitó pausar cuenta',
        },
      });

      if (error) throw error;

      // Opcional: Actualizar en profile_preferences también
      await supabase
        .from('profile_preferences')
        .upsert({
          user_id: user.id,
          account_paused: true,
          account_paused_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      toast({
        title: "Cuenta pausada",
        description: "Tu cuenta ha sido pausada. Puedes reactivarla en cualquier momento desde tu perfil.",
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error pausing account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo pausar la cuenta. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      // Remover flag de pausado
      const { error } = await supabase.auth.updateUser({
        data: {
          account_paused: false,
          account_paused_at: null,
          account_pause_reason: null,
        },
      });

      if (error) throw error;

      // Actualizar en profile_preferences
      await supabase
        .from('profile_preferences')
        .upsert({
          user_id: user.id,
          account_paused: false,
          account_paused_at: null,
        }, {
          onConflict: 'user_id'
        });

      toast({
        title: "Cuenta reactivada",
        description: "Tu cuenta ha sido reactivada. Bienvenido de nuevo.",
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error resuming account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo reactivar la cuenta. Intenta de nuevo.",
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
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isPaused 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-yellow-100 dark:bg-yellow-900/20'
            }`}>
              {isPaused ? (
                <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <Pause className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                {isPaused ? 'Reactivar Cuenta' : 'Pausar Cuenta'}
              </h2>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
                {isPaused 
                  ? 'Reanuda el acceso a tu cuenta' 
                  : 'Temporalmente desactiva tu cuenta'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
          </button>
        </div>

        {isPaused ? (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-400 mb-1">
                    Tu cuenta está pausada
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-300">
                    Al reactivar, recuperarás acceso completo a todas tus funcionalidades y datos.
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
                onClick={handleResume}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reactivando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Reactivar Cuenta
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-400 mb-2">
                    ¿Qué significa pausar tu cuenta?
                  </p>
                  <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                    <li>Tus datos se mantendrán seguros</li>
                    <li>No podrás acceder a la plataforma temporalmente</li>
                    <li>Puedes reactivar en cualquier momento</li>
                    <li>No se eliminará ninguna información</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                Motivo (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Voy a estar fuera por un tiempo..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all resize-none"
                disabled={loading}
              />
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
                onClick={handlePause}
                disabled={loading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white border-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Pausando...
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar Cuenta
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PauseAccountModal;

