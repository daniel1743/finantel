import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Pricing = () => {
  const { toast } = useToast();

  const handlePlanClick = (plan) => {
    toast({
      title: `Seleccionaste ${plan}`,
      description: "Te redirigiremos al proceso de pago seguro.",
    });
  };

  return (
    <section className="py-32 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-[#1a1a1a] mb-4">Inversión transparente</h2>
          <p className="text-xl text-[#6E6E73]">Comienza gratis, escala cuando lo necesites.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Starter</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-[#1a1a1a]">$0</span>
              <span className="text-[#6E6E73]">/mes</span>
            </div>
            <p className="text-[#6E6E73] mb-8 text-sm">Para individuos que quieren claridad básica.</p>
            <Button onClick={() => handlePlanClick('Starter')} variant="outline" className="w-full rounded-full py-6 border-gray-200 hover:bg-gray-50 text-[#1a1a1a]">
              Comenzar Gratis
            </Button>
            <ul className="mt-8 space-y-4">
              {['Gastos ilimitados', '5 categorías', 'Exportación básica'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#6E6E73]">
                  <Check className="w-4 h-4 text-[#1C8FA0]" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan - Highlighted */}
          <div className="bg-[#1a1a1a] p-10 rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] relative transform scale-105 z-10">
            <div className="absolute top-0 right-0 bg-[#1C8FA0] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-[32px]">POPULAR</div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-bold text-white">$9</span>
              <span className="text-gray-400">/mes</span>
            </div>
            <p className="text-gray-400 mb-8 text-sm">Potencia total para tus finanzas personales.</p>
            <Button onClick={() => handlePlanClick('Pro')} className="w-full bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full py-6 shadow-lg shadow-[#1C8FA0]/25">
              Obtener Pro
            </Button>
            <ul className="mt-8 space-y-4">
              {['Todo en Starter', 'Categorías ilimitadas', 'IA Predictiva', 'Sincronización multi-dispositivo', 'Soporte prioritario'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-[#1C8FA0]" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Business Plan */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Family</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-[#1a1a1a]">$19</span>
              <span className="text-[#6E6E73]">/mes</span>
            </div>
            <p className="text-[#6E6E73] mb-8 text-sm">Gestión colaborativa para el hogar.</p>
            <Button onClick={() => handlePlanClick('Family')} variant="outline" className="w-full rounded-full py-6 border-gray-200 hover:bg-gray-50 text-[#1a1a1a]">
              Contactar Ventas
            </Button>
            <ul className="mt-8 space-y-4">
              {['Todo en Pro', 'Hasta 5 miembros', 'Presupuestos compartidos', 'Roles y permisos', 'Asesor financiero IA'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#6E6E73]">
                  <Check className="w-4 h-4 text-[#1C8FA0]" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;