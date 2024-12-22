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
      ...config,
    };
    this.subscribers = new Set();
    this.publishClient = null;
    this.subscribeClient = null;
    this.processedEvents = new Map();
  }

  async initialize() {
    this.publishClient = new Redis(this.config);
    this.subscribeClient = new Redis(this.config);

    await this.subscribeClient.psubscribe(`${this.config.channelPrefix}*`);
    this.subscribeClient.on("pmessage", async (pattern, channel, message) => {
      try {
        const event = JSON.parse(message);

        // Only process the event for subscribers that haven't seen it
        await Promise.all(
          Array.from(this.subscribers).map(async (handler) => {
            // If this is a component event, use component ID for tracking
            const eventId = event.metadata?.componentId
              ? `${event.type}-${event.metadata.componentId}`
              : `${event.type}-${Date.now()}`;

            if (!this.processedEvents.has(eventId)) {
              this.processedEvents.set(eventId, true);
              setTimeout(() => {
                this.processedEvents.delete(eventId);
              }, 1000);

              await handler(event).catch((err) =>
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

  async publish(event, options = {}) {
    if (!this.publishClient) {
      throw new Error("Redis adapter not initialized");
    }

    const channel = `${this.config.channelPrefix}${event.type}`;
    await this.publishClient.publish(
      channel,
      JSON.stringify({
        ...event,
        metadata: {
          ...options.metadata,
          componentId: options.componentId, // Add component ID to metadata
        },
      })
    );
  }

  async subscribe(handler) {
    this.subscribers.add(handler);
  }

  async cleanup() {
    await Promise.all([
      this.publishClient?.quit(),
      this.subscribeClient?.quit(),
    ]);
    this.subscribers.clear();
  }
}
