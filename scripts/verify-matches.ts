import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const bySource = await prisma.match.groupBy({ by: ["source"], _count: { _all: true } });
  for (const row of bySource) {
    console.log(`source ${row.source} = ${row._count._all}`);
  }

  const visibleMock = await prisma.match.count({ where: { source: "mock", isArchived: false } });
  const archivedMock = await prisma.match.count({ where: { source: "mock", isArchived: true } });
  const visibleTheSportsDB = await prisma.match.count({ where: { source: "thesportsdb", isArchived: false } });

  console.log(`source thesportsdb visible = ${visibleTheSportsDB}`);
  console.log(`source mock visible = ${visibleMock}`);
  console.log(`source mock archived = ${archivedMock}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
