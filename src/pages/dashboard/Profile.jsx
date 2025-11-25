
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Settings, 
  Bell, 
  CreditCard,
  ChevronRight
} from 'lucide-react';
import NotificationsModal from '@/components/modals/NotificationsModal';
import CurrencyModal from '@/components/modals/CurrencyModal';
import TwoFactorAuthModal from '@/components/modals/TwoFactorAuthModal';
import EditProfileModal from '@/components/modals/EditProfileModal';
import { supabase } from '@/lib/customSupabaseClient';
import { useBilling } from '@/hooks/useBilling';

const ProfileSection = ({ title, children }) => (
  <div className="bg-white dark:bg-[#1a1a1a] rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden mb-6">
    <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
      <h3 className="font-bold text-[#1a1a1a] dark:text-white">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const ProfileRow = ({ icon: Icon, label, value, action, onClick }) => (
  <div 
    className={`flex items-center justify-between py-4 border-b border-gray-50 dark:border-white/5 last:border-0 ${
      onClick || action ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#6E6E73] dark:text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#6E6E73] dark:text-gray-400">{label}</p>
        <p className="text-base font-bold text-[#1a1a1a] dark:text-white">{value}</p>
      </div>
    </div>
    {action && (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="text-sm font-medium text-[#1C8FA0] hover:text-[#167a8a] transition-colors"
      >
        {action}
      </button>
    )}
  </div>
);

const Profile = () => {
  const { user, signOut } = useAuth();
  const { subscription } = useBilling(user?.id);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [currencyName, setCurrencyName] = useState('Dólar Estadounidense');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarStyle, setAvatarStyle] = useState({ fontStyle: 'bold', color: '#1C8FA0' });

  useEffect(() => {
    if (user?.id) {
      loadCurrency();
      loadAvatar();
    }
  }, [user?.id]);

  const loadAvatar = async () => {
    try {
      // Cargar foto de perfil si existe
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }

      // Cargar preferencias de avatar si es plan gratis
      const isFreePlan = !subscription || subscription?.plan === 'free';
      if (isFreePlan) {
        const { data } = await supabase
          .from('profile_preferences')
          .select('avatar_font_style, avatar_color')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setAvatarStyle({
            fontStyle: data.avatar_font_style || 'bold',
            color: data.avatar_color || '#1C8FA0',
          });
        }
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  const loadCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('currency')
        .eq('user_id', user.id)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.currency) {
        setCurrency(data.currency);
        const currencyNames = {
          'USD': 'Dólar Estadounidense',
          'EUR': 'Euro',
          'GBP': 'Libra Esterlina',
          'MXN': 'Peso Mexicano',
          'ARS': 'Peso Argentino',
          'CLP': 'Peso Chileno',
          'COP': 'Peso Colombiano',
          'PEN': 'Sol Peruano',
        };
        setCurrencyName(currencyNames[data.currency] || data.currency);
      } else {
        // Si no hay preferencias, usar el default
        setCurrency('USD');
        setCurrencyName('Dólar Estadounidense');
      }
    } catch (error) {
      console.error('Error loading currency:', error);
      // En caso de error, usar default
      setCurrency('USD');
      setCurrencyName('Dólar Estadounidense');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Mi Perfil</h1>
        <p className="text-[#6E6E73] dark:text-gray-400 mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main Info */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 border border-gray-100 dark:border-white/5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            {avatarUrl ? (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] p-[3px] shadow-xl shadow-[#1C8FA0]/20">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="w-24 h-24 rounded-full p-[3px] shadow-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${avatarStyle.color}, ${avatarStyle.color}dd)`,
                  boxShadow: `0 20px 40px -12px ${avatarStyle.color}33`
                }}
              >
                <div className="w-full h-full rounded-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                  <span 
                    className={`text-3xl ${
                      avatarStyle.fontStyle === 'bold' ? 'font-bold' :
                      avatarStyle.fontStyle === 'semibold' ? 'font-semibold' :
                      avatarStyle.fontStyle === 'medium' ? 'font-medium' :
                      avatarStyle.fontStyle === 'regular' ? 'font-normal' :
                      'font-light'
                    }`}
                    style={{ color: avatarStyle.color }}
                  >
                    {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
                </div>
              </div>
            )}
            <button 
              onClick={() => setEditProfileOpen(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#1a1a1a] shadow-md hover:scale-110 transition-transform"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-1">
              {user?.user_metadata?.full_name || 'Usuario Finantel'}
            </h2>
            <p className="text-[#6E6E73] dark:text-gray-400 mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 text-[#1C8FA0] dark:text-[#1C8FA0] text-xs font-bold border border-[#1C8FA0]/20 dark:border-[#1C8FA0]/30">
                Plan Pro
              </span>
              <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800/30">
                Verificado
              </span>
            </div>
          </div>

          <Button 
            onClick={signOut}
            variant="outline" 
            className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <ProfileSection title="Información Personal">
          <ProfileRow 
            icon={User} 
            label="Nombre Completo" 
            value={user?.user_metadata?.full_name || 'No definido'} 
            action="Editar"
            onClick={() => setEditProfileOpen(true)}
          />
          <ProfileRow 
            icon={Mail} 
            label="Correo Electrónico" 
            value={user?.email}
          />
          <ProfileRow 
            icon={Shield} 
            label="Contraseña" 
            value="••••••••••••" 
            action="Cambiar"
            onClick={() => setEditProfileOpen(true)}
          />
        </ProfileSection>

        <ProfileSection title="Preferencias">
          <div className="space-y-1">
            <button 
              onClick={() => setNotificationsOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 flex items-center justify-center text-[#6E6E73] dark:text-gray-400 transition-colors">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">Notificaciones</p>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400">Alertas de gastos y resumen semanal</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-[#1C8FA0] transition-colors" />
            </button>

            <button 
              onClick={() => setCurrencyOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
            >
                <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 flex items-center justify-center text-[#6E6E73] dark:text-gray-400 transition-colors">
                  <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                  <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">Moneda Principal</p>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400">{currency} - {currencyName}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-[#1C8FA0] transition-colors" />
            </button>

            <button 
              onClick={() => setTwoFactorOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 flex items-center justify-center text-[#6E6E73] dark:text-gray-400 transition-colors">
                  <Shield className="w-5 h-5" />
                  </div>
                <div className="text-left">
                  <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">Autenticación en 2 Pasos</p>
                  <p className="text-xs text-[#6E6E73] dark:text-gray-400">Mayor seguridad para tu cuenta</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-[#1C8FA0] transition-colors" />
              </button>
          </div>
        </ProfileSection>

        <NotificationsModal 
          isOpen={notificationsOpen} 
          onClose={() => {
            setNotificationsOpen(false);
            loadCurrency(); // Recargar en caso de cambios
          }} 
        />
        <CurrencyModal 
          isOpen={currencyOpen} 
          onClose={() => {
            setCurrencyOpen(false);
            loadCurrency(); // Recargar moneda actualizada
          }} 
        />
        <TwoFactorAuthModal 
          isOpen={twoFactorOpen} 
          onClose={() => setTwoFactorOpen(false)} 
        />
        <EditProfileModal 
          isOpen={editProfileOpen} 
          initialTab="profile"
          onClose={() => {
            setEditProfileOpen(false);
            loadAvatar(); // Recargar avatar después de editar
          }}
          onUpdate={() => {
            loadAvatar();
            loadCurrency();
            // Recargar usuario para obtener datos actualizados
            window.location.reload();
          }}
        />
      </motion.div>
    </div>
  );
};

export default Profile;
