export const analyticsConfig = {
  enabled: import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics/events',
  batchSize: 10,
  flushIntervalMs: 5000,
  sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
  maxQueueSize: 500, // Drop events if offline for too long or if queue fills up
  maxRetries: 3,
};
