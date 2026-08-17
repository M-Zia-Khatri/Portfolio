import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { getConfig } from "../../config/env.js";
import { prisma } from "../../infrastructure/prisma.js";
import type { AccessTokenPayload, RefreshTokenPayload } from "../types/auth.types.js";

const { jwt: jwtConfig } = getConfig();

const ACCESS_SECRET = jwtConfig.accessSecret!;
const REFRESH_SECRET = jwtConfig.refreshSecret!;
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY_SEC = 7 * 24 * 60 * 60; // 7 days in seconds
const REFRESH_EXPIRY_MS = REFRESH_EXPIRY_SEC * 1000;

// ─── SIGN ACCESS TOKEN ───────────────────────────────────────────────────────

export function signAccessToken(adminId: string, email: string): string {
  const payload: AccessTokenPayload = { sub: adminId, email, type: "access" };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

// ─── SIGN & PERSIST REFRESH TOKEN ────────────────────────────────────────────

export async function signRefreshToken(adminId: string): Promise<string> {
  // Create the DB row first to get the `id` (used as jti)
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_MS);

  const record = await prisma.refreshToken.create({
    data: {
      adminId,
      tokenHash: "pending", // placeholder before we know the token
      expiresAt,
    },
  });

  const payload: RefreshTokenPayload = {
    sub: adminId,
    jti: record.id,
    type: "refresh",
  };

  const token = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY_SEC,
  });

  // Store sha256 hash of the token (never store raw tokens)
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { tokenHash },
  });

  return token;
}

// ─── VERIFY ACCESS TOKEN ─────────────────────────────────────────────────────

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

// ─── VERIFY & ROTATE REFRESH TOKEN ───────────────────────────────────────────

export async function rotateRefreshToken(
  oldToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  let payload: RefreshTokenPayload;

  try {
    payload = jwt.verify(oldToken, REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }

  const tokenHash = crypto.createHash("sha256").update(oldToken).digest("hex");

  const record = await prisma.refreshToken.findFirst({
    where: {
      id: payload.jti,
      adminId: payload.sub,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { admin: { select: { email: true, isActive: true } } },
  });

  if (!record?.admin.isActive) return null;

  // Revoke the old token (rotation)
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = signAccessToken(payload.sub, record.admin.email);
  const refreshToken = await signRefreshToken(payload.sub);

  return { accessToken, refreshToken };
}

// ─── REVOKE REFRESH TOKEN (logout) ───────────────────────────────────────────

export async function revokeRefreshToken(token: string): Promise<void> {
  let payload: RefreshTokenPayload;

  try {
    payload = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return; // already invalid, nothing to do
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.refreshToken.updateMany({
    where: { id: payload.jti, tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// ─── REVOKE ALL (force-logout all sessions) ───────────────────────────────────

export async function revokeAllRefreshTokens(adminId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { adminId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
