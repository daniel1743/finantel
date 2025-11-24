import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDemoMode } from '@/contexts/DemoModeContext';

const DemoConversionModal = () => {
  const navigate = useNavigate();
  const { showConversionModal, setShowConversionModal, exitDemoMode } = useDemoMode();

  const handleRegister = () => {
    exitDemoMode();
    setShowConversionModal(false);
    navigate('/auth?mode=signup');
  };

  const handleClose = () => {
    exitDemoMode();
    setShowConversionModal(false);
    navigate('/');
  };

  return (
    <AnimatePresence>
      {showConversionModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-2xl max-w-2xl w-full relative overflow-hidden border border-gray-100 dark:border-white/10">

              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1C8FA0] via-[#E47B45] to-[#1C8FA0]" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1C8FA0]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Content */}
              <div className="p-8 md:p-12 relative">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] flex items-center justify-center shadow-xl shadow-[#1C8FA0]/30"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1a1a1a] dark:text-white mb-4 font-['Inter_Tight']">
                  ¡Nos alegra que hayas probado Finantel!
                </h2>

                {/* Description */}
                <p className="text-center text-lg text-[#6E6E73] dark:text-gray-400 mb-8 max-w-xl mx-auto">
                  Has completado tu hora de prueba gratuita. Para seguir controlando tus finanzas y acceder a todas las funcionalidades, crea tu cuenta.
                </p>

                {/* Benefits */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    'Datos ilimitados y seguros',
                    'Sincronización en todos tus dispositivos',
                    'Asistente IA personalizado',
                    'Análisis financiero profundo',
                  ].map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#1C8FA0] flex-shrink-0" />
                      <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                        {benefit}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleRegister}
                    className="flex-1 bg-[#1C8FA0] hover:bg-[#167a8a] text-white text-lg px-8 py-6 h-auto rounded-full shadow-xl shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-1"
                  >
                    Crear Cuenta Gratuita
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1 text-[#6E6E73] border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 text-lg px-8 py-6 h-auto rounded-full transition-all"
                  >
                    Volver al inicio
                  </Button>
                </div>

                {/* Footer note */}
                <p className="text-center text-sm text-[#6E6E73] dark:text-gray-500 mt-6">
                  Sin tarjeta de crédito requerida • Cancela cuando quieras
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DemoConversionModal;
