import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';

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

  // Usar refs para evitar loops infinitos
  const sessionRef = useRef(null);
  const userRef = useRef(null);
  const isInitializingRef = useRef(true);

  const handleSession = useCallback(async (newSession) => {
    // Evitar actualizaciones innecesarias comparando con la sesión actual
    const currentSessionId = sessionRef.current?.user?.id;
    const newSessionId = newSession?.user?.id;
    
    // Si la sesión no ha cambiado realmente, no hacer nada
    if (currentSessionId === newSessionId && sessionRef.current !== null && newSession === null) {
      // Solo actualizar si realmente cambió de null a null (ya está manejado)
      return;
    }
    
    // Si ambos son null y ya procesamos la inicialización, no hacer nada
    if (!currentSessionId && !newSessionId && !isInitializingRef.current) {
      return;
    }
    
    // Actualizar refs
    sessionRef.current = newSession;
    userRef.current = newSession?.user ?? null;
    
    setSession(newSession);
    const currentUser = newSession?.user ?? null;
    setUser(currentUser);
    setLoading(false);
    
    // Actualizar contexto de Sentry y Analytics solo si cambió el usuario
    if (currentUser && currentUser.id !== currentSessionId) {
      setSentryUser(currentUser);
      identifyUser(currentUser.id, {
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
      });
    } else if (!currentUser && currentSessionId) {
      setSentryUser(null);
      resetAnalyticsUser();
    }
    
    isInitializingRef.current = false;
  }, []);

  // Función para refrescar el token automáticamente
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        // Solo loguear errores que no sean de token inválido (esperados)
        const isInvalidTokenError = 
          error.message?.includes('Invalid Refresh Token') ||
          error.message?.includes('Refresh Token Not Found') ||
          error.message?.includes('exp') ||
          error.message?.includes('Invalid');
        
        if (!isInvalidTokenError) {
        console.error('Error refreshing session:', error);
        }
        
        // Si el refresh falla, limpiar la sesión silenciosamente
        if (isInvalidTokenError) {
          // Limpiar tokens inválidos sin mostrar error al usuario
          await supabase.auth.signOut();
          handleSession(null);
          // Solo mostrar toast si el usuario estaba autenticado
          if (userRef.current) {
          toast({
            variant: "destructive",
            title: "Sesión Expirada",
            description: "Por favor, inicia sesión nuevamente.",
          });
          }
        }
        return;
      }
      handleSession(session);
    } catch (err) {
      // Solo loguear errores inesperados
      const isInvalidTokenError = 
        err.message?.includes('Invalid Refresh Token') ||
        err.message?.includes('Refresh Token Not Found');
      
      if (!isInvalidTokenError) {
      console.error('Error in refreshSession:', err);
      }
      handleSession(null);
    }
  }, [handleSession, toast]);

  useEffect(() => {
    let mounted = true;
    
    const getSession = async () => {
      try {
        // Verificar preferencia de "mantener sesión" al cargar
        const rememberMePreference = localStorage.getItem('finantel_remember_me');
        const rememberMe = rememberMePreference === null || rememberMePreference === 'true';
        
        if (rememberMe) {
          console.log('🔐 [Auth] Preferencia "Mantener sesión": ACTIVADA - Buscando sesión en localStorage');
        } else {
          console.log('🔐 [Auth] Preferencia "Mantener sesión": DESACTIVADA - Buscando sesión en sessionStorage');
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          // Solo loguear errores que no sean de token inválido (esperados)
          const isInvalidTokenError = 
            error.message?.includes('Invalid Refresh Token') ||
            error.message?.includes('Refresh Token Not Found') ||
            error.message?.includes('exp') ||
            error.message?.includes('Invalid');
          
          if (!isInvalidTokenError) {
          console.error('Error getting session:', error);
          }
          
          // Si el token está expirado, intentar refrescar
          if (isInvalidTokenError) {
            await refreshSession();
            return;
          }
          handleSession(null);
          return;
        }
        
        if (session) {
          console.log('✅ [Auth] Sesión encontrada:', session.user?.email);
        } else {
          console.log('ℹ️ [Auth] No hay sesión activa');
        }
        
        handleSession(session);
      } catch (err) {
        if (!mounted) return;
        
        // Solo loguear errores inesperados
        const isInvalidTokenError = 
          err.message?.includes('Invalid Refresh Token') ||
          err.message?.includes('Refresh Token Not Found');
        
        if (!isInvalidTokenError) {
        console.error('Error in getSession:', err);
        }
        handleSession(null);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        // Solo loguear eventos importantes, no INITIAL_SESSION
        if (event !== 'INITIAL_SESSION') {
          console.log('Auth state changed:', event, newSession?.user?.email);
        }
        
        // Evitar procesar INITIAL_SESSION múltiples veces
        if (event === 'INITIAL_SESSION' && !isInitializingRef.current) {
          return;
        }
        
        // Manejar eventos específicos
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // USER_UPDATED se dispara cuando se actualiza el usuario con updateUser()
          handleSession(newSession);
        } else if (event === 'SIGNED_OUT') {
          handleSession(null);
        } else if (event === 'SIGNED_IN') {
          // Limpiar caché al iniciar sesión para asegurar que se vean los cambios
          appUpdateService.clearCache().then(() => {
            console.log('[Auth] Caché limpiado al iniciar sesión');
          }).catch((error) => {
            console.error('[Auth] Error limpiando caché:', error);
          });
          handleSession(newSession);
          
          // Track evento de login (puede ser email o OAuth)
          const authMethod = newSession?.user?.app_metadata?.provider || 'email';
          trackEvent(AnalyticsEvents.USER_LOGGED_IN, {
            method: authMethod,
            timestamp: new Date().toISOString(),
          });
        } else if (event === 'INITIAL_SESSION') {
          // Manejar sesión inicial solo una vez
          isInitializingRef.current = true;
          handleSession(newSession);
        } else {
          // Para cualquier otro evento, actualizar la sesión
          handleSession(newSession);
        }
      }
    );

    // Configurar refresh automático del token cada 55 minutos (los tokens de Supabase duran 1 hora)
    const refreshInterval = setInterval(() => {
      if (sessionRef.current) {
        refreshSession();
      }
    }, 55 * 60 * 1000); // 55 minutos

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []); // Sin dependencias para evitar loops

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

  const signIn = useCallback(async (email, password, rememberMe = true) => {
    try {
      // ✅ CRÍTICO: Guardar preferencia de "recordar sesión" ANTES de iniciar sesión
      // Esto es esencial para que el storage adapter sepa dónde guardar la sesión
      localStorage.setItem('finantel_remember_me', rememberMe ? 'true' : 'false');
      
      // Si rememberMe es false, limpiar cualquier sesión previa en localStorage
      if (!rememberMe) {
        // Limpiar tokens de Supabase de localStorage antes de iniciar sesión
        const supabaseKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase')
        );
        supabaseKeys.forEach(key => localStorage.removeItem(key));
      } else {
        // Si rememberMe es true, limpiar cualquier sesión en sessionStorage
        const supabaseKeys = Object.keys(sessionStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase')
        );
        supabaseKeys.forEach(key => sessionStorage.removeItem(key));
      }

      console.log(`🔐 [Auth] Iniciando sesión con "Mantener sesión": ${rememberMe ? 'SÍ (localStorage - persistente)' : 'NO (sessionStorage - se borrará al cerrar pestaña)'}`);

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

  const signInWithGoogle = useCallback(async (rememberMe = true) => {
    try {
      // ✅ Guardar preferencia de "recordar sesión" ANTES de iniciar sesión
      localStorage.setItem('finantel_remember_me', rememberMe ? 'true' : 'false');

      console.log(`🔐 Iniciando sesión con Google - "Mantener sesión": ${rememberMe ? 'SÍ (localStorage)' : 'NO (sessionStorage - se borrará al cerrar)'}`);

      // Obtener la URL actual para redirección
      const redirectTo = `${window.location.origin}/auth/callback`;

      console.log('[Auth] URL de redirección:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error al Iniciar Sesión con Google",
          description: error.message || "No se pudo conectar con Google. Por favor, intenta de nuevo.",
        });
        return { error };
      }

      // La redirección se manejará automáticamente
      // El callback URL manejará el resto
      return { error: null, data };
    } catch (err) {
      console.error('Error in signInWithGoogle:', err);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudo conectar con Google. Verifica tu conexión a internet.",
      });
      return { error: err };
    }
  }, [toast]);

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
    signInWithGoogle,
    signOut,
    refreshUser,
  }), [user, session, loading, signUp, signIn, signInWithGoogle, signOut, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
