// prisma/seeds/admin.ts
import bcrypt from "bcrypt";
import { getConfig } from "../../src/config/env.js"; // Use relative path for safety
import { prisma } from "../../src/infrastructure/prisma.js"; // Ensure this points to your prisma instance

export async function seedAdmin() {
  const config = getConfig(); // Get fresh config
  const adminObj = config.admin || {};

  const email = adminObj.email || "admin@example.com";
  const password = adminObj.password || "ChangeMe123!";
  const fullName = adminObj.name || "Super Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, fullName },
    create: { email, passwordHash, fullName },
  });

  console.log(`✓ Admin seeded → id: ${admin.id}  email: ${admin.email}`);
}
