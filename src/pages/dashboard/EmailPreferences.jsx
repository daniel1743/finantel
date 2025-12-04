
import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Mail, BellRing, Tag, Calendar } from 'lucide-react';

const EmailPreferences = () => {
  const [prefs, setPrefs] = useState({
    weeklyDigest: true,
    productUpdates: true,
    marketingOffers: false,
    securityAlerts: true
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Preferencias de Email</h1>
        <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Gestiona qué correos recibes de Finantel</p>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-8">
        
        {/* Weekly Digest */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icon component={Calendar} size="md" color="default" />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a1a] dark:text-white">Resumen Semanal</h3>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1 max-w-md">
                Un análisis completo de tus gastos, ahorros y progreso de metas enviado cada lunes por la mañana.
              </p>
            </div>
          </div>
          <Switch 
            checked={prefs.weeklyDigest} 
            onCheckedChange={(v) => setPrefs(p => ({...p, weeklyDigest: v}))} 
          />
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/5" />

        {/* Product Updates */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Icon component={Tag} size="md" color="default" />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a1a] dark:text-white">Nuevas Funcionalidades</h3>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1 max-w-md">
                Sé el primero en enterarte sobre nuevas herramientas de IA y actualizaciones de la plataforma.
              </p>
            </div>
          </div>
          <Switch 
            checked={prefs.productUpdates} 
            onCheckedChange={(v) => setPrefs(p => ({...p, productUpdates: v}))} 
          />
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/5" />

        {/* Marketing */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Icon component={Mail} size="md" color="default" />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a1a] dark:text-white">Ofertas y Promociones</h3>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1 max-w-md">
                Descuentos exclusivos para planes premium y ofertas de nuestros socios financieros.
              </p>
            </div>
          </div>
          <Switch 
            checked={prefs.marketingOffers} 
            onCheckedChange={(v) => setPrefs(p => ({...p, marketingOffers: v}))} 
          />
        </div>

      </div>

      <div className="flex justify-end gap-4">
        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
          Desuscribirse de todo
        </Button>
        <Button className="bg-[#1a1a1a] dark:bg-white text-white dark:text-black px-8">
          Guardar Preferencias
        </Button>
      </div>
    </div>
  );
};

export default EmailPreferences;
