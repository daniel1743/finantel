import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
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
        if (event === 'TOKEN_REFRESHED') {
          handleSession(session);
        } else if (event === 'SIGNED_OUT') {
          handleSession(null);
        } else if (event === 'SIGNED_IN') {
          handleSession(session);
        } else if (event === 'INITIAL_SESSION') {
          // Manejar sesión inicial sin loguear
          handleSession(session);
        } else {
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
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }), [user, session, loading, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
