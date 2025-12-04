// =====================================================
// COMPONENTE: Update Notification
// =====================================================
// Muestra notificación de actualización disponible
// =====================================================

import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppUpdate } from '@/hooks/useAppUpdate';

const UpdateNotification = () => {
  const { updateAvailable, applyUpdate, isMobile } = useAppUpdate();
  const [dismissed, setDismissed] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // NO aplicar automáticamente - solo mostrar notificación
  // El usuario debe hacer clic para actualizar

  if (!updateAvailable || dismissed || isUpdating) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await applyUpdate();
    } catch (err) {
      console.error('[UpdateNotification] Error aplicando actualización:', err);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1C8FA0] to-[#167a8a] text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Icon component={Download} size="md" color="default" />
              </div>
              <div>
                <p className="font-semibold text-sm">Nueva actualización disponible</p>
                <p className="text-xs text-white/80">
                  {isMobile 
                    ? 'Toca para actualizar y ver los últimos cambios'
                    : 'Haz clic para actualizar y ver los últimos cambios'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleUpdate}
                className="bg-white text-[#1C8FA0] hover:bg-white/90 px-4 py-2 h-auto text-sm font-semibold"
              >
                <Icon component={RefreshCw} size="sm" color="default" className="mr-2" />
                Actualizar
              </Button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <Icon component={X} size="md" color="default" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateNotification;

