import { describe, expect, it } from "vitest";
import {
  buildGymContext,
  isAvailable,
  queryLibrary,
  routineConflicts,
  substituteFor,
  substitutesForBusy,
} from "./availability";
import { EXERCISES, exerciseById, gymById } from "./catalog";
import type { OccupancySnapshot } from "./occupancy";

const utRec = gymById("ut_rec");
const planetFitness = gymById("pf_kingston");
const garage = gymById("home_garage");

const ex = (id: string) => {
  const found = exerciseById(id);
  if (!found) throw new Error(`fixture missing exercise ${id}`);
  return found;
};

describe("availability", () => {
  it("gates on the equipment the gym actually has", () => {
    expect(isAvailable(ex("bench_press"), utRec)).toBe(true);
    expect(isAvailable(ex("bench_press"), planetFitness)).toBe(false);
    expect(isAvailable(ex("hack_squat"), utRec)).toBe(false);
    expect(isAvailable(ex("hack_squat"), planetFitness)).toBe(true);
  });

  it("treats bodyweight and bands as available anywhere", () => {
    for (const gym of [utRec, planetFitness, garage]) {
      expect(isAvailable(ex("pushup"), gym)).toBe(true);
      expect(isAvailable(ex("band_pulldown"), gym)).toBe(true);
    }
  });

  it("counts what the gym can and cannot load", () => {
    const ctx = buildGymContext(utRec);
    expect(ctx.totalCount).toBe(EXERCISES.length);
    expect(ctx.availableCount + ctx.missingCount).toBe(ctx.totalCount);
    expect(ctx.availableIds.has("trap_bar_deadlift")).toBe(false);
    expect(ctx.missingEquipment).toContain("trap_bar");
    // A better equipped gym can never offer fewer exercises.
    expect(ctx.availableCount).toBeGreaterThan(buildGymContext(garage).availableCount);
  });
});

describe("substitution", () => {
  it("prefers a curated substitute the gym can load", () => {
    const utCtx = buildGymContext(utRec);
    expect(substituteFor(ex("trap_bar_deadlift"), utCtx)?.id).toBe("rack_pull");
    expect(substituteFor(ex("hack_squat"), utCtx)?.id).toBe("leg_press");

    const pfCtx = buildGymContext(planetFitness);
    expect(substituteFor(ex("bench_press"), pfCtx)?.id).toBe("smith_press");
    expect(substituteFor(ex("back_squat"), pfCtx)?.id).toBe("hack_squat");
  });

  it("skips curated substitutes the gym also lacks", () => {
    const garageCtx = buildGymContext(garage);
    // db_fly is the curated swap for cable_fly, but the garage has no dumbbells.
    expect(substituteFor(ex("cable_fly"), garageCtx)?.id).not.toBe("db_fly");
    expect(substituteFor(ex("cable_fly"), garageCtx)?.muscle).toBe("Chest");
  });

  it("never substitutes across muscles for an isolation lift", () => {
    const garageCtx = buildGymContext(garage);
    const swap = substituteFor(ex("cable_fly"), garageCtx);
    expect(swap?.id).toBe("pushup");
  });

  it("returns an available exercise or nothing at all", () => {
    for (const gym of [utRec, planetFitness, garage]) {
      const ctx = buildGymContext(gym);
      for (const exercise of EXERCISES) {
        if (ctx.availableIds.has(exercise.id)) continue;
        const swap = substituteFor(exercise, ctx);
        if (swap) expect(ctx.availableIds.has(swap.id)).toBe(true);
      }
    }
  });
});

