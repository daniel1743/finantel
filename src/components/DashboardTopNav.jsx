
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Menu, 
  Moon, 
  Sun
} from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import UserMenu from '@/components/UserMenu';

const DashboardTopNav = ({ onMenuClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { countryCode, currency } = useUserCurrency();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const menuContainerRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Estado local para el nombre y avatar del usuario
  const [userName, setUserName] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario');
  const [userAvatar, setUserAvatar] = useState(user?.user_metadata?.avatar_url || null);
  const userEmail = user?.email || 'usuario@finantel.app';

  // Actualizar nombre y avatar cuando cambie el usuario
  useEffect(() => {
    if (user) {
      const newName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
      const newAvatar = user.user_metadata?.avatar_url || null;
      
      setUserName(newName);
      setUserAvatar(newAvatar);
    }
  }, [user?.user_metadata?.full_name, user?.user_metadata?.avatar_url, user?.email, user?.id]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar si el clic está fuera del contenedor del menú (que incluye el botón)
      if (
        isMenuOpen &&
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Agregar listener cuando el menú está abierto
    if (isMenuOpen) {
      // Usar un pequeño delay para evitar que el evento de apertura cierre el menú inmediatamente
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  return (
    <nav className="sticky top-0 z-30 bg-[#F5F7F9]/80 dark:bg-[#0f0f11]/80 backdrop-blur-xl border-b border-gray-100/50 dark:border-white/5 h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 min-w-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1 rounded-full border border-transparent hover:border-gray-100 dark:hover:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-all hover:-translate-y-0.5 hover:shadow-md text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white flex-shrink-0"
        >
          <Menu className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={toggleTheme}
            className="p-1 rounded-full border border-transparent hover:border-gray-100 dark:hover:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-all hover:-translate-y-0.5 hover:shadow-md text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white flex-shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
          </button>

          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="relative p-1 rounded-full border border-transparent hover:border-gray-100 dark:hover:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-all hover:-translate-y-0.5 hover:shadow-md group flex-shrink-0"
          >
            <Bell className="w-3 h-3 text-[#6E6E73] dark:text-gray-400 group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors" />
            {/* Mostrar punto rojo solo si hay notificaciones no leídas */}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#E47B45] rounded-full border border-white dark:border-[#1a1a1a]" />
            )}
          </button>
          
          <div className="relative" ref={menuContainerRef}>
            <button 
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-10 h-10 min-w-[40px] rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] p-[2px] shadow-lg shadow-[#1C8FA0]/30 hover:shadow-[#1C8FA0]/40 transition-all hover:-translate-y-0.5 relative flex-shrink-0 ring-2 ring-[#1C8FA0]/60"
            >
              <div className="w-full h-full rounded-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      // Si la imagen falla al cargar, ocultar y mostrar inicial
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className={`text-sm font-bold text-[#1C8FA0] avatar-fallback ${userAvatar ? 'hidden' : 'flex'}`}
                >
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Bandera en la esquina inferior derecha - Badge verificador pequeño con anillo dorado */}
              {countryCode && (
                <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white dark:bg-[#1a1a1a] border border-amber-400 flex items-center justify-center overflow-hidden shadow-sm z-10 ring-1 ring-amber-400/60" style={{ width: '12.54px', height: '12.54px' }}>
                  <ReactCountryFlag
                    countryCode={countryCode}
                    svg
                    style={{
                      width: '7.31px',
                      height: '7.31px',
                      objectFit: 'cover',
                    }}
                    title={`${currency || 'USD'}`}
                  />
                </div>
              )}
            </button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-14 z-50"
                >
                  <UserMenu
                    userName={userName}
                    userEmail={userEmail}
                    onClose={() => setIsMenuOpen(false)}
                    onSignOut={signOut}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardTopNav;
