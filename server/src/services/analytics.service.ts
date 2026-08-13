import { Prisma } from "../../generated/prisma/client.js";
import { RETENTION_DAYS, SESSION_TIMEOUT_MS } from "../lib/analytics/analytics.constants.js";
import type {
  AnalyticsEventPayload,
  AnalyticsIngestRequest,
} from "../lib/analytics/analytics.types.js";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/utills/redis.js";

const ONE_DAY_SECONDS = 24 * 60 * 60;

export class AnalyticsService {
  static async processEvents(payload: AnalyticsIngestRequest): Promise<void> {
    const visitor = await AnalyticsService.getOrCreateVisitor(payload.visitorId);
    const { session, isNewSession } = await AnalyticsService.getOrCreateSession(
      payload.sessionId,
      visitor.id,
      {
        referrer: payload.referrer ?? null,
        deviceType: payload.deviceType ?? null,
        browser: payload.browser ?? null,
        os: payload.os ?? null,
        screenWidth: payload.screenWidth ?? null,
        screenHeight: payload.screenHeight ?? null,
      },
    );

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

    // 3. Update durable daily aggregates used by the admin dashboard.
    await AnalyticsService.recordAggregates(payload.events, visitor.id, isNewSession);

    // 4. Mark live visitor in Redis (approx 5 minute sliding window for "Live Now")
    try {
      await redis.setex(`analytics:live:visitors:${visitor.id}`, 300, session.id);
    } catch {
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

  private static async getOrCreateSession(
    sessionId: string,
    visitorId: string,
    metadata: {
      referrer?: string | null;
      deviceType?: string | null;
      browser?: string | null;
      os?: string | null;
      screenWidth?: number | null;
      screenHeight?: number | null;
    } = {},
  ) {
    let session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    let isNewSession = false;

    const now = new Date();
    const validReferrers = new Set([
      "Direct",
      "Google",
      "GitHub",
      "LinkedIn",
      "YouTube",
      "Reddit",
      "Other",
    ]);
    const validDevices = new Set(["desktop", "tablet", "mobile"]);

    const referrer =
      metadata.referrer && validReferrers.has(metadata.referrer) ? metadata.referrer : null;
    const deviceType =
      metadata.deviceType && validDevices.has(metadata.deviceType) ? metadata.deviceType : null;
    const browser = metadata.browser?.trim() ? metadata.browser.trim().slice(0, 64) : null;
    const os = metadata.os?.trim() ? metadata.os.trim().slice(0, 64) : null;
    const screenWidth =
      typeof metadata.screenWidth === "number" && Number.isFinite(metadata.screenWidth)
        ? Math.max(0, Math.min(10000, Math.trunc(metadata.screenWidth)))
        : null;
    const screenHeight =
      typeof metadata.screenHeight === "number" && Number.isFinite(metadata.screenHeight)
        ? Math.max(0, Math.min(10000, Math.trunc(metadata.screenHeight)))
        : null;

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
          referrer: referrer ?? undefined,
          deviceType: deviceType ?? undefined,
          browser: browser ?? undefined,
          os: os ?? undefined,
          screenWidth: screenWidth ?? undefined,
          screenHeight: screenHeight ?? undefined,
        },
      });
      isNewSession = true;
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
        data: {
          lastSeenAt: now,
          ...(referrer ? { referrer } : {}),
          ...(deviceType ? { deviceType } : {}),
          ...(browser ? { browser } : {}),
          ...(os ? { os } : {}),
          ...(screenWidth !== null ? { screenWidth } : {}),
          ...(screenHeight !== null ? { screenHeight } : {}),
        },
      });
    }

    return { session, isNewSession };
  }

  private static getUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private static async shouldCountDailyVisitor(date: Date, visitorId: string): Promise<boolean> {
    try {
      const dateKey = date.toISOString().slice(0, 10);
      const result = await redis.set(
        `analytics:daily:${dateKey}:visitor:${visitorId}`,
        "1",
        "EX",
        ONE_DAY_SECONDS,
        "NX",
      );
      return result === "OK";
    } catch {
      return false;
    }
  }

  private static async recordAggregates(
    events: AnalyticsEventPayload[],
    visitorId: string,
    isNewSession: boolean,
  ): Promise<void> {
    const dailyCounts = new Map<
      string,
      {
        date: Date;
        pageViews: number;
        contactOpens: number;
        contactSubmits: number;
        gameStarts: number;
        gameCompletions: number;
      }
    >();
    const projectCounts = new Map<
      string,
      {
        date: Date;
        projectId: string;
        views: number;
        demoClicks: number;
        githubClicks: number;
      }
    >();

    for (const event of events) {
      const date = AnalyticsService.getUtcDay(new Date(event.timestamp));
      const dateKey = date.toISOString().slice(0, 10);
      const daily = dailyCounts.get(dateKey) ?? {
        date,
        pageViews: 0,
        contactOpens: 0,
        contactSubmits: 0,
        gameStarts: 0,
        gameCompletions: 0,
      };

      if (event.type === "page_view") daily.pageViews += 1;
      if (event.type === "contact_open") daily.contactOpens += 1;
      if (event.type === "contact_submit") daily.contactSubmits += 1;
      if (event.type === "game_start") daily.gameStarts += 1;
      if (event.type === "game_complete") daily.gameCompletions += 1;

      dailyCounts.set(dateKey, daily);

      if (
        event.type === "project_view" ||
        event.type === "project_demo_click" ||
        event.type === "project_github_click"
      ) {
        const projectId =
          typeof event.metadata?.projectId === "string" ? event.metadata.projectId.trim() : "";
        if (!projectId) continue;

        const projectKey = `${dateKey}:${projectId}`;
        const project = projectCounts.get(projectKey) ?? {
          date,
          projectId,
          views: 0,
          demoClicks: 0,
          githubClicks: 0,
        };

        if (event.type === "project_view") project.views += 1;
        if (event.type === "project_demo_click") project.demoClicks += 1;
        if (event.type === "project_github_click") project.githubClicks += 1;

        projectCounts.set(projectKey, project);
      }
    }

    const dailyUpserts = [...dailyCounts.values()].map(async (counts) => {
      const visitors = (await AnalyticsService.shouldCountDailyVisitor(counts.date, visitorId))
        ? 1
        : 0;

      return prisma.analyticsDaily.upsert({
        where: { date: counts.date },
        create: {
          date: counts.date,
          visitors,
          sessions: isNewSession ? 1 : 0,
          pageViews: counts.pageViews,
          contactOpens: counts.contactOpens,
          contactSubmits: counts.contactSubmits,
          gameStarts: counts.gameStarts,
          gameCompletions: counts.gameCompletions,
        },
        update: {
          visitors: { increment: visitors },
          sessions: { increment: isNewSession ? 1 : 0 },
          pageViews: { increment: counts.pageViews },
          contactOpens: { increment: counts.contactOpens },
          contactSubmits: { increment: counts.contactSubmits },
          gameStarts: { increment: counts.gameStarts },
          gameCompletions: { increment: counts.gameCompletions },
        },
      });
    });

    const projectUpserts = [...projectCounts.values()].map((counts) =>
      prisma.analyticsProjectDaily.upsert({
        where: {
          date_projectId: {
            date: counts.date,
            projectId: counts.projectId,
          },
        },
        create: {
          date: counts.date,
          projectId: counts.projectId,
          views: counts.views,
          demoClicks: counts.demoClicks,
          githubClicks: counts.githubClicks,
        },
        update: {
          views: { increment: counts.views },
          demoClicks: { increment: counts.demoClicks },
          githubClicks: { increment: counts.githubClicks },
        },
      }),
    );

    await Promise.all([...dailyUpserts, ...projectUpserts]);
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
    } catch {
      return 0; // Fail open
    }
  }
}
