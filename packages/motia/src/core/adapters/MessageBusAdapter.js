// packages/motia/src/core/adapters/MessageBusAdapter.js

/**
 * Base interface for message bus adapters
 */
export class MessageBusAdapter {
  /**
   * Initialize the adapter
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error("initialize() must be implemented by adapter");
  }

  /**
   * Publish an event to the message bus
   * @param {Object} event The event to publish
   * @param {Object} options Additional options for publishing
   * @returns {Promise<void>}
   */
  async publish(event, options) {
    throw new Error("publish() must be implemented by adapter");
  }

  /**
   * Subscribe to events on the message bus
   * @param {Function} handler The event handler function
   * @returns {Promise<void>}
   */
  async subscribe(handler) {
    throw new Error("subscribe() must be implemented by adapter");
  }

  /**
   * Clean up any resources used by the adapter
   * @returns {Promise<void>}
   */
  async cleanup() {
    throw new Error("cleanup() must be implemented by adapter");
  }
}
