import { describe, expect, it } from "vitest";
import { busyLevel, estimatedWaitMinutes, shouldOfferSwap } from "./occupancy";
import type { OccupancySnapshot } from "./occupancy";

function snap(total: number, inUse: number): OccupancySnapshot {
  return { equipmentId: "squat_rack", total, inUse, updatedAt: Date.now() };
}

describe("busyLevel", () => {
  // Training reason: below 50% utilisation there is essentially no queue;
  // 50–80% adds a brief wait; ≥ 80% (or full) produces a real queue that
  // costs more time than a typical rest interval.
  it("is free when inUse / total is below 0.5", () => {
    expect(busyLevel(snap(4, 0))).toBe("free");
    expect(busyLevel(snap(4, 1))).toBe("free");
  });

  it("is moderate between 0.5 (inclusive) and 0.8 (exclusive)", () => {
    expect(busyLevel(snap(4, 2))).toBe("moderate"); // ratio = 0.5
    expect(busyLevel(snap(10, 7))).toBe("moderate"); // ratio = 0.7
  });

  it("is busy at or above 0.8 ratio", () => {
    expect(busyLevel(snap(10, 8))).toBe("busy"); // ratio = 0.8
    expect(busyLevel(snap(10, 9))).toBe("busy"); // ratio = 0.9
  });

  it("is busy when inUse equals total regardless of ratio", () => {
    // Training reason: fully occupied equipment always produces a queue.
    expect(busyLevel(snap(1, 1))).toBe("busy");
    expect(busyLevel(snap(2, 2))).toBe("busy");
  });
});

describe("estimatedWaitMinutes", () => {
  it("returns 0 when equipment is free", () => {
    expect(estimatedWaitMinutes(snap(4, 1))).toBe(0);
  });

  it("returns 0 when equipment is only moderate", () => {
    // Training reason: moderate utilisation has no queue yet.
    expect(estimatedWaitMinutes(snap(4, 2))).toBe(0);
  });

  it("returns a positive value when equipment is busy", () => {
    expect(estimatedWaitMinutes(snap(1, 1))).toBeGreaterThan(0);
  });
});

describe("shouldOfferSwap", () => {
  it("returns false when equipment is free", () => {
    // Training reason: no reason to swap if the rack is open.
    expect(shouldOfferSwap(snap(4, 0), 90)).toBe(false);
  });

  it("returns false when equipment is only moderate", () => {
    expect(shouldOfferSwap(snap(4, 2), 90)).toBe(false);
  });

  it("returns false when busy but wait does not exceed planned rest", () => {
    // Training reason: a wait shorter than your rest interval costs nothing —
    // the user is already standing around. Only surface the swap offer when
    // waiting would add dead time beyond the scheduled rest.
    // snap(1,1) → estimatedWaitMinutes ≈ 4 min; 300 s rest = 5 min > 4 min.
    expect(shouldOfferSwap(snap(1, 1), 300)).toBe(false);
  });

  it("returns true when busy and wait exceeds planned rest", () => {
    // snap(1,1) → wait ≈ 4 min; 60 s rest = 1 min < 4 min.
    expect(shouldOfferSwap(snap(1, 1), 60)).toBe(true);
  });

  it("returns false even at full occupancy when planned rest is very long", () => {
    // 10-minute rest means even a queue barely matters.
    // snap(1,1) → wait ≈ 4 min; 600 s rest = 10 min > 4 min.
    expect(shouldOfferSwap(snap(1, 1), 600)).toBe(false);
  });
});
