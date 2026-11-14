import type { SessionSummary } from "./types";

const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => Date.now() - days * DAY;

/**
 * Seed history so the progress charts and coach cards have something true to
 * read before the user has logged anything. Replace with server queries once
 * sync is live: `select ... from sets join workouts` grouped by session.
 */
export const SEED_HISTORY: SessionSummary[] = [
  // Bench press, the progression case: all reps hit, effort submaximal.
  {
    exerciseId: "bench_press",
    performedAt: ago(2),
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
    performedAt: ago(6),
    repTarget: 6,
    sets: [
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 7 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: ago(10),
    repTarget: 6,
    sets: [
      { weight: 185, reps: 7, rpe: 7 },
      { weight: 185, reps: 6, rpe: 7.5 },
      { weight: 185, reps: 6, rpe: 7.5 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: ago(17),
    repTarget: 6,
    sets: [
      { weight: 180, reps: 6, rpe: 7.5 },
      { weight: 180, reps: 6, rpe: 8 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: ago(24),
    repTarget: 6,
    sets: [
      { weight: 175, reps: 6, rpe: 7.5 },
      { weight: 175, reps: 5, rpe: 8 },
    ],
  },
  {
    exerciseId: "bench_press",
    performedAt: ago(31),
    repTarget: 6,
    sets: [
      { weight: 170, reps: 6, rpe: 7 },
      { weight: 170, reps: 6, rpe: 7.5 },
    ],
  },

  // Back squat, the deload case: tonnage ramping, RPE rising, reps falling.
  {
    exerciseId: "back_squat",
    performedAt: ago(2),
    repTarget: 5,
    sets: [
      { weight: 275, reps: 4, rpe: 8.6 },
      { weight: 275, reps: 4, rpe: 9 },
      { weight: 275, reps: 3, rpe: 9 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: ago(5),
    repTarget: 5,
    sets: [
      { weight: 265, reps: 5, rpe: 8.5 },
      { weight: 265, reps: 4, rpe: 8.8 },
      { weight: 265, reps: 4, rpe: 9 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: ago(9),
    repTarget: 5,
    sets: [
      { weight: 255, reps: 5, rpe: 8.4 },
      { weight: 255, reps: 5, rpe: 8.6 },
      { weight: 245, reps: 5, rpe: 8.2 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: ago(16),
    repTarget: 6,
    sets: [
      { weight: 225, reps: 6, rpe: 7.2 },
      { weight: 225, reps: 6, rpe: 7.4 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: ago(20),
    repTarget: 6,
    sets: [
      { weight: 215, reps: 6, rpe: 7 },
      { weight: 215, reps: 6, rpe: 7.2 },
    ],
  },
  {
    exerciseId: "back_squat",
    performedAt: ago(27),
    repTarget: 6,
    sets: [
      { weight: 205, reps: 6, rpe: 7.1 },
      { weight: 205, reps: 6, rpe: 7 },
    ],
  },

  // Supporting lifts, enough to draw charts with.
  {
    exerciseId: "overhead_press",
    performedAt: ago(2),
    repTarget: 6,
    sets: [
      { weight: 115, reps: 6, rpe: 8 },
      { weight: 115, reps: 5, rpe: 8.5 },
    ],
  },
  {
    exerciseId: "overhead_press",
    performedAt: ago(9),
    repTarget: 6,
    sets: [
      { weight: 110, reps: 6, rpe: 7.5 },
      { weight: 110, reps: 6, rpe: 8 },
    ],
  },
  {
    exerciseId: "overhead_press",
    performedAt: ago(23),
    repTarget: 6,
    sets: [{ weight: 105, reps: 6, rpe: 7.5 }],
  },
  {
    exerciseId: "pullup",
    performedAt: ago(4),
    repTarget: 10,
    sets: [
      { weight: 0, reps: 11, rpe: 8 },
      { weight: 0, reps: 10, rpe: 8.5 },
      { weight: 0, reps: 8, rpe: 9 },
    ],
  },
  {
    exerciseId: "pullup",
    performedAt: ago(11),
    repTarget: 10,
    sets: [
      { weight: 0, reps: 9, rpe: 8.5 },
      { weight: 0, reps: 8, rpe: 9 },
    ],
  },
  {
    exerciseId: "romanian_deadlift",
    performedAt: ago(5),
    repTarget: 8,
    sets: [
      { weight: 205, reps: 8, rpe: 7.5 },
      { weight: 205, reps: 8, rpe: 8 },
    ],
  },
  {
    exerciseId: "romanian_deadlift",
    performedAt: ago(12),
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
    performedAt: ago(18),
    repTarget: 8,
    sets: [
      { weight: 185, reps: 8, rpe: 7.5 },
      { weight: 185, reps: 8, rpe: 7.5 },
    ],
  },
  {
    exerciseId: "goblet_squat",
    performedAt: ago(25),
    repTarget: 15,
    sets: [
      { weight: 65, reps: 15, rpe: 7 },
      { weight: 65, reps: 15, rpe: 7 },
    ],
  },
];

export function historyFor(exerciseId: string): SessionSummary[] {
  return SEED_HISTORY.filter((s) => s.exerciseId === exerciseId).sort(
    (a, b) => b.performedAt - a.performedAt,
  );
}

export const SEED_BODY_WEIGHT: Array<{ measuredAt: number; weight: number }> = [
  { measuredAt: ago(56), weight: 174.3 },
  { measuredAt: ago(49), weight: 174.8 },
  { measuredAt: ago(42), weight: 174.6 },
  { measuredAt: ago(35), weight: 175.2 },
  { measuredAt: ago(28), weight: 175.4 },
  { measuredAt: ago(21), weight: 175.9 },
  { measuredAt: ago(14), weight: 176.1 },
  { measuredAt: ago(4), weight: 176.4 },
];

/** Days in the last 16 weeks that have a logged session, for the heatmap. */
export function trainedDays(): Set<string> {
  const days = new Set<string>();
  for (const s of SEED_HISTORY) days.add(new Date(s.performedAt).toDateString());
  // Fill in the rest of a realistic four-a-week pattern.
  for (let d = 0; d < 112; d++) {
    const date = new Date(ago(d));
    const dow = date.getDay();
    if (dow === 1 || dow === 2 || dow === 4 || dow === 6) {
      if (d % 17 !== 3) days.add(date.toDateString());
    }
  }
  return days;
}
