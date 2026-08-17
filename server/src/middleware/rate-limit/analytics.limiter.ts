import { rateLimit } from "./rate-limit.middleware.js";

export const analyticsLimiter = rateLimit({
  action: "analytics",
  tiers: [
    { limit: 30, interval: 60 },
    { limit: 300, interval: 3600 },
  ],
  message: "Analytics rate limit exceeded",
  failBehavior: "open",
});
