import type { SessionSummary } from "./types";

/**
 * Brzycki estimated one-rep max. This is the formula the design's numbers
 * assume: 190 lb for 6 reads as 221.
 */
export function e1rm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  // Brzycki breaks down past about 12 reps and is undefined at 37.
  const capped = Math.min(reps, 12);
  return weight * (36 / (37 - capped));
}

export function bestE1rm(sets: Array<{ weight: number; reps: number }>): number {
  return sets.reduce((best, s) => Math.max(best, e1rm(s.weight, s.reps)), 0);
}

export function tonnage(sets: Array<{ weight: number; reps: number }>): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
}

export function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

/** Upper body moves in 2.5 to 5 lb steps, lower body in 5 to 10. */
export function loadStep(muscle: string, weight: number): number {
  const lower = muscle === "Legs";
  const base = lower ? 10 : 5;
  const small = lower ? 5 : 2.5;
  // Light lifts get the small step so a 25 lb raise does not jump 20 percent.
  return weight >= (lower ? 135 : 95) ? base : small;
}

export interface ProgressionSuggestion {
  kind: "progress";
  exerciseId: string;
  from: number;
  to: number;
  repTarget: number;
  evidence: {
    sessionsChecked: number;
    repsHitEverySet: number;
    avgRpe: number | null;
    stepPct: number;
  };
}

export interface DeloadSuggestion {
  kind: "deload";
  muscle: string;
  evidence: {
    tonnagePrev: number;
    tonnageRecent: number;
    tonnageChangePct: number;
    rpePrev: number | null;
    rpeRecent: number | null;
    repsPerSetPrev: number;
    repsPerSetRecent: number;
    signals: string[];
  };
}

export type Suggestion = ProgressionSuggestion | DeloadSuggestion;

export interface ProgressionOptions {
  /** Consecutive qualifying sessions required. */
  sessionsRequired?: number;
  /** Highest reported RPE that still counts as "had more in the tank". */
  rpeCeiling?: number;
}

/**
 * Recommend more weight when the top of the rep range was hit on every working
 * set across the last few sessions and effort stayed submaximal.
 *
 * `history` is newest first.
 */
export function suggestProgression(
  muscle: string,
  history: SessionSummary[],
  options: ProgressionOptions = {},
): ProgressionSuggestion | null {
  const { sessionsRequired = 2, rpeCeiling = 7 } = options;
  if (history.length < sessionsRequired) return null;

  const window = history.slice(0, sessionsRequired);
  const rpes: number[] = [];

  for (const session of window) {
    const working = session.sets.filter((s) => s.reps > 0);
    if (working.length === 0) return null;
    if (!working.every((s) => s.reps >= session.repTarget)) return null;
    for (const s of working) if (typeof s.rpe === "number") rpes.push(s.rpe);
  }

  const avgRpe = rpes.length > 0 ? rpes.reduce((a, b) => a + b, 0) / rpes.length : null;
  if (avgRpe !== null && avgRpe > rpeCeiling) return null;

  const latest = window[0];
  const topWeight = Math.max(...latest.sets.map((s) => s.weight));
  if (topWeight <= 0) return null;

  const step = loadStep(muscle, topWeight);
  const to = roundToIncrement(topWeight + step, step);

  return {
    kind: "progress",
    exerciseId: latest.exerciseId,
    from: topWeight,
    to,
    repTarget: latest.repTarget,
    evidence: {
      sessionsChecked: sessionsRequired,
      repsHitEverySet: window.length,
      avgRpe: avgRpe === null ? null : Number(avgRpe.toFixed(1)),
      stepPct: Number((((to - topWeight) / topWeight) * 100).toFixed(1)),
    },
  };
}

export interface DeloadOptions {
  /** Tonnage rise that counts as a ramp. */
  tonnageThresholdPct?: number;
  /** Require this many of the three signals. */
  signalsRequired?: number;
}

