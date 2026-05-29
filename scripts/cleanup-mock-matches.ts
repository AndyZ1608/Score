import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.CONFIRM_CLEANUP_MOCK_MATCHES !== "true") {
    console.log("Refusing to cleanup mock matches. Set CONFIRM_CLEANUP_MOCK_MATCHES=true to confirm.");
    return;
  }

  const mockMatches = await prisma.match.findMany({
    where: { source: "mock" },
    select: { id: true, externalId: true, homeTeam: true, awayTeam: true, _count: { select: { predictions: true } } },
    orderBy: { kickoffTime: "asc" },
  });

  let deleted = 0;
  let archived = 0;
  for (const match of mockMatches) {
    const label = `${match.externalId}: ${match.homeTeam} vs ${match.awayTeam}`;
    if (match._count.predictions === 0) {
      await prisma.match.delete({ where: { id: match.id } });
      deleted += 1;
      console.log(`Deleted mock match without predictions: ${label}`);
    } else {
      await prisma.match.update({ where: { id: match.id }, data: { isArchived: true } });
      archived += 1;
      console.log(`Archived mock match with predictions: ${label}`);
    }
  }

  console.log(`Cleanup complete. deleted=${deleted}, archived=${archived}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
