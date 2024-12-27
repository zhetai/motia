// packages/wistro/src/core/adapters/MessageBusAdapter.js

/**
 * Base interface for message bus adapters
 */
export class MessageBusAdapter {
  /**
   * Initialize the adapter
   */
  async initialize() {
    throw new Error("initialize() must be implemented by adapter");
  }

  /**
   * Publish an event to the message bus
   * @param {Object} event - The event to publish { type, data, metadata? }
   * @param {Object} options - Additional options { metadata? }
   */
  async publish(event, options) {
    throw new Error("publish() must be implemented by adapter");
  }

  /**
   * Subscribe to events on the message bus
   * @param {Function} handler - Async function(event) to handle events
   */
  async subscribe(handler) {
    throw new Error("subscribe() must be implemented by adapter");
  }

  /**
   * Clean up adapter resources
   */
  async cleanup() {
    throw new Error("cleanup() must be implemented by adapter");
  }
}
