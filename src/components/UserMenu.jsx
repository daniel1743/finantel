import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * UserMenu - Menú dropdown sutil y elegante del usuario
 * EXACTAMENTE los mismos tamaños que el sidebar
 */
const UserMenu = ({
  userName,
  userEmail,
  onClose,
  onSignOut,
  userAvatar = null,
  isPremium = false
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      icon: User,
      label: 'Mi Perfil',
      to: '/dashboard/profile',
    },
    {
      icon: Crown,
      label: 'Mi Suscripción',
      to: '/dashboard/billing',
      badge: isPremium ? 'Premium' : null
    },
    {
      icon: Settings,
      label: 'Preferencias',
      to: '/dashboard/settings',
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      to: '/dashboard/notifications',
    },
    {
      icon: Shield,
      label: 'Seguridad',
      to: '/dashboard/security',
    },
    {
      icon: HelpCircle,
      label: 'Centro de Ayuda',
      external: true,
      onClick: () => {
        onClose();
        window.open('https://help.finantel.app', '_blank');
      }
    },
    {
      icon: MessageSquare,
      label: 'Enviar Comentarios',
      onClick: () => {
        onClose();
        const subject = encodeURIComponent('Feedback - Finantel');
        const body = encodeURIComponent('Hola,\n\nMe gustaría compartir mi opinión sobre Finantel:\n\n');
        window.location.href = `mailto:support@finantel.app?subject=${subject}&body=${body}`;
      }
    }
  ];

  const renderMenuItem = (item, index) => {
    const ItemIcon = item.icon;
    const isHovered = hoveredItem === index;

    const content = (
      <motion.div
        onHoverStart={() => setHoveredItem(index)}
        onHoverEnd={() => setHoveredItem(null)}
        className={cn(
          "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
          isHovered
            ? "bg-[#1C8FA0]/10 text-[#1C8FA0]"
            : "text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
        )}
      >
        {/* Barra lateral - igual que sidebar */}
        {isHovered && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1C8FA0] rounded-r-full" />
        )}

        {/* Icono - usa tokens de iconografía (mismo que sidebar) */}
        <Icon
          component={ItemIcon}
          size="md"
          color={isHovered ? "primary" : "default"}
          className={cn(
            "transition-all duration-300",
            isHovered ? "drop-shadow-[0_0_8px_rgba(28,143,160,0.5)]" : "group-hover:scale-110"
          )}
        />

        {/* Texto - EXACTO tamaño sidebar: text-sm font-medium */}
        <span className={cn(
          "font-medium text-sm whitespace-nowrap flex-1",
          isHovered && "text-[#1C8FA0]"
        )}>
          {item.label}
        </span>

        {/* Badge pequeño si es premium */}
        {item.badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            {item.badge}
          </span>
        )}
      </motion.div>
    );

    if (item.to) {
      return (
        <Link key={index} to={item.to} onClick={onClose}>
          {content}
        </Link>
      );
    }

    return (
      <button key={index} onClick={item.onClick} className="w-full">
        {content}
      </button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="w-[260px] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/10 overflow-hidden"
    >
      {/* Header compacto */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          {/* Avatar pequeño */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] p-[2px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] bg-clip-text text-transparent">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {/* Badge premium mini */}
            {isPremium && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center border border-white dark:border-[#1a1a1a]">
                <Crown className="w-2 h-2 text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Info - EXACTO tamaño sidebar */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1a1a1a] dark:text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400 truncate">
              {userEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Items del menú - sin secciones para ser más compacto */}
      <div className="py-1">
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </div>

      {/* Divisor */}
      <div className="h-px bg-gray-100 dark:bg-white/5 mx-4" />

      {/* Cerrar Sesión */}
      <div className="py-1">
        <button
          onClick={() => {
            onClose();
            onSignOut();
          }}
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
          className={cn(
            "group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
            hoveredItem === 'logout'
              ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
              : "text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
          )}
        >
          {/* Barra lateral roja */}
          {hoveredItem === 'logout' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full" />
          )}

          <Icon component={LogOut} size="md" color="default" className="transition-all duration-300" />
          <span className="flex-1 text-left text-sm font-medium">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default UserMenu;
