import React from 'react';
import { Mail, Smartphone, Check } from 'lucide-react';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { cn } from '@/lib/utils';

/**
 * PreferencesPanel - Panel de preferencias de notificaciones
 * Estilo profesional con toggles estilo iOS y checkboxes para tipos de alerta
 */
const PreferencesPanel = ({ 
  preferences, 
  onPreferencesChange,
  alertTypes,
  onAlertTypesChange,
  toast
}) => {
  const handleToggle = (key, value) => {
    onPreferencesChange(prev => ({ ...prev, [key]: value }));
    if (toast) {
      toast({
        title: value 
          ? `Notificaciones por ${key === 'email' ? 'email' : 'push'} activadas`
          : `Notificaciones por ${key === 'email' ? 'email' : 'push'} desactivadas`,
        description: value 
          ? `Recibirás alertas importantes ${key === 'email' ? 'en tu correo' : 'en tiempo real'}`
          : `Ya no recibirás notificaciones por ${key === 'email' ? 'email' : 'push'}`,
      });
    }
  };

  const handleAlertTypeChange = (typeKey, checked) => {
    onAlertTypesChange(prev => ({
      ...prev,
      [typeKey]: checked
    }));
    if (toast) {
      toast({
        title: checked ? "Alerta activada" : "Alerta desactivada",
        description: `${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}: ${checked ? 'Recibirás' : 'No recibirás'} este tipo de notificaciones`,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-[#0E0F11] rounded-xl sm:rounded-[22px] p-5 sm:p-6 border border-gray-100 dark:border-white/5 shadow-sm lg:sticky lg:top-6">
      <h3 className="font-bold text-lg text-[#1a1a1a] dark:text-white mb-6">Preferencias</h3>
      
      {/* Toggles Email y Push */}
      <div className="space-y-5 mb-6">
        {/* Email Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
            </div>
            <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">Email</span>
          </div>
          <div className="ml-6">
            <ToggleSwitch
              checked={preferences.email}
              onCheckedChange={(val) => handleToggle('email', val)}
            />
          </div>
        </div>
        
        {/* Push Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
            </div>
            <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">Push</span>
          </div>
          <div className="ml-6">
            <ToggleSwitch
              checked={preferences.push}
              onCheckedChange={(val) => handleToggle('push', val)}
            />
          </div>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="h-px bg-gray-100 dark:bg-white/5 mb-6" />

      {/* Tipos de Alerta */}
      <div>
        <h4 className="text-xs font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider mb-4">
          Tipos de Alerta
        </h4>
        <div className="space-y-3">
          {['Presupuestos', 'Metas', 'Seguridad', 'Consejos'].map((type) => {
            const typeKey = type.toLowerCase();
            const isChecked = alertTypes[typeKey];

            return (
              <label 
                key={type} 
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleAlertTypeChange(typeKey, e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                  isChecked
                    ? "bg-[#1C8FA0] border-[#1C8FA0]"
                    : "border-gray-300 dark:border-gray-600 group-hover:border-[#1C8FA0]"
                )}>
                  {isChecked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-[#6E6E73] dark:text-gray-400 group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors">
                  {type}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreferencesPanel;

