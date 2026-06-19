import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { getConfig } from "./config/env.js";
import "./lib/utills/redis.js";
import router from "./routes/index.js";

const app = express();
app.set("trust proxy", 1);

const config = getConfig();

const DEV_DEFAULT_ORIGINS = ["http://localhost:3000", "http://localhost:5173"];
const allowedOrigins = new Set(
  config.cors.originList.length > 0
    ? config.cors.originList
    : config.isDev
      ? DEV_DEFAULT_ORIGINS
      : [config.client.url].filter((origin): origin is string => Boolean(origin?.trim())),
);

if (!config.isDev && allowedOrigins.size === 0) {
  throw new Error("CORS_ORIGINS must include at least one production origin");
}

console.log(
  JSON.stringify({
    event: "startup.config",
    port: config.port,
    corsOrigins: [...allowedOrigins],
    redisHost: config.redis.host,
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl/postman/server-to-server).
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);

      console.warn(`[cors] blocked origin: ${origin}`);
      return callback(new Error(`Origin not allowed: ${origin}`), false);
    },
    credentials: true,
    exposedHeaders: ["ETag"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.get("/", (_req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/ready", (_req, res) => {
  res.json({ status: "ready" });
});

export default app;
