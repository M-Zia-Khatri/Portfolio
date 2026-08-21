// src/controllers/auth.controller.ts

import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { getConfig } from "@/config/env.js";
import { sendOtpEmail } from "@/infrastructure/mailer.js";
import { prisma } from "@/infrastructure/prisma.js";
import {
  revokeAllRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "@/shared/services/jwt/jwt.service.js";
import { generateOtp, verifyOtp } from "@/shared/services/otp.service.js";
import type { AuthRequest } from "@/shared/types/globle.types.js";
import { catchError } from "@/shared/utils/catch-error.js";
import { sendResponse } from "@/shared/utils/send-response.js";
import type { LoginBody, VerifyOtpBody } from "./auth.types.js";

const config = getConfig();

// ─── Constants ────────────────────────────────────────────────────────────────
const REFRESH_TOKEN_COOKIE = "refreshToken";
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1_000; // 7 days in ms
const ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // 15 min in seconds

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.cookies.secure,
  sameSite: config.cookies.sameSite,
  maxAge: REFRESH_TOKEN_MAX_AGE,
  path: "/",
  ...(config.cookies.domain ? { domain: config.cookies.domain } : {}),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: "/",
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure,
    ...(config.cookies.domain ? { domain: config.cookies.domain } : {}),
  });
}

// ─── POST /auth/login ─────────────────────────────────────────────────────────
// Step 1 of 2: verify credentials → issue OTP

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = (req.body ?? {}) as LoginBody;

    if (!email || !password) {
      sendResponse(res, {
        success: false,
        status: 400,
        message: "Validation error",
        error: { fields: { email: !email, password: !password } },
      });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        isActive: true,
      },
    });

    // Constant-time response — prevents user enumeration via timing attack
    const dummyHash = "$2b$10$invalidhashfortimingprotection0zia00khatri000000000";
    const hashToCompare = admin?.passwordHash ?? dummyHash;
    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!admin || !passwordMatch || !admin.isActive) {
      sendResponse(res, {
        success: false,
        status: 401,
        message: "Invalid credentials",
      });
      return;
    }

    const otpCode = await generateOtp(admin.id);
    await sendOtpEmail(admin.email, admin.fullName, otpCode);

    sendResponse(res, {
      success: true,
      status: 200,
      message: "OTP sent to your registered email",
      data: { email: admin.email },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── POST /auth/verify-otp ────────────────────────────────────────────────────
// Step 2 of 2: verify OTP → issue JWT pair
// accessToken  → JSON body (short-lived, held in memory by client)
// refreshToken → HttpOnly cookie (long-lived, never exposed to JS)

export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp } = req.body as VerifyOtpBody;

    if (!email || !otp) {
      sendResponse(res, {
        success: false,
        status: 400,
        message: "Validation error",
        error: { fields: { email: !email, otp: !otp } },
      });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, isActive: true },
    });

    if (!admin?.isActive) {
      sendResponse(res, { success: false, status: 401, message: "Invalid request" });
      return;
    }

    const isValid = await verifyOtp(admin.id, otp.trim());

    if (!isValid) {
      sendResponse(res, {
        success: false,
        status: 401,
        message: "Invalid or expired OTP",
      });
      return;
    }

    const accessToken = signAccessToken(admin.id, admin.email);
    const refreshToken = await signRefreshToken(admin.id);

    // refreshToken goes into an HttpOnly cookie — never into the response body
    setRefreshCookie(res, refreshToken);

    sendResponse(res, {
      success: true,
      status: 200,
      message: "Login successful",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
// Reads the HttpOnly cookie — client sends no body

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      sendResponse(res, { success: false, status: 401, message: "No refresh token" });
      return;
    }

    const tokens = await rotateRefreshToken(refreshToken);

    if (!tokens) {
      clearRefreshCookie(res);
      sendResponse(res, {
        success: false,
        status: 401,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    // Rotate: old cookie out, new cookie in
    setRefreshCookie(res, tokens.refreshToken);

    sendResponse(res, {
      success: true,
      status: 200,
      message: "Token refreshed",
      data: {
        accessToken: tokens.accessToken,
        tokenType: "Bearer",
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── POST /auth/logout ────────────────────────────────────────────────────────
// Revoke the current session and clear the cookie

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken: string | undefined = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    clearRefreshCookie(res);
    sendResponse(res, {
      success: true,
      status: 200,
      message: "Logged out successfully",
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── POST /auth/logout-all ────────────────────────────────────────────────────
// Force-revoke ALL sessions for the current admin (requires valid access token)

export async function logoutAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.admin?.id) {
      sendResponse(res, { success: false, status: 400, message: "Admin id is required" });
      return;
    }

    await revokeAllRefreshTokens(req.admin.id);
    clearRefreshCookie(res);

    sendResponse(res, { success: true, status: 200, message: "All sessions revoked" });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
// Returns the current admin profile (requires valid access token)

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin?.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        // Include role if the column exists in your schema.
        // If not, add: role String @default("admin") in schema.prisma
        // role: true,
      },
    });

    if (!admin) {
      sendResponse(res, { success: false, status: 404, message: "Admin not found" });
      return;
    }

    sendResponse(res, {
      success: true,
      status: 200,
      message: "Data retrieved successfully",
      // Hardcode role until a role column is added to the Admin model
      data: { ...admin, role: "admin" as const },
    });
  } catch (err) {
    catchError(res, err);
  }
}
