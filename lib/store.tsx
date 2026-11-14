"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildGymContext, type GymContext } from "./availability";
import { GYMS, ROUTINES, exerciseById, gymById } from "./catalog";
import { loadActiveWorkout, loadSets, saveSets, saveWorkout } from "./db";
import { historyFor } from "./history";
import type { Routine, SetEntry } from "./types";

export interface ActiveSet {
  clientId: string;
  /** Held as strings so a half-typed "1" does not become the number 1. */
  weight: string;
  reps: string;
  done: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  targetReps?: number;
  sets: ActiveSet[];
}

export interface ActiveSession {
  id: string;
  name: string;
  gymId: string;
  routineId?: string;
  startedAt: number;
  exercises: ActiveExercise[];
}

export interface RestTimer {
  open: boolean;
  /** Seconds. 0 means the custom field is selected. */
  duration: number;
  startedAt: number | null;
}

const GYM_KEY = "volfit.gym";
const ONLY_KEY = "volfit.availableOnly";
const DEFAULT_REST = 90;

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or a full quota. A lost preference is not worth a crash.
  }
}

interface StoreValue {
  gymId: string;
  gym: ReturnType<typeof gymById>;
  gymCtx: GymContext;
  gyms: typeof GYMS;
  setGymId: (id: string) => void;

  availableOnly: boolean;
  setAvailableOnly: (value: boolean) => void;

  routines: Routine[];
  session: ActiveSession | null;
  startEmpty: () => void;
  startRoutine: (routineId: string) => void;
  addExercise: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, clientId: string, patch: Partial<ActiveSet>) => void;
  toggleSetDone: (exerciseId: string, clientId: string) => void;
  finish: () => void;

  rest: RestTimer;
  setRestDuration: (seconds: number) => void;
  closeRest: () => void;

  /** Last session's numbers for that set index, for the PREVIOUS column. */
  previousFor: (exerciseId: string, setIndex: number) => string;
  tonnage: number;
}

const StoreContext = createContext<StoreValue | null>(null);

