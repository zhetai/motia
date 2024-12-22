// packages/motia/src/core/MotiaServer.js
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MotiaServer {
  constructor() {
    this.traffic = new Map();
    this.express = express();
    this.express.use(bodyParser.json());
  }

  async findTrafficFiles(paths) {
    const trafficFiles = [];

    const searchTraffic = async (dir) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchTraffic(fullPath);
        } else if (
          entry.name.endsWith(".js") &&
          !entry.name.includes(".test.")
        ) {
          trafficFiles.push(fullPath);
        }
      }
    };

    for (const basePath of paths) {
      const absolutePath = path.resolve(basePath);
      await searchTraffic(absolutePath);
    }
    return trafficFiles;
  }

  async initialize(core, trafficPaths = ["./traffic/inbound"]) {
    this.core = core;

    // Load traffic handlers
    const trafficFiles = await this.findTrafficFiles(trafficPaths);
    for (const trafficFile of trafficFiles) {
      const trafficModule = await import(pathToFileURL(trafficFile));
      const trafficConfigs = Array.isArray(trafficModule.default)
        ? trafficModule.default
        : [trafficModule.default];

      for (const config of trafficConfigs) {
        this.registerTraffic(config);
      }
    }

    // Set up routes
    this.traffic.forEach((config, routePath) => {
      this.express[config.method.toLowerCase()](routePath, async (req, res) => {
        try {
          await this.handleRequest(req, res);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    });

    // API endpoints
    this.express.get("/api/workflows", (req, res) => {
      res.json(this.core.describeWorkflows());
    });

    // Static files and catch-all
    this.express.use(express.static(path.join(__dirname, "../dist")));
    this.express.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../dist/index.html"));
    });

    // Start server
    const port = process.env.PORT || 4000;
    this.express.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }

  async handleRequest(req, res) {
    const traffic = this.traffic.get(req.path);
    if (!traffic) {
      res.status(404).json({ error: "Traffic not found" });
      return;
    }

    try {
      // Check authorization if required
      if (traffic.authorize) {
        await traffic.authorize(req);
      }

      // Transform request to event
      const event = await traffic.transform(req);

      // Emit through core
      await this.core.emit(event, {
        traceId: req.headers["x-trace-id"],
        metadata: {
          source: "http",
          path: req.path,
          method: req.method,
        },
      });

      res.status(200).json({ success: true, eventType: event.type });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  registerTraffic(config) {
    if (!config.path || !config.method || !config.transform) {
      throw new Error("Invalid traffic configuration");
    }

    const routePath = config.path.startsWith("/")
      ? config.path
      : `/${config.path}`;
    this.traffic.set(routePath, config);
  }
}
