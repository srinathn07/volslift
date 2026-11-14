'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import type { Tables } from '@/src/lib/types/db';

export function useSession() {
  const [session, setSession]   = useState<Tables<'sessions'> | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: { session: auth } } = await supabase().auth.getSession();
      if (!auth || cancelled) { setLoading(false); return; }

      const { data } = await supabase()
        .from('sessions')
        .select('*')
        .eq('user_id', auth.user.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setSession(data ?? null);
        setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  async function startSession(name: string): Promise<Tables<'sessions'> | null> {
    const { data: { session: auth } } = await supabase().auth.getSession();
    if (!auth) return null;

    const { data, error } = await supabase()
      .from('sessions')
      .insert({
        user_id:     auth.user.id,
        name,
        client_uuid: crypto.randomUUID(),
      })
      .select()
      .single();

    if (error || !data) return null;
    setSession(data);
    return data;
  }

  async function endSession(): Promise<void> {
    if (!session) return;
    const { error } = await supabase()
      .from('sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', session.id);
    if (!error) setSession(null);
  }

  return { session, loading, startSession, endSession };
}
