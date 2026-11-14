import { type NextRequest, NextResponse } from "next/server";
import { askCoach, type CoachTurn } from "@/lib/anthropic";

/**
 * Answers a question about the lifter's own training.
 *
 * The context is built on the client by lib/coachContext.ts and posted here,
 * because the history lives in the browser: IndexedDB for logged sets and the
 * seed for everything before sync. The route never computes a figure of its
 * own, and neither does the model.
 */

interface RequestBody {
  question?: string;
  context?: string;
  history?: CoachTurn[];
}

interface ResponseBody {
  answer: string;
  /** "model" or "fallback", so the UI can be honest about what produced this. */
  source: "model" | "fallback";
}

const TIMEOUT_MS = 25_000;
const MAX_QUESTION_CHARS = 500;

const NO_KEY =
  "The chat needs an API key to answer in its own words. Your numbers are all " +
  "still here though: the Suggestions tab shows what the rules say about your " +
  "training and the evidence behind each call.";

const NO_DATA =
  "There is nothing logged yet, so there is nothing for me to read. Run a " +
  "workout and tick the sets off as you go, then ask me again.";

export async function POST(req: NextRequest): Promise<NextResponse<ResponseBody>> {
  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    /* fall through */
  }

  const question = (body.question ?? "").trim().slice(0, MAX_QUESTION_CHARS);
  const context = body.context ?? "";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!question) {
    return NextResponse.json({ answer: NO_DATA, source: "fallback" });
  }
  if (!context) {
    return NextResponse.json({ answer: NO_DATA, source: "fallback" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const answer = await askCoach({ question, context, history }, controller.signal);
    clearTimeout(timeout);
    if (!answer) return NextResponse.json({ answer: NO_KEY, source: "fallback" });
    return NextResponse.json({ answer, source: "model" });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json({ answer: NO_KEY, source: "fallback" });
  }
}
