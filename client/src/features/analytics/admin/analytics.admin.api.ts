import { api } from "@/shared/api/axios";
import type {
  AnalyticsRange,
  ContentAnalytics,
  EventCount,
  GeographyAnalytics,
  KpiOverview,
  TechnologyAnalytics,
  TrafficAnalytics,
  VisitorDetail,
  VisitorSummary,
} from "./analytics.admin.types";

type ApiEnvelope<T> = { data: T } | T;

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  return response as T;
}

const rangeParam = (range: AnalyticsRange) => ({ params: { range } });

export async function fetchAnalyticsOverview(range: AnalyticsRange): Promise<KpiOverview> {
  const res = await api.get<ApiEnvelope<KpiOverview>>(
    "/analytics/dashboard-overview",
    rangeParam(range),
  );
  return unwrap(res.data);
}

export async function fetchTrafficAnalytics(range: AnalyticsRange): Promise<TrafficAnalytics> {
  const res = await api.get<ApiEnvelope<TrafficAnalytics>>("/analytics/traffic", rangeParam(range));
  return unwrap(res.data);
}

export async function fetchContentAnalytics(range: AnalyticsRange): Promise<ContentAnalytics> {
  const res = await api.get<ApiEnvelope<ContentAnalytics>>("/analytics/content", rangeParam(range));
  return unwrap(res.data);
}

export async function fetchTopEvents(range: AnalyticsRange): Promise<EventCount[]> {
  const res = await api.get<ApiEnvelope<EventCount[]>>("/analytics/events/top", rangeParam(range));
  return unwrap(res.data);
}

export async function fetchTechnologyAnalytics(
  range: AnalyticsRange,
): Promise<TechnologyAnalytics> {
  const res = await api.get<ApiEnvelope<TechnologyAnalytics>>(
    "/analytics/technology",
    rangeParam(range),
  );
  return unwrap(res.data);
}

export async function fetchGeographyAnalytics(range: AnalyticsRange): Promise<GeographyAnalytics> {
  const res = await api.get<ApiEnvelope<GeographyAnalytics>>(
    "/analytics/geography",
    rangeParam(range),
  );
  return unwrap(res.data);
}

export async function fetchVisitors(range: AnalyticsRange): Promise<VisitorSummary[]> {
  const res = await api.get<ApiEnvelope<VisitorSummary[]>>(
    "/analytics/visitors",
    rangeParam(range),
  );
  return unwrap(res.data);
}

export async function fetchVisitorDetail(
  visitorId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<VisitorDetail> {
  const res = await api.get<ApiEnvelope<VisitorDetail>>(`/analytics/visitors/${visitorId}`, {
    params: options,
  });
  return unwrap(res.data);
}
