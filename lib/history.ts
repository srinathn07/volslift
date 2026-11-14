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
  // Bench press, the progression case: all reps hit, effort submaximal.
  {
    exerciseId: "bench_press",
    performedAt: daysAgo(2),
    repTarget: 6,
    sets: [
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 6.5 },
      { weight: 175, reps: 8, rpe: 7 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: daysAgo(6),
    repTarget: 6,
    sets: [
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 7 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: daysAgo(10),
    repTarget: 6,
    sets: [
      { weight: 185, reps: 7, rpe: 7 },
      { weight: 185, reps: 6, rpe: 7.5 },
      { weight: 185, reps: 6, rpe: 7.5 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: daysAgo(17),
    repTarget: 6,
    sets: [
      { weight: 180, reps: 6, rpe: 7.5 },
      { weight: 180, reps: 6, rpe: 8 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: daysAgo(24),
    repTarget: 6,
    sets: [
      { weight: 175, reps: 6, rpe: 7.5 },
      { weight: 175, reps: 5, rpe: 8 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: daysAgo(31),
    repTarget: 6,
    sets: [
      { weight: 170, reps: 6, rpe: 7 },
      { weight: 170, reps: 6, rpe: 7.5 },
    ],
  },

  // Back squat, the deload case: tonnage ramping, RPE rising, reps falling.
  {
    exerciseId: "back_squat",
    performedAt: daysAgo(2),
    repTarget: 5,
    sets: [
      { weight: 275, reps: 4, rpe: 8.6 },
      { weight: 275, reps: 4, rpe: 9 },
      { weight: 275, reps: 3, rpe: 9 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: daysAgo(5),
    repTarget: 5,
    sets: [
      { weight: 265, reps: 5, rpe: 8.5 },
      { weight: 265, reps: 4, rpe: 8.8 },
      { weight: 265, reps: 4, rpe: 9 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: daysAgo(9),
    repTarget: 5,
    sets: [
      { weight: 255, reps: 5, rpe: 8.4 },
      { weight: 255, reps: 5, rpe: 8.6 },
      { weight: 245, reps: 5, rpe: 8.2 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: daysAgo(16),
    repTarget: 6,
    sets: [
      { weight: 225, reps: 6, rpe: 7.2 },
      { weight: 225, reps: 6, rpe: 7.4 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: daysAgo(20),
    repTarget: 6,
    sets: [
      { weight: 215, reps: 6, rpe: 7 },
      { weight: 215, reps: 6, rpe: 7.2 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: daysAgo(27),
    repTarget: 6,
    sets: [
      { weight: 205, reps: 6, rpe: 7.1 },
      { weight: 205, reps: 6, rpe: 7 },
    ],
  },

  // Supporting lifts, enough to draw charts with.
  {
    exerciseId: "overhead_press",
    performedAt: daysAgo(2),
    repTarget: 6,
    sets: [
      { weight: 115, reps: 6, rpe: 8 },
      { weight: 115, reps: 5, rpe: 8.5 },
    ],
  },
  {
    exerciseId: "overhead_press",
    performedAt: daysAgo(9),
    repTarget: 6,
    sets: [
      { weight: 110, reps: 6, rpe: 7.5 },
      { weight: 110, reps: 6, rpe: 8 },
    ],
  },
  {
    exerciseId: "overhead_press",
    performedAt: daysAgo(23),
    repTarget: 6,
    sets: [{ weight: 105, reps: 6, rpe: 7.5 }],
  },
  {
    exerciseId: "pullup",
    performedAt: daysAgo(4),
    repTarget: 10,
    sets: [
      { weight: 0, reps: 11, rpe: 8 },
      { weight: 0, reps: 10, rpe: 8.5 },
      { weight: 0, reps: 8, rpe: 9 },
    ],
  },
  {
    exerciseId: "pullup",
    performedAt: daysAgo(11),
    repTarget: 10,
    sets: [
      { weight: 0, reps: 9, rpe: 8.5 },
      { weight: 0, reps: 8, rpe: 9 },
    ],
  },
  {
    exerciseId: "romanian_deadlift",
    performedAt: daysAgo(5),
    repTarget: 8,
    sets: [
      { weight: 205, reps: 8, rpe: 7.5 },
      { weight: 205, reps: 8, rpe: 8 },
    ],
  },
  {
    exerciseId: "romanian_deadlift",
    performedAt: daysAgo(12),
    repTarget: 8,
    sets: [
      { weight: 195, reps: 8, rpe: 7.5 },
      { weight: 195, reps: 8, rpe: 7.5 },
    ],
  },
  // Earlier leg work, so the deload comparison has a fair previous window
  // rather than comparing three squat days against one.
  {
    exerciseId: "romanian_deadlift",
    performedAt: daysAgo(18),
    repTarget: 8,
    sets: [
      { weight: 185, reps: 8, rpe: 7.5 },
      { weight: 185, reps: 8, rpe: 7.5 },
    ],
  },
  {
    exerciseId: "goblet_squat",
    performedAt: daysAgo(25),
    repTarget: 15,
    sets: [
      { weight: 65, reps: 15, rpe: 7 },
      { weight: 65, reps: 15, rpe: 7 },
    ],
  },
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
