import { analyticsConfig } from "./analytics.config";
import type { AnalyticsSession, AnalyticsSessionMetadata, DeviceType } from "./analytics.types";

const STORAGE_KEY = "portfolio_analytics_session";

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function normalizeTrafficSource(rawValue?: string | null): string {
  const value = (rawValue ?? "").trim();
  if (!value) return "Direct";

  const directValues = new Set(["direct", "none", "(direct)"]);
  if (directValues.has(value.toLowerCase())) return "Direct";

  const fallback = value
    .replace(/^https?:\/\//i, "")
    .replace(/^[^/]+@/, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .replace(/^www\./i, "")
    .toLowerCase();

  if (!fallback) return "Direct";

  const host = fallback.includes("/") ? fallback.split("/")[0] : fallback;
  if (/google(\.|$)/.test(host) || /googleadservices|googlesyndication/.test(host)) return "Google";
  if (/github(\.|$)/.test(host)) return "GitHub";
  if (/linkedin(\.|$)/.test(host)) return "LinkedIn";
  if (/youtube(\.|$)/.test(host) || /youtu\.be/.test(host)) return "YouTube";
  if (/reddit(\.|$)/.test(host)) return "Reddit";

  const lowerValue = value.toLowerCase();
  if (lowerValue.includes("google")) return "Google";
  if (lowerValue.includes("github")) return "GitHub";
  if (lowerValue.includes("linkedin")) return "LinkedIn";
  if (lowerValue.includes("youtube") || lowerValue.includes("youtu.be")) return "YouTube";
  if (lowerValue.includes("reddit")) return "Reddit";

  return "Other";
}

export function getSessionMetadata(): AnalyticsSessionMetadata {
  const search = typeof window !== "undefined" ? window.location.search : "";
  const referrer = typeof document !== "undefined" ? document.referrer : "";
  const params = new URLSearchParams(search);
  const utmParams = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
    term: params.get("utm_term"),
  };
  const hasUtmContext = Boolean(
    utmParams.source ||
      utmParams.medium ||
      utmParams.campaign ||
      utmParams.content ||
      utmParams.term,
  );

  const normalizedReferrer = normalizeTrafficSource(
    hasUtmContext ? (utmParams.source ?? referrer ?? undefined) : referrer || undefined,
  );

  const hasWindow = typeof window !== "undefined";
  const width = hasWindow ? window.innerWidth : 0;
  const ua = hasWindow ? navigator.userAgent : "";

  let deviceType: DeviceType = "desktop";
  if (width <= 480 || /android|iphone|ipod|mobile/i.test(ua)) {
    deviceType = "mobile";
  } else if (width <= 1024 || /ipad|tablet/i.test(ua)) {
    deviceType = "tablet";
  }

  const browser = /Edg|Edge/i.test(ua)
    ? "Edge"
    : /OPR|Opera/i.test(ua)
      ? "Opera"
      : /Chrome|CriOS/i.test(ua)
        ? "Chrome"
        : /Firefox/i.test(ua)
          ? "Firefox"
          : /Safari/i.test(ua)
            ? "Safari"
            : "Other";

  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Mac/i.test(ua)
      ? "macOS"
      : /Android/i.test(ua)
        ? "Android"
        : /iPhone|iPad|iPod/i.test(ua)
          ? "iOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Other";

  return {
    referrer: normalizedReferrer,
    deviceType,
    browser,
    os,
    screenWidth: hasWindow ? window.screen.width : undefined,
    screenHeight: hasWindow ? window.screen.height : undefined,
  };
}

export function getSession(): AnalyticsSession {
  const now = Date.now();
  const sessionMetadata = getSessionMetadata();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const session: AnalyticsSession = JSON.parse(stored);
      if (now - session.lastActivityAt > analyticsConfig.sessionTimeoutMs) {
        const newSession: AnalyticsSession = {
          visitorId: session.visitorId,
          sessionId: generateId(),
          startedAt: now,
          lastActivityAt: now,
          ...sessionMetadata,
        };
        saveSession(newSession);
        return newSession;
      }

      return session;
    }
  } catch {
    // Ignore storage errors silently as per spec
  }

  const newSession: AnalyticsSession = {
    visitorId: generateId(),
    sessionId: generateId(),
    startedAt: now,
    lastActivityAt: now,
    ...sessionMetadata,
  };
  saveSession(newSession);
  return newSession;
}

export function hitSession(): void {
  const session = getSession();
  session.lastActivityAt = Date.now();
  saveSession(session);
}

export function saveSession(session: AnalyticsSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}
