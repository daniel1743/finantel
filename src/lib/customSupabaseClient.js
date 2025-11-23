import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhiqfsikextxysoedssz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaXFmc2lrZXh0eHlzb2Vkc3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTQ4MzYsImV4cCI6MjA3OTE3MDgzNn0.ZA9OpRzCQQ2UKrtO2LRLrxmvG7WHxqzYzUSbZH2Jwz8';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
