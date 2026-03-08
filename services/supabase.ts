import { createClient } from '@supabase/supabase-js';

// Extremely defensive initialization to prevent Vercel blank pages due to missing env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('CRITICAL: Supabase environment variables are missing! The app will not function correctly. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your deployment settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
