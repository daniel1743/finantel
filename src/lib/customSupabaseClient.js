import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - DEBE estar en variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Variables de entorno de Supabase no configuradas');
  console.error('Por favor, crea un archivo .env con:');
  console.error('VITE_SUPABASE_URL=tu_url_de_supabase');
  console.error('VITE_SUPABASE_ANON_KEY=tu_anon_key');
  throw new Error('Variables de entorno de Supabase no configuradas. Por favor, crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

// Configurar cliente con opciones para manejo de tokens
const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Refrescar tokens automáticamente
    persistSession: true, // Persistir sesión en localStorage
    detectSessionInUrl: true, // Detectar sesión en URL (para callbacks)
    storage: window.localStorage, // Usar localStorage para persistencia
    flowType: 'pkce', // Usar PKCE flow para mejor seguridad
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limitar eventos por segundo
    },
  },
  global: {
    headers: {
      'x-client-info': 'finantel-web@2.1',
    },
  },
});

// Interceptor para manejar errores de token expirado
customSupabaseClient.auth.onAuthStateChange((event, session) => {
  // Solo loguear eventos importantes en desarrollo
  if (import.meta.env.MODE === 'development') {
    if (event === 'TOKEN_REFRESHED') {
      console.log('✅ Token refrescado exitosamente');
    } else if (event === 'SIGNED_OUT') {
      console.log('👋 Usuario cerró sesión');
    }
  }
  
  // Manejar errores de refresh token silenciosamente
  if (event === 'TOKEN_REFRESHED' && !session) {
    // Token refresh falló, limpiar sesión
    customSupabaseClient.auth.signOut().catch(() => {
      // Ignorar errores al cerrar sesión
    });
  }
});

// Interceptor global para suprimir errores esperados de refresh token en la consola
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Filtrar errores esperados de refresh token
    const errorMessage = args[0]?.message || args[0]?.toString() || '';
    const isInvalidRefreshTokenError = 
      errorMessage.includes('Invalid Refresh Token') ||
      errorMessage.includes('Refresh Token Not Found') ||
      (args[0]?.name === 'AuthApiError' && errorMessage.includes('refresh'));
    
    // Solo suprimir en producción o si es un error esperado de refresh token
    if (isInvalidRefreshTokenError && import.meta.env.MODE === 'production') {
      // No mostrar el error en producción, es esperado cuando no hay sesión válida
      return;
    }
    
    // Mostrar otros errores normalmente
    originalConsoleError.apply(console, args);
  };
}

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
