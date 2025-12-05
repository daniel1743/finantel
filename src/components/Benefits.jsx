import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Brain, Globe, FileText, Zap } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Controla tus gastos sin conectar tu banco.",
      description: "Registra tus transacciones manualmente o con voz. Sin necesidad de compartir credenciales bancarias."
    },
    {
      icon: Lock,
      title: "Privacidad absoluta — tus claves no se comparten con nadie.",
      description: "Tus datos financieros permanecen privados. No conectamos con bancos ni almacenamos credenciales."
    },
    {
      icon: Brain,
      title: "IA que te muestra dónde se va tu plata.",
      description: "Análisis inteligente que detecta patrones, fugas de dinero y oportunidades de ahorro."
    },
    {
      icon: Globe,
      title: "Compatible con CLP, MXN, ARS, COP, EUR y más.",
      description: "Funciona con cualquier moneda. Ideal para usuarios de Chile, Latinoamérica y España."
    },
    {
      icon: FileText,
      title: "Análisis claros, sin tecnicismos.",
      description: "Reportes y visualizaciones simples que cualquiera puede entender. Sin jerga financiera."
    },
    {
      icon: Zap,
      title: "Rápido, simple y sin humo.",
      description: "Interfaz limpia y rápida. Sin complicaciones innecesarias. Hecho para personas reales."
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-[#0f0f11]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Beneficios reales
          </h2>
          <p className="text-xl text-neutral-500 dark:text-gray-400 max-w-2xl mx-auto">
            Lo que realmente importa cuando gestionas tu dinero
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-card-lg bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-card-sm bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-neutral-500 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;


