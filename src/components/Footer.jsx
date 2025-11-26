
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const { toast } = useToast();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "¡Suscrito!",
      description: "Gracias por unirte a nuestra newsletter exclusiva.",
    });
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <img
                src="/finantel-logo.png"
                alt="Finantel Logo"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-[#6E6E73] max-w-sm leading-relaxed">
              Diseñando el futuro de las finanzas personales. Privacidad primero, inteligencia siempre.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#6E6E73] hover:bg-[#1C8FA0] hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-[#1a1a1a] mb-6">Producto</h4>
            <ul className="space-y-4 text-sm text-[#6E6E73]">
              {['Características', 'Seguridad', 'Precios', 'Roadmap'].map(item => (
                <li key={item}><a href="#" className="hover:text-[#1C8FA0] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-[#1a1a1a] mb-6">Compañía</h4>
            <ul className="space-y-4 text-sm text-[#6E6E73]">
              {['Sobre nosotros', 'Carreras', 'Blog', 'Contacto'].map(item => (
                <li key={item}><a href="#" className="hover:text-[#1C8FA0] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-bold text-[#1a1a1a] mb-6">Mantente al día</h4>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1C8FA0]/20 text-sm outline-none transition-all"
              />
              <Button type="submit" className="w-full bg-[#1a1a1a] hover:bg-black text-white rounded-xl py-6">
                Suscribirse
              </Button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#6E6E73]">
          <p>© 2025 Finantel Inc. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#1a1a1a]">Privacidad</a>
            <a href="#" className="hover:text-[#1a1a1a]">Términos</a>
            <a href="#" className="hover:text-[#1a1a1a]">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
