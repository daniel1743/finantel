
import React from 'react';
import { motion } from 'framer-motion';

const UniqueValue = () => {
  return (
    <section className="py-32 bg-[#F9FAFB] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative">
              {/* Glassmorphism Card */}
              <div className="bg-white/60 backdrop-blur-2xl rounded-[40px] p-8 border border-white shadow-[0_40px_80px_-12px_rgba(0,0,0,0.12)] relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="text-xs font-medium text-[#6E6E73] uppercase tracking-wider">Análisis Mensual</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-[#6E6E73] mb-1">Ahorro</p>
                    <p className="text-xl font-bold text-[#1C8FA0]">+24%</p>
                    <div className="w-full bg-gray-100 h-1 mt-2 rounded-full overflow-hidden">
                      <div className="w-[75%] h-full bg-[#1C8FA0]" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-[#6E6E73] mb-1">Gastos</p>
                    <p className="text-xl font-bold text-[#E47B45]">-12%</p>
                    <div className="w-full bg-gray-100 h-1 mt-2 rounded-full overflow-hidden">
                      <div className="w-[45%] h-full bg-[#E47B45]" />
                    </div>
                  </div>
                </div>

                <div className="h-32 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 flex items-end justify-around p-4">
                   {[30, 50, 45, 70, 60, 80, 55].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="w-3 bg-[#1a1a1a] rounded-t-full opacity-10"
                      />
                    ))}
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#E47B45]/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#1C8FA0]/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1a1a1a] leading-tight">
              Lo que otras apps <br/>
              <span className="text-[#6E6E73]">no pueden hacer.</span>
            </h2>
            <p className="text-lg text-[#6E6E73] leading-relaxed">
              La mayoría de las apps te muestran lo que ya pasó. Finantel te muestra lo que está por venir. Nuestra tecnología predictiva analiza patrones sutiles para anticipar gastos antes de que ocurran.
            </p>
            <div className="pt-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1C8FA0]" />
                <p className="text-[#1a1a1a] font-medium">Predicción de flujo de caja a 30 días</p>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1C8FA0]" />
                <p className="text-[#1a1a1a] font-medium">Detección de suscripciones olvidadas</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1C8FA0]" />
                <p className="text-[#1a1a1a] font-medium">Simulación de escenarios de ahorro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniqueValue;
