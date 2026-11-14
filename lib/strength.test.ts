import { describe, expect, it } from "vitest";
import {
  bestE1rm,
  e1rm,
  explain,
  loadStep,
  suggestDeload,
  suggestProgression,
  tonnage,
} from "./strength";
import type { SessionSummary } from "./types";

const DAY = 24 * 60 * 60 * 1000;

const session = (
  daysAgo: number,
  sets: Array<{ weight: number; reps: number; rpe?: number }>,
  repTarget: number,
  exerciseId = "bench_press",
): SessionSummary => ({
  exerciseId,
  performedAt: Date.now() - daysAgo * DAY,
  sets,
  repTarget,
});

describe("e1rm", () => {
  it("matches the Brzycki numbers the design assumes", () => {
    // 190 x 6 reads as 221 on the progress screen.
    expect(Math.round(e1rm(190, 6))).toBe(221);
    expect(Math.round(e1rm(245, 5))).toBe(276);
  });

  it("returns the weight itself for a single", () => {
    expect(e1rm(300, 1)).toBe(300);
  });

  it("stays finite at high reps where Brzycki breaks down", () => {
    const value = e1rm(100, 40);
    expect(Number.isFinite(value)).toBe(true);
    expect(value).toBeGreaterThan(100);
    expect(e1rm(100, 40)).toBe(e1rm(100, 12));
  });

  it("rejects nonsense input instead of producing a max", () => {
    expect(e1rm(0, 5)).toBe(0);
    expect(e1rm(100, 0)).toBe(0);
    expect(e1rm(-100, 5)).toBe(0);
  });

  it("takes the best set, not the last", () => {
    // 185 x 8 estimates 230, the heavy single stands on its own at 245.
    expect(Math.round(bestE1rm([{ weight: 185, reps: 8 }, { weight: 245, reps: 1 }]))).toBe(245);
    // And the other way round, so it is really a max and not just the last set.
    expect(Math.round(bestE1rm([{ weight: 245, reps: 1 }, { weight: 185, reps: 8 }]))).toBe(245);
  });
});

describe("tonnage", () => {
  it("sums weight by reps", () => {
    expect(tonnage([{ weight: 100, reps: 10 }, { weight: 50, reps: 5 }])).toBe(1250);
  });
});

describe("loadStep", () => {
  it("steps lower body harder than upper", () => {
    expect(loadStep("Legs", 245)).toBe(10);
    expect(loadStep("Chest", 190)).toBe(5);
  });

  it("steps light lifts gently", () => {
    expect(loadStep("Shoulders", 25)).toBe(2.5);
    expect(loadStep("Legs", 95)).toBe(5);
  });
});

describe("suggestProgression", () => {
  const allRepsHit = [
    session(3, [
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 7 },
    ], 6),
    session(10, [
      { weight: 190, reps: 6, rpe: 7 },
      { weight: 190, reps: 6, rpe: 6.5 },
      { weight: 190, reps: 6, rpe: 7 },
    ], 6),
  ];

  it("recommends more weight when every rep landed at submaximal effort", () => {
    const s = suggestProgression("Chest", allRepsHit);
    expect(s).not.toBeNull();
    expect(s?.from).toBe(190);
    expect(s?.to).toBe(195);
    expect(s?.evidence.avgRpe).toBe(6.9);
    expect(s?.evidence.stepPct).toBeCloseTo(2.6, 1);
  });

  it("holds when a set fell short of the target", () => {
    const missed = [
      session(3, [{ weight: 190, reps: 6 }, { weight: 190, reps: 4 }], 6),
      ...allRepsHit.slice(1),
    ];
    expect(suggestProgression("Chest", missed)).toBeNull();
  });

  it("holds when effort was already near the limit", () => {
    const grinding = allRepsHit.map((s) => ({
      ...s,
      sets: s.sets.map((set) => ({ ...set, rpe: 9 })),
    }));
    expect(suggestProgression("Chest", grinding)).toBeNull();
  });

  it("holds when there is not enough history yet", () => {
    expect(suggestProgression("Chest", allRepsHit.slice(0, 1))).toBeNull();
  });

  it("works without RPE logged at all", () => {
    const noRpe = allRepsHit.map((s) => ({
      ...s,
      sets: s.sets.map(({ weight, reps }) => ({ weight, reps })),
    }));
    const s = suggestProgression("Chest", noRpe);
    expect(s?.to).toBe(195);
    expect(s?.evidence.avgRpe).toBeNull();
  });
});

describe("suggestDeload", () => {
  const ramping: SessionSummary[] = [
    session(2, [{ weight: 275, reps: 4, rpe: 8.6 }, { weight: 275, reps: 4, rpe: 9 }], 5, "back_squat"),
    session(5, [{ weight: 265, reps: 5, rpe: 8.5 }, { weight: 265, reps: 4, rpe: 8.8 }], 5, "back_squat"),
    session(9, [{ weight: 255, reps: 5, rpe: 8.4 }, { weight: 255, reps: 5, rpe: 8.6 }], 5, "back_squat"),
    session(17, [{ weight: 225, reps: 6, rpe: 7.2 }, { weight: 225, reps: 6, rpe: 7.4 }], 6, "back_squat"),
    session(21, [{ weight: 215, reps: 6, rpe: 7 }], 6, "back_squat"),
    session(25, [{ weight: 205, reps: 6, rpe: 7.1 }], 6, "back_squat"),
  ];

  it("flags a lighter week when load climbs and the body pushes back", () => {
    const s = suggestDeload("Legs", ramping);
    expect(s).not.toBeNull();
    expect(s?.evidence.tonnageChangePct).toBeGreaterThan(30);
    expect(s?.evidence.signals.length).toBeGreaterThanOrEqual(2);
    expect(s?.evidence.signals).toContain("effort rising");
  });

  it("stays quiet when volume rises but effort and reps hold", () => {
    const healthy = ramping.map((s) => ({
      ...s,
      sets: s.sets.map((set) => ({ ...set, reps: 6, rpe: 7 })),
    }));
    expect(suggestDeload("Legs", healthy)).toBeNull();
  });

  it("stays quiet without enough sessions to compare", () => {
    expect(suggestDeload("Legs", ramping.slice(0, 3))).toBeNull();
  });
});

describe("explain", () => {
  it("states the recommendation in the user's own numbers", () => {
    const s = suggestProgression("Chest", [
      session(3, [{ weight: 190, reps: 6, rpe: 7 }], 6),
      session(10, [{ weight: 190, reps: 6, rpe: 7 }], 6),
    ]);
    expect(s).not.toBeNull();
    const line = explain(s!, "Bench Press");
    expect(line).toContain("195 lb");
    expect(line).toContain("190 lb");
  });
});
