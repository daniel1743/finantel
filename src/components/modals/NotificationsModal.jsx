import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Mail, Smartphone, CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const NotificationsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    budget_alerts: true,
    goal_reminders: true,
    weekly_summary: true,
    monthly_report: true,
  });

  useEffect(() => {
    if (isOpen && user?.id) {
      loadPreferences();
    }
  }, [isOpen, user?.id]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          budget_alerts: data.budget_alerts ?? true,
          goal_reminders: data.goal_reminders ?? true,
          weekly_summary: data.weekly_summary ?? true,
          monthly_report: data.monthly_report ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las preferencias",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profile_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "¡Guardado!",
        description: "Tus preferencias de notificaciones han sido actualizadas",
      });

      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar las preferencias",
      });
    } finally {
      setSaving(false);
    }
  };

  const notificationOptions = [
    {
      key: 'email_notifications',
      label: 'Notificaciones por Email',
      description: 'Recibe alertas importantes por correo electrónico',
      icon: Mail,
    },
    {
      key: 'push_notifications',
      label: 'Notificaciones Push',
      description: 'Recibe notificaciones en tiempo real en tu dispositivo',
      icon: Smartphone,
    },
    {
      key: 'budget_alerts',
      label: 'Alertas de Presupuesto',
      description: 'Te avisamos cuando te acerques o excedas tus presupuestos',
      icon: Bell,
    },
    {
      key: 'goal_reminders',
      label: 'Recordatorios de Metas',
      description: 'Notificaciones sobre el progreso de tus metas de ahorro',
      icon: CheckCircle2,
    },
    {
      key: 'weekly_summary',
      label: 'Resumen Semanal',
      description: 'Recibe un resumen de tus finanzas cada lunes',
      icon: Bell,
    },
    {
      key: 'monthly_report',
      label: 'Reporte Mensual',
      description: 'Análisis completo de tus finanzas al final de cada mes',
      icon: Bell,
    },
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
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Notificaciones</h2>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
              Configura cómo y cuándo recibir alertas
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C8FA0]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {notificationOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#1C8FA0]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">
                        {option.label}
                      </p>
                      <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[option.key]}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, [option.key]: checked }))
                    }
                    disabled={saving}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={saving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationsModal;

