import { z } from "zod";
import {
  MAX_EVENTS_PER_BATCH,
  MAX_METADATA_SIZE_BYTES,
  VALID_ANALYTICS_EVENT_TYPES,
} from "@/lib/analytics/analytics.constants.js";

const FORBIDDEN_METADATA_KEYS = new Set(
  [
    "name",
    "fullName",
    "firstName",
    "lastName",
    "email",
    "phone",
    "phoneNumber",
    "telephone",
    "message",
    "msg",
    "text",
    "content",
    "password",
    "token",
    "authorization",
    "cookie",
    "ssn",
    "address",
  ].map((key) => key.toLowerCase()),
);

function containsForbiddenMetadataKey(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => containsForbiddenMetadataKey(item));
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    return (
      FORBIDDEN_METADATA_KEYS.has(key.toLowerCase()) || containsForbiddenMetadataKey(nestedValue)
    );
  });
}

const metadataSchema = z
  .record(z.string(), z.any())
  .refine(
    (data) => {
      if (!data) return true;
      const jsonStr = JSON.stringify(data);
      if (Buffer.byteLength(jsonStr, "utf8") > MAX_METADATA_SIZE_BYTES) {
        return false;
      }
      return true;
    },
    { message: "Metadata size exceeds maximum allowed bytes" },
  )
  .refine(
    (data) => {
      if (!data) return true;
      return !containsForbiddenMetadataKey(data);
    },
    { message: "Analytics metadata must not contain PII or contact form content" },
  );

export const analyticsEventSchema = z.object({
  type: z.enum(VALID_ANALYTICS_EVENT_TYPES),
  path: z.string().max(1024).optional(),
  timestamp: z.string().datetime(),
  metadata: metadataSchema.optional(),
});

export const analyticsIngestSchema = z.object({
  visitorId: z.string().min(5).max(128, "Invalid visitorId format"),
  sessionId: z.string().min(5).max(128, "Invalid sessionId format"),
  referrer: z
    .enum(["Direct", "Google", "GitHub", "LinkedIn", "YouTube", "Reddit", "Other"])
    .optional(),
  deviceType: z.enum(["desktop", "tablet", "mobile"]).optional(),
  browser: z.string().max(64).optional(),
  os: z.string().max(64).optional(),
  screenWidth: z.number().int().min(0).max(10000).optional(),
  screenHeight: z.number().int().min(0).max(10000).optional(),
  events: z
    .array(analyticsEventSchema)
    .min(1, "At least one event is required")
    .max(MAX_EVENTS_PER_BATCH, `Maximum ${MAX_EVENTS_PER_BATCH} events allowed per request`),
});

// Admin API Date Filter Validation
export const dateFilterSchema = z
  .object({
    range: z.enum(["today", "7d", "30d", "90d", "custom"]).default("30d"),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.range === "custom") {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    { message: "startDate and endDate are required when range is 'custom'" },
  );
