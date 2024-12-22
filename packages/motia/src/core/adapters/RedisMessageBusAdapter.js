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
  }

  async initialize() {
    // Client for publishing only
    this.publishClient = new Redis({
      ...this.config,
      clientName: "motia-publisher",
    });

    // Client for subscribing only
    this.subscribeClient = new Redis({
      ...this.config,
      clientName: "motia-subscriber",
    });

    await this.subscribeClient.psubscribe(`${this.config.channelPrefix}*`);

    this.subscribeClient.on("pmessage", async (pattern, channel, message) => {
      console.log("[RedisMB] Processing message:", {
        pattern,
        channel,
      });

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
    console.log("[RedisMB] Adding subscriber");
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
