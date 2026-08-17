const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export const analyticsConfig = {
  enabled: import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === "true",

  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || `${apiBaseUrl}/analytics/events`,

  batchSize: 4,
  flushIntervalMs: 5000,
  sessionTimeoutMs: 30 * 60 * 1000,
  maxQueueSize: 500,
  maxRetries: 3,
};
