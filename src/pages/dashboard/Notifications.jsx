
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Mail,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const NotificationItem = ({ notification, index }) => (
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
      notification.type === 'alert' ? "bg-red-100 text-red-600" :
      notification.type === 'success' ? "bg-green-100 text-green-600" :
      "bg-[#1C8FA0]/10 text-[#1C8FA0]"
    )}>
      {notification.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
       notification.type === 'success' ? <TrendingUp className="w-5 h-5" /> :
       <Bell className="w-5 h-5" />}
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
        <button className="text-xs font-bold text-[#1C8FA0] hover:underline">Ver detalles</button>
        <button className="text-xs font-medium text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white">Marcar como leída</button>
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
  
  const notifications = [
    { id: 1, title: "Presupuesto Excedido", desc: "Has superado el 90% de tu presupuesto en 'Ocio' este mes.", type: "alert", time: "Hace 2h", read: false },
    { id: 2, title: "Meta Alcanzada", desc: "¡Felicidades! Completaste tu meta 'Fondo de Emergencia'.", type: "success", time: "Hace 5h", read: false },
    { id: 3, title: "Nuevo Gasto Compartido", desc: "Diego agregó 'Cena Pizza' ($45.00) al grupo.", type: "info", time: "Ayer", read: true },
    { id: 4, title: "Resumen Semanal", desc: "Tus gastos bajaron un 12% esta semana comparado con la anterior.", type: "info", time: "Ayer", read: true },
  ];

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
            {notifications.map((n, i) => (
              <NotificationItem key={n.id} notification={n} index={i} />
            ))}
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
    </div>
  );
};

export default Notifications;
