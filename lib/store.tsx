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
import type { User } from "@supabase/supabase-js";
import { buildGymContext, substituteFor, type GymContext } from "./availability";
import { ROUTINES, exerciseById, gymById } from "./catalog";
import { loadActiveWorkout, loadHistory, loadSets, saveWorkout, saveSets } from "./db";
import { allHistory, populateHistory } from "./history";
import type { OccupancySnapshot } from "./occupancy";
import { gymOccupancySnapshot } from "./occupancySim";
import { supabase } from "./supabase";
import { pullRemote, pushPending } from "./sync";
import type { Routine, RoutineExercise, SessionSummary, SetEntry } from "./types";

export interface ActiveSet {
  clientId: string;
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
  duration: number;
  startedAt: number | null;
}

/** Fixed to TRECS — the only gym we support in this release. */
const FIXED_GYM_ID  = "ut_rec";
const ROUTINES_KEY  = "volfit.routines";
const ONLY_KEY      = "volfit.availableOnly";
const DEFAULT_REST  = 90;

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function readLocal(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function writeLocal(key: string, value: string): void {
  try { window.localStorage.setItem(key, value); } catch { /* quota / private mode */ }
}

interface StoreValue {
  gym: ReturnType<typeof gymById>;
  gymCtx: GymContext;
  availableOnly: boolean;
  setAvailableOnly: (value: boolean) => void;

  routines: Routine[];
  saveRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;

  history: SessionSummary[];

  session: ActiveSession | null;
  startEmpty: () => void;
  startRoutine: (routineId: string) => void;
  addExercise: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
  swapExercise: (oldId: string, newId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, clientId: string, patch: Partial<ActiveSet>) => void;
  toggleSetDone: (exerciseId: string, clientId: string) => void;
  finish: () => void;

  rest: RestTimer;
  setRestDuration: (seconds: number) => void;
  closeRest: () => void;

  previousFor: (exerciseId: string, setIndex: number) => string;
  tonnage: number;
  occupancy: Map<string, OccupancySnapshot>;

  authUser: User | null;
  syncStatus: "idle" | "syncing" | "error";
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function VolFitProvider({ children }: { children: React.ReactNode }) {
  const gym    = useMemo(() => gymById(FIXED_GYM_ID), []);
  const gymCtx = useMemo(() => buildGymContext(gym), [gym]);

  const [availableOnly, setAvailableOnlyState] = useState(true);
  const [routines, setRoutines]                = useState<Routine[]>([]);
  const [history,  setHistory]                 = useState<SessionSummary[]>([]);
  const [session,  setSession]                 = useState<ActiveSession | null>(null);
  const [rest,     setRest]                    = useState<RestTimer>({
    open: false, duration: DEFAULT_REST, startedAt: null,
  });
  const [occupancy, setOccupancy] = useState<Map<string, OccupancySnapshot>>(
    () => gymOccupancySnapshot(FIXED_GYM_ID, gym?.equipment ?? []),
  );
  const [authUser,    setAuthUser]    = useState<User | null>(null);
  const [syncStatus,  setSyncStatus]  = useState<"idle" | "syncing" | "error">("idle");
  const restored = useRef(false);

  const refreshHistory = useCallback(async () => {
    const rows = await loadHistory();
    populateHistory(rows);
    // populateHistory merges the real rows over the seed; the merged cache is
    // what the screens should render. Setting `rows` here showed an empty
    // History while Home and Progress, which read allHistory() directly, were
    // showing seeded numbers.
    setHistory(allHistory());
  }, []);

  // Refresh occupancy every 5 minutes to pick up the next LCG window.
  useEffect(() => {
    const refresh = () =>
      setOccupancy(gymOccupancySnapshot(FIXED_GYM_ID, gym?.equipment ?? []));
    const id = window.setInterval(refresh, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [gym]);

  // Keep authUser in sync with the Supabase session, and pull remote history
  // whenever the user signs in so a new device is populated immediately.
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setAuthUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthUser(session?.user ?? null);
        if (event === "SIGNED_IN" && session?.user) {
          setSyncStatus("syncing");
          pullRemote(session.user)
            .then(() => refreshHistory())
            .catch((err) => console.error("[volfit] pullRemote failed:", err))
            .finally(() => setSyncStatus("idle"));
        }
      },
    );
    return () => subscription.unsubscribe();
  }, [refreshHistory]);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const storedOnly = readLocal(ONLY_KEY);
    if (storedOnly !== null) setAvailableOnlyState(storedOnly === "true");

    // Seeded routines are the fallback, not an empty list: a workout started
    // without a routine has no rep range, so it records no target and the
    // coach can never judge it. A first-run user with no routines would never
    // see a suggestion.
    const stored = readLocal(ROUTINES_KEY);
    let savedRoutines: Routine[] | null = null;
    if (stored) {
      try { savedRoutines = JSON.parse(stored) as Routine[]; } catch { /* corrupt data */ }
    }
    setRoutines(savedRoutines && savedRoutines.length > 0 ? savedRoutines : ROUTINES);

    void refreshHistory();

    void (async () => {
      const open = await loadActiveWorkout();
      if (!open) return;
      const rows = await loadSets(open.id);
      const byExercise = new Map<string, ActiveSet[]>();
      for (const row of rows) {
        const list = byExercise.get(row.exerciseId) ?? [];
        list.push({
          clientId: row.clientId,
          weight:   row.weight ? String(row.weight) : "",
          reps:     row.reps   ? String(row.reps)   : "",
          done:     Boolean(row.doneAt),
        });
        byExercise.set(row.exerciseId, list);
      }
      setSession({
        id:        open.id,
        name:      open.name,
        gymId:     open.gymId,
        routineId: open.routineId,
        startedAt: open.startedAt,
        exercises: Array.from(byExercise.entries()).map(([exerciseId, sets]) => ({
          exerciseId, sets,
        })),
      });
    })();
  }, [refreshHistory]);

  const setAvailableOnly = useCallback((value: boolean) => {
    setAvailableOnlyState(value);
    writeLocal(ONLY_KEY, String(value));
  }, []);

  const saveRoutine = useCallback((routine: Routine) => {
    setRoutines((prev) => {
      const next = prev.some((r) => r.id === routine.id)
        ? prev.map((r) => (r.id === routine.id ? routine : r))
        : [...prev, routine];
      writeLocal(ROUTINES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines((prev) => {
      const next = prev.filter((r) => r.id !== id);
      writeLocal(ROUTINES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!session) return;
    void saveWorkout({
      id:        session.id,
      gymId:     session.gymId,
      routineId: session.routineId,
      name:      session.name,
      startedAt: session.startedAt,
    });
    const rows: SetEntry[] = session.exercises.flatMap((ex) =>
      ex.sets.map((s, index) => ({
        clientId:   s.clientId,
        workoutId:  session.id,
        exerciseId: ex.exerciseId,
        setIndex:   index + 1,
        weight:     Number(s.weight) || 0,
        reps:       Number(s.reps)   || 0,
        doneAt:     s.done ? Date.now() : undefined,
        repTarget:  ex.targetReps,
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
      id:        uid(),
      name:      "Workout",
      gymId:     FIXED_GYM_ID,
      startedAt: Date.now(),
      exercises: [],
    });
  }, []);

  const startRoutine = useCallback(
    (routineId: string) => {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return;
      setSession({
        id:        uid(),
        name:      routine.name,
        gymId:     FIXED_GYM_ID,
        routineId: routine.id,
        startedAt: Date.now(),
        // Keep ALL exercises — unavailable ones show a swap prompt in workout page.
        exercises: routine.exercises.map((entry) => ({
          exerciseId: entry.exerciseId,
          targetReps: entry.repHigh,
          sets: Array.from({ length: entry.targetSets }, () =>
            blankSet(entry.targetWeight ? String(entry.targetWeight) : "", ""),
          ),
        })),
      });
    },
    [blankSet, routines],
  );

  const ensureSession = useCallback((): ActiveSession => {
    if (session) return session;
    const fresh: ActiveSession = {
      id:        uid(),
      name:      "Workout",
      gymId:     FIXED_GYM_ID,
      startedAt: Date.now(),
      exercises: [],
    };
    setSession(fresh);
    return fresh;
  }, [session]);

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

  const swapExercise = useCallback((oldId: string, newId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.exercises.some((e) => e.exerciseId === newId)) {
        // New exercise already in session — just drop the old one.
        return { ...prev, exercises: prev.exercises.filter((e) => e.exerciseId !== oldId) };
      }
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.exerciseId === oldId ? { ...ex, exerciseId: newId } : ex,
        ),
      };
    });
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
              ? { ...ex, sets: ex.sets.map((s) => (s.clientId === clientId ? { ...s, ...patch } : s)) }
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
      setRest((prev) =>
        nowDone ? { ...prev, open: true, startedAt: Date.now() } : prev,
      );
    },
    [],
  );

  const finish = useCallback(() => {
    setSession((prev) => {
      if (prev)
        void saveWorkout({
          id:        prev.id,
          gymId:     prev.gymId,
          routineId: prev.routineId,
          name:      prev.name,
          startedAt: prev.startedAt,
          endedAt:   Date.now(),
        });
      return null;
    });
    setRest({ open: false, duration: DEFAULT_REST, startedAt: null });
    void refreshHistory();
    // Push to Supabase if signed in — non-blocking, non-fatal.
    if (authUser) {
      setSyncStatus("syncing");
      // Slight delay to let saveWorkout/saveSets flush to IndexedDB first.
      setTimeout(() => {
        pushPending(authUser)
          .then(() => setSyncStatus("idle"))
          .catch(() => setSyncStatus("error"));
      }, 400);
    }
  }, [refreshHistory, authUser]);

  const setRestDuration = useCallback((seconds: number) => {
    setRest((prev) => ({ ...prev, duration: seconds, startedAt: Date.now() }));
  }, []);

  const closeRest = useCallback(() => {
    setRest((prev) => ({ ...prev, open: false, startedAt: null }));
  }, []);

  const previousFor = useCallback(
    (exerciseId: string, setIndex: number) => {
      const sessions = history
        .filter((s) => s.exerciseId === exerciseId)
        .sort((a, b) => b.performedAt - a.performedAt);
      const last = sessions[0];
      const set  = last?.sets[setIndex - 1];
      if (!set) return "—";
      const bw = exerciseById(exerciseId)?.equipment === "bodyweight" || set.weight === 0;
      return bw ? `BW × ${set.reps}` : `${set.weight} × ${set.reps}`;
    },
    [history],
  );

  const tonnage = useMemo(() => {
    if (!session) return 0;
    return session.exercises.reduce(
      (sum, ex) =>
        sum + ex.sets.reduce(
          (inner, s) => inner + (s.done ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0),
          0,
        ),
      0,
    );
  }, [session]);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Expose substituteFor bound to current gymCtx so pages don't import availability directly.
  const boundSubstituteFor = useCallback(
    (exercise: Parameters<typeof substituteFor>[0]) => substituteFor(exercise, gymCtx),
    [gymCtx],
  );

  const value: StoreValue = {
    gym, gymCtx,
    availableOnly, setAvailableOnly,
    routines, saveRoutine, deleteRoutine,
    history,
    session, startEmpty, startRoutine,
    addExercise, removeExercise, swapExercise,
    addSet, updateSet, toggleSetDone, finish,
    rest, setRestDuration, closeRest,
    previousFor, tonnage,
    occupancy,
    authUser, syncStatus, signIn, signUp, signOut,
    // @ts-expect-error extra field used by workout page
    substituteFor: boundSubstituteFor,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside VolFitProvider");
  return value;
}

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

export type { RoutineExercise };
