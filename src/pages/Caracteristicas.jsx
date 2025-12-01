import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Zap, BrainCircuit, Layers, Users2, Target, TrendingUp } from 'lucide-react';

const Caracteristicas = () => {
  const features = [
    {
      icon: Zap,
      title: "Registro en 3 segundos",
      description: "Agrega gastos al instante con atajos inteligentes."
    },
    {
      icon: BrainCircuit,
      title: "IA Predictiva",
      description: "Identifica patrones de consumo, anticipa facturas y proyecta tu flujo de caja."
    },
    {
      icon: Layers,
      title: "Categorías Ilimitadas",
      description: "Etiqueta, organiza y analiza tu vida financiera de la forma que tú quieras."
    },
    {
      icon: Users2,
      title: "Modo Colaborativo Familiar",
      description: "Presupuestos compartidos con roles y permisos."
    },
    {
      icon: Target,
      title: "Escenarios Inteligentes",
      description: "Simula cuánto puedes ahorrar cambiando pequeños hábitos."
    },
    {
      icon: TrendingUp,
      title: "Análisis Profundo",
      description: "Detecta fugas de dinero, suscripciones olvidadas y oportunidades de ahorro."
    }
  ];

  return (
    <>
      <SeoHead
        title="Características - Finantel"
        description="Descubre todas las herramientas que hacen a Finantel único: registro rápido, categorías ilimitadas, IA predictiva, escenarios de ahorro, alertas inteligentes y sincronización multidispositivo."
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
              Finantel: claridad financiera real
            </h1>
            <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Finantel te ayuda a organizar tus gastos, detectar fugas de dinero y proyectar tu futuro financiero con herramientas profesionales, simples y privadas.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
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
      </div>
    </>
  );
};

export default Caracteristicas;


