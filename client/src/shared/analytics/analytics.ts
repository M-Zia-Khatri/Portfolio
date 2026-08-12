import type { AnalyticsEventType, AnalyticsEventMetadata, BaseAnalyticsEvent } from './analytics.types';
import { AnalyticsQueue } from './analytics.queue';
import { hitSession, getSession } from './analytics.session';

class Analytics {
  private queue: AnalyticsQueue | null = null;
  private isStarted = false;

  public start() {
    if (this.isStarted) return;
    this.isStarted = true;
    
    // Ensure session is initialized
    getSession();

    this.queue = new AnalyticsQueue(() => {
      const session = getSession();
      return { visitorId: session.visitorId, sessionId: session.sessionId };
    });
  }

  public track<T extends AnalyticsEventType>(event: T, metadata: AnalyticsEventMetadata[T]) {
    if (!this.isStarted || !this.queue) return;

    hitSession(); // update session timestamp

    // Ensure path is relatively robust even if called during unmounting
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';

    const queueEvent: BaseAnalyticsEvent<T> = {
      type: event,
      path,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.queue.enqueue(queueEvent);
  }

  public page(path: string, title?: string) {
    this.track('page_view', { title: title || (typeof document !== 'undefined' ? document.title : '') });
  }
  
  public flush() {
    if (this.queue) {
      this.queue.flush();
    }
  }
}

export const analytics = new Analytics();
