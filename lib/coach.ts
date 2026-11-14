import { exerciseById } from "./catalog";
import { SEED_HISTORY, historyFor } from "./history";
import { explain, suggestDeload, suggestProgression, type Suggestion } from "./strength";
import type { Muscle, SessionSummary } from "./types";

export interface CoachCard {
  id: string;
  suggestion: Suggestion;
  title: string;
  body: string;
  /** Rows shown inside the "Why this suggestion?" panel. */
  evidence: Array<{ label: string; value: string }>;
}

function groupByMuscle(history: SessionSummary[]): Map<Muscle, SessionSummary[]> {
  const groups = new Map<Muscle, SessionSummary[]>();
  for (const session of history) {
    const muscle = exerciseById(session.exerciseId)?.muscle;
    if (!muscle) continue;
    groups.set(muscle, [...(groups.get(muscle) ?? []), session]);
  }
  for (const [muscle, sessions] of groups) {
    groups.set(
      muscle,
      sessions.sort((a, b) => b.performedAt - a.performedAt),
    );
  }
  return groups;
}

/**
 * Everything the coach has to say, newest evidence first. Rules own the
 * numbers; a model is only ever asked to rephrase `body`.
 */
export function coachCards(history: SessionSummary[] = SEED_HISTORY): CoachCard[] {
  const cards: CoachCard[] = [];
  const exerciseIds = Array.from(new Set(history.map((s) => s.exerciseId)));

  for (const exerciseId of exerciseIds) {
    const exercise = exerciseById(exerciseId);
    if (!exercise) continue;
    const suggestion = suggestProgression(exercise.muscle, historyFor(exerciseId));
    if (!suggestion) continue;
    cards.push({
      id: `progress-${exerciseId}`,
      suggestion,
      title: `Add weight to ${exercise.name}`,
      body: explain(suggestion, exercise.name),
      evidence: [
        { label: "sessions", value: String(suggestion.evidence.sessionsChecked) },
        {
          label: "avg RPE",
          value: suggestion.evidence.avgRpe === null ? "not logged" : String(suggestion.evidence.avgRpe),
        },
        { label: "load step", value: `+${suggestion.evidence.stepPct}%` },
      ],
    });
  }

  for (const [muscle, sessions] of groupByMuscle(history)) {
    const suggestion = suggestDeload(muscle, sessions);
    if (!suggestion) continue;
    cards.push({
      id: `deload-${muscle}`,
      suggestion,
      title: `${muscle} volume is climbing fast`,
      body: explain(suggestion),
      evidence: [
        {
          label: "tonnage",
          value: `${Math.round(suggestion.evidence.tonnagePrev / 1000)}k to ${Math.round(
            suggestion.evidence.tonnageRecent / 1000,
          )}k lb`,
        },
        {
          label: "session RPE",
          value:
            suggestion.evidence.rpePrev === null || suggestion.evidence.rpeRecent === null
              ? "not logged"
              : `${suggestion.evidence.rpePrev} to ${suggestion.evidence.rpeRecent}`,
        },
        {
          label: "reps per set",
          value: `${suggestion.evidence.repsPerSetPrev} to ${suggestion.evidence.repsPerSetRecent}`,
        },
      ],
    });
  }

  // Deloads first: backing off matters more than adding five pounds.
  return cards.sort((a, b) => Number(b.suggestion.kind === "deload") - Number(a.suggestion.kind === "deload"));
}

export const GOALS = ["Strength", "Hypertrophy", "Lean out", "Return from break"] as const;
export type Goal = (typeof GOALS)[number];
