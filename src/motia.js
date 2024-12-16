import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import express from "express";
import bodyParser from "body-parser";

// Resolve __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * In-Memory Message Bus Implementation
 * ------------------------------------
 * The InMemoryMessageBus provides a simple, local-only event bus for the Motia framework.
 * It manages event subscribers and publishes events to them. This bus operates fully in-memory,
 * making it ideal for development, testing, and lightweight deployments.
 *
 * Key Responsibilities:
 * - Store a list of subscribers (event handlers)
 * - When an event is published, deliver it to all subscribers that match the event type
 * - Handle errors in subscriber callbacks gracefully
 *
 * This class does not persist events or maintain any external state,
 * and is not suitable for production scenarios that require durability or scaling.
 */
class InMemoryMessageBus {
  constructor() {
    this.subscribers = [];
  }

  async publish(event, options) {
    await Promise.all(
      this.subscribers.map((subscriber) =>
        subscriber(event, options).catch((error) => {
          console.error("Error in subscriber:", error);
        })
      )
    );
  }

  subscribe(handler) {
    this.subscribers.push(handler);
  }
}

/**
 * Core Orchestrator: MotiaCore
 * ----------------------------
 * MotiaCore serves as the central orchestrator of the Motia framework. It manages the lifecycle
 * of workflows, components, and the event bus, acting as the heart of the entire system.
 *
 * Key Responsibilities:
 * - Initialize and configure the message bus (either in-memory or a provided one)
 * - Load and register workflows and their associated components
 * - Emit events into the system and deliver them to subscribed components
 *
 * MotiaCore provides the foundational logic that ties together components, events,
 * and workflows, enabling flexible, event-driven behavior throughout the application.
 */
class MotiaCore {
  constructor() {
    this.messageBus = new InMemoryMessageBus();
    this.workflows = new Map();
    this.components = new Map();
  }

  async registerWorkflow(workflowPath) {
    try {
      const configPath = path.resolve(workflowPath, "config.js");
      const configModule = await import(pathToFileURL(configPath).href);
      this.workflows.set(workflowPath, configModule);
    } catch (error) {
      console.error(`Error registering workflow at ${workflowPath}:`, error);
    }
  }

  async registerComponent(componentPath) {
    try {
      // componentPath is absolute now
      const componentModule = await import(pathToFileURL(componentPath).href);
      if (componentModule.subscribe) {
        this.components.set(componentPath, componentModule.default);
      }
    } catch (error) {
      console.error(`Error registering component at ${componentPath}:`, error);
    }
  }

  async emit(event, options) {
    await this.messageBus.publish(event, options);
  }

  async initialize(options = {}) {
    const workflowPaths = options.workflowPaths || ["./src/workflows"];
    this.messageBus = options.messageBus || new InMemoryMessageBus();

    this.workflows = new Map();
    this.components = new Map();

    // Convert workflowPaths to absolute
    const absoluteWorkflowPaths = workflowPaths.map((p) => path.resolve(p));

    // Load all workflows
    for (const wPath of absoluteWorkflowPaths) {
      const workflowFiles = await this.findWorkflowFiles(wPath);
      for (const file of workflowFiles) {
        await this.registerWorkflow(file);
      }
    }

    // Load all components from these workflows
    const componentFiles = await this.findComponentFiles(absoluteWorkflowPaths);
    for (const file of componentFiles) {
      await this.registerComponent(file);
    }

    // Subscribe components to message bus
    for (const [id, component] of this.components.entries()) {
      const moduleUrl = pathToFileURL(id).href;
      const module = await import(moduleUrl);
      if (module.subscribe) {
        for (const eventPattern of module.subscribe) {
          this.messageBus.subscribe(async (event, opts) => {
            if (this.eventMatchesPattern(event.type, eventPattern)) {
              await component(
                event.data,
                (e) => this.emit(e, opts),
                event.type
              );
            }
          });
        }
      }
    }
  }

