import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los parámetros de la URL (hash o query params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Verificar si hay un error en la URL
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        if (errorParam) {
          setError(errorDescription || errorParam);
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
          return;
        }

        // Obtener la sesión del hash de la URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // Sesión exitosa, redirigir al dashboard
          trackEvent(AnalyticsEvents.USER_LOGGED_IN, {
            method: 'google',
            timestamp: new Date().toISOString(),
          });
          
          // Redirigir al dashboard
          navigate('/dashboard', { replace: true });
        } else {
          // No hay sesión, redirigir al login
          setError('No se pudo iniciar sesión. Por favor, intenta de nuevo.');
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
        }
      } catch (err) {
        console.error('Error en callback de autenticación:', err);
        setError(err.message || 'Ocurrió un error al iniciar sesión');
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7F9] p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Error al iniciar sesión</h2>
          <p className="text-[#6E6E73] mb-4">{error}</p>
          <p className="text-sm text-[#6E6E73]">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F9]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#1C8FA0] animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Completando inicio de sesión...</h2>
        <p className="text-[#6E6E73]">Por favor espera mientras te redirigimos</p>
      </div>
    </div>
  );
};

export default AuthCallback;

