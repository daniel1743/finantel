import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { BookOpen, TrendingUp, Brain, Users, FileText } from 'lucide-react';

const Blog = () => {
  const categories = [
    {
      icon: TrendingUp,
      title: "Guías de ahorro",
      description: "Estrategias prácticas para ahorrar más sin sacrificar tu estilo de vida."
    },
    {
      icon: FileText,
      title: "Control de gastos",
      description: "Técnicas y herramientas para mantener tus gastos bajo control."
    },
    {
      icon: Brain,
      title: "Psicología financiera",
      description: "Entiende cómo tus emociones afectan tus decisiones de dinero."
    },
    {
      icon: BookOpen,
      title: "IA aplicada al dinero",
      description: "Cómo la inteligencia artificial puede ayudarte a tomar mejores decisiones financieras."
    },
    {
      icon: Users,
      title: "Historias de usuarios",
      description: "Casos reales de personas que mejoraron sus finanzas con Finantel."
    }
  ];

  return (
    <>
      <SeoHead
        title="Blog - Finantel"
        description="Consejos reales para personas reales. Guías de ahorro, control de gastos, psicología financiera, IA aplicada al dinero e historias de usuarios."
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
              Blog de Finantel
            </h1>
            <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Consejos reales para personas reales.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
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
                    {category.title}
                  </h3>
                  <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                    {category.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-[#6E6E73] dark:text-gray-400">
              Próximamente publicaremos artículos en estas categorías.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Blog;

