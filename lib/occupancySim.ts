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
 * Returns a deterministic occupancy snapshot for every piece of equipment
 * at the given gym.  The snapshot drifts slowly: the seed rotates every
 * 5 minutes, so values change gradually rather than jumping.
 */
export function gymOccupancySnapshot(
  gymId: string,
  equipmentIds: readonly string[],
): Map<string, OccupancySnapshot> {
  const window = Math.floor(Date.now() / 300_000); // 5-minute bucket
  const rand = lcg(gymSeed(gymId) ^ window);
  const updatedAt = Date.now();

  const result = new Map<string, OccupancySnapshot>();
  for (const equipmentId of equipmentIds) {
    const total = randomTotal(rand);
    const inUse = Math.floor(rand() * (total + 1));
    result.set(equipmentId, { equipmentId, total, inUse, updatedAt });
  }
  return result;
}
