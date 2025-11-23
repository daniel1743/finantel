
import React from 'react';
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

const ProfileSection = ({ title, children }) => (
  <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm overflow-hidden mb-6">
    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
      <h3 className="font-bold text-[#1a1a1a]">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const ProfileRow = ({ icon: Icon, label, value, action }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#6E6E73]">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#6E6E73]">{label}</p>
        <p className="text-base font-bold text-[#1a1a1a]">{value}</p>
      </div>
    </div>
    {action && (
      <button className="text-sm font-medium text-[#1C8FA0] hover:text-[#167a8a] transition-colors">
        {action}
      </button>
    )}
  </div>
);

const Profile = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Mi Perfil</h1>
        <p className="text-[#6E6E73] mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main Info */}
        <div className="bg-white rounded-[26px] p-8 border border-gray-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] p-[3px] shadow-xl shadow-[#1C8FA0]/20">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-bold text-[#1C8FA0]">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#1a1a1a] rounded-full text-white flex items-center justify-center border-2 border-white shadow-md hover:scale-110 transition-transform">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">
              {user?.user_metadata?.full_name || 'Usuario Finantel'}
            </h2>
            <p className="text-[#6E6E73] mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-[#1C8FA0]/10 text-[#1C8FA0] text-xs font-bold border border-[#1C8FA0]/20">
                Plan Pro
              </span>
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-100">
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
          <ProfileRow icon={User} label="Nombre Completo" value={user?.user_metadata?.full_name || 'No definido'} action="Editar" />
          <ProfileRow icon={Mail} label="Correo Electrónico" value={user?.email} />
          <ProfileRow icon={Shield} label="Contraseña" value="••••••••••••" action="Cambiar" />
        </ProfileSection>

        <ProfileSection title="Preferencias">
          <div className="space-y-1">
            {[
              { icon: Bell, label: "Notificaciones", desc: "Alertas de gastos y resumen semanal" },
              { icon: CreditCard, label: "Moneda Principal", desc: "USD - Dólar Estadounidense" },
              { icon: Shield, label: "Autenticación en 2 Pasos", desc: "Mayor seguridad para tu cuenta" }
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center text-[#6E6E73] transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#1a1a1a] text-sm">{item.label}</p>
                    <p className="text-xs text-[#6E6E73]">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1C8FA0] transition-colors" />
              </button>
            ))}
          </div>
        </ProfileSection>
      </motion.div>
    </div>
  );
};

export default Profile;
