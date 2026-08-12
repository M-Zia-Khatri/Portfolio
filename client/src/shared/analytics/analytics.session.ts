import { analyticsConfig } from "./analytics.config";
import type { AnalyticsSession } from "./analytics.types";

const STORAGE_KEY = "portfolio_analytics_session";

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getSession(): AnalyticsSession {
  const now = Date.now();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const session: AnalyticsSession = JSON.parse(stored);
      // Check timeout
      if (now - session.lastActivityAt > analyticsConfig.sessionTimeoutMs) {
        // Expired session, keep visitorId but create new sessionId
        const newSession: AnalyticsSession = {
          visitorId: session.visitorId,
          sessionId: generateId(),
          startedAt: now,
          lastActivityAt: now,
        };
        saveSession(newSession);
        return newSession;
      }

      return session;
    }
  } catch (e) {
    // Ignore storage errors silently as per spec
  }

  // Create entirely new session and visitor
  const newSession: AnalyticsSession = {
    visitorId: generateId(),
    sessionId: generateId(),
    startedAt: now,
    lastActivityAt: now,
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
  } catch (e) {
    // Ignore storage errors
  }
}
