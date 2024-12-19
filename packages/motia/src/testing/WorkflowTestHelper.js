// packages/motia/src/testing/WorkflowTestHelper.js
import { MotiaCore, MotiaServer } from "motia";
import { WorkflowTestMessageBus } from "./WorkflowTestMessageBus.js";
import path from "path";

export class WorkflowTestHelper {
  constructor(basePath) {
    this.basePath = basePath;
    this.core = null;
    this.server = null;
    this.messageBus = new WorkflowTestMessageBus();
  }

  async setup() {
    this.core = new MotiaCore();
    // Initialize core with the correct workflow paths
    await this.core.initialize({
      workflowPaths: [`${this.basePath}/playground/src/workflows`],
      messageBus: this.messageBus,
    });
    // Do NOT initialize server here. The server should be started in startServer().
  }

  async startServer(port) {
    process.env.PORT = port;
    this.server = new MotiaServer();
    // Initialize server with correct traffic paths
    await this.server.initialize(this.core, [
      `${this.basePath}/playground/src/traffic/inbound`,
    ]);
  }

  get receivedEvents() {
    return this.messageBus.getEvents();
  }

  async cleanup() {
    this.messageBus.clearEvents();
    // If there's a need to stop the server, implement that if MotiaServer exposes a close method
  }
}
