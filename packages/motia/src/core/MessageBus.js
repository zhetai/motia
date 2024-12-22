// packages/motia/src/core/MessageBus.js
import crypto from "crypto";

export class InMemoryMessageBus {
  constructor() {
    this.subscribers = new Set();
    this.processedEvents = new Map();
    this.deduplicationWindow = 30000; // 30 seconds, matching Redis adapter
  }

  async initialize() {
    // Start cleanup interval for processed events
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [eventId, timestamp] of this.processedEvents.entries()) {
        if (now - timestamp > this.deduplicationWindow) {
          this.processedEvents.delete(eventId);
        }
      }
    }, 10000);

    return Promise.resolve();
  }

  computeEventId(event) {
    const payload = JSON.stringify({
      type: event.type,
      data: event.data,
    });

    const hash = crypto.createHash("sha256").update(payload).digest("hex");
    return `evt-${hash.slice(0, 12)}`;
  }

  async publish(event, options = {}) {
    const eventId = this.computeEventId(event);

    // Skip if already processed
    if (this.processedEvents.has(eventId)) {
      return;
    }

    // Mark as processed
    this.processedEvents.set(eventId, Date.now());

    const enrichedEvent = {
      ...event,
      metadata: {
        ...options.metadata,
        eventId,
        timestamp: Date.now(),
      },
    };

    // Notify all subscribers
    await Promise.all(
      Array.from(this.subscribers).map((handler) =>
        handler(enrichedEvent).catch((err) => {
          console.error("Error in event handler:", err);
        })
      )
    );
  }

  async subscribe(handler) {
    this.subscribers.add(handler);
  }

  async cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.subscribers.clear();
    this.processedEvents.clear();
  }
}
