import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/src/lib/types/db';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

// Singleton — one client per browser tab.
let _client: ReturnType<typeof createClient<Database>> | null = null;

export function supabase() {
  if (!_client) {
    _client = createClient<Database>(url, key);
  }
  return _client;
}
