import type { User } from "@supabase/supabase-js";
import { getDb, markSynced, pendingRows } from "./db";
import { supabase } from "./supabase";

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

/**
 * Uploads any locally-completed workouts (endedAt set, syncedAt not set)
 * to Supabase.  Workouts are upserted before sets so the sets RLS policy
 * (which checks workout ownership) is satisfied.
 */
export async function pushPending(user: User): Promise<void> {
  const { workouts, sets } = await pendingRows();
  if (workouts.length === 0) return;

  const { error: wErr } = await supabase.from("workouts").upsert(
    workouts.map((w) => ({
      id: w.id,
      user_id: user.id,
      name: w.name,
      started_at: toIso(w.startedAt),
      ended_at: w.endedAt ? toIso(w.endedAt) : null,
      gym_id: null,
      routine_id: null,
    })),
    { onConflict: "id" },
  );
  if (wErr) throw new Error(wErr.message);

  if (sets.length > 0) {
    const { error: sErr } = await supabase.from("sets").upsert(
      sets.map((s) => ({
        client_id: s.clientId,
        workout_id: s.workoutId,
        exercise_id: s.exerciseId,
        set_index: s.setIndex,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe ?? null,
        done_at: s.doneAt ? toIso(s.doneAt) : null,
      })),
      { onConflict: "client_id" },
    );
    if (sErr) throw new Error(sErr.message);
  }

  await markSynced(workouts.map((w) => w.id));
}

/**
 * Fetches all completed workouts for the signed-in user from Supabase and
 * merges them into the local IndexedDB.  Runs on sign-in so a second device
 * immediately has the full history.
 */
export async function pullRemote(user: User): Promise<void> {
  const db = getDb();
  if (!db) return;

  const { data: workouts, error: wErr } = await supabase
    .from("workouts")
    .select("id, name, started_at, ended_at")
    .eq("user_id", user.id)
    .not("ended_at", "is", null);
  if (wErr) throw new Error(wErr.message);
  if (!workouts || workouts.length === 0) return;

  const { data: sets, error: sErr } = await supabase
    .from("sets")
    .select("client_id, workout_id, exercise_id, set_index, weight, reps, rpe, done_at")
    .in("workout_id", workouts.map((w) => w.id));
  if (sErr) throw new Error(sErr.message);

  await db.workouts.bulkPut(
    workouts.map((w) => ({
      id: w.id,
      gymId: "ut_rec",
      name: w.name,
      startedAt: new Date(w.started_at as string).getTime(),
      endedAt: new Date(w.ended_at as string).getTime(),
      syncedAt: Date.now(),
    })),
  );

  if (sets && sets.length > 0) {
    await db.sets.bulkPut(
      sets.map((s) => ({
        clientId: s.client_id as string,
        workoutId: s.workout_id as string,
        exerciseId: s.exercise_id as string,
        setIndex: s.set_index as number,
        weight: Number(s.weight),
        reps: Number(s.reps),
        rpe: s.rpe != null ? Number(s.rpe) : undefined,
        doneAt: s.done_at ? new Date(s.done_at as string).getTime() : undefined,
      })),
    );
  }
}
