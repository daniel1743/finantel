// =====================================================
// COMPONENTE: AnalysisSummary
// =====================================================
// Muestra el resumen ejecutivo del análisis
// =====================================================

import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Info } from 'lucide-react';

const AnalysisSummary = ({ summary, insights }) => {
  // Procesar summary desde diferentes formatos
  const summaryText = typeof summary === 'string'
    ? summary
    : summary?.text || summary?.summary || summary?.executive_summary || 'No hay resumen disponible';

  const insightsText = insights || summary?.insights || summary?.ai_insights || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-2xl border-2 border-gray-200 dark:border-white/10 p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-[#1C8FA0]/10 border border-[#1C8FA0]/20">
          <Icon component={FileText} size="md" color="primary" />
        </div>
        <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
          Resumen del Análisis
        </h3>
      </div>

      <div className="space-y-4">
        {/* Resumen principal */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-[#1a1a1a] dark:text-white leading-relaxed whitespace-pre-wrap">
            {summaryText}
          </p>
        </div>

        {/* Insights adicionales */}
        {insightsText && (
          <div className="pt-4 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Icon component={Sparkles} size="sm" color="primary" />
              <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                Insights Adicionales
              </h4>
            </div>
            <div className="p-3 rounded-xl bg-[#1C8FA0]/5 border border-[#1C8FA0]/10">
              <p className="text-sm text-[#1a1a1a] dark:text-white leading-relaxed whitespace-pre-wrap">
                {typeof insightsText === 'string' ? insightsText : JSON.stringify(insightsText, null, 2)}
              </p>
            </div>
          </div>
        )}

        {/* Info adicional */}
        <div className="flex items-start gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
          <Icon component={Info} size="sm" color="default" className="dark: mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
            Este análisis fue generado automáticamente por el motor DeepFinance™ basado en tus transacciones y patrones financieros.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisSummary;

