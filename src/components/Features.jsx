import React from 'react';
import { Zap, BrainCircuit, Layers, Users2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Features = () => {
  const { toast } = useToast();

  const handleFeatureClick = () => {
    toast({
      title: "Explora más",
      description: "Detalles completos disponibles en la versión completa.",
    });
  };

  const features = [
    {
      icon: Zap,
      title: "Registro Ultra Rápido",
      description: "Diseñado para la velocidad. Añade gastos en menos de 3 segundos con atajos inteligentes.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: BrainCircuit,
      title: "IA Predictiva",
      description: "Anticípate a tus facturas. El sistema aprende tus ciclos y te avisa antes de quedarte en descubierto.",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: Layers,
      title: "Categorías Ilimitadas",
      description: "Organiza tu vida financiera con la granularidad que necesites. Etiquetas, grupos y subcategorías.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: Users2,
      title: "Colaboración Familiar",
      description: "Comparte presupuestos específicos sin revelar todas tus cuentas. Control total de permisos.",
      color: "bg-green-50 text-green-600"
    }
  ];

  return (
    <section id="features" className="py-32 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-20 max-w-2xl">
          <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">Potencia sin complejidad</h2>
          <p className="text-xl text-[#6E6E73]">Herramientas profesionales simplificadas para el uso diario.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                onClick={handleFeatureClick}
                className="group relative bg-white p-10 rounded-[32px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-10 transition-opacity duration-500 transform translate-x-4 -translate-y-4">
                  <Icon className="w-32 h-32 text-[#1a1a1a]" />
                </div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gray-50 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-[#1a1a1a]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">{feature.title}</h3>
                  <p className="text-[#6E6E73] text-lg leading-relaxed max-w-sm">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;