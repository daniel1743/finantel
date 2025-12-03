import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  Shield, 
  HelpCircle, 
  MessageSquare, 
  LogOut 
} from 'lucide-react';

/**
 * UserMenu - Menú dropdown de usuario con diseño profesional
 * Diseño exacto del mockup: fondo blanco, iconos outline uniformes, espaciado consistente
 */
const UserMenu = ({ 
  userName, 
  userEmail, 
  onClose, 
  onSignOut 
}) => {
  const menuItems = [
    {
      icon: User,
      label: 'Mi Perfil',
      to: '/dashboard/profile',
      onClick: onClose
    },
    {
      icon: CreditCard,
      label: 'Mi Suscripción',
      to: '/dashboard/billing',
      onClick: onClose
    },
    {
      icon: Shield,
      label: 'Seguridad',
      to: '/dashboard/profile',
      onClick: onClose
    },
    {
      icon: HelpCircle,
      label: 'Ayuda y Soporte',
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

  return (
    <div className="w-[280px] bg-white rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
      {/* Encabezado del usuario */}
      <div className="px-6 pt-6 pb-5 border-b border-[#E5E7EB]">
        <p className="text-lg font-bold text-[#1a1a1a] mb-1 truncate">
          {userName}
        </p>
        <p className="text-sm text-[#6B7280] truncate">
          {userEmail}
        </p>
      </div>

      {/* Items del menú */}
      <div className="py-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <div className="flex items-center gap-3 px-6 py-3 text-sm text-[#1a1a1a] hover:bg-[#F3F4F6] transition-colors cursor-pointer">
              <Icon className="w-5 h-5 text-[#1a1a1a] flex-shrink-0" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
            </div>
          );

          if (item.to) {
            return (
              <Link key={index} to={item.to} onClick={item.onClick}>
                {content}
              </Link>
            );
          }

          return (
            <button key={index} onClick={item.onClick} className="w-full">
              {content}
            </button>
          );
        })}
      </div>

      {/* Línea divisoria */}
      <div className="h-px bg-[#E5E7EB] mx-6 my-2" />

      {/* Cerrar Sesión */}
      <div className="pb-2">
        <button
          onClick={() => {
            onClose();
            onSignOut();
          }}
          className="flex items-center gap-3 w-full px-6 py-3 text-sm text-[#EF4444] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-[#1a1a1a] flex-shrink-0" strokeWidth={2} />
          <span className="flex-1 text-left">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenu;

