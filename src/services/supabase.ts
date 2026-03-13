import { createClient } from '@supabase/supabase-js';

// Extremely robust initialization to prevent blank pages due to missing env vars
const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('https://')) {
    return { url, key };
  }

  console.error('CRITICAL: Supabase credentials missing or invalid in Environment Variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your deployment settings.');

  // Return valid-format placeholder to prevent Uncaught Error: supabaseUrl is required
  return {
    url: 'https://placeholder-project-id.supabase.co',
    key: 'placeholder-key'
  };
};

const config = getSupabaseConfig();
export const supabase = createClient(config.url, config.key);
