
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Mail,
  Smartphone,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

const NotificationItem = ({ notification, index, onMarkAsRead, onViewDetails }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className={cn(
      "flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer group",
      notification.read 
        ? "bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-white/5" 
        : "bg-[#1C8FA0]/5 border-[#1C8FA0]/20"
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
      notification.type === 'alert' ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
      notification.type === 'success' ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
      "bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 text-[#1C8FA0] dark:text-[#1C8FA0]"
    )}>
      {notification.icon ? (
        React.createElement(notification.icon, { className: "w-5 h-5" })
      ) : notification.type === 'alert' ? (
        <AlertTriangle className="w-5 h-5" />
      ) : notification.type === 'success' ? (
        <TrendingUp className="w-5 h-5" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
    </div>
    
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h4 className={cn("font-bold text-sm", notification.read ? "text-[#1a1a1a] dark:text-white" : "text-[#1C8FA0]")}>
          {notification.title}
        </h4>
        <span className="text-xs text-[#6E6E73] dark:text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
      </div>
      <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1 leading-relaxed">{notification.desc}</p>
      
      <div className="flex gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(notification);
          }}
          className="text-xs font-bold text-[#1C8FA0] hover:underline"
        >
          Ver detalles
        </button>
        {!notification.read && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="text-xs font-medium text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white"
          >
            Marcar como leída
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [preferences, setPreferences] = useState({
    email: true,
    push: true
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "¡Bienvenido a Finantel!", 
      desc: "Estamos emocionados de tenerte aquí. Comienza agregando tus primeras transacciones para tener un control completo de tus finanzas.", 
      type: "success", 
      time: "Ahora", 
      read: false,
      icon: Sparkles,
      details: {
        fullDescription: "¡Bienvenido a Finantel! Tu plataforma de gestión financiera personal. Aquí podrás:\n\n• Registrar tus ingresos y gastos de forma sencilla\n• Crear presupuestos por categoría\n• Establecer metas de ahorro\n• Analizar tus patrones de gasto\n• Recibir recomendaciones inteligentes\n\nComienza agregando tu primera transacción para ver cómo Finantel te ayuda a tomar el control de tus finanzas.",
        tips: [
          "Usa la función de voz para registrar gastos rápidamente",
          "Crea presupuestos para categorías importantes",
          "Establece metas realistas y alcanzables",
          "Revisa tus análisis semanales para identificar patrones"
        ]
      }
    },
    { 
      id: 2, 
      title: "Tus datos están seguros", 
      desc: "En Finantel nunca solicitamos datos bancarios, números de tarjeta, contraseñas ni información confidencial. Solo registramos tus movimientos financieros que tú mismo ingresas. Tu privacidad es nuestra prioridad.", 
      type: "info", 
      time: "Ahora", 
      read: false,
      icon: ShieldCheck,
      details: {
        fullDescription: "En Finantel, tu seguridad y privacidad son fundamentales. Queremos que sepas exactamente cómo protegemos tu información:\n\n🔒 Lo que NUNCA pedimos:\n• Números de tarjeta de crédito o débito\n• Datos bancarios (cuentas, claves, tokens)\n• Contraseñas de servicios externos\n• Información confidencial de terceros\n• Acceso a tus cuentas bancarias\n\n✅ Lo que SÍ hacemos:\n• Solo registramos los movimientos que TÚ ingresas manualmente\n• Tus datos están encriptados y protegidos\n• Cumplimos con estándares internacionales de seguridad\n• Nunca compartimos tu información con terceros\n• Puedes eliminar todos tus datos cuando quieras\n\nTu privacidad es nuestra prioridad absoluta.",
        tips: [
          "Solo tú tienes acceso a tus datos financieros",
          "Puedes exportar o eliminar tu información en cualquier momento",
          "Usamos encriptación de extremo a extremo",
          "Nunca vendemos ni compartimos tus datos"
        ]
      }
    },
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast({
      title: "Notificación marcada como leída",
      description: "La notificación ha sido actualizada",
    });
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    // Marcar como leída automáticamente al ver detalles
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'todos' || activeTab === 'all') return true;
    if (activeTab === 'no leídos') return !n.read;
    if (activeTab === 'alertas') return n.type === 'alert';
    if (activeTab === 'sistema') return n.type === 'info' || n.type === 'success';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Notificaciones</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Mantente al día con tu actividad financiera</p>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
          <Settings className="w-6 h-6 text-[#6E6E73] dark:text-gray-400" />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-100 dark:border-white/5 pb-1">
            {['Todos', 'No leídos', 'Alertas', 'Sistema'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all relative",
                  activeTab === tab.toLowerCase() 
                    ? "text-[#1C8FA0]" 
                    : "text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white"
                )}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1C8FA0]" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n, i) => (
                <NotificationItem 
                  key={n.id} 
                  notification={n} 
                  index={i}
                  onMarkAsRead={handleMarkAsRead}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <div className="text-center py-12 text-[#6E6E73] dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay notificaciones en esta categoría</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-4">Preferencias</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#6E6E73] dark:text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">Email</span>
                </div>
                <Switch 
                  checked={preferences.email} 
                  onCheckedChange={(val) => setPreferences(prev => ({...prev, email: val}))} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-[#6E6E73] dark:text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">Push</span>
                </div>
                <Switch 
                  checked={preferences.push} 
                  onCheckedChange={(val) => setPreferences(prev => ({...prev, push: val}))} 
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 dark:border-white/5">
              <h4 className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider mb-3">Tipos de Alerta</h4>
              <div className="space-y-2">
                {['Presupuestos', 'Metas', 'Seguridad', 'Consejos'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 group-hover:border-[#1C8FA0] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#1C8FA0]" />
                    </div>
                    <span className="text-sm text-[#6E6E73] dark:text-gray-400 group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>
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
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0">
                  <img 
                    src="/finantel-icon.svg" 
                    alt="Finantel Logo" 
                    className="w-full h-full object-contain"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(28, 143, 160, 0.3))',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">
                    {selectedNotification.title}
                  </h2>
                  <span className="text-xs text-[#6E6E73] dark:text-gray-400">
                    {selectedNotification.time}
                  </span>
                </div>
              </div>

              {/* Contenido completo */}
              <div className="space-y-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-[#1a1a1a] dark:text-white leading-relaxed whitespace-pre-line">
                    {selectedNotification.details?.fullDescription || selectedNotification.desc}
                  </p>
                </div>

                {/* Tips/Consejos */}
                {selectedNotification.details?.tips && (
                  <div className="bg-[#1C8FA0]/5 dark:bg-[#1C8FA0]/10 rounded-xl p-4 border border-[#1C8FA0]/20">
                    <h3 className="text-sm font-bold text-[#1C8FA0] dark:text-[#1C8FA0] mb-3">
                      💡 Consejos útiles:
                    </h3>
                    <ul className="space-y-2">
                      {selectedNotification.details.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-[#1a1a1a] dark:text-white flex items-start gap-2">
                          <span className="text-[#1C8FA0] mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
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
