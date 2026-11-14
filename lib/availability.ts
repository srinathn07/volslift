import { EXERCISES, UBIQUITOUS_EQUIPMENT, exerciseById } from "./catalog";
import type { Exercise, Gym, Muscle } from "./types";

/**
 * Equipment the gym can offer, including the kit we assume exists anywhere
 * (your own bodyweight, a band in your bag).
 */
export function gymEquipment(gym: Gym): Set<string> {
  return new Set<string>([...gym.equipment, ...UBIQUITOUS_EQUIPMENT]);
}

export function isAvailable(exercise: Exercise, gym: Gym): boolean {
  return gymEquipment(gym).has(exercise.equipment);
}

/** Pre-computed once per gym selection, then used as a cheap predicate. */
export interface GymContext {
  gym: Gym;
  equipment: Set<string>;
  availableIds: Set<string>;
  availableCount: number;
  totalCount: number;
  missingCount: number;
  /** Equipment in the master list this gym does not have. */
  missingEquipment: string[];
}

export function buildGymContext(gym: Gym, catalog: Exercise[] = EXERCISES): GymContext {
  const equipment = gymEquipment(gym);
  const availableIds = new Set(
    catalog.filter((e) => equipment.has(e.equipment)).map((e) => e.id),
  );
  const missingEquipment = Array.from(
    new Set(catalog.map((e) => e.equipment).filter((id) => !equipment.has(id))),
  );
  return {
    gym,
    equipment,
    availableIds,
    availableCount: availableIds.size,
    totalCount: catalog.length,
    missingCount: catalog.length - availableIds.size,
    missingEquipment,
  };
}

export interface LibraryQuery {
  muscle?: Muscle | "All";
  search?: string;
  /** When true, exercises the gym cannot load are dropped instead of marked. */
  availableOnly?: boolean;
}

export interface LibraryRow {
  exercise: Exercise;
  available: boolean;
  /** Set only when unavailable and a reachable alternative exists. */
  substitute?: Exercise;
}

export function queryLibrary(
  ctx: GymContext,
  query: LibraryQuery = {},
  catalog: Exercise[] = EXERCISES,
): LibraryRow[] {
  const { muscle = "All", search = "", availableOnly = true } = query;
  const needle = search.trim().toLowerCase();

  return catalog
    .filter((e) => (muscle === "All" ? true : e.muscle === muscle))
    .filter((e) => (needle ? e.name.toLowerCase().includes(needle) : true))
    .map((e) => {
      const available = ctx.availableIds.has(e.id);
      return {
        exercise: e,
        available,
        substitute: available ? undefined : (substituteFor(e, ctx, catalog) ?? undefined),
      };
    })
    .filter((row) => (availableOnly ? row.available : true));
}

/**
 * Closest exercise the gym can actually load.
 *
 * Curated substitutes win when one of them is available, because those are
 * hand-checked. Otherwise candidates are scored: same movement pattern matters
 * most, then the same primary muscle, then how similarly the movement can be
 * loaded, so a heavy hinge does not get replaced by a band exercise.
 */
export function substituteFor(
  exercise: Exercise,
  ctx: GymContext,
  catalog: Exercise[] = EXERCISES,
): Exercise | null {
  for (const id of exercise.substitutes ?? []) {
    const candidate = exerciseById(id);
    if (candidate && ctx.availableIds.has(candidate.id)) return candidate;
  }

  const scored = catalog
    .filter((c) => c.id !== exercise.id && ctx.availableIds.has(c.id))
    .map((c) => ({ exercise: c, score: similarity(exercise, c) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name));

  return scored.length > 0 ? scored[0].exercise : null;
}

export function similarity(target: Exercise, candidate: Exercise): number {
  const samePattern = candidate.pattern === target.pattern;
  const sameMuscle = candidate.muscle === target.muscle;

  // An isolation movement is defined by the muscle it isolates, so a different
  // muscle is never a substitute however well the pattern matches. Without
  // this, a skullcrusher scores higher than a push-up for a cable fly.
  if (target.pattern === "isolation" && !sameMuscle) return 0;

  let score = 0;
  if (samePattern) score += 6;
  if (sameMuscle) score += 4;
  // Nothing in common on either axis is not a substitute, whatever the loading.
  if (score === 0) return 0;
  score -= Math.abs(candidate.loadClass - target.loadClass);
  return score;
}

/** Exercises in a routine that the selected gym cannot load, with their swaps. */
export function routineConflicts(
  exerciseIds: string[],
  ctx: GymContext,
): Array<{ exercise: Exercise; substitute: Exercise | null }> {
  return exerciseIds
    .map((id) => exerciseById(id))
    .filter((e): e is Exercise => Boolean(e))
    .filter((e) => !ctx.availableIds.has(e.id))
    .map((e) => ({ exercise: e, substitute: substituteFor(e, ctx) }));
}
