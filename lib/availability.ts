import { EXERCISES, UBIQUITOUS_EQUIPMENT, exerciseById } from "./catalog";
import { busyLevel, estimatedWaitMinutes } from "./occupancy";
import type { OccupancySnapshot } from "./occupancy";
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

export interface SwapCandidate {
  exercise: Exercise;
  score: number;
  /** Estimated minutes to wait for this equipment; 0 when equipment is free. */
  waitMinutes: number;
  /** Plain sentence explaining why this is a good swap; same contract as coach cards. */
  evidence: string;
}

/**
 * Top-3 alternatives for a busy exercise, respecting both gym availability
 * and current occupancy.
 *
 * Training reason: offering a swap to equipment that is equally busy wastes
 * the user's time. Curated substitutes win when they are reachable AND not
 * busy; scored fallbacks fill the remaining slots.
 */
export function substitutesForBusy(
  exercise: Exercise,
  ctx: GymContext,
  occupancy: Map<string, OccupancySnapshot>,
  catalog: Exercise[] = EXERCISES,
): SwapCandidate[] {
  const isReachableAndFree = (c: Exercise): boolean => {
    if (!ctx.availableIds.has(c.id)) return false;
    const snap = occupancy.get(c.equipment);
    if (!snap) return true; // no data → assume available
    return busyLevel(snap) !== "busy";
  };

  const makeCandidate = (c: Exercise, score: number): SwapCandidate => {
    const snap = occupancy.get(c.equipment);
    const waitMinutes = snap ? estimatedWaitMinutes(snap) : 0;
    return {
      exercise: c,
      score,
      waitMinutes,
      evidence: `${c.name} hits the same ${c.muscle.toLowerCase()} with a ${c.pattern.replace(/_/g, " ")} pattern and is available now.`,
    };
  };

  const candidates: SwapCandidate[] = [];

  // Curated substitutes win when reachable and not busy.
  for (const id of exercise.substitutes ?? []) {
    if (candidates.length >= 3) break;
    const c = exerciseById(id);
    if (c && isReachableAndFree(c)) candidates.push(makeCandidate(c, 100));
  }

  if (candidates.length >= 3) return candidates;

  // Scored fallbacks fill remaining slots (similarity() already enforces
  // the isolation-never-crosses-muscles invariant via a zero score).
  const alreadyPicked = new Set(candidates.map((x) => x.exercise.id));
  const scored = catalog
    .filter((c) => c.id !== exercise.id && !alreadyPicked.has(c.id) && isReachableAndFree(c))
    .map((c) => ({ c, score: similarity(exercise, c) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name));

  for (const { c, score } of scored) {
    if (candidates.length >= 3) break;
    candidates.push(makeCandidate(c, score));
  }

  return candidates;
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
