/**
 * In-Memory Message Bus Implementation
 * ------------------------------------
 * The InMemoryMessageBus provides a simple, local-only event bus for the Motia framework.
 * It manages event subscribers and publishes events to them. This bus operates fully in-memory,
 * making it ideal for development, testing, and lightweight deployments.
 *
 * Key Responsibilities:
 * - Store a list of subscribers (event handlers)
 * - When an event is published, deliver it to all subscribers that match the event type
 * - Handle errors in subscriber callbacks gracefully
 *
 * This class does not persist events or maintain any external state,
 * and is not suitable for production scenarios that require durability or scaling.
 */
export class InMemoryMessageBus {
  constructor() {
    this.subscribers = [];
  }

  async publish(event, options) {
    await Promise.all(
      this.subscribers.map((subscriber) =>
        subscriber(event, options).catch((error) => {
          console.error("Error in subscriber:", error);
        })
      )
    );
  }

  subscribe(handler) {
    this.subscribers.push(handler);
  }
}
