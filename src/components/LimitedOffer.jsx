import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LimitedOffer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

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

    const element = document.getElementById('limited-offer');
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

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Resetear cuando llegue a 0 (o mantener en 0)
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleCTAClick = () => {
    navigate('/auth?offer=50off');
  };

  return (
    <section id="limited-offer" className="py-20 bg-gradient-to-br from-[#1C8FA0]/10 via-[#E47B45]/5 to-[#1C8FA0]/10 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1C8FA0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E47B45]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 md:p-12 shadow-2xl border-2 border-[#1C8FA0]/20 relative overflow-hidden"
        >
          {/* Sparkle Effect */}
          <div className="absolute top-4 right-4">
            <Icon component={Sparkles} size="xl" color="primary" className="animate-pulse" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C8FA0]/10 text-[#1C8FA0] text-sm font-bold mb-4">
                <Icon component={Sparkles} size="sm" color="default" />
                OFERTA LIMITADA
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                50% OFF en los primeros 3 meses
              </h2>

              <p className="text-lg text-[#6E6E73] dark:text-gray-400 mb-6 leading-relaxed">
                Únete ahora y obtén acceso completo a todas las funciones premium con un descuento exclusivo. Solo para los primeros 100 usuarios.
              </p>

              <ul className="space-y-2 mb-8">
                {[
                  'Acceso a todas las funciones premium',
                  'IA Predictiva ilimitada',
                  'Soporte prioritario',
                  'Sin compromiso, cancela cuando quieras'
                ].map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-2 text-[#1a1a1a] dark:text-white"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#1C8FA0]" />
                    </div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <Button
                onClick={handleCTAClick}
                className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full px-8 py-6 text-lg font-medium shadow-xl shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-1"
              >
                Aprovechar Oferta
                <Icon component={ArrowRight} size="md" color="default" className="ml-2" />
              </Button>

              <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-4">
                * Oferta válida solo para nuevos usuarios. Se aplica automáticamente al registrarte.
              </p>
            </div>

            {/* Right: Timer */}
            <div className="flex flex-col items-center justify-center">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-[#6E6E73] dark:text-gray-400 mb-4">
                  <Icon component={Clock} size="md" color="default" />
                  <span className="text-sm font-medium">La oferta termina en:</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Horas', value: timeLeft.hours },
                    { label: 'Minutos', value: timeLeft.minutes },
                    { label: 'Segundos', value: timeLeft.seconds }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                          {String(item.value).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-white/80 uppercase tracking-wider">
                          {item.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-2">
                  Solo quedan
                </p>
                <p className="text-2xl font-bold text-[#1C8FA0]">
                  47 cupos disponibles
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LimitedOffer;
