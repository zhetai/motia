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
    // Create separate clients for pub/sub
    this.publishClient = new Redis(this.config);
    this.subscribeClient = new Redis(this.config);

    await this.subscribeClient.psubscribe(`${this.config.channelPrefix}*`);
    this.subscribeClient.on("pmessage", async (pattern, channel, message) => {
      try {
        const event = JSON.parse(message);
        // Fan out to all subscribers
        await Promise.all(
          Array.from(this.subscribers).map((handler) =>
            handler(event).catch((err) =>
              console.error("Error in subscriber:", err)
            )
          )
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
      JSON.stringify({ ...event, metadata: options.metadata })
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
