import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@healthreach.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin User";

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name,
    },
  });

  console.log("Admin user created/updated:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

