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
  const timeout = setTimeout(() => controller.abort(), 1200);

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
