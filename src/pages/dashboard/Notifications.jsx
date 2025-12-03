import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCard from '@/components/notifications/NotificationCard';
import PreferencesPanel from '@/components/notifications/PreferencesPanel';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('todos');
  const [preferences, setPreferences] = useState({
    email: true,
    push: true
  });
  const [alertTypes, setAlertTypes] = useState({
    presupuestos: true,
    metas: true,
    seguridad: true,
    consejos: true
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Usar el hook de notificaciones
  const { notifications, loading, markAsRead } = useNotifications();

  // Cargar preferencias desde localStorage al montar
  useEffect(() => {
    const savedPreferences = localStorage.getItem('finantel_notification_preferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }

    const savedAlertTypes = localStorage.getItem('finantel_alert_types');
    if (savedAlertTypes) {
      try {
        setAlertTypes(JSON.parse(savedAlertTypes));
      } catch (error) {
        console.error('Error loading alert types:', error);
      }
    }
  }, []);

  // Guardar preferencias en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('finantel_notification_preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Guardar tipos de alerta en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('finantel_alert_types', JSON.stringify(alertTypes));
  }, [alertTypes]);

  const handleMarkAsRead = async (id) => {
    const success = await markAsRead(id);
    if (success) {
      toast({
        title: "Notificación marcada como leída",
        description: "La notificación ha sido actualizada",
      });
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    // Marcar como leída automáticamente al ver detalles
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeTab === 'todos') return true;
      if (activeTab === 'no leídos') return !n.is_read;
      if (activeTab === 'alertas') return n.type === 'critical' || n.type === 'warning';
      if (activeTab === 'sistema') return n.type === 'info' || n.type === 'opportunity' || n.type === 'trend';
      return true;
    });
  }, [notifications, activeTab]);

  return (
    <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0E0F11]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight'] mb-2">
              Notificaciones
            </h1>
            <p className="text-base sm:text-lg text-[#6E6E73] dark:text-gray-400">
              Mantente al día con tu actividad financiera
            </p>
          </div>
          <button
            onClick={() => {
              const prefsSection = document.getElementById('preferences-section');
              if (prefsSection) {
                prefsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="p-2 hover:bg-white/5 dark:hover:bg-white/5 rounded-xl transition-colors flex-shrink-0 self-start sm:self-auto"
            title="Ir a preferencias"
          >
            <Settings className="w-6 h-6 text-[#6E6E73] dark:text-gray-400" />
          </button>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Columna izquierda: Notificaciones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs horizontales */}
            <div 
              className="flex gap-2 overflow-x-auto pb-3 border-b border-gray-100 dark:border-white/5 -mx-4 sm:mx-0 px-4 sm:px-0"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {['Todos', 'No leídos', 'Alertas', 'Sistema'].map((tab) => {
                const tabKey = tab.toLowerCase();
                const isActive = activeTab === tabKey;
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tabKey)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-semibold rounded-lg transition-all relative whitespace-nowrap flex-shrink-0",
                      isActive
                        ? "text-[#1C8FA0] dark:text-[#1C8FA0] bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/10"
                        : "text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    {tab}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1C8FA0] dark:bg-[#1C8FA0]"
                        style={{ bottom: '-3px' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lista de notificaciones */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16 text-[#6E6E73] dark:text-gray-400">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
                  <p className="text-lg">Cargando notificaciones...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((n, i) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    index={i}
                    onMarkAsRead={handleMarkAsRead}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <div className="text-center py-16 text-[#6E6E73] dark:text-gray-400">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay notificaciones en esta categoría</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Preferencias */}
          <div className="lg:col-span-1" id="preferences-section">
            <PreferencesPanel
              preferences={preferences}
              onPreferencesChange={setPreferences}
              alertTypes={alertTypes}
              onAlertTypesChange={setAlertTypes}
              toast={toast}
            />
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      <AnimatePresence>
        {isDetailModalOpen && selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDetailModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-white/10 shadow-2xl relative"
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6 pr-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] flex items-center justify-center shrink-0 shadow-lg shadow-[#1C8FA0]/30">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
                    {selectedNotification.title}
                  </h2>
                  <span className="text-xs text-[#6E6E73] dark:text-gray-400">
                    {selectedNotification.created_at 
                      ? new Date(selectedNotification.created_at).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Ahora'}
                  </span>
                </div>
              </div>

              {/* Contenido completo */}
              <div className="space-y-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-[#1a1a1a] dark:text-white leading-relaxed whitespace-pre-line">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Recomendación */}
                {selectedNotification.recommendation && (
                  <div className="bg-[#1C8FA0]/5 dark:bg-[#1C8FA0]/10 rounded-xl p-4 border border-[#1C8FA0]/20">
                    <h3 className="text-sm font-bold text-[#1C8FA0] dark:text-[#1C8FA0] mb-3">
                      💡 Recomendación:
                    </h3>
                    <p className="text-sm text-[#1a1a1a] dark:text-white">
                      {selectedNotification.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2.5 bg-[#1C8FA0] text-white rounded-xl font-medium hover:bg-[#167a8a] transition-colors"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
