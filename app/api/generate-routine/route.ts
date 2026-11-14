import { type NextRequest, NextResponse } from "next/server";
import { buildGymContext } from "@/lib/availability";
import { gymById } from "@/lib/catalog";
import { generateRoutine } from "@/lib/anthropic";
import { candidateList, fallbackDay, validateGeneratedDays, type GeneratedDay } from "@/lib/routineGen";

/**
 * Generates training days from a plain-language request.
 *
 * The model only ever proposes. Everything it returns is validated against the
 * selected gym by validateGeneratedDays, which drops unknown ids, drops
 * anything the gym cannot load, clamps sets and reps, and discards any weight.
 * If the key is missing, the call fails, it times out, or nothing survives
 * validation, a deterministic session is returned instead, so the feature
 * always produces something usable.
 */

interface RequestBody {
  request?: string;
  gymId?: string;
}

interface ResponseBody {
  days: GeneratedDay[];
  /** "model" or "fallback", so the UI can be honest about what produced this. */
  source: "model" | "fallback";
}

const TIMEOUT_MS = 20_000;
const MAX_REQUEST_CHARS = 500;

export async function POST(req: NextRequest): Promise<NextResponse<ResponseBody>> {
  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    /* fall through to the fallback below */
  }

  const gym = gymById(body.gymId ?? "");
  const ctx = buildGymContext(gym);
  const fallback: ResponseBody = { days: fallbackDay(ctx), source: "fallback" };

  const request = (body.request ?? "").trim().slice(0, MAX_REQUEST_CHARS);
  if (!request) return NextResponse.json(fallback);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const raw = await generateRoutine(
      { request, gymName: gym.name, candidates: candidateList(ctx) },
      controller.signal,
    );
    clearTimeout(timeout);

    const days = validateGeneratedDays(raw, ctx.availableIds);
    if (days.length === 0) return NextResponse.json(fallback);
    return NextResponse.json({ days, source: "model" });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json(fallback);
  }
}
