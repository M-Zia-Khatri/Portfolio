import { Router } from "express";
import skillRouter from "../modules/skills/skill.route.js";
import analyticsRouter from "../modules/analytics/analytics.route.js";
import authRouter from "../modules/auth/auth.route.js";
import contactRouter from "../modules/contact/contact.route.js";
import portfolioRouter from "../modules/portfolio/portfolio.route.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/skills", skillRouter);
router.use("/portfolio", portfolioRouter);
router.use("/contact", contactRouter);
router.use("/analytics", analyticsRouter);

export default router;
