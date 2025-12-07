import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, X } from 'lucide-react';
import { formatNumber, formatPercentage } from '@/utils/metricsFormatter';

const ToolUsageMetrics = ({ toolUsage, mostUsed, leastUsed }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Icon component={Zap} size="md" color="default" />
        Uso de Herramientas
      </h2>

      {/* Más Usadas */}
      {mostUsed && mostUsed.length > 0 && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400 flex items-center gap-2">
            <Icon component={TrendingUp} size="sm" color="default" />
            Más Usadas
          </h3>
          <div className="space-y-3">
            {mostUsed.slice(0, 5).map((tool, idx) => {
              const percentage = tool.totalUsers > 0 ? (tool.totalUsers / (toolUsage?.totalUsers || 1)) * 100 : 0;
              return (
                <div key={tool.toolName || idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">{idx + 1}.</span>
                    <span className="font-medium">{tool.toolName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-20 text-right">
                      {formatNumber(tool.totalUsers || 0)} usuarios
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Menos Usadas */}
      {leastUsed && leastUsed.length > 0 && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400 flex items-center gap-2">
            <Icon component={TrendingDown} size="sm" color="default" />
            Menos Usadas
          </h3>
          <div className="space-y-3">
            {leastUsed.slice(0, 5).map((tool, idx) => {
              const percentage = tool.totalUsers > 0 ? (tool.totalUsers / (toolUsage?.totalUsers || 1)) * 100 : 0;
              return (
                <div key={tool.toolName || idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">{idx + 1}.</span>
                    <span className="font-medium">{tool.toolName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-20 text-right">
                      {formatNumber(tool.totalUsers || 0)} usuarios
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolUsageMetrics;


