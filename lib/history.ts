/**
 * In-memory history cache.
 *
 * The store populates this once on mount (and again after each finished
 * workout) by calling populateHistory(). Every synchronous consumer —
 * historyFor(), allHistory(), trainedDays() — reads from the cache so they
 * never need async/await.
 *
 * SEED_HISTORY provides a realistic baseline so charts and coach cards have
 * something to render before the user has logged any real workouts. Real rows
 * are merged on top; seed rows are dropped whenever a real row exists for the
 * same exercise on the same calendar day.
 */
import type { SessionSummary } from "./types";

function daysAgo(n: number): number {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

// 4 weeks of push/pull/legs, 3×/week.  repTarget left 0 — History and
// Progress only need weight, reps, and dates.
const SEED_HISTORY: SessionSummary[] = [
  // ── week 4 (oldest) ─────────────────────────────────────────────────────
  { exerciseId: "bench_press",        performedAt: daysAgo(27), repTarget: 0, sets: [{ weight: 115, reps: 8 }, { weight: 115, reps: 8 }, { weight: 115, reps: 7 }] },
  { exerciseId: "overhead_press",     performedAt: daysAgo(27), repTarget: 0, sets: [{ weight: 75,  reps: 8 }, { weight: 75,  reps: 7 }, { weight: 75,  reps: 7 }] },
  { exerciseId: "triceps_pushdown",   performedAt: daysAgo(27), repTarget: 0, sets: [{ weight: 50,  reps: 12 }, { weight: 50, reps: 11 }, { weight: 50, reps: 10 }] },

  { exerciseId: "pullup",             performedAt: daysAgo(25), repTarget: 0, sets: [{ weight: 0,   reps: 7 }, { weight: 0,  reps: 6 }, { weight: 0,  reps: 5 }] },
  { exerciseId: "barbell_row",        performedAt: daysAgo(25), repTarget: 0, sets: [{ weight: 115, reps: 8 }, { weight: 115, reps: 8 }, { weight: 115, reps: 7 }] },
  { exerciseId: "ez_curl",            performedAt: daysAgo(25), repTarget: 0, sets: [{ weight: 55,  reps: 10 }, { weight: 55, reps: 10 }, { weight: 55, reps: 9 }] },

  { exerciseId: "back_squat",         performedAt: daysAgo(23), repTarget: 0, sets: [{ weight: 135, reps: 6 }, { weight: 135, reps: 6 }, { weight: 135, reps: 5 }] },
  { exerciseId: "romanian_deadlift",  performedAt: daysAgo(23), repTarget: 0, sets: [{ weight: 115, reps: 8 }, { weight: 115, reps: 8 }, { weight: 115, reps: 7 }] },
  { exerciseId: "leg_press",          performedAt: daysAgo(23), repTarget: 0, sets: [{ weight: 180, reps: 10 }, { weight: 180, reps: 10 }, { weight: 180, reps: 9 }] },

  // ── week 3 ───────────────────────────────────────────────────────────────
  { exerciseId: "bench_press",        performedAt: daysAgo(20), repTarget: 0, sets: [{ weight: 120, reps: 8 }, { weight: 120, reps: 8 }, { weight: 120, reps: 7 }] },
  { exerciseId: "overhead_press",     performedAt: daysAgo(20), repTarget: 0, sets: [{ weight: 75,  reps: 8 }, { weight: 75,  reps: 8 }, { weight: 75,  reps: 7 }] },
  { exerciseId: "triceps_pushdown",   performedAt: daysAgo(20), repTarget: 0, sets: [{ weight: 55,  reps: 12 }, { weight: 55, reps: 11 }, { weight: 55, reps: 11 }] },

  { exerciseId: "pullup",             performedAt: daysAgo(18), repTarget: 0, sets: [{ weight: 0,   reps: 7 }, { weight: 0,  reps: 7 }, { weight: 0,  reps: 6 }] },
  { exerciseId: "barbell_row",        performedAt: daysAgo(18), repTarget: 0, sets: [{ weight: 120, reps: 8 }, { weight: 120, reps: 8 }, { weight: 120, reps: 7 }] },
  { exerciseId: "ez_curl",            performedAt: daysAgo(18), repTarget: 0, sets: [{ weight: 55,  reps: 10 }, { weight: 55, reps: 10 }, { weight: 60, reps: 8 }] },

  { exerciseId: "back_squat",         performedAt: daysAgo(16), repTarget: 0, sets: [{ weight: 140, reps: 6 }, { weight: 140, reps: 6 }, { weight: 140, reps: 5 }] },
  { exerciseId: "romanian_deadlift",  performedAt: daysAgo(16), repTarget: 0, sets: [{ weight: 120, reps: 8 }, { weight: 120, reps: 8 }, { weight: 120, reps: 7 }] },
  { exerciseId: "leg_press",          performedAt: daysAgo(16), repTarget: 0, sets: [{ weight: 185, reps: 10 }, { weight: 185, reps: 10 }, { weight: 185, reps: 10 }] },

  // ── week 2 ───────────────────────────────────────────────────────────────
  { exerciseId: "bench_press",        performedAt: daysAgo(13), repTarget: 0, sets: [{ weight: 120, reps: 8 }, { weight: 120, reps: 8 }, { weight: 125, reps: 6 }] },
  { exerciseId: "overhead_press",     performedAt: daysAgo(13), repTarget: 0, sets: [{ weight: 80,  reps: 7 }, { weight: 80,  reps: 7 }, { weight: 80,  reps: 6 }] },
  { exerciseId: "triceps_pushdown",   performedAt: daysAgo(13), repTarget: 0, sets: [{ weight: 55,  reps: 12 }, { weight: 55, reps: 12 }, { weight: 55, reps: 11 }] },

  { exerciseId: "pullup",             performedAt: daysAgo(11), repTarget: 0, sets: [{ weight: 0,   reps: 8 }, { weight: 0,  reps: 7 }, { weight: 0,  reps: 6 }] },
  { exerciseId: "barbell_row",        performedAt: daysAgo(11), repTarget: 0, sets: [{ weight: 120, reps: 8 }, { weight: 125, reps: 7 }, { weight: 125, reps: 7 }] },
  { exerciseId: "ez_curl",            performedAt: daysAgo(11), repTarget: 0, sets: [{ weight: 60,  reps: 10 }, { weight: 60, reps: 10 }, { weight: 60, reps: 9 }] },

  { exerciseId: "back_squat",         performedAt: daysAgo(9),  repTarget: 0, sets: [{ weight: 145, reps: 6 }, { weight: 145, reps: 5 }, { weight: 145, reps: 5 }] },
  { exerciseId: "romanian_deadlift",  performedAt: daysAgo(9),  repTarget: 0, sets: [{ weight: 125, reps: 8 }, { weight: 125, reps: 8 }, { weight: 125, reps: 7 }] },
  { exerciseId: "leg_press",          performedAt: daysAgo(9),  repTarget: 0, sets: [{ weight: 190, reps: 10 }, { weight: 190, reps: 10 }, { weight: 195, reps: 8 }] },

  // ── week 1 (most recent seed week) ───────────────────────────────────────
  { exerciseId: "bench_press",        performedAt: daysAgo(6),  repTarget: 0, sets: [{ weight: 125, reps: 8 }, { weight: 125, reps: 8 }, { weight: 125, reps: 7 }] },
  { exerciseId: "overhead_press",     performedAt: daysAgo(6),  repTarget: 0, sets: [{ weight: 80,  reps: 8 }, { weight: 80,  reps: 7 }, { weight: 80,  reps: 7 }] },
  { exerciseId: "triceps_pushdown",   performedAt: daysAgo(6),  repTarget: 0, sets: [{ weight: 60,  reps: 12 }, { weight: 60, reps: 11 }, { weight: 60, reps: 10 }] },

  { exerciseId: "pullup",             performedAt: daysAgo(4),  repTarget: 0, sets: [{ weight: 0,   reps: 8 }, { weight: 0,  reps: 8 }, { weight: 0,  reps: 7 }] },
  { exerciseId: "barbell_row",        performedAt: daysAgo(4),  repTarget: 0, sets: [{ weight: 125, reps: 8 }, { weight: 125, reps: 8 }, { weight: 130, reps: 6 }] },
  { exerciseId: "ez_curl",            performedAt: daysAgo(4),  repTarget: 0, sets: [{ weight: 60,  reps: 10 }, { weight: 60, reps: 10 }, { weight: 65, reps: 8 }] },
];

let _cache: SessionSummary[] = [];

/**
 * Called by the store after loading completed workouts from IndexedDB.
 * Real rows take precedence: a seed row is omitted when a real row already
 * exists for the same exerciseId on the same calendar day.
 */
export function populateHistory(real: SessionSummary[]): void {
  const realKeys = new Set(
    real.map((s) => `${s.exerciseId}:${new Date(s.performedAt).toDateString()}`),
  );
  const filtered = SEED_HISTORY.filter(
    (s) => !realKeys.has(`${s.exerciseId}:${new Date(s.performedAt).toDateString()}`),
  );
  _cache = [...real, ...filtered].sort((a, b) => b.performedAt - a.performedAt);
}

/** All cached sessions, most-recent first. */
export function allHistory(): SessionSummary[] {
  return _cache;
}

/** Sessions for one exercise, most-recent first. */
export function historyFor(exerciseId: string): SessionSummary[] {
  return _cache
    .filter((s) => s.exerciseId === exerciseId)
    .sort((a, b) => b.performedAt - a.performedAt);
}

/** Unique calendar days that have at least one logged session. */
export function trainedDays(): Set<string> {
  const days = new Set<string>();
  for (const s of _cache) days.add(new Date(s.performedAt).toDateString());
  return days;
}
