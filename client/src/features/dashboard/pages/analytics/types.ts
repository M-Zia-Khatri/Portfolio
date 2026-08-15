export type AnalyticsRange = "today" | "7d" | "30d" | "90d";

export type KpiOverview = {
  totalVisitors: number;
  uniqueVisitors: number;
  visitorsToday: number;
  visitorsThisWeek: number;
  visitorsThisMonth: number;
  totalSessions: number;
  averageSessionDurationMs: number;
  totalPageViews: number;
  bounceRate: number;
};

export type TimeseriesPoint = {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
};

export type TrafficAnalytics = {
  timeseries: TimeseriesPoint[];
  sources: { referrer: string; sessions: number }[];
  byHour: { hour: number; sessions: number }[];
  newVisitors: number;
  returningVisitors: number;
  utmCampaigns: { campaign: string; sessions: number }[];
};

export type ContentAnalytics = {
  pages: { path: string; views: number; uniqueVisitors: number; averageTimeMs: number }[];
  mostViewed: { path: string; views: number }[];
  leastViewed: { path: string; views: number }[];
  entryPages: { path: string; sessions: number }[];
  exitPages: { path: string; sessions: number }[];
};

export type EventCount = { type: string; count: number };
export type BreakdownItem = { label: string; count: number };

export type TechnologyAnalytics = {
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  screens: BreakdownItem[];
  languages: BreakdownItem[];
  timezones: BreakdownItem[];
};

export type GeographyAnalytics = {
  countries: { label: string; visitors: number }[];
  regions: { label: string; visitors: number }[];
  cities: { label: string; visitors: number }[];
  isPopulated: boolean;
};

export type VisitorSummary = {
  id: string;
  visitorId: string;
  firstVisit: string;
  lastVisit: string;
  sessions: number;
  pages: number;
  durationMs: number;
  visitorType: "new" | "returning";
  lastActivity: string;
};

export type VisitorDetail = {
  id: string;
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  sessions: number;
  pageViews: number;
  totalDurationMs: number;
  timeline: { id: string; type: string; path: string | null; timestamp: string }[];
};
