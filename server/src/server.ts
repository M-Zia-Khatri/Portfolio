import app from "./app.js";
import { getConfig } from "./config/env.js";
import { redis } from "./lib/utills/redis.js";
import { prisma } from "./lib/prisma.js";

const config = getConfig();
const PORT = config.port || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(JSON.stringify({ event: "server.started", host: "0.0.0.0", port: PORT }));
});

async function shutdown(signal: NodeJS.Signals) {
  console.log(JSON.stringify({ event: "server.shutdown.start", signal }));

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
