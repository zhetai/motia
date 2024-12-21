// packages/motia/src/testing/WorkflowTestHelper.js
import { MotiaCore, MotiaServer } from "motia";
import { WorkflowTestMessageBus } from "./WorkflowTestMessageBus.js";

export class WorkflowTestHelper {
  constructor(basePath, messageBus) {
    this.basePath = basePath;
    this.core = null;
    this.server = null;
    // Use a provided bus or default to a specialized test bus
    this.messageBus = messageBus || new WorkflowTestMessageBus();
  }

  async setup() {
    this.core = new MotiaCore();
    await this.messageBus.initialize();
    await this.core.initialize({
      workflowPaths: [`${this.basePath}/playground/src/workflows`],
      messageBus: this.messageBus,
    });
    // Do NOT initialize server by default unless you need server-based tests
  }

  async startServer(port) {
    process.env.PORT = port;
    this.server = new MotiaServer();
    await this.server.initialize(this.core, [
      `${this.basePath}/playground/src/traffic/inbound`,
    ]);
  }

  get receivedEvents() {
    // If we're using WorkflowTestMessageBus, it stores everything in memory
    // If we are using Redis, you might need a separate approach to read them
    return this.messageBus.getEvents?.() || [];
  }

  async cleanup() {
    await this.messageBus.cleanup?.();
  }
}
