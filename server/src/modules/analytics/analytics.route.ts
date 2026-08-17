import { json, Router } from "express";
import {
  getContentDashboard,
  getConversions,
  getCountries,
  getDashboardOverview,
  getDevices,
  getGame,
  getGeographyDashboard,
  getOverview,
  getPages,
  getProjects,
  getSources,
  getTechnologyDashboard,
  getTimeseries,
  getTopEvents,
  getTrafficDashboard,
  getVisitorDetail,
  getVisitorsDashboard,
  ingestEvents,
} from "./analytics.controller.js";
import { requireAdmin } from "../../middleware/auth.middleware.js";
import { analyticsLimiter } from "../../middleware/rate-limit/analytics.limiter.js";

const router = Router();

// Public Ingest API
router.post("/events", analyticsLimiter, json({ limit: "50kb" }), ingestEvents);

// Protected Admin APIs
router.use(requireAdmin);

router.get("/overview", getOverview);
router.get("/dashboard-overview", getDashboardOverview);
router.get("/traffic", getTrafficDashboard);
router.get("/content", getContentDashboard);
router.get("/events/top", getTopEvents);
router.get("/technology", getTechnologyDashboard);
router.get("/geography", getGeographyDashboard);
router.get("/visitors", getVisitorsDashboard);
router.get("/visitors/:visitorId", getVisitorDetail);
router.get("/timeseries", getTimeseries);
router.get("/pages", getPages);
router.get("/projects", getProjects);
router.get("/sources", getSources);
router.get("/devices", getDevices);
router.get("/countries", getCountries);
router.get("/conversions", getConversions);
router.get("/game", getGame);

export default router;
