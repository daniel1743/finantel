import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/Icon';
import { useNavigate } from 'react-router-dom';

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario ya cerró el CTA en esta sesión
    const dismissed = sessionStorage.getItem('floating-cta-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      // Mostrar después de hacer scroll 300px
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 300 && !isDismissed) {
        setIsVisible(true);
      } else if (scrollY <= 300) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('floating-cta-dismissed', 'true');
  };

  const handleCTAClick = () => {
    navigate('/auth');
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-xs sm:max-w-sm"
        >
          <div className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md rounded-full sm:rounded-2xl shadow-md border border-gray-200/50 dark:border-white/10 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 relative">
            {/* Close Button - Más pequeño y discreto */}
            <button
              onClick={handleDismiss}
              className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors opacity-70 hover:opacity-100"
              aria-label="Cerrar"
            >
              <Icon component={X} size="xs" color="muted" className="sm:w-3.5 sm:h-3.5" />
            </button>

            {/* Content - Más compacto */}
            <div className="flex-1 min-w-0 pr-6 sm:pr-0">
              <p className="text-xs sm:text-sm font-medium text-[#1a1a1a] dark:text-white leading-tight">
                ¿Listo para tomar control?
              </p>
              <p className="text-[10px] sm:text-xs text-[#6E6E73] dark:text-gray-400 leading-tight mt-0.5 hidden sm:block">
                Comienza gratis
              </p>
            </div>

            {/* CTA Button - Más pequeño y proporcional */}
            <Button
              onClick={handleCTAClick}
              className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-medium shadow-sm shadow-[#1C8FA0]/10 transition-all hover:shadow-[#1C8FA0]/20 hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0 h-auto"
            >
              <span className="hidden sm:inline">Comenzar</span>
              <span className="sm:hidden">Ir</span>
              <Icon component={ArrowRight} size="xs" className="ml-1 sm:ml-1 text-white" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;
