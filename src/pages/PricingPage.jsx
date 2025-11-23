
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: "Free",
    price: 0,
    features: ["5 Categorías", "50 transacciones/mes", "Dashboard Básico", "Exportar a CSV", "1 Dispositivo"],
    notIncluded: ["IA Predictiva", "Soporte Prioritario", "Grupos Familiares"],
    cta: "Comenzar Gratis",
    popular: false
  },
  {
    name: "Personal",
    monthly: 12,
    annual: 102,
    features: ["Categorías Ilimitadas", "Transacciones Ilimitadas", "Alertas Inteligentes", "IA Predictiva (GPT-4)", "Exportar PDF", "3 Dispositivos"],
    notIncluded: ["Grupos Familiares"],
    cta: "Elegir Personal",
    popular: true
  },
  {
    name: "Familiar",
    monthly: 25,
    annual: 212,
    features: ["Todo en Personal", "5 Miembros de Familia", "Gastos Compartidos", "Dashboard Familiar", "7 Dispositivos", "Roles y Permisos"],
    notIncluded: [],
    cta: "Elegir Familiar",
    popular: false
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Usuarios Ilimitados", "Reportes Profesionales", "API Access", "Webhooks", "Consultor Dedicado"],
    notIncluded: [],
    cta: "Contactar Ventas",
    popular: false
  }
];

const PricingPage = () => {
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();

  const handleSelect = (plan) => {
    if (plan.price === 0) navigate('/auth');
    else navigate(`/auth?plan=${plan.name}&billing=${annual ? 'annual' : 'monthly'}`);
  };

  return (
    <div className="bg-[#F5F7F9] min-h-screen">
      <Header />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6">Elige el control total</h1>
          <p className="text-xl text-[#6E6E73] mb-8">Invierte en tu tranquilidad financiera.</p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!annual ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>Mensual</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm font-medium ${annual ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>
              Anual <span className="text-[#1C8FA0] text-xs font-bold bg-[#1C8FA0]/10 px-2 py-0.5 rounded-full">-15%</span>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative p-8 rounded-[26px] bg-white border transition-all hover:-translate-y-1 duration-300 ${plan.popular ? 'border-[#1C8FA0] shadow-xl shadow-[#1C8FA0]/10 ring-1 ring-[#1C8FA0]' : 'border-gray-100 shadow-sm'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1C8FA0] text-white text-xs font-bold px-3 py-1 rounded-full">
                  MÁS POPULAR
                </div>
              )}
              
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                {typeof plan.price === 'number' ? (
                   <>
                    <span className="text-4xl font-bold text-[#1a1a1a]">${annual && plan.annual ? Math.round(plan.annual / 12) : (plan.monthly || 0)}</span>
                    <span className="text-gray-400 text-sm">/mes</span>
                   </>
                ) : (
                  <span className="text-3xl font-bold text-[#1a1a1a]">{plan.price}</span>
                )}
              </div>
              
              {annual && plan.annual && (
                <p className="text-xs text-[#1C8FA0] mb-6 font-medium">Facturado ${plan.annual} al año</p>
              )}

              <Button 
                onClick={() => handleSelect(plan)}
                className={`w-full rounded-xl py-6 mb-8 ${plan.popular ? 'bg-[#1C8FA0] hover:bg-[#167a8a]' : 'bg-[#1a1a1a] hover:bg-black'} text-white`}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4">
                {plan.features.map(feat => (
                  <div key={feat} className="flex items-start gap-3">
                    <div className="mt-0.5 bg-green-100 rounded-full p-0.5"><Check className="w-3 h-3 text-green-600" /></div>
                    <span className="text-sm text-gray-600">{feat}</span>
                  </div>
                ))}
                {plan.notIncluded.map(feat => (
                  <div key={feat} className="flex items-start gap-3 opacity-50">
                    <div className="mt-0.5 bg-gray-100 rounded-full p-0.5"><X className="w-3 h-3 text-gray-500" /></div>
                    <span className="text-sm text-gray-500">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
