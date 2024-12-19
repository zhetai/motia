import { InMemoryMessageBus } from "../core/MessageBus.js";

export class WorkflowTestMessageBus extends InMemoryMessageBus {
  constructor() {
    super();
    this.events = [];
  }

  async publish(event, options) {
    this.events.push(event);
    await super.publish(event, options);
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}
