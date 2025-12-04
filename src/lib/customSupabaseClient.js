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

// ✅ Storage Adapter Dinámico para "Mantener Sesión Activa"
// Usa localStorage cuando rememberMe=true, sessionStorage cuando rememberMe=false
const createDynamicStorage = () => {
  return {
    getItem: (key) => {
      // Primero intentar localStorage, luego sessionStorage
      return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    },
    setItem: (key, value) => {
      // Verificar preferencia de "mantener sesión"
      const rememberMe = window.localStorage.getItem('finantel_remember_me') !== 'false';

      if (rememberMe) {
        // Persistir en localStorage (permanente)
        window.localStorage.setItem(key, value);
        // Limpiar de sessionStorage si existe
        window.sessionStorage.removeItem(key);
      } else {
        // Usar sessionStorage (se borra al cerrar pestaña)
        window.sessionStorage.setItem(key, value);
        // Limpiar de localStorage si existe
        window.localStorage.removeItem(key);
      }
    },
    removeItem: (key) => {
      // Remover de ambos storages
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    },
  };
};

// Configurar cliente con opciones para manejo de tokens
const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Refrescar tokens automáticamente
    persistSession: true, // Persistir sesión
    detectSessionInUrl: true, // Detectar sesión en URL (para callbacks)
    storage: createDynamicStorage(), // ✅ Usar storage dinámico
    flowType: 'pkce', // Usar PKCE flow para mejor seguridad
  },
  realtime: {
    // Deshabilitar Realtime en desarrollo si no se usa
    // Esto evita errores de conexión WebSocket a localhost:3001
    ...(import.meta.env.DEV ? {
      // En desarrollo, deshabilitar Realtime si no es necesario
      // Comentar la siguiente línea si necesitas Realtime en desarrollo
      // params: { eventsPerSecond: 10 },
    } : {
      params: {
        eventsPerSecond: 10, // Limitar eventos por segundo
      },
    }),
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

// Interceptor global para suprimir errores esperados de refresh token y conexión en la consola
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Filtrar errores esperados de refresh token
    const errorMessage = args[0]?.message || args[0]?.toString() || '';
    const errorString = JSON.stringify(args);
    
    const isInvalidRefreshTokenError = 
      errorMessage.includes('Invalid Refresh Token') ||
      errorMessage.includes('Refresh Token Not Found') ||
      (args[0]?.name === 'AuthApiError' && errorMessage.includes('refresh'));
    
    // Filtrar errores de conexión WebSocket en desarrollo (localhost:3001)
    const isWebSocketConnectionError = 
      errorString.includes('localhost:3001') ||
      errorString.includes('ERR_CONNECTION_REFUSED') ||
      errorString.includes('Failed to fetch') && errorString.includes('localhost:3001');
    
    // Filtrar errores de DNS de Supabase (ERR_NAME_NOT_RESOLVED)
    const isSupabaseDNSError = 
      errorString.includes('ERR_NAME_NOT_RESOLVED') ||
      (errorMessage.includes('Failed to fetch') && errorString.includes('supabase.co'));
    
    // Solo suprimir en desarrollo si son errores esperados
    if (import.meta.env.DEV) {
      if (isWebSocketConnectionError || isSupabaseDNSError) {
        // No mostrar errores de conexión WebSocket/DNS en desarrollo
        // Estos son esperados cuando Realtime no está configurado o hay problemas de red
        return;
      }
    }
    
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
