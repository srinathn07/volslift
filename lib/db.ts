import Dexie, { type Table } from "dexie";
import type { SetEntry, Workout } from "./types";

/**
 * Local-first storage. Gyms have bad signal and a set must never be lost
 * because a fetch failed, so every write lands in IndexedDB first and sync
 * pushes rows up later keyed by clientId.
 */
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

/** Returns null during SSR, where IndexedDB does not exist. */
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
 * Rows the server has not acknowledged. The caller posts these and calls
 * markSynced on success, so a failed push simply retries next time.
 */
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
  const now = Date.now();
  await db.workouts.where("id").anyOf(workoutIds).modify({ syncedAt: now });
}

export async function clearAll(): Promise<void> {
  const db = getDb();
  if (!db) return;
  await Promise.all([db.workouts.clear(), db.sets.clear(), db.metrics.clear()]);
}
