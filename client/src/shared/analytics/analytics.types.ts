export type AnalyticsEventType =
  | "page_view"
  | "section_view"
  | "project_view"
  | "project_demo_click"
  | "project_github_click"
  | "contact_open"
  | "contact_form_start"
  | "contact_submit"
  | "contact_success"
  | "game_open"
  | "game_start"
  | "game_level_selected"
  | "game_complete"
  | "game_abandon"
  | "performance"
  | "client_error";

export interface AnalyticsEventMetadata {
  page_view: { title: string };
  section_view: { section: string };
  project_view: { projectId: string };
  project_demo_click: { projectId: string };
  project_github_click: { projectId: string };
  contact_open: Record<string, never>;
  contact_form_start: Record<string, never>;
  contact_submit: Record<string, never>;
  contact_success: Record<string, never>;
  game_open: Record<string, never>;
  game_start: Record<string, never>;
  game_level_selected: { difficulty?: string; level?: number | string };
  game_complete: { score?: number; attempts?: number; durationMs?: number };
  game_abandon: { durationMs?: number; level?: string | number };
  performance: { ttfb?: number; fcp?: number; lcp?: number; cls?: number; inp?: number };
  client_error: { errorType: string; message: string; route: string };
}

export type AnyAnalyticsEventMetadata = {
  [K in AnalyticsEventType]: AnalyticsEventMetadata[K];
}[AnalyticsEventType];

export interface BaseAnalyticsEvent<T extends AnalyticsEventType> {
  type: T;
  path: string;
  timestamp: string;
  metadata: AnalyticsEventMetadata[T];
}

export interface AnalyticsBatchPayload extends AnalyticsSessionMetadata {
  visitorId: string;
  sessionId: string;
  events: BaseAnalyticsEvent<AnalyticsEventType>[];
}

export type DeviceType = "desktop" | "tablet" | "mobile";

export interface AnalyticsSessionMetadata {
  referrer?: string;
  deviceType?: DeviceType;
  browser?: string;
  os?: string;
  screenWidth?: number;
  screenHeight?: number;
}

export interface AnalyticsSession extends AnalyticsSessionMetadata {
  visitorId: string;
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
}
