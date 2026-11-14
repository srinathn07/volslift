import { SEED_HISTORY, trainedDays } from "./history";
import { bestE1rm, tonnage } from "./strength";
import type { SessionSummary } from "./types";

const DAY = 24 * 60 * 60 * 1000;

export interface WeekStats {
  volume: number;
  workouts: number;
  prs: number;
}

/** Sessions in the trailing seven days. */
export function recentSessions(days = 7, history: SessionSummary[] = SEED_HISTORY) {
  const cutoff = Date.now() - days * DAY;
  return history.filter((s) => s.performedAt >= cutoff);
}

export function weekStats(history: SessionSummary[] = SEED_HISTORY): WeekStats {
  const recent = recentSessions(7, history);
  const volume = recent.reduce((sum, s) => sum + tonnage(s.sets), 0);
  const workouts = new Set(recent.map((s) => new Date(s.performedAt).toDateString())).size;
  return { volume, workouts, prs: personalRecords(7, history).length };
}

export interface PersonalRecord {
  exerciseId: string;
  performedAt: number;
  /** Best estimated max in the window. */
  value: number;
  /** Best estimated max before it, for the gain figure. */
  previous: number;
  topSet: { weight: number; reps: number };
}

/**
 * An exercise sets a PR when its best estimated max inside the window beats
 * everything logged before the window.
 */
export function personalRecords(
  days = 7,
  history: SessionSummary[] = SEED_HISTORY,
): PersonalRecord[] {
  const cutoff = Date.now() - days * DAY;
  const byExercise = new Map<string, SessionSummary[]>();
  for (const s of history) {
    byExercise.set(s.exerciseId, [...(byExercise.get(s.exerciseId) ?? []), s]);
  }

  const records: PersonalRecord[] = [];
  for (const [exerciseId, sessions] of byExercise) {
    const inWindow = sessions.filter((s) => s.performedAt >= cutoff);
    const before = sessions.filter((s) => s.performedAt < cutoff);
    if (inWindow.length === 0) continue;

    const best = inWindow.reduce(
      (acc, s) => {
        const value = bestE1rm(s.sets);
        return value > acc.value ? { value, session: s } : acc;
      },
      { value: 0, session: inWindow[0] },
    );
    const previous = before.reduce((max, s) => Math.max(max, bestE1rm(s.sets)), 0);
    if (best.value <= previous) continue;

    const topSet = best.session.sets.reduce(
      (top, s) => (bestE1rm([s]) > bestE1rm([top]) ? s : top),
      best.session.sets[0],
    );

    records.push({
      exerciseId,
      performedAt: best.session.performedAt,
      value: Math.round(best.value),
      previous: Math.round(previous),
      topSet: { weight: topSet.weight, reps: topSet.reps },
    });
  }

  return records.sort((a, b) => b.performedAt - a.performedAt);
}

/**
 * Length in days of the current unbroken chain. Rest days are allowed: the
 * chain only breaks after `allowedGap` consecutive days with nothing logged,
 * which is how a four-a-week lifter keeps a streak that means something.
 */
export function chainDays(days: Set<string> = trainedDays(), allowedGap = 2): number {
  const today = new Date();
  let gap = 0;
  let length = 0;

  for (let i = 0; i < 400; i++) {
    const date = new Date(today.getTime() - i * DAY);
    if (days.has(date.toDateString())) {
      gap = 0;
      length = i + 1;
    } else {
      gap += 1;
      if (gap > allowedGap) break;
    }
  }

  return length;
}

/** 16 weeks by 7 days of intensity levels, newest column last. */
export function heatmap(days: Set<string> = trainedDays(), history = SEED_HISTORY): number[] {
  const cells: number[] = [];
  const volumeByDay = new Map<string, number>();
  for (const s of history) {
    const key = new Date(s.performedAt).toDateString();
    volumeByDay.set(key, (volumeByDay.get(key) ?? 0) + tonnage(s.sets));
  }

  for (let i = 111; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY);
    const key = date.toDateString();
    if (!days.has(key)) {
      cells.push(0);
      continue;
    }
    const volume = volumeByDay.get(key) ?? 0;
    if (volume === 0) cells.push(1);
    else if (volume < 6000) cells.push(2);
    else cells.push(3);
  }
  return cells;
}

export function formatVolume(lb: number): string {
  if (lb >= 1000) return `${(lb / 1000).toFixed(1)}k`;
  return String(Math.round(lb));
}

export function relativeDay(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / DAY);
  if (diff <= 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff} days ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
