// packages/motia/src/core/adapters/RedisMessageBusAdapter.js
import { MessageBusAdapter } from "./MessageBusAdapter.js";
import Redis from "ioredis";
import crypto from "crypto";

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

    // Start a regular cleanup for old events
    this.startCleanupInterval();
  }

  /**
   * Establishes Redis connections and subscribes to motia:events:* pmessage.
   */
  async initialize() {
    // 1) Create separate clients for pub/sub
    this.publishClient = new Redis(this.config);
    this.subscribeClient = new Redis(this.config);

    // 2) Subscribe to all channels matching motia:events:*
    await this.subscribeClient.psubscribe(`${this.config.channelPrefix}*`);

    // 3) Listen for incoming messages
    this.subscribeClient.on("pmessage", async (pattern, channel, message) => {
      try {
        // Parse the event
        const event = JSON.parse(message);

        // Add or update metadata so we know this came from Redis
        const enrichedEvent = {
          ...event,
          metadata: {
            ...event.metadata,
            fromRedis: true,
          },
        };

        // Compute a stable ID based on (type, data) to deduplicate
        const stableId = this.computeStableEventId(event);

        // Deliver to local subscribers only if we haven't seen this ID
        await Promise.all(
          Array.from(this.subscribers).map(async (handler) => {
            if (!this.processedEvents.has(stableId)) {
              this.processedEvents.set(stableId, true);

              // Remove it from memory after a short delay
              setTimeout(() => {
                this.processedEvents.delete(stableId);
              }, 1000);

              // Invoke the subscriber
              await handler(enrichedEvent).catch((err) => {
                console.error("Error in subscriber:", err);
              });
            }
          })
        );
      } catch (err) {
        console.error("Error processing Redis pmessage:", err);
      }
    });
  }

  /**
   * Creates a stable ID based on (type, data).
   * We ignore event.metadata so that re-sends with new metadata
   * are considered the same event if (type, data) are unchanged.
   */
  computeStableEventId(event) {
    const corePayload = JSON.stringify({
      type: event.type,
      data: event.data,
    });

    const shasum = crypto.createHash("sha256");
    shasum.update(corePayload);

    // You can adjust the slice length to generate a longer or shorter ID.
    const shortHash = shasum.digest("hex").slice(0, 12);
    return `evt-${shortHash}`;
  }

  /**
   * Publishes an event to Redis using a stable ID. If the event
   * has the same (type, data) as a previous one, we skip re-publishing.
   */
  async publish(event, options = {}) {
    // Use stable ID for dedup (rather than random)
    const eventId = this.computeStableEventId(event);

    console.log(
      `[RedisMessageBus] Publishing event: ${event.type}, ID: ${eventId}`
    );

    // If we've seen this stable ID, skip
    if (this.processedEvents.has(eventId)) {
      console.log(`[RedisMessageBus] Skipping duplicate event: ${eventId}`);
      return;
    }

    // Mark it as processed
    this.processedEvents.set(eventId, Date.now());

    // Cleanup after deduplicationWindow
    setTimeout(() => {
      this.processedEvents.delete(eventId);
    }, this.config.deduplicationWindow);

    // Publish to the Redis channel
    const channel = `${this.config.channelPrefix}${event.type}`;
    await this.publishClient.publish(
      channel,
      JSON.stringify({
        ...event,
        metadata: {
          ...(options.metadata || {}),
          eventId, // stable event ID in metadata
          componentId: options.componentId,
        },
      })
    );
  }

  /**
   * Allows local code to subscribe to any event received from Redis.
   * Each 'handler' is called with the parsed event object.
   */
  async subscribe(handler) {
    this.subscribers.add(handler);
  }

  /**
   * Periodically clears out old events from processedEvents
   * to prevent memory growth if many events are published.
   */
  startCleanupInterval() {
    // Check every 10 seconds for old events
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [eventId, timestamp] of this.processedEvents.entries()) {
        if (now - timestamp > this.config.deduplicationWindow) {
          this.processedEvents.delete(eventId);
        }
      }
    }, 10000);
  }

  /**
   * Shuts down clients and clears memory. Useful when stopping the app.
   */
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
