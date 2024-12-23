import { MotiaCore, MotiaServer } from "motia";
import { InMemoryMessageBus } from "../core/MessageBus.js";
import fetch from "node-fetch";

export class WorkflowTestHelper {
  constructor(basePath) {
    this.basePath = basePath;
    this.core = null;
    this.server = null;
    this.port = 4000; // Default port
  }

  async setup() {
    this.core = new MotiaCore({
      messageBus: new InMemoryMessageBus(),
    });
    await this.core.initialize({
      workflowPaths: [`${this.basePath}/playground/src/workflows`],
    });
  }

  async startServer(port = 4000) {
    this.port = port;
    this.server = new MotiaServer();
    await this.server.initialize(this.core, [
      `${this.basePath}/playground/src/traffic/inbound`,
    ]);
  }

  // Helper method for HTTP POST requests
  async post(path, body) {
    const response = await fetch(`http://localhost:${this.port}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return {
      statusCode: response.status,
      body: await response.json(),
    };
  }

  // Get events from in-memory bus
  async getEvents() {
    return this.core.messageBus.events;
  }

  async cleanup() {
    if (this.server) {
      await this.server.close(); // Assuming MotiaServer has a close() method
    }
    if (this.core) {
      await this.core.cleanup();
    }
  }
}
