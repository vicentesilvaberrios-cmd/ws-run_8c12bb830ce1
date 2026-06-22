import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

/**
 * GET /api/highscore
 * Returns the current high score from the server.
 * If no score has been recorded, returns { score: 0 }.
 */
export async function GET() {
  const db = getDb();
  const row = db
    .prepare("SELECT MAX(score) AS maxScore FROM high_scores")
    .get() as { maxScore: number | null } | undefined;

  const score = row?.maxScore ?? 0;
  return NextResponse.json({ score });
}

/**
 * POST /api/highscore
 * Body: { score: number }
 * Validates that score is a positive integer.
 * Inserts the score only if it exceeds the current maximum.
 * Returns { score: number, isNew: boolean }.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate score: must be a positive integer
  const scoreCandidate = (body as Record<string, unknown>)?.score;
  if (
    typeof scoreCandidate !== "number" ||
    !Number.isInteger(scoreCandidate) ||
    scoreCandidate <= 0
  ) {
    return NextResponse.json(
      { error: "score must be a positive integer" },
      { status: 400 }
    );
  }

  const score = scoreCandidate;
  const db = getDb();

  const row = db
    .prepare("SELECT MAX(score) AS maxScore FROM high_scores")
    .get() as { maxScore: number | null } | undefined;

  const currentMax = row?.maxScore ?? 0;

  if (score > currentMax) {
    const id = randomUUID();
    db.prepare(
      "INSERT INTO high_scores (id, score) VALUES (?, ?)"
    ).run(id, score);
    return NextResponse.json({ score, isNew: true });
  }

  return NextResponse.json({ score: currentMax, isNew: false });
}
