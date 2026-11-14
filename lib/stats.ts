import { allHistory, trainedDays } from "./history";
import { bestE1rm, tonnage } from "./strength";
import type { SessionSummary } from "./types";

const DAY = 24 * 60 * 60 * 1000;

export interface WeekStats {
  volume: number;
  workouts: number;
  prs: number;
}

export function recentSessions(days = 7): SessionSummary[] {
  const cutoff = Date.now() - days * DAY;
  return allHistory().filter((s) => s.performedAt >= cutoff);
}

export function weekStats(): WeekStats {
  const recent = recentSessions(7);
  const volume = recent.reduce((sum, s) => sum + tonnage(s.sets), 0);
  const workouts = new Set(recent.map((s) => new Date(s.performedAt).toDateString())).size;
  return { volume, workouts, prs: personalRecords(7).length };
}

export interface PersonalRecord {
  exerciseId: string;
  performedAt: number;
  value: number;
  previous: number;
  topSet: { weight: number; reps: number };
}

export function personalRecords(days = 7): PersonalRecord[] {
  const history = allHistory();
  const cutoff = Date.now() - days * DAY;
  const byExercise = new Map<string, SessionSummary[]>();
  for (const s of history) {
    byExercise.set(s.exerciseId, [...(byExercise.get(s.exerciseId) ?? []), s]);
  }

  const records: PersonalRecord[] = [];
  for (const [exerciseId, sessions] of byExercise) {
    const inWindow = sessions.filter((s) => s.performedAt >= cutoff);
    const before   = sessions.filter((s) => s.performedAt < cutoff);
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
      value:    Math.round(best.value),
      previous: Math.round(previous),
      topSet: { weight: topSet.weight, reps: topSet.reps },
    });
  }

  return records.sort((a, b) => b.performedAt - a.performedAt);
}

export function chainDays(allowedGap = 2): number {
  const days  = trainedDays();
  const today = new Date();
  let gap    = 0;
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

/** 16 weeks × 7 days of intensity levels, oldest column first. */
export function heatmap(): number[] {
  const days        = trainedDays();
  const history     = allHistory();
  const volumeByDay = new Map<string, number>();
  for (const s of history) {
    const key = new Date(s.performedAt).toDateString();
    volumeByDay.set(key, (volumeByDay.get(key) ?? 0) + tonnage(s.sets));
  }

  const cells: number[] = [];
  for (let i = 111; i >= 0; i--) {
    const key = new Date(Date.now() - i * DAY).toDateString();
    if (!days.has(key)) { cells.push(0); continue; }
    const volume = volumeByDay.get(key) ?? 0;
    if (volume === 0)        cells.push(1);
    else if (volume < 6000)  cells.push(2);
    else                     cells.push(3);
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
