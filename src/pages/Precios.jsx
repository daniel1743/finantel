import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Precios = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "$0",
      description: "Para empezar a ordenar tus finanzas.",
      features: [
        "Gastos ilimitados",
        "Categorías básicas",
        "Exportación simple"
      ],
      cta: "Comenzar Gratis",
      highlight: false
    },
    {
      name: "Pro",
      price: "$9",
      description: "Para quienes quieren análisis más profundos.",
      features: [
        "IA Predictiva",
        "Categorías ilimitadas",
        "Escenarios inteligentes",
        "Sincronización multidispositivo",
        "Soporte prioritario"
      ],
      cta: "Obtener Pro",
      highlight: true
    },
    {
      name: "Family",
      price: "$19",
      description: "Para familias que quieren gestionar gastos juntos.",
      features: [
        "Hasta 5 miembros",
        "Presupuestos compartidos",
        "Roles y permisos",
        "Asesor financiero IA"
      ],
      cta: "Contactar Ventas",
      highlight: false
    }
  ];

  return (
    <>
      <SeoHead
        title="Precios - Finantel"
        description="Planes simples y transparentes para individuos, profesionales y familias. Comienza gratis y escala cuando lo necesites."
      />
      <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] dark:text-white mb-6">
              Planes simples y transparentes
            </h1>
            <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Empieza gratis y escala cuando lo necesites.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`p-8 rounded-[32px] border-2 ${
                  plan.highlight
                    ? 'bg-[#1a1a1a] dark:bg-[#0f0f11] border-[#1C8FA0] shadow-xl'
                    : 'bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-white/10'
                } hover:shadow-lg transition-all duration-300`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-[#1a1a1a] dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`text-5xl font-bold ${plan.highlight ? 'text-white' : 'text-[#1a1a1a] dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.highlight ? 'text-gray-400' : 'text-[#6E6E73] dark:text-gray-400'}`}>
                    /mes
                  </span>
                </div>
                <p className={`mb-8 ${plan.highlight ? 'text-gray-400' : 'text-[#6E6E73] dark:text-gray-400'}`}>
                  {plan.description}
                </p>
                <Button
                  onClick={() => navigate('/auth')}
                  className={`w-full rounded-full py-6 mb-8 ${
                    plan.highlight
                      ? 'bg-[#1C8FA0] hover:bg-[#167a8a] text-white'
                      : 'bg-[#1a1a1a] dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-[#1a1a1a]'
                  }`}
                >
                  {plan.cta}
                </Button>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${plan.highlight ? 'text-[#1C8FA0]' : 'text-[#1C8FA0]'}`} />
                      <span className={plan.highlight ? 'text-gray-300' : 'text-[#6E6E73] dark:text-gray-400'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Precios;