describe("library query", () => {
  it("hides unavailable exercises when availableOnly is on", () => {
    const ctx = buildGymContext(utRec);
    const rows = queryLibrary(ctx, { availableOnly: true });
    expect(rows.every((r) => r.available)).toBe(true);
    expect(rows.find((r) => r.exercise.id === "trap_bar_deadlift")).toBeUndefined();
  });

  it("marks them instead when availableOnly is off", () => {
    const ctx = buildGymContext(utRec);
    const rows = queryLibrary(ctx, { availableOnly: false });
    const trapBar = rows.find((r) => r.exercise.id === "trap_bar_deadlift");
    expect(trapBar?.available).toBe(false);
    expect(trapBar?.substitute?.id).toBe("rack_pull");
  });

  it("filters by muscle and search text together", () => {
    const ctx = buildGymContext(utRec);
    const rows = queryLibrary(ctx, { muscle: "Chest", search: "press" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.exercise.muscle === "Chest")).toBe(true);
    expect(rows.every((r) => r.exercise.name.toLowerCase().includes("press"))).toBe(true);
  });
});

function busySnap(equipmentId: string): OccupancySnapshot {
  return { equipmentId, total: 1, inUse: 1, updatedAt: 0 };
}

describe("substitutesForBusy", () => {
  it("excludes exercises whose equipment is busy", () => {
    // Training reason: offering a swap to equally busy equipment wastes the
    // user's time — only suggest equipment with capacity.
    const ctx = buildGymContext(utRec);
    const barbellBusy = new Map([["barbell", busySnap("barbell")]]);
    const candidates = substitutesForBusy(ex("bench_press"), ctx, barbellBusy);
    // No candidate may require a barbell.
    expect(candidates.every((c) => c.exercise.equipment !== "barbell")).toBe(true);
  });

  it("skips a busy curated substitute and uses the next available one", () => {
    // Training reason: curated subs win when reachable AND not busy; a busy
    // curated sub is treated the same as an unavailable one.
    const ctx = buildGymContext(utRec);
    // smith_machine is the first curated sub for bench_press; mark it busy.
    const smithBusy = new Map([["smith_machine", busySnap("smith_machine")]]);
    const candidates = substitutesForBusy(ex("bench_press"), ctx, smithBusy);
    expect(candidates.map((c) => c.exercise.id)).not.toContain("smith_press");
    // Falls back to incline_db_press or db_bench_press (both use dumbbell).
    expect(candidates.length).toBeGreaterThan(0);
  });

  it("never substitutes across muscles for an isolation lift", () => {
    // Training reason: isolation movements are defined by the muscle they
    // isolate; a different muscle is never a valid substitute.
    const ctx = buildGymContext(utRec);
    const candidates = substitutesForBusy(ex("cable_fly"), ctx, new Map());
    expect(candidates.every((c) => c.exercise.muscle === "Chest")).toBe(true);
  });

  it("returns at most 3 candidates", () => {
    const ctx = buildGymContext(utRec);
    const candidates = substitutesForBusy(ex("bench_press"), ctx, new Map());
    expect(candidates.length).toBeLessThanOrEqual(3);
  });

  it("includes waitMinutes and evidence on every candidate", () => {
    const ctx = buildGymContext(utRec);
    const candidates = substitutesForBusy(ex("bench_press"), ctx, new Map());
    for (const c of candidates) {
      expect(typeof c.waitMinutes).toBe("number");
      expect(typeof c.evidence).toBe("string");
      expect(c.evidence.length).toBeGreaterThan(0);
    }
  });
});

describe("routine conflicts", () => {
  it("reports which routine entries the gym cannot load", () => {
    const pfCtx = buildGymContext(planetFitness);
    const conflicts = routineConflicts(["bench_press", "incline_db_press", "overhead_press"], pfCtx);
    expect(conflicts.map((c) => c.exercise.id)).toEqual(["bench_press", "overhead_press"]);
    expect(conflicts[0].substitute?.id).toBe("smith_press");
  });

  it("reports nothing when every entry is available", () => {
    const ctx = buildGymContext(utRec);
    expect(routineConflicts(["bench_press", "cable_fly", "pullup"], ctx)).toEqual([]);
  });
});
