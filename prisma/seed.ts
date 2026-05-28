import { PrismaClient } from "@prisma/client";
import { mockFixtures } from "../src/lib/football-provider";

const prisma = new PrismaClient();

async function main() {
  for (const fixture of mockFixtures()) {
    await prisma.match.upsert({
      where: { externalId: fixture.externalId },
      update: fixture,
      create: fixture,
    });
  }

  console.log("Seed complete: mock fixtures synced. No demo users were created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
