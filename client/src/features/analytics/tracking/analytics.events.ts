import type { AnalyticsEventType } from "./analytics.types";

export const AnalyticsEvents: Record<string, AnalyticsEventType> = {
  PAGE_VIEW: "page_view",
  SECTION_VIEW: "section_view",
  PROJECT_VIEW: "project_view",
  PROJECT_DEMO_CLICK: "project_demo_click",
  PROJECT_GITHUB_CLICK: "project_github_click",
  CONTACT_OPEN: "contact_open",
  CONTACT_FORM_START: "contact_form_start",
  CONTACT_SUBMIT: "contact_submit",
  CONTACT_SUCCESS: "contact_success",
  GAME_OPEN: "game_open",
  GAME_START: "game_start",
  GAME_LEVEL_SELECTED: "game_level_selected",
  GAME_COMPLETE: "game_complete",
  GAME_ABANDON: "game_abandon",
  PERFORMANCE: "performance",
  CLIENT_ERROR: "client_error",
} as const;
