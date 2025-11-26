import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Freelancer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    rating: 5,
    text: "Finantel me ordenó la vida, literal. La IA me avisa antes de que me pase gastando y me dice dónde puedo ahorrar sin matarme. Estoy fascinada.",
    location: "Santiago, Chile",
    style: "coloquial"
  },
  {
    id: 2,
    name: "Carlos Ramírez",
    role: "Emprendedor",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    rating: 5,
    text: "La privacidad es fundamental para mí. No necesito conectar mi banco y aun así mantengo control total de mis finanzas. Es ideal para mi negocio.",
    location: "Valparaíso, Chile",
    style: "profesional"
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Estudiante",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    rating: 5,
    text: "Como estudiante cada peso duele, pero Finantel me muestra clarito dónde se me va la plata y cómo ahorrar más. De pana que me salvó.",
    location: "Concepción, Chile",
    style: "coloquial"
  },
  {
    id: 4,
    name: "Roberto Silva",
    role: "Profesional",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
    rating: 5,
    text: "La simulación financiera me permitió proyectar mi ahorro futuro. Con pequeños ajustes en mis hábitos pude visualizar un ahorro significativo en pocos meses.",
    location: "La Serena, Chile",
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
            Miles de personas confían en Finantel para controlar sus finanzas
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
            Verificado por usuarios reales
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
              ))}
            </div>
            <span className="text-sm font-semibold text-[#1a1a1a] ml-2">
              4.9/5 de 1,200+ reseñas
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
