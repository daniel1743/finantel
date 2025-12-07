import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Star, Quote, Check } from 'lucide-react';

// ✅ TESTIMONIOS REALES DE USUARIOS
const testimonials = [
  {
    id: 1,
    name: "Daniel Gomez",
    image: "/daniel.jpeg",
    verified: true,
    rating: 5,
    text: "Una aplicación que me funciona como anillo al dedo. Si voy rápido solo dicto y esto, luego si me dan ganas lo edito, sino el gasto queda allí registrado igual. Gracias Finantel."
  },
  {
    id: 2,
    name: "Givonik Marrero",
    image: "/givonik.jpeg",
    verified: true,
    rating: 5,
    text: "He revisado muchas aplicaciones y app de finanzas, esta es la mejor en todo: proyecciones, simulaciones y no te piden cuentas bancarias ni nada. ¿Qué más se puede pedir? Y el modo gratis es suficiente para llevar mis datos. Los otros déjalos."
  },
  {
    id: 3,
    name: "Juan Peralta",
    image: "/ejemplo1.jpeg",
    verified: true,
    rating: 5,
    text: "Finantel ha transformado la forma en que gestiono mis finanzas personales. La facilidad de uso y las proyecciones precisas me han ayudado a tomar mejores decisiones financieras."
  },
  {
    id: 4,
    name: "Elizabeth Vazquez K.",
    image: "/ejemplo2.jpeg",
    verified: true,
    rating: 5,
    text: "La mejor herramienta financiera que he usado. Sin complicaciones, sin pedir datos bancarios, solo registras tus gastos y obtienes insights valiosos. Totalmente recomendada."
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-xl text-[#6E6E73] max-w-2xl mx-auto">
            Personas reales compartiendo su experiencia con Finantel
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-4 md:p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full overflow-hidden min-w-0"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10">
                <Icon component={Quote} size="xl" color="primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 flex-shrink-0">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFD700] text-[#FFD700] flex-shrink-0" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-[#1a1a1a] mb-6 leading-relaxed text-sm flex-grow break-words min-h-0" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                "{testimonial.text}"
              </p>

              {/* User Info - Siempre en la misma posición vertical */}
              <div className="pt-4 border-t border-gray-100 mt-auto flex-shrink-0">
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#1C8FA0]/20 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-semibold text-[#1a1a1a] text-sm truncate min-w-0">
                        {testimonial.name}
                      </p>
                      {testimonial.verified && (
                        <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-2.5 h-2.5"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-[#6E6E73] mb-2">
            Testimonios de usuarios reales
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
