import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingDown, PiggyBank, Star, Clock } from 'lucide-react';

// ✅ MÉTRICAS ESTRATÉGICAS - Datos que importan al usuario
// NOTA: Actualizar estos valores con datos reales de la base de datos
const stats = [
  {
    id: 1,
    icon: Users,
    value: "+850",
    label: "usuarios gestionando sus finanzas activamente",
    color: "text-[#1C8FA0]",
    bgColor: "bg-[#1C8FA0]/10"
  },
  {
    id: 2,
    icon: DollarSign,
    value: "$3.2M",
    label: "en gastos rastreados y categorizados",
    color: "text-[#E47B45]",
    bgColor: "bg-[#E47B45]/10"
  },
  {
    id: 3,
    icon: TrendingDown,
    value: "94%",
    label: "de usuarios detectaron fugas de dinero",
    color: "text-[#1C8FA0]",
    bgColor: "bg-[#1C8FA0]/10"
  },
  {
    id: 4,
    icon: PiggyBank,
    value: "$420",
    label: "ahorro promedio mensual por usuario",
    color: "text-[#E47B45]",
    bgColor: "bg-[#E47B45]/10"
  },
  {
    id: 5,
    icon: Star,
    value: "4.8/5",
    label: "calificación promedio de satisfacción",
    color: "text-[#1C8FA0]",
    bgColor: "bg-[#1C8FA0]/10"
  },
  {
    id: 6,
    icon: Clock,
    value: "12min",
    label: "tiempo promedio de configuración inicial",
    color: "text-[#E47B45]",
    bgColor: "bg-[#E47B45]/10"
  }
];

const RealNumbers = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('real-numbers');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section id="real-numbers" className="py-16 md:py-20 bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Resultados reales de usuarios reales
          </h2>
          <p className="text-gray-400 text-lg">
            Datos que importan: ahorro, tiempo y satisfacción
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${stat.bgColor} mb-4`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RealNumbers;


