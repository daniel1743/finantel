import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/Icon';

const GlobalNotificationPanel = ({ isOpen, onClose, onSent }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    target_audience: 'all',
    expires_at: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expiresAt = formData.expires_at 
        ? new Date(formData.expires_at).toISOString()
        : null;

      const { error } = await supabase
        .from('global_notifications')
        .insert({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          target_audience: formData.target_audience,
          expires_at: expiresAt,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: 'Notificación enviada',
        description: 'La notificación global se ha creado exitosamente',
      });

      setFormData({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
        target_audience: 'all',
        expires_at: '',
      });

      onSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar la notificación',
      });
    } finally {
      setLoading(false);
    }
  };

  const typeIcons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2,
    error: AlertCircle,
  };

  const typeColors = {
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
              Enviar Notificación Global
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Icon component={X} size="lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                Título
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20"
                placeholder="Ej: Nueva funcionalidad disponible"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                Mensaje
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 resize-none"
                placeholder="Escribe el mensaje que verán todos los usuarios..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20"
                >
                  <option value="info">Información</option>
                  <option value="warning">Advertencia</option>
                  <option value="success">Éxito</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20"
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                Audiencia Objetivo
              </label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20"
              >
                <option value="all">Todos los usuarios</option>
                <option value="registered">Solo registrados</option>
                <option value="active">Solo activos</option>
                <option value="premium">Solo premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                Fecha de Expiración (opcional)
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/10 text-[#1a1a1a] dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#1C8FA0] text-white rounded-lg hover:bg-[#1a7a8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Icon component={AlertCircle} size="sm" className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Icon component={Send} size="sm" />
                    Enviar Notificación
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalNotificationPanel;