export function VolFitProvider({ children }: { children: React.ReactNode }) {
  const [gymId, setGymIdState] = useState<string>(GYMS[0].id);
  const [availableOnly, setAvailableOnlyState] = useState(true);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [rest, setRest] = useState<RestTimer>({
    open: false,
    duration: DEFAULT_REST,
    startedAt: null,
  });
  const restored = useRef(false);

  // Restore preferences and any workout left open by a reload or a dead battery.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const storedGym = readLocal(GYM_KEY);
    if (storedGym && GYMS.some((g) => g.id === storedGym)) setGymIdState(storedGym);
    const storedOnly = readLocal(ONLY_KEY);
    if (storedOnly !== null) setAvailableOnlyState(storedOnly === "true");

    void (async () => {
      const open = await loadActiveWorkout();
      if (!open) return;
      const rows = await loadSets(open.id);
      const byExercise = new Map<string, ActiveSet[]>();
      for (const row of rows) {
        const list = byExercise.get(row.exerciseId) ?? [];
        list.push({
          clientId: row.clientId,
          weight: row.weight ? String(row.weight) : "",
          reps: row.reps ? String(row.reps) : "",
          done: Boolean(row.doneAt),
        });
        byExercise.set(row.exerciseId, list);
      }
      setSession({
        id: open.id,
        name: open.name,
        gymId: open.gymId,
        routineId: open.routineId,
        startedAt: open.startedAt,
        exercises: Array.from(byExercise.entries()).map(([exerciseId, sets]) => ({
          exerciseId,
          sets,
        })),
      });
    })();
  }, []);

  const gym = useMemo(() => gymById(gymId), [gymId]);
  const gymCtx = useMemo(() => buildGymContext(gym), [gym]);

  const setGymId = useCallback((id: string) => {
    setGymIdState(id);
    writeLocal(GYM_KEY, id);
  }, []);

  const setAvailableOnly = useCallback((value: boolean) => {
    setAvailableOnlyState(value);
    writeLocal(ONLY_KEY, String(value));
  }, []);

  // Persist the session on every change. IndexedDB first, server later.
  useEffect(() => {
    if (!session) return;
    void saveWorkout({
      id: session.id,
      gymId: session.gymId,
      routineId: session.routineId,
      name: session.name,
      startedAt: session.startedAt,
    });
    const rows: SetEntry[] = session.exercises.flatMap((ex) =>
      ex.sets.map((s, index) => ({
        clientId: s.clientId,
        workoutId: session.id,
        exerciseId: ex.exerciseId,
        setIndex: index + 1,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
        doneAt: s.done ? Date.now() : undefined,
      })),
    );
    void saveSets(rows);
  }, [session]);

  const blankSet = useCallback(
    (weight = "", reps = ""): ActiveSet => ({ clientId: uid(), weight, reps, done: false }),
    [],
  );

  const startEmpty = useCallback(() => {
    setSession({
      id: uid(),
      name: "Empty Workout",
      gymId,
      startedAt: Date.now(),
      exercises: [],
    });
  }, [gymId]);

  const startRoutine = useCallback(
    (routineId: string) => {
      const routine = ROUTINES.find((r) => r.id === routineId);
      if (!routine) return;
      setSession({
        id: uid(),
        name: routine.name,
        gymId,
        routineId: routine.id,
        startedAt: Date.now(),
        // Entries the gym cannot load are left out here; the logger offers the
        // swap rather than silently substituting behind the user's back.
        exercises: routine.exercises
          .filter((entry) => gymCtx.availableIds.has(entry.exerciseId))
          .map((entry) => ({
            exerciseId: entry.exerciseId,
            targetReps: entry.repHigh,
            sets: Array.from({ length: entry.targetSets }, () =>
              blankSet(entry.targetWeight ? String(entry.targetWeight) : "", ""),
            ),
          })),
      });
    },
    [blankSet, gymCtx, gymId],
  );

  const ensureSession = useCallback((): ActiveSession => {
    if (session) return session;
    const fresh: ActiveSession = {
      id: uid(),
      name: "Empty Workout",
      gymId,
      startedAt: Date.now(),
      exercises: [],
    };
    setSession(fresh);
    return fresh;
  }, [gymId, session]);

  const addExercise = useCallback(
    (exerciseId: string) => {
      const base = ensureSession();
      if (base.exercises.some((e) => e.exerciseId === exerciseId)) return;
      setSession({
        ...base,
        exercises: [...base.exercises, { exerciseId, sets: [blankSet(), blankSet(), blankSet()] }],
      });
    },
    [blankSet, ensureSession],
  );

  const removeExercise = useCallback((exerciseId: string) => {
    setSession((prev) =>
      prev ? { ...prev, exercises: prev.exercises.filter((e) => e.exerciseId !== exerciseId) } : prev,
    );
  }, []);

  const addSet = useCallback(
    (exerciseId: string) => {
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex;
            const last = ex.sets[ex.sets.length - 1];
            // A new set inherits the previous load, which is what you want
            // nine times out of ten and saves two taps.
            return { ...ex, sets: [...ex.sets, blankSet(last?.weight ?? "", "")] };
          }),
        };
      });
    },
    [blankSet],
  );

  const updateSet = useCallback(
    (exerciseId: string, clientId: string, patch: Partial<ActiveSet>) => {
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) => (s.clientId === clientId ? { ...s, ...patch } : s)),
                }
              : ex,
          ),
        };
      });
    },
    [],
  );

  const toggleSetDone = useCallback(
    (exerciseId: string, clientId: string) => {
      let nowDone = false;
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) =>
            ex.exerciseId === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) => {
                    if (s.clientId !== clientId) return s;
                    nowDone = !s.done;
                    return { ...s, done: nowDone };
                  }),
                }
              : ex,
          ),
        };
      });
      // Completing a set starts the rest clock. Unchecking a set does not.
      setRest((prev) =>
        nowDone ? { ...prev, open: true, startedAt: Date.now() } : prev,
      );
    },
    [],
  );

  const finish = useCallback(() => {
    setSession((prev) => {
      if (prev) void saveWorkout({
        id: prev.id,
        gymId: prev.gymId,
        routineId: prev.routineId,
        name: prev.name,
        startedAt: prev.startedAt,
        endedAt: Date.now(),
      });
      return null;
    });
    setRest({ open: false, duration: DEFAULT_REST, startedAt: null });
  }, []);

  const setRestDuration = useCallback((seconds: number) => {
    setRest((prev) => ({ ...prev, duration: seconds, startedAt: Date.now() }));
  }, []);

  const closeRest = useCallback(() => {
    setRest((prev) => ({ ...prev, open: false, startedAt: null }));
  }, []);

  const previousFor = useCallback((exerciseId: string, setIndex: number) => {
    const history = historyFor(exerciseId);
    const last = history[0];
    const set = last?.sets[setIndex - 1];
    if (!set) return "—";
    const unit = exerciseById(exerciseId)?.equipment === "bodyweight" || set.weight === 0;
    return unit ? `BW × ${set.reps}` : `${set.weight} × ${set.reps}`;
  }, []);

  const tonnage = useMemo(() => {
    if (!session) return 0;
    return session.exercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets.reduce(
          (inner, s) => inner + (s.done ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0),
          0,
        ),
      0,
    );
  }, [session]);

  const value: StoreValue = {
    gymId,
    gym,
    gymCtx,
    gyms: GYMS,
    setGymId,
    availableOnly,
    setAvailableOnly,
    routines: ROUTINES,
    session,
    startEmpty,
    startRoutine,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    toggleSetDone,
    finish,
    rest,
    setRestDuration,
    closeRest,
    previousFor,
    tonnage,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside VolFitProvider");
  return value;
}

/**
 * Seconds elapsed since a timestamp, recomputed on a one-second tick.
 * Derived from the stored start time rather than accumulated ticks, so a
 * backgrounded tab or a locked phone cannot drift.
 */
export function useElapsed(since: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (since === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [since]);
  if (since === null) return 0;
  return Math.max(0, Math.floor((now - since) / 1000));
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
