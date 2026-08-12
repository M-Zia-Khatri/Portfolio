import { Prisma } from "../../generated/prisma/client.js";
import { RETENTION_DAYS, SESSION_TIMEOUT_MS } from "../lib/analytics/analytics.constants.js";
import type { AnalyticsIngestRequest } from "../lib/analytics/analytics.types.js";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/utills/redis.js";

export class AnalyticsService {
  static async processEvents(payload: AnalyticsIngestRequest): Promise<void> {
    const visitor = await AnalyticsService.getOrCreateVisitor(payload.visitorId);
    const session = await AnalyticsService.getOrCreateSession(payload.sessionId, visitor.id);

    if (payload.events.length === 0) return;

    // 1. Process specific events like page views which demand their own tables in the spec
    const pageViewEvents = payload.events.filter((e) => e.type === "page_view");
    for (const pv of pageViewEvents) {
      await prisma.pageView.create({
        data: {
          sessionId: session.id,
          path: pv.path || "/",
          title: pv.metadata?.title ? String(pv.metadata.title) : null,
          startedAt: new Date(pv.timestamp),
          durationMs: pv.metadata?.durationMs ? Number(pv.metadata.durationMs) : null,
        },
      });
    }

    // 2. Persist the raw analytics events unconditionally for Timeseries rendering
    await prisma.analyticsEvent.createMany({
      data: payload.events.map((e) => ({
        sessionId: session.id,
        type: e.type,
        path: e.path,
        timestamp: new Date(e.timestamp),
        metadata: e.metadata || Prisma.JsonNull,
      })),
    });

    // 3. Mark live visitor in Redis (approx 5 minute sliding window for "Live Now")
    try {
      await redis.setex(`analytics:live:visitors:${visitor.id}`, 300, session.id);
    } catch (e) {
      /* ignore redis best-effort failure */
    }
  }

  private static async getOrCreateVisitor(anonymousId: string) {
    let visitor = await prisma.visitor.findUnique({
      where: { anonymousId },
    });

    if (!visitor) {
      visitor = await prisma.visitor.create({
        data: { anonymousId, visitCount: 1 },
      });
    } else {
      visitor = await prisma.visitor.update({
        where: { id: visitor.id },
        data: { lastSeenAt: new Date() },
      });
    }
    return visitor;
  }

  private static async getOrCreateSession(sessionId: string, visitorId: string) {
    let session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    const now = new Date();

    if (!session) {
      // First session for returning visitor? Increment counter.
      const visitor = await prisma.visitor.findUnique({ where: { id: visitorId } });
      if (visitor && visitor.firstSeenAt.getTime() < now.getTime() - 1000) {
        await prisma.visitor.update({
          where: { id: visitorId },
          data: { visitCount: { increment: 1 } },
        });
      }

      session = await prisma.session.create({
        data: {
          id: sessionId,
          visitorId,
        },
      });
    } else {
      const isExpired = now.getTime() - session.lastSeenAt.getTime() > SESSION_TIMEOUT_MS;
      if (isExpired) {
        // Treat as a new internal logical visit
        await prisma.visitor.update({
          where: { id: visitorId },
          data: { visitCount: { increment: 1 } },
        });
      }

      session = await prisma.session.update({
        where: { id: session.id },
        data: { lastSeenAt: now },
      });
    }

    return session;
  }

  static async getOverview(start: Date, end: Date) {
    const agg = await prisma.analyticsDaily.aggregate({
      _sum: { visitors: true, sessions: true, pageViews: true },
      where: { date: { gte: start, lte: end } },
    });
    return {
      visitors: agg._sum.visitors || 0,
      sessions: agg._sum.sessions || 0,
      pageViews: agg._sum.pageViews || 0,
    };
  }

