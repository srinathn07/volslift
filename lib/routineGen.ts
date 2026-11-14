import { EXERCISES, exerciseById } from "./catalog";
import type { GymContext } from "./availability";
import type { Exercise, RoutineExercise } from "./types";

/**
 * Routine generation. A model proposes the programming; this module decides
 * what is allowed to survive.
 *
 * The split of responsibility matches the rest of the app. Choosing which
 * exercises to group into a session and roughly how many sets and reps is a
 * programming opinion, and a model is good at that. Claiming what a lifter can
 * lift is not an opinion, so no weight is ever accepted from the model: target
 * weights are left unset and the logger fills them from the lifter's history.
 *
 * Everything coming back is validated against the gym. An exercise the gym
 * cannot load is dropped rather than silently shown, because the whole premise
 * of the app is that the picker only offers what is actually there.
 */

export interface GeneratedDay {
  name: string;
  exercises: RoutineExercise[];
}

/** Bounds that a proposed session has to fall inside to be usable. */
const MAX_DAYS = 4;
const MAX_EXERCISES_PER_DAY = 8;
const MIN_EXERCISES_PER_DAY = 2;
const MAX_SETS = 6;
const MIN_SETS = 1;
const MIN_REPS = 1;
const MAX_REPS = 30;

function clamp(value: number, low: number, high: number): number {
  if (!Number.isFinite(value)) return low;
  return Math.min(high, Math.max(low, Math.round(value)));
}

interface RawEntry {
  exerciseId?: unknown;
  targetSets?: unknown;
  repLow?: unknown;
  repHigh?: unknown;
}

interface RawDay {
  name?: unknown;
  exercises?: unknown;
}

/**
 * Turns whatever the model returned into days this gym can actually run.
 *
 * Rules, in order:
 *  - an exercise id that is not in the catalog is dropped
 *  - an exercise the gym cannot load is dropped
 *  - a duplicate inside the same day is dropped
 *  - sets and reps are clamped into sane bounds, and an inverted rep range is
 *    flipped rather than discarded
 *  - a day left with fewer than two exercises is dropped
 *  - any weight the model supplied is ignored
 */
export function validateGeneratedDays(
  raw: unknown,
  availableIds: Set<string>,
): GeneratedDay[] {
  if (!Array.isArray(raw)) return [];

  const days: GeneratedDay[] = [];

  for (const rawDay of raw.slice(0, MAX_DAYS) as RawDay[]) {
    if (!rawDay || typeof rawDay !== "object") continue;
    if (!Array.isArray(rawDay.exercises)) continue;

    const seen = new Set<string>();
    const exercises: RoutineExercise[] = [];

    for (const entry of rawDay.exercises as RawEntry[]) {
      if (exercises.length >= MAX_EXERCISES_PER_DAY) break;
      if (!entry || typeof entry !== "object") continue;

      const id = entry.exerciseId;
      if (typeof id !== "string") continue;
      if (!exerciseById(id)) continue;
      if (!availableIds.has(id)) continue;
      if (seen.has(id)) continue;
      seen.add(id);

      let low = clamp(Number(entry.repLow), MIN_REPS, MAX_REPS);
      let high = clamp(Number(entry.repHigh), MIN_REPS, MAX_REPS);
      if (low > high) [low, high] = [high, low];

      exercises.push({
        exerciseId: id,
        targetSets: clamp(Number(entry.targetSets), MIN_SETS, MAX_SETS),
        repLow: low,
        repHigh: high,
        // Deliberately no targetWeight. See the note at the top of this file.
      });
    }

    if (exercises.length < MIN_EXERCISES_PER_DAY) continue;

    const name =
      typeof rawDay.name === "string" && rawDay.name.trim().length > 0
        ? rawDay.name.trim().slice(0, 40)
        : `Day ${days.length + 1}`;

    days.push({ name, exercises });
  }

  return days;
}

/** The exercises a model is allowed to choose from, with the facts it needs. */
export function candidateList(ctx: GymContext, catalog: Exercise[] = EXERCISES) {
  return catalog
    .filter((e) => ctx.availableIds.has(e.id))
    .map((e) => ({
      id: e.id,
      name: e.name,
      muscle: e.muscle,
      pattern: e.pattern,
      loadClass: e.loadClass,
    }));
}

/**
 * Deterministic fallback used when there is no API key, the call fails, or
 * nothing survived validation. A full-body session built from the heaviest
 * available exercise per movement pattern, so the feature still returns
 * something usable offline.
 */
export function fallbackDay(ctx: GymContext, catalog: Exercise[] = EXERCISES): GeneratedDay[] {
  const order = ["squat", "hinge", "horizontal_push", "horizontal_pull", "vertical_push", "vertical_pull"];
  const picks: RoutineExercise[] = [];

  for (const pattern of order) {
    const best = catalog
      .filter((e) => ctx.availableIds.has(e.id) && e.pattern === pattern)
      .sort((a, b) => b.loadClass - a.loadClass)[0];
    if (!best) continue;
    const compound = best.loadClass >= 4;
    picks.push({
      exerciseId: best.id,
      targetSets: compound ? 4 : 3,
      repLow: compound ? 5 : 8,
      repHigh: compound ? 8 : 12,
    });
  }

  if (picks.length < MIN_EXERCISES_PER_DAY) return [];
  return [{ name: "Full Body", exercises: picks.slice(0, MAX_EXERCISES_PER_DAY) }];
}
