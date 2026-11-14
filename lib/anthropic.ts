// TODO: key supplied later — set ANTHROPIC_API_KEY in .env.local

/**
 * One place for the model id so both calls move together. Verify this string
 * against the current model list before relying on it in a live demo.
 */
const MODEL = "claude-haiku-5-5";

export interface SwapArgs {
  /** IDs the model is allowed to pick from — it must not invent new IDs. */
  candidateIds: string[];
  exerciseName: string;
  sessionName: string;
}

export interface SwapResult {
  chosenId: string;
  sentence: string;
}

/**
 * Calls the Anthropic messages API to select the best swap candidate and
 * produce a plain-language explanation.
 *
 * Hard constraints for the model:
 *  - Only pick from the provided candidateIds; never invent exercise IDs.
 *  - No weights, reps, or programming advice in the sentence.
 *  - One sentence, plain language, no emojis.
 *
 * Returns null when ANTHROPIC_API_KEY is not set.  Callers must always
 * provide their own fallback.
 */
export async function fetchSwapRecommendation(
  args: SwapArgs,
  signal?: AbortSignal,
): Promise<SwapResult | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const prompt =
    `You are helping a gym-goer find an exercise swap during their workout "${args.sessionName}". ` +
    `They were about to do ${args.exerciseName} but the equipment is busy. ` +
    `Choose the best replacement from this list: ${args.candidateIds.join(", ")}. ` +
    `Respond with valid JSON only — no markdown, no code fences: ` +
    `{"chosenId":"<one of the given IDs>","sentence":"<one plain sentence, no weights or reps>"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text?.trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as Partial<SwapResult>;
    if (typeof parsed.chosenId !== "string") return null;
    if (typeof parsed.sentence !== "string") return null;
    // Hard constraint: model must only pick from the provided IDs.
    if (!args.candidateIds.includes(parsed.chosenId)) return null;
    return { chosenId: parsed.chosenId, sentence: parsed.sentence };
  } catch {
    return null;
  }
}

/* ── Routine generation ───────────────────────────────────────────────────── */

export interface RoutineCandidate {
  id: string;
  name: string;
  muscle: string;
  pattern: string;
  loadClass: number;
}

export interface GenerateRoutineArgs {
  /** What the lifter asked for, in their own words. */
  request: string;
  gymName: string;
  /** The only exercises the model may use. Anything else is rejected. */
  candidates: RoutineCandidate[];
}

/**
 * Asks the model to design one or more training days using only the exercises
 * the selected gym can load.
 *
 * The model proposes programming: which lifts go together, how many sets, what
 * rep range. It is never asked for a weight, because a weight is a claim about
 * what this lifter can do and that comes from their own logged history.
 *
 * The returned value is unvalidated. The caller must pass it through
 * validateGeneratedDays, which enforces the gym constraint and the bounds.
 *
 * Returns null when ANTHROPIC_API_KEY is not set, the call fails, or the
 * response is not parseable. Callers must always provide their own fallback.
 */
export async function generateRoutine(
  args: GenerateRoutineArgs,
  signal?: AbortSignal,
): Promise<unknown | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const menu = args.candidates
    .map((c) => `${c.id} | ${c.name} | ${c.muscle} | ${c.pattern} | load ${c.loadClass}/5`)
    .join("\n");

  const prompt =
    `You are programming training days for a lifter at ${args.gymName}.\n\n` +
    `Their request, in their words:\n"${args.request}"\n\n` +
    `You may ONLY use exercises from this list. Each line is ` +
    `id | name | muscle | movement pattern | how heavily it loads.\n${menu}\n\n` +
    `Rules:\n` +
    `- Use exercise ids exactly as written above. Never invent an id.\n` +
    `- Between 1 and 4 days. Each day needs 3 to 7 exercises.\n` +
    `- Open each day with its heaviest compound movement.\n` +
    `- Do not repeat an exercise within a day.\n` +
    `- Respect anything they said about injuries, time, or frequency.\n` +
    `- Give a rep range, not a single number. Heavy compounds belong in low ` +
    `ranges, isolation work in higher ones.\n` +
    `- Never include a weight. You do not know what they lift.\n\n` +
    `Respond with valid JSON only, no markdown and no code fences:\n` +
    `{"days":[{"name":"<short day name>","exercises":[` +
    `{"exerciseId":"<id from the list>","targetSets":<1-6>,` +
    `"repLow":<number>,"repHigh":<number>}]}]}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text?.trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as { days?: unknown };
    return parsed.days ?? null;
  } catch {
    return null;
  }
}
