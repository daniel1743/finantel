import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DemoModeBanner = () => {
  const { isDemoMode, getFormattedTimeRemaining } = useDemoMode();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1C8FA0] to-[#167a8a] text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Demo info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Modo Demo Activo</p>
              <p className="text-xs text-white/80">
                Estás explorando Finantel sin registro
              </p>
            </div>
          </div>

          {/* Center - Timer */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono font-semibold">
              {getFormattedTimeRemaining()}
            </span>
            <span className="text-xs text-white/80">restantes</span>
          </div>

          {/* Right side - CTA */}
          <Button
            onClick={() => navigate('/auth?mode=signup')}
            size="sm"
            className="bg-white text-[#1C8FA0] hover:bg-white/90 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Crear Cuenta Gratis
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>

        {/* Mobile timer */}
        <div className="sm:hidden mt-2 flex items-center justify-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span className="font-mono font-semibold">
            {getFormattedTimeRemaining()}
          </span>
          <span className="text-xs text-white/80">restantes</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoModeBanner;
