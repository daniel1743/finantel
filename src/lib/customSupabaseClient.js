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
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ Token refrescado exitosamente');
  } else if (event === 'SIGNED_OUT') {
    console.log('👋 Usuario cerró sesión');
  }
});

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
