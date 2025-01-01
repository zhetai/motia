// packages/wistro/src/core/EventManager.js
const Redis = require("ioredis");
const crypto = require("crypto");

class EventManager {
  constructor(config) {
    this.definitions = new Map();
    this.subscriptions = new Map();
    this.processedEvents = new Set();
    this.redis = new Redis(config);
    this.subscriber = new Redis(config);
    this.eventHandlers = new Map();
  }

  async initialize() {
    console.log("[EventManager] Initializing...");

    // Subscribe to all events
    const pattern = `${this.getPrefix()}*`;
    await this.subscriber.psubscribe(pattern);

    this.subscriber.on("pmessage", async (_pattern, channel, message) => {
      const eventType = channel.replace(this.getPrefix(), "");
      const event = JSON.parse(message);

      console.log(`[EventManager] Received Redis message for ${eventType}`, {
        subscribers: this.subscriptions.get(eventType)?.size || 0,
        eventId: event.metadata?.eventId,
      });

      await this.routeEvent(event);
    });

    console.log("[EventManager] Initialized");
  }

  async registerHandler(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType).add(handler);

    console.log(`[EventManager] Registered handler for ${eventType}`, {
      totalHandlers: this.eventHandlers.get(eventType).size,
    });
  }

  async emit(event, emitter) {
    const eventId = this.computeEventId(event);

    const enrichedEvent = {
      ...event,
      metadata: {
        ...event.metadata,
        eventId,
        emitter,
        timestamp: Date.now(),
      },
    };

    this.processedEvents.add(eventId);

    const channel = `${this.getPrefix()}${event.type}`;
    await this.redis.publish(channel, JSON.stringify(enrichedEvent));

    const handlers = this.eventHandlers.get(event.type)?.size || 0;
    console.log(`[EventManager] Emitted event ${event.type} (${eventId})`, {
      emitter,
      handlers,
      subscriptions: this.subscriptions.get(event.type)?.size || 0,
    });
  }

  async subscribe(eventType, componentId, handler) {
    // Track subscription
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType).add(componentId);

    // Register handler if provided
    if (handler) {
      await this.registerHandler(eventType, handler);
    }

    console.log(`[EventManager] Added subscription`, {
      eventType,
      componentId,
      totalSubscribers: this.subscriptions.get(eventType).size,
    });
  }

  async routeEvent(event) {
    const handlers = this.eventHandlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      console.log(`[EventManager] No handlers for event ${event.type}`);
      return;
    }

    console.log(`[EventManager] Routing event ${event.type}`, {
      eventId: event.metadata?.eventId,
      handlers: handlers.size,
    });

    // Execute all handlers
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(
          `[EventManager] Error in handler for ${event.type}:`,
          error
        );
      }
    }
  }

  getPrefix() {
    return "wistro:events:";
  }

  computeEventId(event) {
    const payload = JSON.stringify({
      type: event.type,
      data: event.data,
    });
    return crypto
      .createHash("sha256")
      .update(payload)
      .digest("hex")
      .slice(0, 12);
  }

  async cleanup() {
    this.processedEvents.clear();
    this.subscriptions.clear();
    this.eventHandlers.clear();
    await this.subscriber.punsubscribe();
    await this.subscriber.quit();
    await this.redis.quit();
  }
}


exports.EventManager = EventManager