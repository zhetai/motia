// packages/motia/src/core/adapters/RedisMessageBusAdapter.js
import { MessageBusAdapter } from "./MessageBusAdapter.js";
import Redis from "ioredis";

export class RedisMessageBusAdapter extends MessageBusAdapter {
  constructor(config = {}) {
    super();
    this.config = {
      host: config.host || "localhost",
      port: config.port || 6379,
      channelPrefix: config.channelPrefix || "motia:events:",
      deduplicationWindow: config.deduplicationWindow || 30000, // 30 seconds default
      ...config,
    };
    this.subscribers = new Set();
    this.publishClient = null;
    this.subscribeClient = null;
    this.processedEvents = new Map();
    this.startCleanupInterval();
  }

  async initialize() {
    this.publishClient = new Redis(this.config);
    this.subscribeClient = new Redis(this.config);

    await this.subscribeClient.psubscribe(`${this.config.channelPrefix}*`);
    this.subscribeClient.on("pmessage", async (pattern, channel, message) => {
      try {
        const event = JSON.parse(message);
        const enrichedEvent = {
          ...event,
          metadata: {
            ...event.metadata,
            fromRedis: true,
          },
        };

        // Only process the event for subscribers that haven't seen it
        await Promise.all(
          Array.from(this.subscribers).map(async (handler) => {
            // If this is a component event, use component ID for tracking
            const eventId = enrichedEvent.metadata?.componentId
              ? `${enrichedEvent.type}-${enrichedEvent.metadata.componentId}`
              : `${enrichedEvent.type}-${Date.now()}`;

            if (!this.processedEvents.has(eventId)) {
              this.processedEvents.set(eventId, true);
              setTimeout(() => {
                this.processedEvents.delete(eventId);
              }, 1000);

              await handler(enrichedEvent).catch((err) =>
                console.error("Error in subscriber:", err)
              );
            }
          })
        );
      } catch (err) {
        console.error("Error processing Redis pmessage:", err);
      }
    });
  }

  async publish(event, options) {
    const eventId =
      options.eventId || `${event.type}-${Date.now()}-${Math.random()}`;

    console.log(
      `[RedisMessageBus] Publishing event: ${event.type}, ID: ${eventId}`
    );

    if (this.processedEvents.has(eventId)) {
      console.log(`[RedisMessageBus] Skipping duplicate event: ${eventId}`);
      return;
    }

    this.processedEvents.set(eventId, Date.now());

    setTimeout(() => {
      this.processedEvents.delete(eventId);
    }, this.config.deduplicationWindow);

    const channel = `${this.config.channelPrefix}${event.type}`;
    await this.publishClient.publish(
      channel,
      JSON.stringify({
        ...event,
        metadata: {
          ...options.metadata,
          eventId, // Include eventId in metadata
          componentId: options.componentId,
        },
      })
    );
  }

  async subscribe(handler) {
    this.subscribers.add(handler);
  }

  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      for (const [eventId, timestamp] of this.processedEvents.entries()) {
        if (now - timestamp > this.config.deduplicationWindow) {
          this.processedEvents.delete(eventId);
        }
      }
    }, 10000); // Cleanup every 10 seconds
  }

  async cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    await Promise.all([
      this.publishClient?.quit(),
      this.subscribeClient?.quit(),
    ]);
    this.subscribers.clear();
  }
}
