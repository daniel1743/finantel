
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    toast({
      title: "🚧 Próximamente",
      description: "Esta sección estará disponible muy pronto.",
    });
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3" : "bg-transparent py-5"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1C8FA0] rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
          <span className="text-xl font-bold tracking-tight text-[#1C8FA0]">FINANTEL</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {['Características', 'Precios', 'Seguridad'].map((item) => (
            <button 
              key={item}
              onClick={handleNavClick} 
              className="text-sm font-medium text-[#6E6E73] hover:text-[#1C8FA0] transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')} 
            className="hidden sm:flex text-[#6E6E73] hover:text-[#1C8FA0] hover:bg-transparent font-medium"
          >
            Iniciar Sesión
          </Button>
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full px-6 font-medium shadow-lg shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-0.5"
          >
            Comenzar Gratis
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
