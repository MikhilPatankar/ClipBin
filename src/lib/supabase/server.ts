import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export function getEnvValue(key: string): string {
  let val = process.env[key];
  if (!val || val.includes('placeholder')) {
    try {
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
        if (match && match[1]) {
          val = match[1].trim();
        }
      }
    } catch {
      // ignore file read error
    }
  }
  return val || '';
}

export function getServiceSupabase() {
  const supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey =
    getEnvValue('SUPABASE_SERVICE_ROLE_KEY') || getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          cache: 'no-store',
        });
      },
    },
  });
}
