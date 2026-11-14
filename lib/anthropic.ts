// TODO: key supplied later — set ANTHROPIC_API_KEY in .env.local

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
      model: "claude-haiku-4-5-20251001",
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
