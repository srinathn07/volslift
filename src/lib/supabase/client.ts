import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/src/lib/types/db';

// Singleton — one client per browser tab.
let _client: ReturnType<typeof createClient<Database>> | null = null;

export function supabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error(
        'Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local and restart the dev server.'
      );
    }
    _client = createClient<Database>(url, key);
  }
  return _client;
}