  async findWorkflowFiles(basePath) {
    const workflows = [];
    try {
      const entries = await fs.promises.readdir(basePath, {
        withFileTypes: true,
      });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const workflowPath = path.join(basePath, entry.name);
          const files = await fs.promises.readdir(workflowPath);
          if (files.includes("config.js") && files.includes("version.json")) {
            // Return absolute path
            workflows.push(path.resolve(workflowPath));
          }
        }
      }
    } catch (error) {
      console.error("Error finding workflow files:", error);
    }
    return workflows;
  }

  async findComponentFiles(paths) {
    const components = [];
    for (const basePath of paths) {
      try {
        const workflowDirs = await fs.promises.readdir(basePath, {
          withFileTypes: true,
        });

        for (const workflowDir of workflowDirs) {
          if (!workflowDir.isDirectory()) continue;

          const componentsPath = path.join(
            basePath,
            workflowDir.name,
            "components"
          );
          try {
            await this.searchComponents(componentsPath, components);
          } catch {
            // If components dir doesn't exist, skip
          }
        }
      } catch (error) {
        console.error("Error finding component files:", error);
      }
    }
    return components.map((c) => path.resolve(c));
  }

  async searchComponents(dir, components) {
    let entries;
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.searchComponents(fullPath, components);
      } else if (
        entry.name.endsWith(".js") &&
        !entry.name.endsWith(".test.js")
      ) {
        components.push(fullPath);
      }
    }
  }

  eventMatchesPattern(eventType, pattern) {
    if (pattern === "*") return true;
    if (pattern === eventType) return true;
    if (pattern.endsWith(".*")) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix);
    }
    return false;
  }
}

/**
 * Testing Utilities: MotiaTest
 * ----------------------------
 * MotiaTest offers testing utilities to validate components, thresholds, and LLM logic within the Motia framework.
 * It provides mock emit functions, component test helpers, and performance test runners.
 *
 * Key Responsibilities:
 * - Create mock emit functions to simulate event emission in tests
 * - Provide helper functions for component-level testing and threshold verification
 * - Offer utilities for load testing and accuracy measurement of LLM outputs
 *
 * This class simplifies and standardizes how developers test their Motia-based workflows, ensuring reliability and correctness.
 */
class MotiaTest {
  static mockEmit() {
    const mock = (...args) => {};
    mock.mock = { calls: [] };
    const wrapper = (event, options) => {
      mock.mock.calls.push([event, options]);
    };
    return wrapper;
  }

  static createComponentTest(component, options) {
    return async (input, emit) => {
      const mockEmit = emit || MotiaTest.mockEmit();
      // If mocks needed, must be handled outside this method for ESM.
      await component(input, mockEmit, "test.event");
    };
  }

  static createThresholdTest(component, options) {
    return async () => {
      const results = {
        accuracy: 0,
        latency: { p95: 0, p99: 0 },
        successRate: 0,
        totalRuns: 0,
        errors: [],
      };

      const runTest = async (input) => {
        const startTime = Date.now();
        try {
          const mockEmit = MotiaTest.mockEmit();
          await component(input, mockEmit, "test.event");
          results.totalRuns++;
          return Date.now() - startTime;
        } catch (error) {
          results.errors.push(
            error instanceof Error ? error : new Error(String(error))
          );
          return null;
        }
      };

      if (options.loadTestOptions) {
        const { rps, duration } = options.loadTestOptions;
        const durationMs = parseDuration(duration);
        const interval = 1000 / rps;
        const endTime = Date.now() + durationMs;
        const latencies = [];

        while (Date.now() < endTime) {
          for (const data of options.testData) {
            const latency = await runTest(data);
            if (latency) latencies.push(latency);
            await sleep(interval);
          }
        }

        latencies.sort((a, b) => a - b);
        results.latency.p95 = latencies[Math.floor(latencies.length * 0.95)];
        results.latency.p99 = latencies[Math.floor(latencies.length * 0.99)];
      } else {
        for (const data of options.testData) {
          await runTest(data);
        }
      }

      results.successRate =
        (results.totalRuns - results.errors.length) / results.totalRuns;
      return results;
    };
  }

