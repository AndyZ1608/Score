import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  if (!username) throw new Error("Missing ADMIN_USERNAME");

  const admin = await prisma.user.findUnique({
    where: { username },
    select: { username: true, role: true, isHidden: true },
  });

  if (!admin) throw new Error(`Admin account not found: ${username}`);
  console.log(`username=${admin.username}`);
  console.log(`role=${admin.role}`);
  console.log(`isHidden=${admin.isHidden}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
