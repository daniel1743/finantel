
import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquear scroll cuando el menú mobile está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Altura del header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleNavClick = (item) => {
    const sectionMap = {
      'Características': 'features',
      'Precios': 'pricing',
      'Seguridad': 'security'
    };

    const sectionId = sectionMap[item];
    if (sectionId) {
      scrollToSection(sectionId);
      setMobileMenuOpen(false); // Cerrar menú mobile al hacer clic
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
          scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3" : "bg-transparent py-5"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/finantel-logo.png"
              alt="Finantel Logo"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Características', 'Precios', 'Seguridad'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className="text-sm font-medium text-[#6E6E73] hover:text-[#1C8FA0] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-[#6E6E73] hover:text-[#1C8FA0] hover:bg-transparent font-medium py-2.5 px-5"
            >
              Iniciar Sesión
            </Button>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full px-6 py-2.5 font-medium shadow-lg shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-0.5"
            >
              Comenzar Gratis
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <Icon component={X} size="lg" color="dark" />
            ) : (
              <Icon component={Menu} size="lg" color="dark" />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header del menú */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <img
                    src="/finantel-logo.png"
                    alt="Finantel Logo"
                    className="h-8 w-auto"
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close menu"
                  >
                    <Icon component={X} size="lg" color="dark" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {['Características', 'Precios', 'Seguridad'].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleNavClick(item)}
                      className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-[#1a1a1a] hover:bg-[#1C8FA0]/10 hover:text-[#1C8FA0] transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </nav>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-full py-3 border-2 border-gray-200 hover:border-[#1C8FA0] hover:bg-[#1C8FA0] hover:text-white text-[#1a1a1a] font-medium"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full py-3 font-medium shadow-lg shadow-[#1C8FA0]/20"
                  >
                    Comenzar Gratis
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
