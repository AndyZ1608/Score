import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { prisma } from "@/lib/prisma";
import { calculateAllFinishedMatches } from "@/lib/scoring";

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const summary = await calculateAllFinishedMatches();
    await prisma.syncLog.create({
      data: {
        provider: "internal",
        jobType: "CALCULATE_SCORES",
        status: summary.errors.length ? "PARTIAL_SUCCESS" : "SUCCESS",
        message: `${summary.processedMatches} matches processed; ${summary.updatedPredictions} predictions updated; ${summary.updatedUsers} users updated; ${summary.errors.length} errors`,
      },
    });
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calculation failed";
    await prisma.syncLog.create({ data: { provider: "internal", jobType: "CALCULATE_SCORES", status: "FAILED", message } });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
