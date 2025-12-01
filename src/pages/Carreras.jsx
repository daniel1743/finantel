import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Users, Heart, Zap } from 'lucide-react';

const Carreras = () => {
  return (
    <>
      <SeoHead
        title="Carreras - Finantel"
        description="¿Quieres trabajar en Finantel? Descubre posiciones abiertas, cómo aplicar y qué buscamos en personas que se unan al proyecto."
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
              Únete a Finantel
            </h1>
            <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Estamos formando un equipo pequeño, ágil y humano.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-12 border border-gray-100 dark:border-white/10 mb-12"
          >
            <p className="text-lg text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-8">
              Buscamos personas:
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-[#1C8FA0]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">
                    Con pasión por las finanzas
                  </h3>
                  <p className="text-[#6E6E73] dark:text-gray-400">
                    Que entiendan el problema que estamos resolviendo y quieran ayudar a otros a tener claridad financiera.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#1C8FA0]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">
                    Obsesionadas por la experiencia del usuario
                  </h3>
                  <p className="text-[#6E6E73] dark:text-gray-400">
                    Que se preocupen por cada detalle y construyan interfaces que realmente ayuden a las personas.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-[#1C8FA0]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">
                    Capaces de construir tecnología que ayude a otros
                  </h3>
                  <p className="text-[#6E6E73] dark:text-gray-400">
                    Que tengan habilidades técnicas sólidas y quieran usarlas para crear herramientas que marquen la diferencia.
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 rounded-[24px] p-8 border border-[#1C8FA0]/20 text-center"
          >
            <p className="text-lg font-semibold text-[#1a1a1a] dark:text-white">
              Pronto abriremos posiciones.
            </p>
            <p className="text-[#6E6E73] dark:text-gray-400 mt-2">
              Si te interesa, escríbenos a <a href="mailto:careers@finantel.net" className="text-[#1C8FA0] hover:underline">careers@finantel.net</a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Carreras;


