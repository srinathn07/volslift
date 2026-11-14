import type { User } from "@supabase/supabase-js";
import { getDb, markSynced, pendingRows } from "./db";
import { supabase } from "./supabase";

// Actual Supabase table/column names (differ from local IndexedDB schema):
//   workouts        → sessions
//   sets.client_id  → sets.client_uuid
//   sets.workout_id → sets.session_id
//   sets.done_at    → sets.logged_at

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

/**
 * Uploads locally-completed workouts (endedAt set, syncedAt not set) to
 * Supabase.  Sessions are upserted before sets so the sets RLS policy
 * (which checks session ownership) is satisfied.
 */
export async function pushPending(user: User): Promise<void> {
  const { workouts, sets } = await pendingRows();
  if (workouts.length === 0) return;

  const { error: wErr } = await supabase.from("sessions").upsert(
    workouts.map((w) => ({
      id: w.id,
      user_id: user.id,
      name: w.name,
      started_at: toIso(w.startedAt),
      ended_at: w.endedAt ? toIso(w.endedAt) : null,
    })),
    { onConflict: "id" },
  );
  if (wErr) throw new Error(wErr.message);

  if (sets.length > 0) {
    const { error: sErr } = await supabase.from("sets").upsert(
      sets.map((s) => ({
        client_uuid: s.clientId,
        session_id: s.workoutId,
        exercise_id: s.exerciseId,
        set_index: s.setIndex,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe ?? null,
        is_warmup: false,
        logged_at: s.doneAt ? toIso(s.doneAt) : null,
      })),
      { onConflict: "client_uuid" },
    );
    if (sErr) throw new Error(sErr.message);
  }

  await markSynced(workouts.map((w) => w.id));
}

/**
 * Fetches all completed sessions for the signed-in user from Supabase and
 * merges them into local IndexedDB.  Runs on sign-in so a new device
 * immediately has the full history.
 */
export async function pullRemote(user: User): Promise<void> {
  const db = getDb();
  if (!db) return;

  const { data: sessions, error: wErr } = await supabase
    .from("sessions")
    .select("id, name, started_at, ended_at")
    .eq("user_id", user.id)
    .not("ended_at", "is", null);
  if (wErr) throw new Error(wErr.message);
  if (!sessions || sessions.length === 0) return;

  const { data: sets, error: sErr } = await supabase
    .from("sets")
    .select("client_uuid, session_id, exercise_id, set_index, weight, reps, rpe, logged_at")
    .in("session_id", sessions.map((s) => s.id));
  if (sErr) throw new Error(sErr.message);

  await db.workouts.bulkPut(
    sessions.map((s) => ({
      id: s.id,
      gymId: "ut_rec",
      name: s.name,
      startedAt: new Date(s.started_at as string).getTime(),
      endedAt: new Date(s.ended_at as string).getTime(),
      syncedAt: Date.now(),
    })),
  );

  if (sets && sets.length > 0) {
    await db.sets.bulkPut(
      sets.map((s) => ({
        clientId: s.client_uuid as string,
        workoutId: s.session_id as string,
        exerciseId: s.exercise_id as string,
        setIndex: s.set_index as number,
        weight: Number(s.weight),
        reps: Number(s.reps),
        rpe: s.rpe != null ? Number(s.rpe) : undefined,
        doneAt: s.logged_at ? new Date(s.logged_at as string).getTime() : undefined,
      })),
    );
  }
}
