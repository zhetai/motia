// packages/wistro/src/core/adapters/RedisMessageBusAdapter.js
import { MessageBusAdapter } from "./MessageBusAdapter.js";
import Redis from "ioredis";

export class RedisMessageBusAdapter extends MessageBusAdapter {
  constructor(config = {}) {
    super();
    this.config = {
      host: config.host || "localhost",
      port: config.port || 6379,
      channelPrefix: config.channelPrefix || "wistro:events:",
      ...config,
    };
    this.subscribers = new Set();
    this.publishClient = null;
    this.subscribeClient = null;
  }

  async initialize() {
    // Client for publishing only
    this.publishClient = new Redis({
      ...this.config,
      clientName: "wistro-publisher",
    });

    // Client for subscribing only
    this.subscribeClient = new Redis({
      ...this.config,
      clientName: "wistro-subscriber",
    });

    await this.subscribeClient.psubscribe(`${this.config.channelPrefix}*`);

    this.subscribeClient.on("pmessage", async (pattern, channel, message) => {
      try {
        const event = JSON.parse(message);
        await Promise.all(
          Array.from(this.subscribers).map((handler) =>
            handler(event).catch((err) => {
              console.error("Error in event handler:", err);
            })
          )
        );
      } catch (err) {
        console.error("[RedisMB] Error processing message:", err);
      }
    });
  }

  async publish(event, options = {}) {
    const channel = `${this.config.channelPrefix}${event.type}`;
    const enrichedEvent = {
      ...event,
      metadata: {
        ...options.metadata,
        timestamp: Date.now(),
      },
    };

    await this.publishClient.publish(channel, JSON.stringify(enrichedEvent));
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
