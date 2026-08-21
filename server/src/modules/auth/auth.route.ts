import { Router } from "express";
import { requireAdmin } from "@/middleware/auth.middleware.js";
import { rateLimit } from "@/middleware/rate-limit/rate-limit.middleware.js";
import { login, logout, logoutAll, me, refresh, verifyOtpHandler } from "./auth.controller.js";

const authRouter = Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
authRouter.post(
  "/login",
  rateLimit({
    action: "login",
    tiers: [
      { limit: 5, interval: 600, weight: 2 },
      {
        limit: 20,
        interval: 3600, // 1 hour
      },
    ],
    message: "Too many login attempts. Try again later.",
    failBehavior: "closed",
  }),
  login,
); // Step 1: email + password

authRouter.post(
  "/verify-otp",
  rateLimit({
    action: "verify-otp",
    tiers: [
      { limit: 5, interval: 300 },
      {
        limit: 10,
        interval: 1800,
      },
    ],
    message: "Too many verification attempts. Try again later.",
    failBehavior: "closed",
  }),
  verifyOtpHandler,
); // Step 2: OTP → JWT pair

authRouter.post(
  "/refresh",
  rateLimit({
    action: "refresh",
    tiers: [
      { limit: 10, interval: 300 },
      {
        limit: 20,
        interval: 1800, // 1/2 hour
      },
    ],
    message: "Too many refresh attempts. Try again later.",
    failBehavior: "closed",
  }),
  refresh,
); // Rotate refresh token

authRouter.post("/logout", logout); // Revoke current session

// ─── PROTECTED (requires valid access token) ──────────────────────────────────
authRouter.post("/logout-all", requireAdmin, logoutAll); // Revoke all sessions
authRouter.get("/me", requireAdmin, me); // Current admin profile

export default authRouter;
