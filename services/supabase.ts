import { createClient } from '@supabase/supabase-js';

// Extremely robust initialization to prevent blank pages
const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('https://')) {
    return { url, key };
  }

  console.error('Supabase credentials missing or invalid in Environment Variables.');
  // Return a valid-format fallback to prevent 'supabaseUrl is required' exception
  return {
    url: 'https://placeholder-project-id.supabase.co',
    key: 'placeholder-key'
  };
};

const config = getSupabaseConfig();
export const supabase = createClient(config.url, config.key);
