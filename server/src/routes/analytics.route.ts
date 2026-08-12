import { json, Router } from "express";
import {
  getConversions,
  getCountries,
  getDevices,
  getGame,
  getOverview,
  getPages,
  getProjects,
  getSources,
  getTimeseries,
  ingestEvents,
} from "../controllers/analytics.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { analyticsLimiter } from "../middlewares/rate-limit/analytics.limiter.js";

const router = Router();

// Public Ingest API
router.post("/events", analyticsLimiter, json({ limit: "50kb" }), ingestEvents);

// Protected Admin APIs
router.use(requireAdmin);

router.get("/overview", getOverview);
router.get("/timeseries", getTimeseries);
router.get("/pages", getPages);
router.get("/projects", getProjects);
router.get("/sources", getSources);
router.get("/devices", getDevices);
router.get("/countries", getCountries);
router.get("/conversions", getConversions);
router.get("/game", getGame);

export default router;
