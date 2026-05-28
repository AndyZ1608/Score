import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_USERNAMES = ["testuser", "demo", "test", "alice", "bob"] as const;

async function main() {
  if (process.env.CONFIRM_DELETE_TEST_USERS !== "true") {
    console.log("Refusing to delete users. Set CONFIRM_DELETE_TEST_USERS=true to confirm.");
    console.log(`Configured test usernames: ${TEST_USERNAMES.join(", ")}`);
    return;
  }

  const users = await prisma.user.findMany({
    where: { username: { in: [...TEST_USERNAMES] } },
    select: { id: true, username: true },
    orderBy: { username: "asc" },
  });

  if (users.length === 0) {
    console.log("No configured test users found.");
    return;
  }

  console.log("Deleting configured test users:");
  for (const user of users) {
    console.log(`- ${user.username} (${user.id})`);
  }

  await prisma.$transaction([
    prisma.prediction.deleteMany({ where: { userId: { in: users.map((user) => user.id) } } }),
    prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } }),
  ]);

  console.log(`Deleted ${users.length} test user(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