  static createLLMTest(component, options) {
    return async () => {
      const results = {
        accuracy: 0,
        consistency: 0,
        averageConfidence: 0,
        edgeCaseResults: [],
        errors: [],
      };

      for (const data of options.testData) {
        const outputs = [];
        for (let i = 0; i < (options.consistencyRuns || 1); i++) {
          const mockEmit = MotiaTest.mockEmit();
          try {
            await component(data, mockEmit, "test.event");
            outputs.push(mockEmit.mock.calls[0]?.[0]?.data);
          } catch (error) {
            results.errors.push(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }

        if (outputs.length > 1) {
          results.consistency += calculateConsistency(outputs);
        }
      }

      if (options.edgeCases) {
        for (const edgeCase of options.edgeCases) {
          const mockEmit = MotiaTest.mockEmit();
          try {
            await component(edgeCase.input, mockEmit, "test.event");
            const output = mockEmit.mock.calls[0]?.[0]?.data;
            results.edgeCaseResults.push({
              input: edgeCase.input,
              expected: edgeCase.expect,
              actual: output,
              passed: output === edgeCase.expect,
            });
          } catch (error) {
            results.errors.push(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }
      }

      results.accuracy = calculateAccuracy(results.edgeCaseResults);
      if (options.consistencyRuns) {
        results.consistency /= options.testData.length;
      }

      return results;
    };
  }
}

function parseDuration(duration) {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1));
  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return value;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateConsistency(outputs) {
  const stringified = outputs.map((o) => JSON.stringify(o));
  const uniqueOutputs = new Set(stringified);
  return 1 - (uniqueOutputs.size - 1) / outputs.length;
}

function calculateAccuracy(results) {
  if (!results.length) return 0;
  return results.filter((r) => r.passed).length / results.length;
}

/**
 * Server Functionality: MotiaServer
 * ---------------------------------
 * MotiaServer integrates an HTTP server (e.g., Express) with the Motia framework, enabling
 * external triggers (like webhooks or user requests) to generate internal Motia events.
 *
 * Key Responsibilities:
 * - Expose HTTP endpoints defined in traffic
 * - Transform incoming HTTP requests into Motia events
 * - Emit these events into the MotiaCore for processing
 *
 * By acting as a bridge between external clients and the internal event-driven system,
 * MotiaServer allows real-world interactions to drive the workflow logic orchestrated by MotiaCore.
 */
class MotiaServer {
  constructor() {
    this.traffic = new Map();
    this.express = express();
    this.express.use(bodyParser.json());
  }

  async findTrafficFiles(paths) {
    const trafficFiles = [];

    const searchTraffic = async (dir) => {
      let entries;
      try {
        entries = await fs.promises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchTraffic(fullPath);
        } else if (
          entry.name.endsWith(".js") &&
          !entry.name.endsWith(".test.js")
        ) {
          const relativePath =
            "./" + path.relative(__dirname, fullPath).replace(/\.js$/, "");
          trafficFiles.push(relativePath);
        }
      }
    };

    for (const basePath of paths) {
      const absolutePath = path.resolve(__dirname, basePath);
      await searchTraffic(absolutePath);
    }

    return trafficFiles;
  }

  describeWorkflows() {
    return {
      workflows: Array.from(this.workflows.keys()).map((workflowPath) => {
        const workflowName = path.basename(workflowPath);
        const componentEntries = Array.from(this.components.entries()).filter(
          ([compPath]) => compPath.includes(workflowName)
        );

        return {
          name: workflowName,
          components: componentEntries.map(([compPath, compModule]) => {
            const compDirName = path.basename(path.dirname(compPath));
            return {
              id: compDirName,
              subscribe: compModule.subscribe || [],
            };
          }),
        };
      }),
    };
  }

  async initialize(core, trafficPaths = ["./traffic/inbound"]) {
    this.core = core;
    const allTrafficFiles = await this.findTrafficFiles(trafficPaths);

    for (const trafficFile of allTrafficFiles) {
      const trafficModule = await import(trafficFile + ".js");
      const trafficConfigs = Array.isArray(trafficModule.default)
        ? trafficModule.default
        : [trafficModule.default];

      for (const config of trafficConfigs) {
        this.registerTraffic(config);
      }
    }

    // Register traffic routes
    this.traffic.forEach((config, routePath) => {
      this.express[config.method.toLowerCase()](routePath, async (req, res) => {
        try {
          await this.handleRequest(req, res);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    });

    // **NEW CODE**: Serve the built React UI and /api/workflows endpoint
    // Serve static files from dist (after you've run npm run build)
    this.express.use(express.static(path.join(__dirname, "../../dist")));

    // Return workflow descriptions
    this.express.get("/api/workflows", (req, res) => {
      res.json(this.core.describeWorkflows());
    });

    // Catch-all route to serve index.html for any unknown route
    this.express.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../../dist/index.html"));
    });
    // **END NEW CODE**

    this.express.listen(process.env.PORT || 3000);
  }

  async handleRequest(req, res) {
    const traffic = this.traffic.get(req.path);
    if (!traffic) {
      res.status(404).json({ error: "Traffic not found" });
      return;
    }

    try {
      if (traffic.authorize) {
        try {
          await traffic.authorize(req);
        } catch (error) {
          res.status(401).json({ error: error.message });
          return;
        }
      }

      const event = await traffic.transform(req);

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

/**
 * Version Management: VersionControl
 * ----------------------------------
 * VersionControl handles the updating and tracking of version information for workflows and components.
 * It ensures that changes in logic or configuration are versioned and that version files are updated
 * as new tests or changes are applied.
 *
 * Key Responsibilities:
 * - Load and parse version information from JSON files
 * - Increment patch versions after successful tests
 * - Write updated version info back to storage
 *
 * VersionControl provides a simple mechanism to track the evolution of workflows and their metrics over time.
 */
class VersionControl {
  static async bumpVersion(versionPath, metrics) {
    const currentVersion = await VersionControl.loadVersion(versionPath);

    const [major, minor, patch] = currentVersion.version.split(".").map(Number);

    const newVersion = {
      version: `${major}.${minor}.${patch + 1}`,
      lastTested: new Date().toISOString(),
      metrics: {
        ...currentVersion.metrics,
        ...metrics,
      },
    };

    await fs.promises.writeFile(
      versionPath,
      JSON.stringify(newVersion, null, 2),
      "utf8"
    );
  }

  static async loadVersion(versionPath) {
    try {
      const content = await fs.promises.readFile(versionPath, "utf8");
      const version = JSON.parse(content);

      if (!version.version || !version.lastTested) {
        throw new Error("Invalid version file format");
      }

      return version;
    } catch (error) {
      return {
        version: "0.1.0",
        lastTested: new Date().toISOString(),
        metrics: {},
      };
    }
  }
}

/**
 * Time-Based Scheduling: MotiaScheduler
 * -------------------------------------
 * MotiaScheduler introduces time-based triggers into the Motia framework. It periodically emits
 * events based on defined schedules, enabling recurring or delayed actions.
 *
 * Key Responsibilities:
 * - Parse and manage time-based configurations (e.g., "1h", "30m")
 * - Set intervals or timers and emit corresponding events at defined intervals
 * - Integrate with workflows that depend on periodic checks or escalations
 *
 * This class allows workflows to incorporate scheduled behavior, such as escalating documents
 * if not approved within a certain time.
 */
class MotiaScheduler {
  constructor() {
    this.schedules = new Map();
    this.activeJobs = new Map();
  }

  async findScheduleFiles(paths) {
    const fsPromises = fs.promises;
    const schedules = [];

    const searchSchedules = async (dir) => {
      let entries;
      try {
        entries = await fsPromises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchSchedules(fullPath);
        } else if (
          entry.name.endsWith(".js") &&
          !entry.name.endsWith(".test.js")
        ) {
          schedules.push(fullPath);
        }
      }
    };

    for (const basePath of paths) {
      const schedulerPath = path.join(basePath, "scheduler");
      await searchSchedules(schedulerPath);
    }

    return schedules;
  }

  async initialize(core, schedulePaths = ["./src/workflows"]) {
    this.core = core;
    const scheduleFiles = await this.findScheduleFiles(
      schedulePaths.map((p) => path.resolve(p))
    );

    for (const file of scheduleFiles) {
      const scheduleModule = await import(pathToFileURL(file).href);
      if (scheduleModule.default) {
        const id = file.replace(/\.[jt]s$/, "");
        this.schedules.set(id, scheduleModule.default);
      }
    }
  }

  start() {
    this.schedules.forEach((schedule, id) => {
      const interval = this.parseSchedule(schedule.interval);

      const job = setInterval(() => {
        this.core.emit(
          {
            type: schedule.eventType,
            data: {
              scheduledAt: new Date().toISOString(),
              scheduleId: id,
            },
          },
          {
            metadata: {
              source: "scheduler",
              scheduleId: id,
            },
          }
        );
      }, interval);

      this.activeJobs.set(id, job);
    });
  }

  stop() {
    this.activeJobs.forEach((job) => {
      clearInterval(job);
    });
    this.activeJobs.clear();
  }

  parseSchedule(schedule) {
    const timeRegex = /^(\d+)(s|m|h|d)$/;
    const match = schedule.match(timeRegex);
    if (match) {
      const [, value, unit] = match;
      const num = parseInt(value, 10);
      switch (unit) {
        case "s":
          return num * 1000;
        case "m":
          return num * 60 * 1000;
        case "h":
          return num * 60 * 60 * 1000;
        case "d":
          return num * 24 * 60 * 60 * 1000;
        default:
          return 0;
      }
    }

    if (schedule.split(" ").length === 5) {
      // TODO: cron parsing
      return 60 * 60 * 1000;
    }

    throw new Error(`Invalid schedule format: ${schedule}`);
  }
}

function defineTraffic(config) {
  return config;
}

function defineRoute(config) {
  return config;
}

export {
  MotiaCore,
  MotiaServer,
  MotiaScheduler,
  MotiaTest,
  InMemoryMessageBus,
  VersionControl,
  defineTraffic,
  defineRoute,
};
