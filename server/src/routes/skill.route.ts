// server/src/routes/skill.route.ts

import { Router } from "express";
import * as skill from "../controllers/skill.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rate-limit/rate-limit.middleware.js";

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router
  .get(
    "/",
    rateLimit({
      action: "skill-get-all",
      tiers: [
        { limit: 5, interval: 300 },
        {
          limit: 25,
          interval: 1800, // 1/2 hour
        },
      ],
      message: "Too many get attempts. Try again later.",
    }),
    skill.getAll,
  )
  .get(
    "/:id",
    rateLimit({
      action: "skill-get-one",
      tiers: [
        { limit: 5, interval: 300 },
        {
          limit: 25,
          interval: 1800, // 1/2 hour
        },
      ],
      message: "Too many get attempts. Try again later.",
    }),
    skill.getOne,
  );

// ─── Admin only ───────────────────────────────────────────────────────────────
router
  .use(requireAdmin)
  .use(
    rateLimit({
      action: "skill-admin",
      tiers: [
        { limit: 10, interval: 600 },
        {
          limit: 25,
          interval: 1800, // 1/2 hour
        },
      ],
      message: "Too many get attempts. Try again later.",
    }),
  )
  .post("/", skill.create)
  .patch("/:id", skill.update)
  .delete("/:id", skill.remove);

export default router;
