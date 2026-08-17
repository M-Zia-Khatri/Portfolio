import { Router } from "express";
import skillRouter from "../routes/skill.route.js";
import analyticsRouter from "../modules/analytics/analytics.route.js";
import authRouter from "../modules/auth/auth.route.js";
import contactRouter from "./contact.route.js";
import portfolioRouter from "./portfolio.route.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/skills", skillRouter);
router.use("/portfolio", portfolioRouter);
router.use("/contact", contactRouter);
router.use("/analytics", analyticsRouter);

export default router;
