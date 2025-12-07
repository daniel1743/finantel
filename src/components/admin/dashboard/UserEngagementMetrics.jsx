import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  XCircle,
  HelpCircle,
  MessageCircle,
  Bot
} from 'lucide-react';
import { formatNumber, formatPercentage } from '@/utils/metricsFormatter';

const UserEngagementMetrics = ({ metrics }) => {
  // Forzar mostrar todas las tarjetas siempre, incluso sin datos
  const safeMetrics = metrics || {};

  const cards = [
    {
      title: 'Usuarios Anónimos (Landing)',
      value: formatNumber(safeMetrics.anonymousVisitors || 0),
      subtitle: 'Visitantes sin cuenta',
      icon: Users,
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Hora Pico de Visitas',
      value: safeMetrics.peakHour || 'N/A',
      subtitle: 'Mayor tráfico',
      icon: Clock,
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Interacciones con IA',
      value: formatNumber(safeMetrics.aiInteractions || 0),
      subtitle: 'Total de mensajes',
      icon: Bot,
      color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Satisfacción con IA',
      value: formatPercentage(safeMetrics.aiSatisfaction || 0),
      subtitle: `${formatNumber(safeMetrics.aiSatisfied || 0)} satisfechos`,
      icon: ThumbsUp,
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
    {
      title: 'Insatisfacción con IA',
      value: formatPercentage(safeMetrics.aiDissatisfaction || 0),
      subtitle: `${formatNumber(safeMetrics.aiDissatisfied || 0)} insatisfechos`,
      icon: ThumbsDown,
      color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    },
    {
      title: 'Abandonos',
      value: formatNumber(safeMetrics.abandonments || 0),
      subtitle: 'Usuarios que salieron',
      icon: XCircle,
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Tickets Creados',
      value: formatNumber(safeMetrics.ticketsCreated || 0),
      subtitle: 'Solicitudes de soporte',
      icon: HelpCircle,
      color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Feedback Enviado',
      value: formatNumber(safeMetrics.feedbackSent || 0),
      subtitle: 'Comentarios recibidos',
      icon: MessageCircle,
      color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Métricas de Engagement y Usuarios</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon component={card.icon} size="md" color="default" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-1">{card.value}</p>
            {card.subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UserEngagementMetrics;


