import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Target, Eye } from 'lucide-react';

const SobreNosotros = () => {
  return (
    <>
      <SeoHead
        title="Sobre Nosotros - Finantel"
        description="Conoce la historia de Finantel y por qué nació esta plataforma. Aprende quién es el fundador, la visión del proyecto y nuestro compromiso con las finanzas privadas."
      />
      <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] dark:text-white mb-6">
              Conoce al fundador
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-12 border border-gray-100 dark:border-white/10 mb-12"
          >
            <div className="space-y-6 text-[#1a1a1a] dark:text-white leading-relaxed text-lg">
              <p>
                Hola, soy <strong className="text-[#1C8FA0]">Daniel Falcón</strong>, fundador de Finantel.
              </p>
              <p>
                Creé esta plataforma porque viví lo mismo que tú: confusión financiera, falta de claridad y miedo a entregar claves bancarias.
              </p>
              <p>
                Finantel nace para resolver eso: <strong>orden, privacidad y claridad</strong>.
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-[#1C8FA0]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                Nuestra misión
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Hacer que cualquier persona hispana pueda entender su dinero sin miedo, sin bancos conectados y sin complicaciones.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-[#1C8FA0]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                Nuestra visión
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Ser la herramienta de finanzas personales número 1 del mundo hispanohablante.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SobreNosotros;


