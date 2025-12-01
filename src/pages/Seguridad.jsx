import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Shield, Lock, EyeOff, Server, Ban, Trash2 } from 'lucide-react';

const Seguridad = () => {
  const securityPoints = [
    {
      icon: Ban,
      title: "Sin conectar bancos",
      description: "No pedimos claves bancarias. No accedemos a tus cuentas. No movemos tu dinero."
    },
    {
      icon: Lock,
      title: "Cifrado extremo",
      description: "Todos tus datos viajan y se almacenan cifrados."
    },
    {
      icon: EyeOff,
      title: "Arquitectura cero accesos",
      description: "Ni el fundador puede ver tus datos. Sistema basado en privacidad total."
    },
    {
      icon: Trash2,
      title: "Control por parte del usuario",
      description: "Puedes borrar tu cuenta y tus datos en cualquier momento."
    }
  ];

  return (
    <>
      <SeoHead
        title="Seguridad y Privacidad - Finantel"
        description="Tu privacidad es nuestra prioridad. Finantel funciona sin conectar tu banco, sin pedir claves y sin acceder a tus fondos. Aprende cómo protegemos tus datos."
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
              Seguridad y privacidad antes que todo
            </h1>
            <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Finantel fue diseñado con un principio: <strong className="text-[#1a1a1a] dark:text-white">tu dinero y tu privacidad no se negocian</strong>.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {securityPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-[#1C8FA0]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-3">
                    {point.title}
                  </h3>
                  <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                    {point.description}
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

export default Seguridad;

