// agents/node-agent/src/server.js
import express from "express";
import bodyParser from "body-parser";
import { createClient } from "redis";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class NodeAgent {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.components = new Map();
    this.redis = null;
    this.initialize();
  }

  async initialize() {
    this.redis = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.redis.on("error", (err) => console.error("Redis Client Error", err));
    await this.redis.connect();

    this.setupRoutes();
    await this.setupRedisSubscriber();

    const port = process.env.PORT || 3000;
    this.app.listen(port, () => {
      console.log(`Node agent listening on port ${port}`);
    });
  }

  setupRoutes() {
    this.app.get("/health", (req, res) => {
      res.json({ status: "healthy" });
    });

    this.app.post("/register", async (req, res) => {
      try {
        const { code, name } = req.body;
        await this.registerComponent(name, code);
        res.json({ status: "success" });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post("/execute/:componentId(*)", async (req, res) => {
      try {
        const { componentId } = req.params;
        const event = req.body;
        await this.executeComponent(componentId, event);
        res.json({ status: "success" });
      } catch (error) {
        console.error("Execution error:", error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  async setupRedisSubscriber() {
    const subscriber = this.redis.duplicate();
    await subscriber.connect();
  }

  async registerComponent(name, code) {
    // Parse the component ID into workflow and component name
    const [workflowName, componentName] = name.split("/");
    if (!workflowName || !componentName) {
      throw new Error(`Invalid component ID format: ${name}`);
    }

    console.log("Registering component:", name);

    try {
      const filePath = `${__dirname}/components/${name.replace("/", "_")}.js`;
      await fs.mkdir(`${__dirname}/components`, { recursive: true });
      await fs.writeFile(filePath, code);

      const componentUrl = new URL(`file://${filePath}`);
      const component = await import(componentUrl);

      // Store with the componentId as the key
      this.components.set(name, {
        ...component,
        filePath,
        id: name,
      });

      console.log(`Component ${name} registered successfully`);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async executeComponent(componentId, event) {
    console.log(
      `[NodeAgent] Executing ${componentId} for event: ${event.type}`
    );
    const component = this.components.get(componentId);
    if (!component) {
      throw new Error(`Component not found: ${componentId}`);
    }

    try {
      await component.default(
        event.data,
        async (newEvent) => {
          const enrichedEvent = {
            ...newEvent,
            metadata: {
              ...event.metadata,
              fromAgent: true,
            },
          };
          const channel = `motia:events:${newEvent.type}`;
          await this.redis.publish(channel, JSON.stringify(enrichedEvent));
        },
        event.type
      );
    } catch (error) {
      console.error("Component execution error:", error);
      throw error;
    }
  }

  async handleEvent(event) {
    for (const [componentId, component] of this.components.entries()) {
      if (component.subscribe?.includes(event.type)) {
        await this.executeComponent(componentId, event);
      }
    }
  }

  async cleanup() {
    for (const component of this.components.values()) {
      try {
        await fs.unlink(component.filePath);
      } catch (error) {
        console.warn(`Failed to delete component file: ${error.message}`);
      }
    }

    await this.redis.quit();
    this.components.clear();
  }
}

const agent = new NodeAgent();

process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await agent.cleanup();
  process.exit(0);
});
