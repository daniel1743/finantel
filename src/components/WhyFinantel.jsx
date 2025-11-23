
import React from 'react';
import { Lock, Sparkles, Users } from 'lucide-react';

const WhyFinantel = () => {
  const features = [
    {
      icon: Lock,
      title: "Privacidad Absoluta",
      description: "Tus datos nunca salen de tu dispositivo. Sin conexiones bancarias, sin riesgos de seguridad."
    },
    {
      icon: Sparkles,
      title: "Inteligencia Real",
      description: "Algoritmos que aprenden de tus patrones para ofrecerte consejos financieros accionables."
    },
    {
      icon: Users,
      title: "Diseño Humano",
      description: "Una experiencia creada para personas, no para contables. Claridad visual instantánea."
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold text-[#1C8FA0] tracking-widest uppercase mb-3">Por qué Finantel</h2>
          <p className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">Redefiniendo la gestión personal</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group p-8 rounded-[32px] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-full bg-[#1C8FA0]/5 flex items-center justify-center mb-6 group-hover:bg-[#1C8FA0] transition-colors duration-300">
                  <Icon className="w-6 h-6 text-[#1C8FA0] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{feature.title}</h3>
                <p className="text-[#6E6E73] leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyFinantel;
