
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const DashboardTopNav = ({ onMenuClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const menuContainerRef = useRef(null);
  const buttonRef = useRef(null);
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || 'usuario@finantel.app';

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
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
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    // Limpiar listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#E47B45] rounded-full border-2 border-white dark:border-[#1a1a1a]" />
          </button>
          
          <div className="relative" ref={menuContainerRef}>
            <button 
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] p-[2px] shadow-lg shadow-[#1C8FA0]/20 hover:shadow-[#1C8FA0]/30 transition-all hover:-translate-y-0.5"
            >
              <div className="w-full h-full rounded-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                <span className="text-sm font-bold text-[#1C8FA0]">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-14 w-56 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-white/10 p-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-white/5 mb-2">
                    <p className="text-sm font-bold text-[#1a1a1a] dark:text-white truncate">{userName}</p>
                    <p className="text-xs text-[#6E6E73] dark:text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <Link 
                    to="/dashboard/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Mi Perfil
                  </Link>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Configuración
                  </button>
                  <div className="h-px bg-gray-50 dark:bg-white/5 my-2" />
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-medium"
                  >
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
