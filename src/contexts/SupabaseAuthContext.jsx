import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { setUserContext as setSentryUser } from '@/lib/sentry';
import { identifyUser, trackEvent, AnalyticsEvents, resetUser as resetAnalyticsUser } from '@/lib/analytics';
import appUpdateService from '@/lib/appUpdateService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    setLoading(false);
    
    // Actualizar contexto de Sentry y Analytics
    if (currentUser) {
      setSentryUser(currentUser);
      identifyUser(currentUser.id, {
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
      });
    } else {
      setSentryUser(null);
      resetAnalyticsUser();
    }
  }, []);

  // Función para refrescar el token automáticamente
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        // Si el refresh falla, limpiar la sesión
        if (error.message?.includes('exp') || error.message?.includes('Invalid')) {
          await supabase.auth.signOut();
          handleSession(null);
          toast({
            variant: "destructive",
            title: "Sesión Expirada",
            description: "Por favor, inicia sesión nuevamente.",
          });
        }
        return;
      }
      handleSession(session);
    } catch (err) {
      console.error('Error in refreshSession:', err);
      handleSession(null);
    }
  }, [handleSession, toast]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          // Si el token está expirado, intentar refrescar
          if (error.message?.includes('exp') || error.message?.includes('Invalid')) {
            await refreshSession();
            return;
          }
          handleSession(null);
          return;
        }
        handleSession(session);
      } catch (err) {
        console.error('Error in getSession:', err);
        handleSession(null);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Solo loguear eventos importantes, no INITIAL_SESSION
        if (event !== 'INITIAL_SESSION') {
          console.log('Auth state changed:', event, session?.user?.email);
        }
        
        // Manejar eventos específicos
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // USER_UPDATED se dispara cuando se actualiza el usuario con updateUser()
          handleSession(session);
        } else if (event === 'SIGNED_OUT') {
          handleSession(null);
        } else if (event === 'SIGNED_IN') {
          // Limpiar caché al iniciar sesión para asegurar que se vean los cambios
          appUpdateService.clearCache().then(() => {
            console.log('[Auth] Caché limpiado al iniciar sesión');
          }).catch((error) => {
            console.error('[Auth] Error limpiando caché:', error);
          });
          handleSession(session);
        } else if (event === 'INITIAL_SESSION') {
          // Manejar sesión inicial sin loguear
          handleSession(session);
        } else {
          // Para cualquier otro evento, actualizar la sesión
          handleSession(session);
        }
      }
    );

    // Configurar refresh automático del token cada 55 minutos (los tokens de Supabase duran 1 hora)
    const refreshInterval = setInterval(() => {
      if (session) {
        refreshSession();
      }
    }, 55 * 60 * 1000); // 55 minutos

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [handleSession, refreshSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Manejar errores específicos
        if (error.message?.includes('exp') || error.message?.includes('Invalid')) {
          toast({
            variant: "destructive",
            title: "Error de Autenticación",
            description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error al Iniciar Sesión",
            description: error.message || "Algo salió mal. Por favor, intenta de nuevo.",
          });
        }
        return { error };
      }

      // Si el login es exitoso, actualizar la sesión
      if (data?.session) {
        handleSession(data.session);
        // Track evento de login
        trackEvent(AnalyticsEvents.USER_LOGGED_IN, {
          method: 'email',
          timestamp: new Date().toISOString(),
        });
      }

      return { error: null, data };
    } catch (err) {
      console.error('Error in signIn:', err);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      });
      return { error: err };
    }
  }, [toast, handleSession]);

  const signOut = useCallback(async () => {
    // Track evento de logout antes de cerrar sesión
    trackEvent(AnalyticsEvents.USER_LOGGED_OUT);
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      // Limpiar contexto de Sentry y Analytics
      setSentryUser(null);
      resetAnalyticsUser();
    }

    return { error };
  }, [toast]);

  const refreshUser = useCallback(async () => {
    try {
      // Refrescar la sesión completa para obtener los datos actualizados
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        // Si falla el refresh, intentar obtener solo el usuario
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting user:', userError);
          return;
        }
        if (currentUser) {
          setUser(currentUser);
        }
        return;
      }

      // Si el refresh fue exitoso, actualizar con la nueva sesión
      if (refreshedSession) {
        handleSession(refreshedSession);
      }
    } catch (err) {
      console.error('Error in refreshUser:', err);
    }
  }, [handleSession]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
  }), [user, session, loading, signUp, signIn, signOut, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
