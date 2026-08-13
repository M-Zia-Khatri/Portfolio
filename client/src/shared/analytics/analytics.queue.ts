import { analyticsConfig } from "./analytics.config";
import type {
  AnalyticsBatchPayload,
  AnalyticsEventType,
  BaseAnalyticsEvent,
  DeviceType,
} from "./analytics.types";

type QueueItem = BaseAnalyticsEvent<AnalyticsEventType>;

type SessionData = {
  visitorId: string;
  sessionId: string;
  referrer?: string;
  deviceType?: DeviceType;
  browser?: string;
  os?: string;
  screenWidth?: number;
  screenHeight?: number;
};

export class AnalyticsQueue {
  private queue: QueueItem[] = [];
  private flushTimer: number | null = null;
  private isFlushing = false;
  private sentSessionMetadata = false;
  private readonly getSessionData: () => SessionData;
  private readonly config: typeof analyticsConfig;

  constructor(getSessionData: () => SessionData, config = analyticsConfig) {
    this.getSessionData = getSessionData;
    this.config = config;
    this.setupBeacon();
  }

  public enqueue(event: QueueItem) {
    if (!this.config.enabled) return;

    if (this.queue.length >= this.config.maxQueueSize) {
      this.queue.shift(); // Drop oldest to prevent unbounded growth
    }

    this.queue.push(event);

    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    if (this.flushTimer !== null) return;
    this.flushTimer = window.setTimeout(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  public async flush() {
    if (this.flushTimer !== null) {
      window.clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0 || this.isFlushing || !this.config.enabled) return;

    this.isFlushing = true;
    const batch = this.queue.splice(0, this.config.batchSize);

    const sessionData = this.getSessionData();
    const payload: AnalyticsBatchPayload = {
      visitorId: sessionData.visitorId,
      sessionId: sessionData.sessionId,
      events: batch,
      ...(this.sentSessionMetadata
        ? {}
        : {
            referrer: sessionData.referrer,
            deviceType: sessionData.deviceType,
            browser: sessionData.browser,
            os: sessionData.os,
            screenWidth: sessionData.screenWidth,
            screenHeight: sessionData.screenHeight,
          }),
    };

    this.sentSessionMetadata = true;

    try {
      await this.sendBatch(payload, 0);
    } catch {
      // Retries exhausted, drop batch silently.
    } finally {
      this.isFlushing = false;
      if (this.queue.length > 0) {
        this.scheduleFlush();
      }
    }
  }

  private async sendBatch(payload: AnalyticsBatchPayload, retryCount: number): Promise<void> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true, // Allow request to complete on navigation
      });

      if (!response.ok) {
        throw new Error(`Analytics HTTP ${response.status}`);
      }
    } catch (err) {
      if (retryCount < this.config.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.sendBatch(payload, retryCount + 1);
      }
      throw err; // Caught by flush() to silently drop
    }
  }

  private setupBeacon() {
    if (typeof window === "undefined") return;

    // Beacon on page hide/visibility change
    const onHide = () => {
      if (document.visibilityState === "hidden" && this.queue.length > 0) {
        this.beaconFlush();
      }
    };

    window.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", () => {
      if (this.queue.length > 0) {
        this.beaconFlush();
      }
    });
  }

  private beaconFlush() {
    if (!this.config.enabled || this.queue.length === 0) return;
    const sessionData = this.getSessionData();
    const payload: AnalyticsBatchPayload = {
      visitorId: sessionData.visitorId,
      sessionId: sessionData.sessionId,
      events: [...this.queue],
      ...(this.sentSessionMetadata
        ? {}
        : {
            referrer: sessionData.referrer,
            deviceType: sessionData.deviceType,
            browser: sessionData.browser,
            os: sessionData.os,
            screenWidth: sessionData.screenWidth,
            screenHeight: sessionData.screenHeight,
          }),
    };

    this.sentSessionMetadata = true;

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "text/plain" }); // text/plain to avoid CORS preflights often blocking beacon
        navigator.sendBeacon(this.config.endpoint, blob);
      }
    } catch {
      // fail silently
    }

    this.queue = [];
  }
}
