import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, BarChart3, Target, Brain } from 'lucide-react';

const WhyDifferent = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Predicción de flujo de caja a 30 días",
      description: "Visualiza tu situación financiera futura basada en tus patrones reales de gasto e ingreso."
    },
    {
      icon: Search,
      title: "Detección automática de suscripciones olvidadas",
      description: "Encuentra servicios que pagas pero ya no usas. Ahorra dinero cancelando lo que no necesitas."
    },
    {
      icon: BarChart3,
      title: "Análisis de hábitos de gasto",
      description: "Entiende tus patrones financieros con análisis profundos que revelan dónde y cuándo gastas más."
    },
    {
      icon: Target,
      title: "Simulación de ahorro y metas",
      description: "Proyecta diferentes escenarios y ve cómo pequeños cambios pueden impactar tu futuro financiero."
    },
    {
      icon: Brain,
      title: "IA financiera privada (sin cuentas bancarias conectadas)",
      description: "Inteligencia artificial que aprende de tus datos sin necesidad de conectar tu banco. Privacidad primero."
    }
  ];

  return (
    <section className="py-32 bg-[#F9FAFB] dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white mb-4">
            Lo que otras apps no pueden hacer
          </h2>
          <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-2xl mx-auto">
            Funcionalidades reales que marcan la diferencia
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-[24px] bg-white dark:bg-[#0f0f11] border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-[#1C8FA0]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;

