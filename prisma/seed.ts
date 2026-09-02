import "dotenv/config";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: "Development Super Admin", passwordHash: await bcrypt.hash(password, 12), role: Role.SUPER_ADMIN },
    update: { passwordHash: await bcrypt.hash(password, 12), role: Role.SUPER_ADMIN, isBanned: false },
    select: { id: true, email: true, role: true, passwordHash: true },
  });
  const storedHash = user.passwordHash;
  if (!storedHash || user.role !== Role.SUPER_ADMIN || storedHash === password || !await bcrypt.compare(password, storedHash)) {
    throw new Error("SUPER_ADMIN verification failed after seed.");
  }
  console.log(`Seeded and verified SUPER_ADMIN: ${user.email} (${user.id})`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
