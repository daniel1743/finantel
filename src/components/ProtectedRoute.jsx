
import React, { useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const ProtectedRoute = ({ children }) => {
  const { user, loading, session } = useAuth();
  const { isDemoMode } = useDemoMode();
  const location = useLocation();

  // Verificar si la sesión es válida
  useEffect(() => {
    const checkSession = async () => {
      if (session) {
        try {
          // Verificar si el token está expirado
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          
          // Si el token expira en menos de 5 minutos, refrescarlo
          if (expiresAt && (expiresAt - now) < 300) {
            console.log('🔄 Token próximo a expirar, refrescando...');
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              console.error('Error refreshing session:', error);
            }
          }
        } catch (err) {
          console.error('Error checking session:', err);
        }
      }
    };

    if (!loading && session) {
      checkSession();
    }
  }, [session, loading]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F5F7F9] dark:bg-[#0f0f11]">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/INANTEL.svg"
            alt="Finantel Logo"
            className="h-[55.2px] w-auto animate-pulse"
          />
          <Icon component={Loader2} size="lg" color="primary" className="animate-spin" />
          <p className="text-sm text-[#6E6E73]">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Permitir acceso si está en modo demo O si tiene usuario autenticado
  if (!user && !isDemoMode) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
