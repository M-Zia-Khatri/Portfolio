import { useQueries } from "@tanstack/react-query";
import {
  fetchAnalyticsOverview,
  fetchContentAnalytics,
  fetchGeographyAnalytics,
  fetchTechnologyAnalytics,
  fetchTopEvents,
  fetchTrafficAnalytics,
  fetchVisitors,
} from "../analytics.admin.api";
import type { AnalyticsRange } from "../analytics.admin.types";

const BOUNCE_RATE_MIN_SESSIONS = 5;

function formatNumber(value?: number) {
  return new Intl.NumberFormat().format(value ?? 0);
}

function formatPercent(value?: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function useAnalytics(range: AnalyticsRange) {
  const [overview, traffic, content, events, technology, geography, visitors] = useQueries({
    queries: [
      { queryKey: ["analytics", "overview", range], queryFn: () => fetchAnalyticsOverview(range) },
      { queryKey: ["analytics", "traffic", range], queryFn: () => fetchTrafficAnalytics(range) },
      { queryKey: ["analytics", "content", range], queryFn: () => fetchContentAnalytics(range) },
      { queryKey: ["analytics", "events", range], queryFn: () => fetchTopEvents(range) },
      {
        queryKey: ["analytics", "technology", range],
        queryFn: () => fetchTechnologyAnalytics(range),
      },
      {
        queryKey: ["analytics", "geography", range],
        queryFn: () => fetchGeographyAnalytics(range),
      },
      { queryKey: ["analytics", "visitors", range], queryFn: () => fetchVisitors(range) },
    ],
  });

  const isLoading = [overview, traffic, content, events, technology, geography, visitors].some(
    (query) => query.isLoading,
  );
  const topTimeline = traffic.data?.timeseries ?? [];
  const sources = traffic.data?.sources ?? [];
  const eventCounts = events.data ?? [];
  const maxTimeline = Math.max(...topTimeline.map((point) => point.pageViews), 0);
  const maxSources = Math.max(...sources.map((item) => item.sessions), 0);
  const maxEvents = Math.max(...eventCounts.map((event) => event.count), 0);
  const overviewData = overview.data;
  const bounceRateValue =
    (overviewData?.totalSessions ?? 0) >= BOUNCE_RATE_MIN_SESSIONS
      ? formatPercent(overviewData?.bounceRate)
      : "N/A";
  const bounceRateHelper =
    (overviewData?.totalSessions ?? 0) >= BOUNCE_RATE_MIN_SESSIONS
      ? `${formatNumber(overviewData?.totalSessions)} sessions sampled`
      : `Insufficient data — needs ${BOUNCE_RATE_MIN_SESSIONS}+ sessions`;

  return {
    overview,
    traffic,
    content,
    events,
    technology,
    geography,
    visitors,
    isLoading,
    topTimeline,
    sources,
    eventCounts,
    maxTimeline,
    maxSources,
    maxEvents,
    overviewData,
    bounceRateValue,
    bounceRateHelper,
  };
}