/**
 * Flag a lighter week when load is climbing while the body is saying no:
 * tonnage ramp, rising effort, falling reps. Any one of those alone is normal
 * training, so two must agree.
 *
 * `sessions` is newest first and should cover roughly four weeks of one muscle.
 */
export function suggestDeload(
  muscle: string,
  sessions: SessionSummary[],
  options: DeloadOptions = {},
): DeloadSuggestion | null {
  const { tonnageThresholdPct = 30, signalsRequired = 2 } = options;
  if (sessions.length < 4) return null;

  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;

  const recent = sessions.filter((s) => s.performedAt >= twoWeeksAgo);
  const prev = sessions.filter(
    (s) => s.performedAt < twoWeeksAgo && s.performedAt >= fourWeeksAgo,
  );
  if (recent.length === 0 || prev.length === 0) return null;

  const sumTonnage = (group: SessionSummary[]) =>
    group.reduce((sum, s) => sum + tonnage(s.sets), 0);
  const meanRpe = (group: SessionSummary[]) => {
    const values = group.flatMap((s) =>
      s.sets.map((set) => set.rpe).filter((r): r is number => typeof r === "number"),
    );
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
  };
  const repsPerSet = (group: SessionSummary[]) => {
    const sets = group.flatMap((s) => s.sets);
    return sets.length > 0 ? sets.reduce((a, b) => a + b.reps, 0) / sets.length : 0;
  };

  const tonnagePrev = sumTonnage(prev);
  const tonnageRecent = sumTonnage(recent);
  const changePct = tonnagePrev > 0 ? ((tonnageRecent - tonnagePrev) / tonnagePrev) * 100 : 0;

  const rpePrev = meanRpe(prev);
  const rpeRecent = meanRpe(recent);
  const repsPrev = repsPerSet(prev);
  const repsRecent = repsPerSet(recent);

  const signals: string[] = [];
  if (changePct >= tonnageThresholdPct) signals.push("tonnage ramp");
  if (rpePrev !== null && rpeRecent !== null && rpeRecent - rpePrev >= 0.5) {
    signals.push("effort rising");
  }
  if (repsPrev > 0 && repsRecent < repsPrev - 0.5) signals.push("reps falling");

  if (signals.length < signalsRequired) return null;

  return {
    kind: "deload",
    muscle,
    evidence: {
      tonnagePrev: Math.round(tonnagePrev),
      tonnageRecent: Math.round(tonnageRecent),
      tonnageChangePct: Number(changePct.toFixed(1)),
      rpePrev: rpePrev === null ? null : Number(rpePrev.toFixed(1)),
      rpeRecent: rpeRecent === null ? null : Number(rpeRecent.toFixed(1)),
      repsPerSetPrev: Number(repsPrev.toFixed(1)),
      repsPerSetRecent: Number(repsRecent.toFixed(1)),
      signals,
    },
  };
}

/**
 * The sentence shown on a coach card. Deterministic on purpose: the rules own
 * the numbers, a model only ever rephrases this.
 */
export function explain(suggestion: Suggestion, exerciseName = "this lift"): string {
  if (suggestion.kind === "progress") {
    const { from, to, repTarget, evidence } = suggestion;
    const rpe = evidence.avgRpe === null ? "" : ` at RPE ${evidence.avgRpe}`;
    return `You hit all ${repTarget} reps on every working set for the last ${evidence.sessionsChecked} sessions${rpe}. Open at ${to} lb instead of ${from} lb.`;
  }
  const { tonnageChangePct, rpePrev, rpeRecent, signals } = suggestion.evidence;
  const effort =
    rpePrev !== null && rpeRecent !== null ? ` while session RPE moved ${rpePrev} to ${rpeRecent}` : "";
  return `${suggestion.muscle} tonnage is up ${tonnageChangePct}% over two weeks${effort}. Signals: ${signals.join(", ")}. A lighter week now protects the next block.`;
}
