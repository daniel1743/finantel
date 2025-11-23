import React from 'react';
import { Shield, Brain, Users } from 'lucide-react';

const Values = () => {
  const values = [
    {
      icon: Shield,
      title: "Tu Privacidad Primero",
      description: "Tus datos financieros nunca salen de tu dispositivo. Sin conexiones bancarias, sin riesgos."
    },
    {
      icon: Brain,
      title: "IA que Entiende tu Dinero",
      description: "Análisis inteligente que aprende de tus hábitos y te ofrece consejos personalizados."
    },
    {
      icon: Users,
      title: "Familia Conectada",
      description: "Comparte presupuestos y metas con tu familia de forma segura y colaborativa."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#208FA3]/10">
                  <Icon className="w-8 h-8 text-[#208FA3]" />
                </div>
                <h3 className="text-xl font-semibold text-[#333333]">{value.title}</h3>
                <p className="text-[#333333]/70 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Values;