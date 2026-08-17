export const VALID_ANALYTICS_EVENT_TYPES = [
  "page_view",
  "section_view",
  "project_view",
  "project_demo_click",
  "project_github_click",
  "contact_open",
  "contact_form_start",
  "contact_submit",
  "contact_success",
  "game_open",
  "game_start",
  "game_level_selected",
  "game_complete",
  "game_abandon",
  "performance",
  "client_error",
] as const;

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const MAX_EVENTS_PER_BATCH = 50;
export const MAX_METADATA_SIZE_BYTES = 5120; // 5KB limit for metadata

export const RETENTION_DAYS = {
  RAW_EVENTS: 90,
  PAGE_VIEWS: 180,
  AGGREGATES: 730, // 2 years
};
