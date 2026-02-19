
import { createClient } from '@supabase/supabase-js';

// Supabase Credentials
// We use a fallback to hardcoded values if env vars are missing to ensure the app runs immediately.
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://offjauimlpovzarkgabx.supabase.co';
const supabaseKey = env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZmphdWltbHBvdnphcmtnYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjMzMDAsImV4cCI6MjA4Njk5OTMwMH0.riLOANK8gBcy70tlOTd4KWsGpMRJbrnaPtO8_pTWPLk';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase Credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Exports required by App.tsx
export const isConfigured = true;

export const setupSupabase = (_url: string, _key: string) => {
  // No-op for hardcoded credentials
  console.log('Setup Supabase called');
};

export const disconnectSupabase = () => {
  // No-op for hardcoded credentials
  console.log('Disconnect Supabase called');
};
