import type { Request, Response } from "express";
import { AnalyticsService } from "../lib/services/analytics.service.js";
import { send } from "../lib/utills/send.js";
import { analyticsIngestSchema, dateFilterSchema } from "../lib/validators/analytics.validation.js";

function getRange(req: Request) {
  const parsed = dateFilterSchema.parse(req.query);
  const now = new Date();
  let startDate = new Date();

  switch (parsed.range) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "custom":
      if (parsed.startDate && parsed.endDate) {
        startDate = new Date(parsed.startDate);
        now.setTime(new Date(parsed.endDate).getTime());
      }
      break;
    default:
      startDate.setDate(now.getDate() - 30);
      break;
  }
  return { start: startDate, end: now };
}

export async function ingestEvents(req: Request, res: Response): Promise<void> {
  try {
    const parsed = analyticsIngestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Invalid payload" });
      return;
    }
    try {
      await AnalyticsService.processEvents(parsed.data);
    } catch (e) {
      console.error("[Analytics Service Error]", e);
    }
    res.status(202).json({ success: true, message: "Accepted" });
  } catch (err) {
    res.status(202).json({ success: false });
  }
}

export async function getOverview(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getOverview(start, end);
    send(res, { success: true, status: 200, message: "Metrics", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getTimeseries(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getTimeseries(start, end);
    send(res, { success: true, status: 200, message: "Timeseries", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getPages(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getPages(start, end);
    send(res, { success: true, status: 200, message: "Pages", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getProjects(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getProjects(start, end);
    send(res, { success: true, status: 200, message: "Projects", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getSources(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getSources(start, end);
    send(res, { success: true, status: 200, message: "Sources", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getDevices(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getDevices(start, end);
    send(res, { success: true, status: 200, message: "Devices", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getCountries(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getCountries(start, end);
    send(res, { success: true, status: 200, message: "Countries", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getConversions(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getConversions(start, end);
    send(res, { success: true, status: 200, message: "Conversions", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getGame(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getGame(start, end);
    send(res, { success: true, status: 200, message: "Game", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getDashboardOverview(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getDashboardOverview(start, end);
    send(res, { success: true, status: 200, message: "Analytics dashboard overview", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getTrafficDashboard(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getTrafficDashboard(start, end);
    send(res, { success: true, status: 200, message: "Traffic analytics", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getContentDashboard(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getContentDashboard(start, end);
    send(res, { success: true, status: 200, message: "Content analytics", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getTopEvents(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getTopEvents(start, end);
    send(res, { success: true, status: 200, message: "Top analytics events", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getTechnologyDashboard(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getTechnologyDashboard(start, end);
    send(res, { success: true, status: 200, message: "Technology analytics", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getGeographyDashboard(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getGeographyDashboard(start, end);
    send(res, { success: true, status: 200, message: "Geographic analytics", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getVisitorsDashboard(req: Request, res: Response) {
  try {
    const { start, end } = getRange(req);
    const data = await AnalyticsService.getVisitorsDashboard(start, end);
    send(res, { success: true, status: 200, message: "Visitor analytics", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}

export async function getVisitorDetail(req: Request, res: Response) {
  try {
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : undefined;
    const data = await AnalyticsService.getVisitorDetail(String(req.params.visitorId), {
      limit,
      offset,
    });
    if (!data) {
      res.status(404).json({ success: false, message: "Visitor not found" });
      return;
    }
    send(res, { success: true, status: 200, message: "Visitor detail", data });
  } catch (e) {
    res.status(400).json({ success: false });
  }
}
