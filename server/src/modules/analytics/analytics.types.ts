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

export interface AnalyticsEventPayload {
  type: AnalyticsEventType;
  path?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsIngestRequest {
  visitorId: string;
  sessionId: string;
  referrer?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  events: AnalyticsEventPayload[];
}
