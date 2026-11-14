'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import type { UnitRow } from './types';

/**
 * Returns equipment units linked to `exerciseId`, and the last-used unit
 * for that exercise as the default selection.
 */
export function useEquipmentUnits(exerciseId: string | null) {
  const [units,          setUnits]          = useState<UnitRow[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) { setUnits([]); setSelectedUnitId(null); return; }

    const exId = exerciseId; // narrow to string for async closures
    let cancelled = false;

    async function init() {
      // Step 1 — get unit IDs linked to this exercise.
      const { data: links } = await supabase()
        .from('exercise_equipment')
        .select('equipment_unit_id')
        .eq('exercise_id', exId);

      if (cancelled || !links || links.length === 0) {
        if (!cancelled) { setUnits([]); setSelectedUnitId(null); }
        return;
      }

      const unitIds = links.map(l => l.equipment_unit_id);

      // Step 2 — fetch unit rows.
      const { data: unitRows } = await supabase()
        .from('equipment_units')
        .select('id, name, zone, kind')
        .in('id', unitIds)
        .order('name', { ascending: true });

      if (cancelled) return;

      const us: UnitRow[] = (unitRows ?? []).map(r => ({
        id:   r.id,
        name: r.name,
        zone: r.zone,
        kind: r.kind,
      }));
      setUnits(us);

      // Step 3 — default to the most recently used unit for this exercise.
      const { data: lastSet } = await supabase()
        .from('sets')
        .select('equipment_unit_id')
        .eq('exercise_id', exId)
        .not('equipment_unit_id', 'is', null)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setSelectedUnitId(lastSet?.equipment_unit_id ?? (us[0]?.id ?? null));
      }
    }

    init();
    return () => { cancelled = true; };
  }, [exerciseId]);

  return { units, selectedUnitId, setSelectedUnitId };
}
