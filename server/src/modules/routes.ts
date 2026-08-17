import { Router } from "express";
import skillRouter from "./skills/skill.route.js";
import analyticsRouter from "./analytics/analytics.route.js";
import authRouter from "./auth/auth.route.js";
import contactRouter from "./contact/contact.route.js";
import portfolioRouter from "./portfolio/portfolio.route.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/skills", skillRouter);
router.use("/portfolio", portfolioRouter);
router.use("/contact", contactRouter);
router.use("/analytics", analyticsRouter);

export default router;
