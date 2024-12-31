// packages/wistro/src/core/WistroServer.js

import Fastify from "fastify";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

export class WistroServer {
  constructor(config) {
    this.traffic = new Map();
    this.fastify = Fastify();
    this.serverConfig = config ?? {
      port: process.env.PORT || 4000,
    };
  }

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
        if (!def.type) {
          throw new Error(
            `No transform function or 'type' field found for route: ${def.path}`
          );
        }
        // Default transform function
        transformFn = (req) => ({
          type: def.type,
          data: req.body,
        });
      }

      const routePath = this.standardizePath(def.path);

      // Register this route into our local Map
      this.registerTraffic({
        path: routePath,
        method: def.method,
        transform: transformFn,
        authorize: authorizeFn,
      });

      // Attach the route to Fastify
      this.fastify.route({
        method: def.method.toUpperCase(),
        url: routePath,
        handler: async (request, reply) => {
          try {
            await this.handleRequest(request, reply);
          } catch (error) {
            console.error("[WistroServer] Error handling request:", error);
            reply.status(500).send({ error: "Internal server error" });
          }
        },
      });
    }

    // Optionally define additional endpoints (e.g., /api/workflows)
    this.fastify.route({
      url: "/api/workflows", 
      handler: async (_, reply) => {
        try {
          const workflows = await this.core.describeWorkflows();
          reply.send(workflows);
        } catch (error) {
          reply.status(500).send({ error: error.message });
        }
      }, 
      method: 'POST'
    });

    // Serve static files
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.fastify.register(import("@fastify/static"), {
      root: path.join(__dirname, "../dist"),
      prefix: "/",
    });

    // Start the Fastify server
    try {
      await this.fastify.listen({ port: this.serverConfig.port, host: '::' });
      console.log(`[WistroServer] Server listening on port ${this.serverConfig.port}`);
    } catch (err) {
      console.error("[WistroServer] Failed to start server:", err);
      process.exit(1);
    }
  }

  async handleRequest(request, reply) {
    const traffic = this.traffic.get(request.raw.url);
    if (!traffic) {
      return reply.status(404).send({ error: "Route not found" });
    }

    try {
      if (traffic.authorize) {
        await traffic.authorize(request);
      }
      const event = await traffic.transform(request);
      await this.core.emit(event, {
        traceId: request.headers["x-trace-id"],
        metadata: {
          source: "http",
          path: request.raw.url,
          method: request.raw.method,
        },
      });
      reply.status(200).send({ success: true, eventType: event.type });
    } catch (error) {
      reply.status(400).send({ error: error.message });
    }
  }

  registerTraffic(config) {
    if (!config.path || !config.method || !config.transform) {
      throw new Error("Invalid traffic configuration");
    }
    if (this.traffic.has(config.path)) {
      throw new Error(`Duplicate traffic path: ${config.path}`);
    }
    this.traffic.set(config.path, config);
  }

  standardizePath(path) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  async close() {
    if (this.fastify) {
      await this.fastify.close();
    }
  }
}
