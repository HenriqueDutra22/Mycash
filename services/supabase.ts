
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔌 Supabase Client Init:');
console.log('   URL:', supabaseUrl ? 'Set ✅' : 'Missing ❌', supabaseUrl);
console.log('   KEY:', supabaseAnonKey ? 'Set ✅' : 'Missing ❌');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('🚨 CRITICAL: Supabase credentials are missing. Check .env.local');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);