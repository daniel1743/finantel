import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const FounderSection = () => {
  return (
    <section className="py-32 bg-white dark:bg-[#0f0f11]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-12 border border-gray-100 dark:border-white/10 shadow-sm"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white mb-4">
              Quién está detrás de Finantel
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Foto del fundador */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src="/daniel_falcon.jpg"
                alt="Daniel Falcon - Fundador de Finantel"
                className="w-48 h-48 rounded-2xl object-cover shadow-lg"
                onError={(e) => {
                  // Si la imagen no existe, mostrar placeholder
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[#1C8FA0]/20 to-[#E47B45]/20 flex items-center justify-center shadow-lg" style={{ display: 'none' }}>
                <User className="w-24 h-24 text-[#1C8FA0] opacity-50" />
              </div>
            </div>

            {/* Texto */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                  Daniel Falcón
                </h3>
                <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-6 font-medium">
                  Fundador de Finantel
                </p>
              </div>

              <div className="space-y-4 text-[#1a1a1a] dark:text-white leading-relaxed">
                <p>
                  Hola, soy Daniel Falcón, fundador de Finantel.
                </p>
                <p>
                  Construí esta plataforma porque viví en carne propia el desorden financiero y la falta de privacidad.
                </p>
                <p>
                  Finantel nace de una idea simple: ordenar tu dinero sin entregar tus claves bancarias.
                </p>
                <p>
                  Trabajo cada día para que tengas una herramienta privada, clara y humana.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FounderSection;



