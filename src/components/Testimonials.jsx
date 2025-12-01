import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Diseñadora freelance",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    rating: 5,
    text: "Llevo 3 meses usando Finantel y finalmente entiendo en qué se me va la plata. La parte de privacidad me encanta, no tengo que conectar mi banco.",
    location: "Santiago, Chile",
    style: "coloquial"
  },
  {
    id: 2,
    name: "Carlos Ramírez",
    role: "Desarrollador independiente",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    rating: 5,
    text: "Como trabajo con varios clientes, necesito ver mi flujo de caja. Finantel me ayuda a proyectar mis ingresos y gastos sin complicaciones.",
    location: "Ciudad de México, México",
    style: "profesional"
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Estudiante universitaria",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    rating: 5,
    text: "Me encontré varias suscripciones que ya no usaba gracias a Finantel. Ahorré como $30 al mes solo cancelando lo que no necesitaba.",
    location: "Bogotá, Colombia",
    style: "coloquial"
  },
  {
    id: 4,
    name: "Roberto Silva",
    role: "Consultor",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
    rating: 5,
    text: "La simulación de escenarios me ayudó a ver cómo pequeños cambios pueden mejorar mi situación financiera. Muy útil para planificar.",
    location: "Madrid, España",
    style: "profesional"
  }
];

const Testimonials = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="w-8 h-8 text-[#1C8FA0]" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-[#1a1a1a] mb-6 leading-relaxed text-sm">
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border-2 border-[#1C8FA0]/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a1a1a] text-sm truncate">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[#6E6E73] truncate">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-[#6E6E73] truncate">
                    {testimonial.location}
                  </p>
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
