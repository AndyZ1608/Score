import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getProvider } from "../src/lib/football-provider";

const prisma = new PrismaClient();

async function main() {
  const fixtures = await getProvider().fetchMatches();
  for (const fixture of fixtures) {
    const { lastUpdatedAt, ...matchData } = fixture;
    const existing = await prisma.match.findUnique({ where: { externalId: fixture.externalId } });
    if (existing?.resultSource === "ADMIN") {
      const { status, homeScore, awayScore, minute, actualResult, ...providerData } = matchData;
      void status;
      void homeScore;
      void awayScore;
      void minute;
      void actualResult;
      await prisma.match.update({ where: { id: existing.id }, data: { ...providerData, isArchived: false, lastSyncedAt: lastUpdatedAt } });
    } else {
      await prisma.match.upsert({
        where: { externalId: fixture.externalId },
        update: { ...matchData, isArchived: false, lastSyncedAt: lastUpdatedAt },
        create: { ...matchData, isArchived: false, lastSyncedAt: lastUpdatedAt },
      });
    }
  }

  await createAdminFromEnv();

  console.log("Seed complete: fixtures synced. No demo users were created.");
}

async function createAdminFromEnv() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.log("Admin seed skipped: ADMIN_USERNAME and ADMIN_PASSWORD are not both set.");
    return;
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: UserRole.ADMIN, isHidden: true },
    create: { username, passwordHash, role: UserRole.ADMIN, isHidden: true },
  });
  console.log(`Admin user ensured: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
