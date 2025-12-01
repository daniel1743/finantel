import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Check, Rocket } from 'lucide-react';

const Roadmap = () => {
  const completed = [
    "IA Predictiva",
    "Registro rápido",
    "Categorías ilimitadas",
    "Escenarios de ahorro",
    "Exportaciones"
  ];

  const upcoming = [
    "Integración de metas automáticas",
    "Chat financiero IA",
    "Recomendaciones avanzadas",
    "Monitoreo familiar inteligente"
  ];

  return (
    <>
      <SeoHead
        title="Roadmap - Finantel"
        description="Mira lo que viene para Finantel: nuevo módulo de IA, predicciones avanzadas, presupuesto automático, bot familiar inteligente y exportaciones premium."
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
              Nuestro camino hacia el futuro
            </h1>
            <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Estamos construyendo la mejor plataforma financiera hispana.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Lo que ya está listo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">
                Lo que ya está listo
              </h2>
              <ul className="space-y-4">
                {completed.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Lo que viene */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">
                Lo que viene
              </h2>
              <ul className="space-y-4">
                {upcoming.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-4 h-4 text-[#1C8FA0]" />
                    </div>
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Roadmap;