  static async getTimeseries(start: Date, end: Date) {
    return prisma.analyticsDaily.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    });
  }

  static async getPages(start: Date, end: Date) {
    const pages = await prisma.pageView.groupBy({
      by: ["path"],
      _count: { id: true },
      where: { startedAt: { gte: start, lte: end } },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });
    return pages.map((p) => ({ path: p.path, views: p._count.id }));
  }

  static async getProjects(start: Date, end: Date) {
    const projects = await prisma.analyticsProjectDaily.groupBy({
      by: ["projectId"],
      _sum: { views: true, demoClicks: true, githubClicks: true },
      where: { date: { gte: start, lte: end } },
    });
    return projects.map((p) => ({
      projectId: p.projectId,
      views: p._sum.views || 0,
      demoClicks: p._sum.demoClicks || 0,
      githubClicks: p._sum.githubClicks || 0,
    }));
  }

  static async getSources(start: Date, end: Date) {
    const sources = await prisma.session.groupBy({
      by: ["referrer"],
      _count: { id: true },
      where: { startedAt: { gte: start, lte: end }, referrer: { not: null } },
      orderBy: { _count: { id: "desc" } },
    });
    return sources.map((s) => ({ referrer: s.referrer || "Direct", sessions: s._count.id }));
  }

  static async getDevices(start: Date, end: Date) {
    const devices = await prisma.session.groupBy({
      by: ["deviceType"],
      _count: { id: true },
      where: { startedAt: { gte: start, lte: end }, deviceType: { not: null } },
      orderBy: { _count: { id: "desc" } },
    });
    return devices.map((d) => ({ device: d.deviceType || "unknown", sessions: d._count.id }));
  }

  static async getCountries(start: Date, end: Date) {
    const countries = await prisma.session.groupBy({
      by: ["country"],
      _count: { id: true },
      where: { startedAt: { gte: start, lte: end }, country: { not: null } },
      orderBy: { _count: { id: "desc" } },
    });
    return countries.map((c) => ({ country: c.country || "unknown", sessions: c._count.id }));
  }

  static async getConversions(start: Date, end: Date) {
    const agg = await prisma.analyticsDaily.aggregate({
      _sum: { visitors: true, contactOpens: true, contactSubmits: true },
      where: { date: { gte: start, lte: end } },
    });
    return {
      visitors: agg._sum.visitors || 0,
      opens: agg._sum.contactOpens || 0,
      submits: agg._sum.contactSubmits || 0,
      conversionRate:
        (agg._sum.visitors || 0) > 0
          ? (agg._sum.contactSubmits || 0) / (agg._sum.visitors || 1)
          : 0,
    };
  }

  static async getGame(start: Date, end: Date) {
    const agg = await prisma.analyticsDaily.aggregate({
      _sum: { gameStarts: true, gameCompletions: true },
      where: { date: { gte: start, lte: end } },
    });
    return {
      starts: agg._sum.gameStarts || 0,
      completions: agg._sum.gameCompletions || 0,
    };
  }

  static async cleanupRetention() {
    const now = new Date();

    const rawCutoff = new Date(now);
    rawCutoff.setDate(rawCutoff.getDate() - RETENTION_DAYS.RAW_EVENTS);
    await prisma.analyticsEvent.deleteMany({ where: { timestamp: { lt: rawCutoff } } });

    const pageViewCutoff = new Date(now);
    pageViewCutoff.setDate(pageViewCutoff.getDate() - RETENTION_DAYS.PAGE_VIEWS);
    await prisma.pageView.deleteMany({ where: { startedAt: { lt: pageViewCutoff } } });
    await prisma.session.deleteMany({ where: { startedAt: { lt: pageViewCutoff } } });

    const aggregateCutoff = new Date(now);
    aggregateCutoff.setDate(aggregateCutoff.getDate() - RETENTION_DAYS.AGGREGATES);
    await prisma.analyticsDaily.deleteMany({ where: { date: { lt: aggregateCutoff } } });
    await prisma.analyticsProjectDaily.deleteMany({ where: { date: { lt: aggregateCutoff } } });
  }

  static async getLiveVisitorsCount(): Promise<number> {
    try {
      const keys = await redis.keys("analytics:live:visitors:*");
      return keys.length;
    } catch (e) {
      return 0; // Fail open
    }
  }
}
