
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
      const headerOffset = 70; // Altura del header (reducida)
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
          "fixed top-0 left-0 right-0 z-[var(--z-fixed)] transition-all duration-300 ease-in-out",
          scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 py-2" : "bg-transparent py-3"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/INANTEL.svg"
              alt="Finantel Logo"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {['Características', 'Precios', 'Seguridad'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-neutral-500 hover:text-primary-500"
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="default"
              size="cta-full"
              onClick={() => navigate('/auth')}
              className="shadow-primary hover:-translate-y-0.5"
            >
              Comenzar Gratis
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100/50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <Icon component={X} size="md" color="dark" />
            ) : (
              <Icon component={Menu} size="md" color="dark" />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay - Más sutil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[var(--z-modal-backdrop)] md:hidden"
            />

            {/* Menu Panel - Más delgado y elegante */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[280px] bg-white/95 backdrop-blur-xl z-[var(--z-modal)] shadow-lg border-l border-gray-100 md:hidden overflow-y-auto"
            >
              <div className="p-5 space-y-4">
                {/* Header del menú - Más compacto */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100/50">
                  <img
                    src="/INANTEL.svg"
                    alt="Finantel Logo"
                    className="h-8 w-auto"
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100/50 transition-colors"
                    aria-label="Close menu"
                  >
                    <Icon component={X} size="md" color="dark" />
                  </button>
                </div>

                {/* Navigation Links - Más sutiles */}
                <nav className="space-y-1 pt-2">
                  {['Características', 'Precios', 'Seguridad'].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleNavClick(item)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-gray-50 hover:text-[#1C8FA0] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </nav>

                {/* Action Buttons - Más compactos */}
                <div className="space-y-2 pt-4 border-t border-gray-100/50">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-sm font-medium text-neutral-600 hover:text-[#1C8FA0] hover:bg-gray-50"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-sm font-medium bg-[#1C8FA0] hover:bg-[#1a7f8e] text-white shadow-sm"
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
