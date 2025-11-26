import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-4 flex items-center gap-4 relative">
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-[#6E6E73]" />
            </button>

            {/* Content */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
                ¿Listo para tomar control?
              </p>
              <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                Comienza gratis y sin tarjeta de crédito
              </p>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleCTAClick}
              className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full px-6 py-2 text-sm font-medium shadow-lg shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-0.5 whitespace-nowrap"
            >
              Comenzar
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;
