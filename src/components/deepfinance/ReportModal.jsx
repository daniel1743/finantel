// =====================================================
// COMPONENTE: ReportModal
// =====================================================
// Modal para generar y descargar el reporte PDF
// =====================================================

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ReportGenerator } from '@/lib/deepfinance/reportGenerator';
import { cn } from '@/lib/utils';

const ReportModal = ({ isOpen, onClose, analysis, userName, userEmail }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGeneratePDF = async () => {
    if (!analysis) {
      setError('No hay análisis disponible para generar el reporte');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Crear el generador
      const generator = new ReportGenerator(analysis, userName, userEmail);
      
      // Generar y descargar el PDF
      generator.generateAndDownload();

      setSuccess(true);
      
      // Cerrar después de 2 segundos
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (err) {
      console.error('[ReportModal] Error generando PDF:', err);
      setError(err.message || 'Error al generar el reporte. Por favor, intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#0f1624] rounded-2xl border-2 border-gray-200 dark:border-[#1C8FA0]/30 shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1C8FA0] to-[#1a9bb0] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <Icon component={FileText} size="lg" color="white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Generar Reporte PDF</h3>
                  <p className="text-sm text-white/80">Análisis completo de DeepFinance™</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                disabled={isGenerating}
              >
                <Icon component={X} size="md" color="white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Descripción */}
            <div className="space-y-2">
              <p className="text-sm text-[#1a1a1a] dark:text-gray-300">
                Este reporte incluirá:
              </p>
              <ul className="space-y-1 text-sm text-[#6E6E73] dark:text-gray-400 ml-4">
                <li className="list-disc">Portada profesional con tu información</li>
                <li className="list-disc">Puntaje financiero y resumen ejecutivo</li>
                <li className="list-disc">Diagnóstico completo por área</li>
                <li className="list-disc">Fugas financieras y factores de riesgo</li>
                <li className="list-disc">Proyecciones de ahorro potencial</li>
                <li className="list-disc">Patrones detectados en tus gastos</li>
                <li className="list-disc">Recomendaciones personalizadas</li>
                <li className="list-disc">Plan de acción 7/30/90 días</li>
              </ul>
            </div>

            {/* Información del análisis */}
            {analysis && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-[#1C8FA0]/20">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[#6E6E73] dark:text-gray-400">Puntaje</p>
                    <p className="font-semibold text-[#1a1a1a] dark:text-white">
                      {analysis.score || 0}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6E6E73] dark:text-gray-400">Transacciones</p>
                    <p className="font-semibold text-[#1a1a1a] dark:text-white">
                      {analysis.totalTransactions || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6E6E73] dark:text-gray-400">Período</p>
                    <p className="font-semibold text-[#1a1a1a] dark:text-white text-xs">
                      {analysis.period_days || 90} días
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6E6E73] dark:text-gray-400">Fecha</p>
                    <p className="font-semibold text-[#1a1a1a] dark:text-white text-xs">
                      {analysis.analysisDate 
                        ? new Date(analysis.analysisDate).toLocaleDateString('es-ES')
                        : 'Hoy'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
              >
                <div className="flex items-start gap-3">
                  <Icon component={AlertCircle} size="md" color="error" className="dark: shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      Error al generar reporte
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
              >
                <div className="flex items-start gap-3">
                  <Icon component={CheckCircle2} size="md" color="success" className="dark: shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      Reporte generado exitosamente
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      El PDF se está descargando...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-[#1a1a2e] border-t border-gray-200 dark:border-[#1C8FA0]/20">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isGenerating}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all",
                  "bg-gray-200 dark:bg-gray-700 text-[#1a1a1a] dark:text-white",
                  "hover:bg-gray-300 dark:hover:bg-gray-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Cancelar
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating || success}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all",
                  "bg-gradient-to-r from-[#1C8FA0] to-[#1a9bb0] text-white",
                  "hover:from-[#1a9bb0] hover:to-[#1C8FA0]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isGenerating ? (
                  <>
                    <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                    Generando...
                  </>
                ) : success ? (
                  <>
                    <Icon component={CheckCircle2} size="sm" color="default" />
                    Descargado
                  </>
                ) : (
                  <>
                    <Icon component={Download} size="sm" color="default" />
                    Generar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportModal;

