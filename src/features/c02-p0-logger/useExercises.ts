'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import type { ExerciseRow } from './types';

export function useExercises() {
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // All exercises (world-readable, ~76 rows — load once).
      const { data: exRows } = await supabase()
        .from('exercises')
        .select('id, name, equipment_class, is_unit_bound, default_rest_seconds, axial_load')
        .order('name', { ascending: true });

      if (cancelled) return;

      setExercises(
        (exRows ?? []).map(r => ({
          id:                   r.id,
          name:                 r.name,
          equipment_class:      r.equipment_class,
          is_unit_bound:        r.is_unit_bound,
          default_rest_seconds: r.default_rest_seconds,
          axial_load:           r.axial_load,
        })),
      );

      // Recents — last 3 unique exercise IDs across all user sessions.
      const { data: recentSets } = await supabase()
        .from('sets')
        .select('exercise_id, logged_at')
        .order('logged_at', { ascending: false })
        .limit(50);

      if (!cancelled && recentSets) {
        const seen = new Set<string>();
        const ids: string[] = [];
        for (const s of recentSets) {
          if (!seen.has(s.exercise_id)) {
            seen.add(s.exercise_id);
            ids.push(s.exercise_id);
            if (ids.length >= 3) break;
          }
        }
        setRecentIds(ids);
      }

      if (!cancelled) setLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return exercises;
    const q = search.toLowerCase();
    return exercises.filter(e => e.name.toLowerCase().includes(q));
  }, [exercises, search]);

  return { exercises, filtered, recentIds, search, setSearch, loading };
}
