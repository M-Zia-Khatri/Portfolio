import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../../infrastructure/prisma.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_BCRYPT_SALT = 12;
const OTP_LENGTH = 6;

// ─── GENERATE ─────────────────────────────────────────────────────────────────

/** Returns the plain 6-digit OTP (send to user) and persists the hash in DB. */
export async function generateOtp(adminId: string): Promise<string> {
  // Invalidate any existing unused OTPs for this admin
  await prisma.otpToken.updateMany({
    where: {
      adminId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() }, // force-expire them
  });

  // Generate cryptographically secure numeric OTP
  const otpCode = crypto
    .randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");

  const codeHash = await bcrypt.hash(otpCode, OTP_BCRYPT_SALT);

  await prisma.otpToken.create({
    data: {
      adminId,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });

  return otpCode;
}

// ─── VERIFY ───────────────────────────────────────────────────────────────────

/** Returns true if the OTP is valid and marks it as used. */
export async function verifyOtp(adminId: string, otpCode: string): Promise<boolean> {
  // Fetch the latest valid (unused, non-expired) OTP for this admin
  const record = await prisma.otpToken.findFirst({
    where: {
      adminId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;

  const isMatch = await bcrypt.compare(otpCode, record.codeHash);
  if (!isMatch) return false;

  // Mark as used (one-time use)
  await prisma.otpToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return true;
}
