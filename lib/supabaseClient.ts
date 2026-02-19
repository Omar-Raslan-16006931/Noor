import { createClient } from '@supabase/supabase-js';

// 1. Load Variables from the Environment (Vercel or .env.local)
// Note: We use 'import.meta.env' because this is likely a Vite project.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// 2. Safety Check: Prevent the app from crashing silently if keys are missing
if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Supabase environment variables are missing.");
  throw new Error('Missing Supabase Credentials. Check your .env.local file or Vercel Dashboard.');
}

// 3. Initialize the Client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Exports required by App.tsx
export const isConfigured = true;

export const setupSupabase = (_url: string, _key: string) => {
  console.log('Supabase is configured via Environment Variables.');
};

export const disconnectSupabase = () => {
  console.log('Disconnect Supabase called (No-op for Env auth)');
};
