import { type NextRequest, NextResponse } from "next/server";
import { fetchSwapRecommendation } from "@/lib/anthropic";

interface RequestBody {
  candidateIds: string[];
  /** Evidence strings paired with candidateIds for the mandatory fallback. */
  candidates?: Array<{ id: string; evidence: string }>;
  exerciseName: string;
  sessionName: string;
}

interface ResponseBody {
  chosenId: string;
  sentence: string;
}

// Hard constraints enforced at this layer (model only picks from given IDs,
// no weights / reps / unlisted exercises — validated in lib/anthropic.ts).
export async function POST(req: NextRequest): Promise<NextResponse<ResponseBody>> {
  const body = (await req.json()) as RequestBody;
  const { candidateIds = [], candidates = [], exerciseName = "", sessionName = "" } = body;

  // Mandatory fallback: first candidate + its evidence sentence.
  const fallback: ResponseBody = {
    chosenId: candidateIds[0] ?? "",
    sentence:
      candidates.find((c) => c.id === candidateIds[0])?.evidence ??
      "This exercise targets the same muscles and is available now.",
  };

  if (candidateIds.length === 0) return NextResponse.json(fallback);

  const controller = new AbortController();
  // The card renders the deterministic evidence straight away and replaces it
  // if a model sentence arrives, so waiting costs the user nothing on screen.
  // 1200 ms could never be met: the model emits a thinking block first and a
  // call measures around five seconds, so this always timed out and the
  // feature silently ran on the fallback.
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const result = await fetchSwapRecommendation(
      { candidateIds, exerciseName, sessionName },
      controller.signal,
    );
    clearTimeout(timeout);
    return NextResponse.json(result ?? fallback);
  } catch {
    clearTimeout(timeout);
    return NextResponse.json(fallback);
  }
}
