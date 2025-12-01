import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, EyeOff, Server, Ban } from 'lucide-react';

const PrivacyFirst = () => {
  const points = [
    {
      icon: Ban,
      title: "No conectamos bancos",
      description: "No necesitas vincular tu cuenta bancaria. Registra tus transacciones manualmente o con voz."
    },
    {
      icon: Lock,
      title: "No pedimos claves bancarias",
      description: "Nunca solicitamos ni almacenamos credenciales bancarias. Tu información financiera permanece privada."
    },
    {
      icon: Shield,
      title: "Todo se almacena con cifrado",
      description: "Todos tus datos están cifrados en tránsito y en reposo. Seguridad de grado bancario."
    },
    {
      icon: EyeOff,
      title: "No vendemos datos",
      description: "Tu información es tuya. No compartimos ni vendemos datos a terceros. Nunca."
    },
    {
      icon: Server,
      title: "IA local y segura",
      description: "El procesamiento de IA se realiza de forma segura sin exponer tus datos financieros."
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-[#0f0f11]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white mb-4">
            Tu privacidad primero
          </h2>
          <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-2xl mx-auto">
            Comprometidos con proteger tus datos financieros
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-[24px] bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
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
    </section>
  );
};

export default PrivacyFirst;


