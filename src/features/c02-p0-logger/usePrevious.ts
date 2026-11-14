'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import type { PrevSet } from './types';

/**
 * Fetches the most recent session's sets for a given exercise,
 * excluding the current session.  Used to prefill the pending set.
 */
export function usePrevious(
  exerciseId:       string | null,
  currentSessionId: string | null,
) {
  const [prevSets, setPrevSets] = useState<PrevSet[]>([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!exerciseId) { setPrevSets([]); return; }

    const exId   = exerciseId;         // narrow to string for async closures
    const sessId = currentSessionId ?? '';

    let cancelled = false;
    setLoading(true);

    async function fetch() {
      // Step 1 — find the most recent logged_at for this exercise outside current session.
      const { data: anchor } = await supabase()
        .from('sets')
        .select('session_id')
        .eq('exercise_id', exId)
        .neq('session_id', sessId)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (!anchor) { setPrevSets([]); setLoading(false); return; }

      // Step 2 — fetch all sets from that session for this exercise.
      const { data: rows } = await supabase()
        .from('sets')
        .select('set_index, weight, reps')
        .eq('session_id', anchor.session_id)
        .eq('exercise_id', exId)
        .order('set_index', { ascending: true });

      if (!cancelled) {
        setPrevSets(
          (rows ?? []).map(r => ({
            set_index: r.set_index,
            weight:    Number(r.weight),
            reps:      r.reps,
          })),
        );
        setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [exerciseId, currentSessionId]);

  return { prevSets, loading };
}

/**
 * Returns the previous set that corresponds to `setIndex`, or the last
 * previous set when there is no exact match (carry-forward for extra sets).
 * Returns null when there is no previous data at all.
 */
export function getPrevForIndex(prevSets: PrevSet[], setIndex: number): PrevSet | null {
  if (prevSets.length === 0) return null;
  return (
    prevSets.find(p => p.set_index === setIndex) ??
    prevSets[prevSets.length - 1]
  );
}
