import app from "./app.js";
import { getConfig } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/utills/redis.js";
import { AnalyticsService } from "./lib/services/analytics.service.js";

const config = getConfig();
const PORT = config.port || 5000;
const RETENTION_CLEANUP_INITIAL_DELAY_MS = 30_000;
const RETENTION_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function runAnalyticsRetentionCleanup() {
  try {
    await AnalyticsService.cleanupRetention();
    console.log(JSON.stringify({ event: "analytics.retention.cleanup.complete" }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analytics retention error";
    console.error(JSON.stringify({ event: "analytics.retention.cleanup.error", error: message }));
  }
}

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(JSON.stringify({ event: "server.started", host: "0.0.0.0", port: PORT }));
});

const retentionStartupTimer = setTimeout(() => {
  void runAnalyticsRetentionCleanup();
}, RETENTION_CLEANUP_INITIAL_DELAY_MS);
retentionStartupTimer.unref();

const retentionInterval = setInterval(() => {
  void runAnalyticsRetentionCleanup();
}, RETENTION_CLEANUP_INTERVAL_MS);
retentionInterval.unref();

async function shutdown(signal: NodeJS.Signals) {
  console.log(JSON.stringify({ event: "server.shutdown.start", signal }));
  clearTimeout(retentionStartupTimer);
  clearInterval(retentionInterval);

  server.close(async (error) => {
    if (error) {
      console.error(JSON.stringify({ event: "server.shutdown.error", error: error.message }));
      process.exit(1);
    }

    await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
    console.log(JSON.stringify({ event: "server.shutdown.complete", signal }));
    process.exit(0);
  });

  setTimeout(() => {
    console.error(JSON.stringify({ event: "server.shutdown.timeout", signal }));
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
