import { MatchStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResult } from "@/lib/scoring";
import { predictionSchema } from "@/lib/validators";
import { isPredictionLocked, PREDICTION_LOCKED_MESSAGE } from "@/lib/prediction-lock";
import { isMatchVisibleForActiveProvider } from "@/lib/provider-config";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = predictionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { matchId, predictedHomeScore, predictedAwayScore } = parsed.data;
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (!isMatchVisibleForActiveProvider(match)) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.status !== MatchStatus.SCHEDULED || isPredictionLocked(match.kickoffTime)) {
    return NextResponse.json({ error: PREDICTION_LOCKED_MESSAGE }, { status: 403 });
  }
  try {
    const prediction = await prisma.prediction.create({
      data: {
        userId: session.userId,
        matchId,
        predictedHomeScore,
        predictedAwayScore,
        predictedResult: getResult(predictedHomeScore, predictedAwayScore),
      },
    });
    return NextResponse.json({ prediction }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Prediction already exists; edit it instead" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to save prediction" }, { status: 500 });
  }
}
