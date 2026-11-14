'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import { enqueueSet, getPendingSets, removeSyncedSet } from '@/src/lib/offline/queue';
import type { LocalSet } from './types';

type SyncStatus = 'idle' | 'syncing' | 'error';

export function useSetLogger(sessionId: string | null) {
  const [sets,       setSets]       = useState<LocalSet[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const inflightUuids               = useRef(new Set<string>());

  // Load all sets for the current session on mount / session change.
  useEffect(() => {
    if (!sessionId) { setSets([]); return; }
    let cancelled = false;

    supabase()
      .from('sets')
      .select('id, exercise_id, set_index, weight, reps, logged_at, client_uuid')
      .eq('session_id', sessionId)
      .order('logged_at', { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data) {
          setSets(data.map(r => ({
            id:          r.id,
            client_uuid: r.client_uuid,
            exercise_id: r.exercise_id,
            set_index:   r.set_index,
            weight:      Number(r.weight),
            reps:        r.reps,
            logged_at:   r.logged_at,
            synced:      true,
          })));
        }
      });

    return () => { cancelled = true; };
  }, [sessionId]);

  // Drain the offline queue — called on mount and on 'online' events.
  const syncQueue = useCallback(async () => {
    if (!sessionId) return;
    setSyncStatus('syncing');
    let anyError = false;

    try {
      const pending = await getPendingSets();
      for (const item of pending) {
        const { error } = await supabase()
          .from('sets')
          .upsert(
            {
              client_uuid:       item.client_uuid,
              session_id:        item.session_id,
              exercise_id:       item.exercise_id,
              equipment_unit_id: item.equipment_unit_id,
              set_index:         item.set_index,
              weight:            item.weight,
              reps:              item.reps,
              is_warmup:         item.is_warmup,
              logged_at:         item.logged_at,
            },
            { onConflict: 'client_uuid', ignoreDuplicates: true },
          );

        if (!error || error.code === '23505') {
          await removeSyncedSet(item.client_uuid);
          // Mark synced in local state.
          setSets(prev =>
            prev.map(s =>
              s.client_uuid === item.client_uuid ? { ...s, synced: true } : s,
            ),
          );
        } else {
          anyError = true;
        }
      }
    } catch {
      anyError = true;
    }

    setSyncStatus(anyError ? 'error' : 'idle');
  }, [sessionId]);

  useEffect(() => {
    syncQueue();
    window.addEventListener('online', syncQueue);
    return () => window.removeEventListener('online', syncQueue);
  }, [syncQueue]);

  /**
   * Log a set.  Optimistically adds to local state, then writes to Supabase.
   * Falls back to IndexedDB queue if offline.  Double-taps are blocked by
   * the in-flight set.
   */
  async function logSet(
    exerciseId:      string,
    weight:          number,
    reps:            number,
    equipmentUnitId: string | null,
  ): Promise<void> {
    if (!sessionId) return;

    const clientUuid = crypto.randomUUID();

    // Prevent double-taps on the exact same client_uuid.
    if (inflightUuids.current.has(clientUuid)) return;
    inflightUuids.current.add(clientUuid);

    const setIndex = sets.filter(s => s.exercise_id === exerciseId).length + 1;
    const loggedAt = new Date().toISOString();

    const local: LocalSet = {
      id:          clientUuid,  // placeholder until DB assigns real uuid
      client_uuid: clientUuid,
      exercise_id: exerciseId,
      set_index:   setIndex,
      weight,
      reps,
      logged_at:   loggedAt,
      synced:      false,
    };

    // Optimistic add.
    setSets(prev => [...prev, local]);

    const payload = {
      client_uuid:       clientUuid,
      session_id:        sessionId,
      exercise_id:       exerciseId,
      equipment_unit_id: equipmentUnitId,
      set_index:         setIndex,
      weight,
      reps,
      is_warmup:         false,
      logged_at:         loggedAt,
    };

    const { data, error } = await supabase()
      .from('sets')
      .upsert(payload, { onConflict: 'client_uuid', ignoreDuplicates: true })
      .select('id')
      .maybeSingle();

    inflightUuids.current.delete(clientUuid);

    if (!error) {
      // Replace placeholder id with real DB id.
      setSets(prev =>
        prev.map(s =>
          s.client_uuid === clientUuid
            ? { ...s, id: data?.id ?? s.id, synced: true }
            : s,
        ),
      );
    } else {
      // Network error → enqueue for later sync.
      await enqueueSet(payload);
      // Keep in local state as unsynced — it will sync when online.
    }
  }

  return { sets, logSet, syncStatus };
}
