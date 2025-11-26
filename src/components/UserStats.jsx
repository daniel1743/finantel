import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Globe, Award } from 'lucide-react';

const stats = [
  {
    id: 1,
    icon: Users,
    value: "10,000+",
    label: "Usuarios Activos",
    color: "text-[#1C8FA0]",
    bgColor: "bg-[#1C8FA0]/10"
  },
  {
    id: 2,
    icon: TrendingUp,
    value: "$2.5M+",
    label: "Ahorrado por Usuarios",
    color: "text-[#E47B45]",
    bgColor: "bg-[#E47B45]/10"
  },
  {
    id: 3,
    icon: Globe,
    value: "15+",
    label: "Países",
    color: "text-[#1C8FA0]",
    bgColor: "bg-[#1C8FA0]/10"
  },
  {
    id: 4,
    icon: Award,
    value: "4.9/5",
    label: "Calificación Promedio",
    color: "text-[#E47B45]",
    bgColor: "bg-[#E47B45]/10"
  }
];

const UserStats = () => {
  const [counters, setCounters] = useState(stats.map(() => 0));
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

    const element = document.getElementById('user-stats');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const intervals = stats.map((stat, index) => {
      const target = stat.value.replace(/[^0-9.]/g, '');
      const numericTarget = parseFloat(target) || 0;
      const duration = 2000; // 2 segundos
      const steps = 60;
      const increment = numericTarget / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= numericTarget) {
          current = numericTarget;
          clearInterval(interval);
        }

        setCounters((prev) => {
          const newCounters = [...prev];
          newCounters[index] = current;
          return newCounters;
        });
      }, duration / steps);

      return interval;
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [isVisible]);

  const formatValue = (value, original) => {
    if (original.includes('+')) {
      return Math.floor(value).toLocaleString() + '+';
    }
    if (original.includes('/')) {
      return value.toFixed(1) + '/5';
    }
    if (original.includes('$')) {
      return '$' + (value / 1000).toFixed(1) + 'M+';
    }
    return Math.floor(value).toLocaleString();
  };

  return (
    <section id="user-stats" className="py-20 bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Finantel en números
          </h2>
          <p className="text-gray-400 text-lg">
            Únete a miles de usuarios que ya están tomando control de sus finanzas
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = isVisible
              ? formatValue(counters[index], stat.value)
              : '0';

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
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold mb-2"
                >
                  {displayValue}
                </motion.div>
                <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserStats;
