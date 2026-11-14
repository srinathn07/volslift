export interface OccupancySnapshot {
  equipmentId: string;
  total: number;
  inUse: number;
  updatedAt: number;
}

export type BusyLevel = "free" | "moderate" | "busy";

/**
 * Categorises current utilisation for a single piece of equipment.
 *
 * Training reason: thresholds are informed by M/M/c queueing — below 50%
 * there is essentially no queue, 50–80% adds a brief wait, and ≥ 80%
 * (or fully occupied) produces a real queue that costs more time than a
 * typical rest interval.
 */
export function busyLevel(s: OccupancySnapshot): BusyLevel {
  if (s.inUse >= s.total) return "busy";
  const ratio = s.inUse / s.total;
  if (ratio >= 0.8) return "busy";
  if (ratio >= 0.5) return "moderate";
  return "free";
}

/**
 * Average time to complete one working slot (set + inter-set rest), in minutes.
 * Derived from observed gym set cadence: roughly 3.5 min per slot.
 */
const AVG_SET_REST_DURATION_MINUTES = 3.5;

/**
 * Rough estimate of how long a user would wait before getting on the equipment.
 * Returns 0 when the level is not busy — only a true queue produces a wait.
 */
export function estimatedWaitMinutes(s: OccupancySnapshot): number {
  if (busyLevel(s) !== "busy") return 0;
  // Queue depth: how many slots ahead of this user are occupied beyond the
  // last free unit.  Minimum 1 to reflect at least one person finishing first.
  const queueDepth = Math.max(1, s.inUse - (s.total - 1));
  return Math.round(queueDepth * AVG_SET_REST_DURATION_MINUTES);
}

/**
 * How the wait reads to someone deciding whether to walk over.
 *
 * A number is only given when there is a real queue. Below that a figure
 * would be false precision: at moderate use the wait depends on whether the
 * person on the station is mid-set or packing up, which nothing here knows.
 */
export function waitLabel(s: OccupancySnapshot): string {
  const level = busyLevel(s);
  if (level === "free") return "open now";
  if (level === "moderate") return "may be a short wait";
  const minutes = estimatedWaitMinutes(s);
  return `about ${minutes} min wait`;
}

/**
 * Returns true when offering a swap is worth showing.
 *
 * Training reason: a wait shorter than the planned rest interval costs
 * nothing — the user is already resting. Only surface the swap offer when
 * the expected wait would add dead time beyond their scheduled rest.
 */
export function shouldOfferSwap(s: OccupancySnapshot, plannedRestSeconds: number): boolean {
  if (busyLevel(s) !== "busy") return false;
  return estimatedWaitMinutes(s) > plannedRestSeconds / 60;
}
