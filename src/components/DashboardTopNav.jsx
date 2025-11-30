
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Menu, 
  Moon, 
  Sun, 
  User, 
  CreditCard, 
  Shield, 
  HelpCircle, 
  MessageSquare, 
  LogOut 
} from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useNotifications } from '@/hooks/useNotifications';
import { Link, useNavigate } from 'react-router-dom';

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
    <nav className="sticky top-0 z-30 bg-[#F5F7F9]/80 dark:bg-[#0f0f11]/80 backdrop-blur-xl border-b border-gray-100/50 dark:border-white/5 h-20 px-6 lg:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-lg transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#6E6E73] dark:text-gray-500 uppercase tracking-wider">Bienvenido de nuevo</span>
          <div className="text-lg font-medium text-[#1a1a1a] dark:text-white">
            Hola, <span className="font-bold">{userName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-white/5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-100 dark:border-white/5 text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="relative p-2 rounded-full bg-white dark:bg-white/5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group border border-gray-100 dark:border-white/5"
          >
            <Bell className="w-5 h-5 text-[#6E6E73] dark:text-gray-400 group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors" />
            {/* Mostrar punto rojo solo si hay notificaciones no leídas */}
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#E47B45] rounded-full border-2 border-white dark:border-[#1a1a1a]" />
            )}
          </button>
          
          <div className="relative" ref={menuContainerRef}>
            <button 
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] p-[2px] shadow-lg shadow-[#1C8FA0]/20 hover:shadow-[#1C8FA0]/30 transition-all hover:-translate-y-0.5 relative"
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
              {/* Bandera en la esquina inferior derecha */}
              {countryCode && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-[#1C8FA0] flex items-center justify-center overflow-hidden shadow-sm z-10">
                  <ReactCountryFlag
                    countryCode={countryCode}
                    svg
                    style={{
                      width: '12px',
                      height: '12px',
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
                  className="absolute right-0 top-14 w-56 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-white/10 p-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-white/5 mb-2">
                    <p className="text-sm font-bold text-[#1a1a1a] dark:text-white truncate">{userName}</p>
                    <p className="text-xs text-[#6E6E73] dark:text-gray-500 truncate">{userEmail}</p>
                  </div>
                  
                  {/* Sección: Perfil y Configuración */}
                  <Link 
                    to="/dashboard/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  
                  <Link 
                    to="/dashboard/billing" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Mi Suscripción
                  </Link>
                  
                  <Link 
                    to="/dashboard/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Seguridad
                  </Link>
                  
                  <div className="h-px bg-gray-50 dark:bg-white/5 my-2" />
                  
                  {/* Sección: Ayuda y Soporte */}
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Abrir FAQ o página de ayuda
                      window.open('https://help.finantel.app', '_blank');
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Ayuda y Soporte
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Abrir modal de feedback o redirigir
                      const subject = encodeURIComponent('Feedback - Finantel');
                      const body = encodeURIComponent('Hola,\n\nMe gustaría compartir mi opinión sobre Finantel:\n\n');
                      window.location.href = `mailto:support@finantel.app?subject=${subject}&body=${body}`;
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Enviar Comentarios
                  </button>
                  
                  <div className="h-px bg-gray-50 dark:bg-white/5 my-2" />
                  
                  {/* Cerrar Sesión */}
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
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
