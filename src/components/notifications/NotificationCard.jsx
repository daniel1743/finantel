import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Bell, AlertTriangle, TrendingUp } from 'lucide-react';

/**
 * NotificationCard - Tarjeta individual de notificación
 * Estilo profesional con icono circular turquesa, título, descripción y timestamp
 */
const NotificationCard = ({ notification, index, onMarkAsRead, onViewDetails }) => {
  // Formatear fecha relativa
  const formatTime = (dateString) => {
    if (!dateString) return 'Ahora';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Determinar icono según tipo
  const getIcon = () => {
    if (notification.type === 'critical' || notification.type === 'warning' || notification.type === 'alert') {
      return AlertTriangle;
    }
    if (notification.type === 'opportunity' || notification.type === 'trend' || notification.type === 'success') {
      return TrendingUp;
    }
    return Bell;
  };

  const IconComponent = getIcon();
  const isUnread = !notification.is_read;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-start gap-4 p-5 rounded-xl border transition-all hover:shadow-lg cursor-pointer group min-h-[100px]",
        isUnread
          ? "bg-[#1C8FA0]/5 dark:bg-[#1C8FA0]/10 border-[#1C8FA0]/20 dark:border-[#1C8FA0]/30"
          : "bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-white/5"
      )}
      onClick={() => onViewDetails && onViewDetails(notification)}
    >
      {/* Icono circular turquesa */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
        "bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20",
        "border border-[#1C8FA0]/20 dark:border-[#1C8FA0]/30"
      )}>
        <IconComponent className="w-6 h-6 text-[#1C8FA0] dark:text-[#1C8FA0]" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h4 className={cn(
            "font-bold text-base leading-tight",
            isUnread
              ? "text-[#1C8FA0] dark:text-[#1C8FA0]"
              : "text-[#1a1a1a] dark:text-white"
          )}>
            {notification.title}
          </h4>
          <span className="text-xs text-[#6E6E73] dark:text-gray-400 whitespace-nowrap shrink-0">
            {formatTime(notification.created_at || notification.time)}
          </span>
        </div>
        
        <p className="text-sm text-[#6E6E73] dark:text-gray-400 leading-relaxed line-clamp-2">
          {notification.message || notification.desc || notification.description}
        </p>
        
        {/* Acciones (solo en hover) */}
        <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.is_read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead && onMarkAsRead(notification.id);
              }}
              className="text-xs font-medium text-[#1C8FA0] hover:underline"
            >
              Marcar como leída
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;

