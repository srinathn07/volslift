import { describe, expect, it } from "vitest";
import { buildGymContext, isAvailable, queryLibrary, routineConflicts, substituteFor } from "./availability";
import { EXERCISES, exerciseById, gymById } from "./catalog";

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
