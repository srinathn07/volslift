import Dexie, { type Table } from "dexie";
import type { SessionSummary, SetEntry, Workout } from "./types";

export interface BodyMetricRow {
  id: string;
  measuredAt: number;
  weight: number;
  syncedAt?: number;
}

class VolFitDb extends Dexie {
  workouts!: Table<Workout, string>;
  sets!: Table<SetEntry, string>;
  metrics!: Table<BodyMetricRow, string>;

  constructor() {
    super("volfit");
    this.version(1).stores({
      workouts: "id, startedAt, endedAt, syncedAt",
      sets: "clientId, workoutId, exerciseId, [workoutId+exerciseId], doneAt",
      metrics: "id, measuredAt, syncedAt",
    });
  }
}

let instance: VolFitDb | null = null;

export function getDb(): VolFitDb | null {
  if (typeof window === "undefined") return null;
  if (!instance) instance = new VolFitDb();
  return instance;
}

export async function saveWorkout(workout: Workout): Promise<void> {
  await getDb()?.workouts.put(workout);
}

export async function saveSets(sets: SetEntry[]): Promise<void> {
  if (sets.length === 0) return;
  await getDb()?.sets.bulkPut(sets);
}

export async function loadActiveWorkout(): Promise<Workout | null> {
  const db = getDb();
  if (!db) return null;
  const open = await db.workouts.filter((w) => !w.endedAt).toArray();
  if (open.length === 0) return null;
  return open.sort((a, b) => b.startedAt - a.startedAt)[0];
}

export async function loadSets(workoutId: string): Promise<SetEntry[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.sets.where("workoutId").equals(workoutId).toArray();
  return rows.sort((a, b) => a.setIndex - b.setIndex);
}

/**
 * Builds SessionSummary[] from all completed workouts in IndexedDB.
 * Only includes sets that were marked done (doneAt set).
 */
export async function loadHistory(): Promise<SessionSummary[]> {
  const db = getDb();
  if (!db) return [];

  const workouts = await db.workouts.filter((w) => Boolean(w.endedAt)).toArray();
  if (workouts.length === 0) return [];

  const summaries: SessionSummary[] = [];

  for (const workout of workouts) {
    const sets = await db.sets.where("workoutId").equals(workout.id).toArray();
    const done = sets.filter((s) => Boolean(s.doneAt));

    const byExercise = new Map<string, SetEntry[]>();
    for (const s of done) {
      const list = byExercise.get(s.exerciseId) ?? [];
      list.push(s);
      byExercise.set(s.exerciseId, list);
    }

    for (const [exerciseId, exSets] of byExercise) {
      const ordered = exSets.sort((a, b) => a.setIndex - b.setIndex);
      summaries.push({
        exerciseId,
        performedAt: workout.startedAt,
        // Carried from the routine when there was one. Zero means unknown, and
        // suggestProgression refuses to progress on an unknown target.
        repTarget: ordered.find((s) => typeof s.repTarget === "number")?.repTarget ?? 0,
        sets: ordered.map((s) => ({ weight: s.weight, reps: s.reps, rpe: s.rpe })),
      });
    }
  }

  return summaries.sort((a, b) => b.performedAt - a.performedAt);
}

export async function pendingRows(): Promise<{ workouts: Workout[]; sets: SetEntry[] }> {
  const db = getDb();
  if (!db) return { workouts: [], sets: [] };
  const workouts = await db.workouts.filter((w) => Boolean(w.endedAt) && !w.syncedAt).toArray();
  const ids = new Set(workouts.map((w) => w.id));
  const sets = await db.sets.filter((s) => ids.has(s.workoutId)).toArray();
  return { workouts, sets };
}

export async function markSynced(workoutIds: string[]): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.workouts.where("id").anyOf(workoutIds).modify({ syncedAt: Date.now() });
}

export async function clearAll(): Promise<void> {
  const db = getDb();
  if (!db) return;
  await Promise.all([db.workouts.clear(), db.sets.clear(), db.metrics.clear()]);
}
