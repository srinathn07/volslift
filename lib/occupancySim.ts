import type { OccupancySnapshot } from "./occupancy";

/**
 * Linear congruential generator.
 * Same seed → same sequence, so occupancy is stable within a 5-minute window.
 */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return function next() {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/** Common rack/station counts in a university rec centre. */
const TOTALS = [1, 2, 2, 3, 3, 4, 6, 8];

function randomTotal(rand: () => number): number {
  return TOTALS[Math.floor(rand() * TOTALS.length)];
}

function gymSeed(gymId: string): number {
  return gymId.split("").reduce((acc, c) => (acc ^ c.charCodeAt(0)) >>> 0, 0);
}

/**
 * The stations people actually queue for. Only these are filled when a busy
 * gym is simulated: free weights and racks go first in a real rush, and
 * leaving the machines and cables open is both realistic and necessary, since
 * a swap needs somewhere to send you. Filling everything would mean no
 * candidate was available and no swap could be offered at all.
 */
export const QUEUED_EQUIPMENT: readonly string[] = [
  "barbell",
  "squat_rack",
  "bench",
  "leg_press",
];

/**
 * Returns a deterministic occupancy snapshot for every piece of equipment
 * at the given gym.  The snapshot drifts slowly: the seed rotates every
 * 5 minutes, so values change gradually rather than jumping.
 *
 * With `busyRush` set, the queued stations above are reported full. Normal
 * occupancy is random per window, so whether anything is busy at a given
 * moment is luck; this makes the crowded case reproducible on demand.
 */
export function gymOccupancySnapshot(
  gymId: string,
  equipmentIds: readonly string[],
  busyRush = false,
): Map<string, OccupancySnapshot> {
  const window = Math.floor(Date.now() / 300_000); // 5-minute bucket
  const rand = lcg(gymSeed(gymId) ^ window);
  const updatedAt = Date.now();

  const result = new Map<string, OccupancySnapshot>();
  for (const equipmentId of equipmentIds) {
    const total = randomTotal(rand);
    const random = Math.floor(rand() * (total + 1));

    // In a rush the queued stations fill completely and everything else fills
    // most of the way. Filling only the racks left the gym reading as merely
    // "filling up" overall, which is the wrong thing to say when every barbell
    // is taken; a rush is busy everywhere, it just queues at the racks first.
    let inUse = random;
    if (busyRush) {
      inUse = QUEUED_EQUIPMENT.includes(equipmentId)
        ? total
        : Math.max(random, Math.ceil(total * 0.75));
    }

    result.set(equipmentId, { equipmentId, total, inUse, updatedAt });
  }
  return result;
}
