export type EquipmentId =
  | "barbell"
  | "squat_rack"
  | "bench"
  | "dumbbell"
  | "cable_stack"
  | "pullup_bar"
  | "smith_machine"
  | "leg_press"
  | "kettlebell"
  | "ez_bar"
  | "trap_bar"
  | "hack_squat"
  | "sled"
  | "belt_squat"
  | "bodyweight"
  | "band";

export type Muscle = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";

export type MovementPattern =
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "squat"
  | "hinge"
  | "lunge"
  | "carry"
  | "isolation";

export interface Equipment {
  id: EquipmentId;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  pattern: MovementPattern;
  /** Equipment that must be present at the gym to perform this at all. */
  equipment: EquipmentId;
  /** Rough ordering of how heavily the movement can be loaded, 1 light to 5 heavy. */
  loadClass: 1 | 2 | 3 | 4 | 5;
  cues?: string;
  /** Curated substitutions, best first. Falls back to scoring when absent. */
  substitutes?: string[];
}

export interface Gym {
  id: string;
  name: string;
  /** Short line shown under the gym name. */
  note: string;
  equipment: EquipmentId[];
}

export interface SetEntry {
  /** Client-generated id, also the server idempotency key. */
  clientId: string;
  workoutId: string;
  exerciseId: string;
  setIndex: number;
  weight: number;
  reps: number;
  rpe?: number;
  doneAt?: number;
  /**
   * Top of the rep range this set was prescribed against, when the workout
   * came from a routine. Stored per set so a session rebuilt from IndexedDB
   * can be judged against the target it was actually given; absent means the
   * target is unknown and the progression rule must not fire.
   */
  repTarget?: number;
}

export interface Workout {
  id: string;
  gymId: string;
  routineId?: string;
  name: string;
  startedAt: number;
  endedAt?: number;
  /** Set when the rows have been accepted by the server. */
  syncedAt?: number;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  repLow: number;
  repHigh: number;
  targetWeight?: number;
}

export interface Routine {
  id: string;
  name: string;
  tint?: string;
  exercises: RoutineExercise[];
  lastPerformedAt?: number;
}

export interface SessionSummary {
  exerciseId: string;
  performedAt: number;
  sets: Array<{ weight: number; reps: number; rpe?: number }>;
  /** Top of the prescribed rep range for that session. */
  repTarget: number;
}
