import { createClient } from '@supabase/supabase-js';

// Nueva base de datos Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yzakmqxbzwzbsdsadzej.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWttcXhiend6YnNkc2FkemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTEzMTYsImV4cCI6MjA3OTQ4NzMxNn0.b_Y7BDr56MeaE_3x4rIYwWn_GG7RM_SOvB-7y5Gvjx4';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
