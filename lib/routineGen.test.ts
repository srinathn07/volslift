import { describe, expect, it } from "vitest";
import { buildGymContext } from "./availability";
import { GYMS, gymById } from "./catalog";
import { candidateList, fallbackDay, validateGeneratedDays } from "./routineGen";

const utRec = buildGymContext(gymById("ut_rec"));
const garage = buildGymContext(GYMS.find((g) => g.id === "home_garage") ?? GYMS[0]);

const day = (exercises: unknown[], name = "Upper") => [{ name, exercises }];

describe("validateGeneratedDays", () => {
  it("keeps a well-formed day", () => {
    const out = validateGeneratedDays(
      day([
        { exerciseId: "bench_press", targetSets: 4, repLow: 6, repHigh: 8 },
        { exerciseId: "barbell_row", targetSets: 3, repLow: 8, repHigh: 10 },
      ]),
      utRec.availableIds,
    );
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe("Upper");
    expect(out[0].exercises.map((e) => e.exerciseId)).toEqual(["bench_press", "barbell_row"]);
  });

  // The premise of the app is that nothing is offered that the gym cannot
  // load, so a hallucinated or unavailable id must not reach the routine.
  it("drops an exercise id that does not exist", () => {
    const out = validateGeneratedDays(
      day([
        { exerciseId: "bench_press", targetSets: 3, repLow: 6, repHigh: 8 },
        { exerciseId: "nordic_hamstring_blaster_3000", targetSets: 3, repLow: 8, repHigh: 10 },
        { exerciseId: "barbell_row", targetSets: 3, repLow: 8, repHigh: 10 },
      ]),
      utRec.availableIds,
    );
    expect(out[0].exercises.map((e) => e.exerciseId)).toEqual(["bench_press", "barbell_row"]);
  });

  it("drops an exercise the gym cannot load", () => {
    // The home garage has no cable stack, so a cable lift must not survive.
    expect(garage.availableIds.has("cable_row")).toBe(false);
    const out = validateGeneratedDays(
      day([
        { exerciseId: "back_squat", targetSets: 4, repLow: 5, repHigh: 6 },
        { exerciseId: "cable_row", targetSets: 3, repLow: 10, repHigh: 12 },
        { exerciseId: "romanian_deadlift", targetSets: 3, repLow: 8, repHigh: 10 },
      ]),
      garage.availableIds,
    );
    expect(out[0].exercises.map((e) => e.exerciseId)).toEqual(["back_squat", "romanian_deadlift"]);
  });

  it("never accepts a weight from the model", () => {
    const out = validateGeneratedDays(
      day([
        { exerciseId: "bench_press", targetSets: 3, repLow: 6, repHigh: 8, targetWeight: 225 },
        { exerciseId: "barbell_row", targetSets: 3, repLow: 8, repHigh: 10, targetWeight: 185 },
      ]),
      utRec.availableIds,
    );
    expect(out[0].exercises.every((e) => e.targetWeight === undefined)).toBe(true);
  });

  it("clamps absurd sets and reps instead of trusting them", () => {
    const out = validateGeneratedDays(
      day([
        { exerciseId: "bench_press", targetSets: 99, repLow: 0, repHigh: 500 },
        { exerciseId: "barbell_row", targetSets: -4, repLow: 8, repHigh: 10 },
      ]),
      utRec.availableIds,
    );
    const [bench, row] = out[0].exercises;
    expect(bench.targetSets).toBe(6);
    expect(bench.repLow).toBe(1);
    expect(bench.repHigh).toBe(30);
    expect(row.targetSets).toBe(1);
  });

  it("flips an inverted rep range rather than discarding the exercise", () => {
    const out = validateGeneratedDays(
      day([
        { exerciseId: "bench_press", targetSets: 3, repLow: 12, repHigh: 6 },
        { exerciseId: "barbell_row", targetSets: 3, repLow: 8, repHigh: 10 },
      ]),
      utRec.availableIds,
    );
    expect(out[0].exercises[0].repLow).toBe(6);
    expect(out[0].exercises[0].repHigh).toBe(12);
  });

  it("drops duplicates within a day", () => {
    const out = validateGeneratedDays(
      day([
        { exerciseId: "bench_press", targetSets: 3, repLow: 6, repHigh: 8 },
        { exerciseId: "bench_press", targetSets: 3, repLow: 6, repHigh: 8 },
        { exerciseId: "barbell_row", targetSets: 3, repLow: 8, repHigh: 10 },
      ]),
      utRec.availableIds,
    );
    expect(out[0].exercises).toHaveLength(2);
  });

  // A day reduced to one usable lift is not a session worth saving.
  it("drops a day left with fewer than two exercises", () => {
    const out = validateGeneratedDays(
      day([
        { exerciseId: "bench_press", targetSets: 3, repLow: 6, repHigh: 8 },
        { exerciseId: "does_not_exist", targetSets: 3, repLow: 8, repHigh: 10 },
      ]),
      utRec.availableIds,
    );
    expect(out).toEqual([]);
  });

  it("caps the number of days and exercises", () => {
    const many = Array.from({ length: 9 }, () => ({
      exerciseId: "bench_press",
      targetSets: 3,
      repLow: 6,
      repHigh: 8,
    }));
    const sixDays = Array.from({ length: 6 }, (_, i) => ({
      name: `Day ${i}`,
      exercises: [
        { exerciseId: "bench_press", targetSets: 3, repLow: 6, repHigh: 8 },
        { exerciseId: "barbell_row", targetSets: 3, repLow: 8, repHigh: 10 },
      ],
    }));
    expect(validateGeneratedDays(sixDays, utRec.availableIds)).toHaveLength(4);
    // Nine entries, but they are all the same lift, so dedupe leaves one and
    // the day is dropped for being too short.
    expect(validateGeneratedDays(day(many), utRec.availableIds)).toEqual([]);
  });

  it("names an unnamed day", () => {
    const out = validateGeneratedDays(
      [{ exercises: [
        { exerciseId: "bench_press", targetSets: 3, repLow: 6, repHigh: 8 },
        { exerciseId: "barbell_row", targetSets: 3, repLow: 8, repHigh: 10 },
      ] }],
      utRec.availableIds,
    );
    expect(out[0].name).toBe("Day 1");
  });

  it("returns nothing for junk", () => {
    expect(validateGeneratedDays(null, utRec.availableIds)).toEqual([]);
    expect(validateGeneratedDays("nope", utRec.availableIds)).toEqual([]);
    expect(validateGeneratedDays([{ name: "x" }], utRec.availableIds)).toEqual([]);
  });
});

describe("candidateList", () => {
  it("offers only what the gym can load", () => {
    const ids = candidateList(garage).map((c) => c.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).not.toContain("cable_row");
    expect(ids.every((id) => garage.availableIds.has(id))).toBe(true);
  });
});

describe("fallbackDay", () => {
  it("builds a usable session with no model involved", () => {
    const [session] = fallbackDay(utRec);
    expect(session.exercises.length).toBeGreaterThanOrEqual(2);
    expect(session.exercises.every((e) => utRec.availableIds.has(e.exerciseId))).toBe(true);
    expect(session.exercises.every((e) => e.targetWeight === undefined)).toBe(true);
  });

  it("still works at a limited gym", () => {
    const days = fallbackDay(garage);
    expect(days[0].exercises.every((e) => garage.availableIds.has(e.exerciseId))).toBe(true);
  });
});
