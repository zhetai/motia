// packages/wistro/src/core/WistroServer.js

import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

export class WistroServer {
  constructor() {
    this.traffic = new Map();
    this.express = express();
    this.express.use(bodyParser.json());
  }

  // Instead of trafficPaths, accept traffic array directly
  async initialize(core, trafficDefs = []) {
    this.core = core;

    for (const def of trafficDefs) {
      // If def.transformPath is given, dynamically import the module
      let transformFn = null;
      if (def.transformPath) {
        const transformModule = await import(pathToFileURL(def.transformPath));
        transformFn = transformModule?.default;
      }

      // If there's an optional authorizePath, import that too
      let authorizeFn = null;
      if (def.authorizePath) {
        const authorizeModule = await import(pathToFileURL(def.authorizePath));
        authorizeFn = authorizeModule?.default;
      }

      // If we still have no transform function, provide a default
      if (!transformFn) {
        // We need to know 'type' to build an event
        if (!def.type) {
          throw new Error(
            `No transform function or 'type' field found for route: ${def.path}`
          );
        }

        // A simple default transform that sets event.type = def.type, event.data = req.body
        transformFn = (req) => ({
          type: def.type,
          data: req.body,
        });
      }

      // Register this route into our local Map
      this.registerTraffic({
        path: def.path,
        method: def.method,
        transform: transformFn,
        authorize: authorizeFn,
      });
    }

    // Now attach each route to Express
    this.traffic.forEach((config, routePath) => {
      this.express[config.method.toLowerCase()](routePath, async (req, res) => {
        try {
          await this.handleRequest(req, res);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    });

    // Optionally, define additional endpoints (e.g. /api/workflows)
    this.express.get("/api/workflows", async (req, res) => {
      try {
        const workflows = await this.core.describeWorkflows();
        res.json(workflows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Serve static files, etc.
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.express.use(express.static(path.join(__dirname, "../dist")));
    this.express.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../dist/index.html"));
    });

    // Start listening
    const port = process.env.PORT || 4000;
    this.express.listen(port, () => {
      console.log(`[WistroServer] Server listening on port ${port}`);
    });
  }

  async handleRequest(req, res) {
    const traffic = this.traffic.get(req.path);
    if (!traffic) {
      return res.status(404).json({ error: "Traffic not found" });
    }

    try {
      if (traffic.authorize) {
        await traffic.authorize(req);
      }
      const event = await traffic.transform(req);
      await this.core.emit(event, {
        traceId: req.headers["x-trace-id"],
        metadata: { source: "http", path: req.path, method: req.method },
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

  async close() {
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
    }
  }
}
