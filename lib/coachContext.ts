import { exerciseById } from "./catalog";
import { coachCards } from "./coach";
import { allHistory } from "./history";
import { bestE1rm, tonnage } from "./strength";
import type { SessionSummary } from "./types";

/**
 * Builds the factual brief the chat answers from.
 *
 * The model is given computed figures and nothing else. It is not given raw
 * sets to add up, because arithmetic it performs is arithmetic nobody checked,
 * and this app's claim is that its numbers mean something. Everything here is
 * derived by the same functions the screens render from, so an answer in the
 * chat and a number on the Progress screen cannot disagree.
 */

const MAX_EXERCISES = 10;
const MAX_SESSIONS_PER_EXERCISE = 6;

function dayLabel(ts: number): string {
  const days = Math.round((Date.now() - ts) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function sessionLine(s: SessionSummary): string {
  const top = s.sets.reduce(
    (best, set) => (set.weight > best.weight ? set : best),
    s.sets[0] ?? { weight: 0, reps: 0 },
  );
  const rpes = s.sets.map((x) => x.rpe).filter((r): r is number => typeof r === "number");
  const avgRpe =
    rpes.length > 0 ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1) : null;
  const target = s.repTarget > 0 ? `target ${s.repTarget}` : "target not recorded";
  return (
    `    ${dayLabel(s.performedAt)}: ${s.sets.length} sets, ` +
    `top ${top.weight} lb x ${top.reps}, ` +
    `e1RM ${Math.round(bestE1rm(s.sets))} lb, ` +
    `volume ${Math.round(tonnage(s.sets))} lb, ` +
    `${target}` +
    (avgRpe ? `, avg RPE ${avgRpe}` : ", RPE not logged")
  );
}

/**
 * A plain-text brief of what this lifter has actually done, plus what the
 * deterministic rules currently say and why. Returns null when there is
 * nothing logged, so the caller can say so rather than inventing a history.
 */
export function buildCoachContext(): string | null {
  const history = allHistory();
  if (history.length === 0) return null;

  const byExercise = new Map<string, SessionSummary[]>();
  for (const s of history) {
    byExercise.set(s.exerciseId, [...(byExercise.get(s.exerciseId) ?? []), s]);
  }

  const ordered = Array.from(byExercise.entries())
    .map(([id, sessions]) => ({
      id,
      sessions: sessions.sort((a, b) => b.performedAt - a.performedAt),
    }))
    .sort((a, b) => b.sessions[0].performedAt - a.sessions[0].performedAt)
    .slice(0, MAX_EXERCISES);

  const lines: string[] = ["LOGGED TRAINING, most recent first:"];

  for (const { id, sessions } of ordered) {
    const name = exerciseById(id)?.name ?? id;
    const muscle = exerciseById(id)?.muscle ?? "unknown";
    lines.push(`  ${name} (${muscle}), ${sessions.length} sessions logged:`);
    for (const s of sessions.slice(0, MAX_SESSIONS_PER_EXERCISE)) {
      lines.push(sessionLine(s));
    }
  }

  const cards = coachCards();
  lines.push("");
  if (cards.length === 0) {
    lines.push(
      "COACH RULES: no suggestion is currently firing. Progression needs every " +
        "working set at the top of a recorded rep range across two sessions at " +
        "mean RPE 7 or below. Deload needs two of three signals: volume up 30 " +
        "percent, RPE up 0.5, reps per set falling.",
    );
  } else {
    lines.push("COACH RULES currently firing:");
    for (const c of cards) {
      const evidence = c.evidence.map((e) => `${e.label} ${e.value}`).join(", ");
      lines.push(`  ${c.title}: ${c.body} (${evidence})`);
    }
  }

  return lines.join("\n");
}
