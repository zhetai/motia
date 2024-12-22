import express from "express";
import bodyParser from "body-parser";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";

class NodeAgent {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.components = new Map();
    this.initialize();
  }

  async initialize() {
    // Create components directory if it doesn't exist
    await fs.mkdir("components", { recursive: true });

    // Try to restore previously registered components
    console.log("[NodeAgent] Restoring components...");
    await this.restoreComponents();

    const port = process.env.PORT || 3000;
    this.app.listen(port, () => {
      console.log(`Node agent listening on port ${port}`);
    });

    this.setupRoutes();
  }

  async restoreComponents() {
    try {
      const files = await fs.readdir("components");
      for (const file of files) {
        if (file.endsWith(".js")) {
          const name = file.replace("_", "/").replace(".js", "");
          const filePath = path.join("components", file);
          this.components.set(name, { filePath });
        }
      }
      console.log(
        "[NodeAgent] Restored components:",
        Array.from(this.components.keys())
      );
    } catch (error) {
      console.error("[NodeAgent] Error restoring components:", error);
    }
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
      console.log("[NodeAgent] Execute:", {
        componentId: req.params.componentId,
        registeredComponents: Array.from(this.components.keys()),
      });

      try {
        const { componentId } = req.params;
        const component = this.components.get(componentId);

        if (!component) {
          throw new Error(
            `Component not found: ${componentId} (registered: ${Array.from(
              this.components.keys()
            ).join(", ")})`
          );
        }

        const moduleUrl = pathToFileURL(component.filePath).href;
        const module = await import(moduleUrl + "?update=" + Date.now()); // Force module reload
        const emittedEvents = [];

        await module.default(req.body.data, async (newEvent) => {
          emittedEvents.push({
            ...newEvent,
            metadata: { componentId },
          });
        });

        res.json({ status: "success", events: emittedEvents });
      } catch (error) {
        console.error("[NodeAgent] Execution error:", error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  async registerComponent(name, code) {
    try {
      const filePath = path.join(
        "components",
        `${name.replace(/\//g, "_")}.js`
      );
      await fs.writeFile(filePath, code, "utf-8");
      this.components.set(name, { filePath });
      console.log("[NodeAgent] Registered component:", {
        name,
        components: Array.from(this.components.keys()),
      });
    } catch (error) {
      console.error(`Failed to register component ${name}:`, error);
      throw error;
    }
  }
}

const agent = new NodeAgent();
