/**
 * In-Memory Message Bus Implementation
 * Default message bus used by motia-core for development and simple deployments
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
 * Main Motia Core Class
 * Central orchestrator for the entire framework
 */
class MotiaCore {
  constructor() {
    this.messageBus = new InMemoryMessageBus();
    this.workflows = new Map();
    this.components = new Map();
  }

  async registerWorkflow(path) {
    try {
      const config = require(path);
      this.workflows.set(path, config);
    } catch (error) {
      console.error(`Error registering workflow at ${path}:`, error);
    }
  }

  async registerComponent(path) {
    try {
      const fixedPath = path
        .replace(/^(\.?\/)?src\//, "./")
        .replace(/\.js$/, ""); // remove .js extension

      const component = require(fixedPath);
      if (component.subscribe) {
        this.components.set(fixedPath, component.default);
      }
    } catch (error) {
      console.error(`Error registering component at ${path}:`, error);
    }
  }

  async emit(event, options) {
    await this.messageBus.publish(event, options);
  }

  /**
   * Initialize the Motia runtime
   */
  async initialize(options) {
    // Set up message bus - use provided one or create in-memory default
    this.messageBus = options.messageBus || new InMemoryMessageBus();

    // Initialize storage
    this.workflows = new Map();
    this.components = new Map();

    // Load all workflows from the provided paths
    for (const path of options.workflowPaths) {
      const workflowFiles = await this.findWorkflowFiles(path);
      for (const file of workflowFiles) {
        this.registerWorkflow(file);
      }
    }

    // Load all components from workflow directories
    const componentFiles = await this.findComponentFiles(options.workflowPaths);
    for (const file of componentFiles) {
      this.registerComponent(file);
    }

    // Subscribe components to message bus
    this.components.forEach((component, id) => {
      const module = require(id);
      if (module.subscribe) {
        for (const eventPattern of module.subscribe) {
          this.messageBus.subscribe(async (event, options) => {
            if (this.eventMatchesPattern(event.type, eventPattern)) {
              await component(
                event.data,
                (e) => this.emit(e, options),
                event.type
              );
            }
          });
        }
      }
    });
  }

  async findWorkflowFiles(path) {
    const fs = require("fs").promises;
    const path_module = require("path");
    const workflows = [];

    try {
      // Read all directories in workflows path
      const entries = await fs.readdir(path, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const workflowPath = path_module.join(path, entry.name);
          // Check for config.js and version.json
          const files = await fs.readdir(workflowPath);
          if (files.includes("config.js") && files.includes("version.json")) {
            workflows.push(workflowPath);
          }
        }
      }
    } catch (error) {
      console.error("Error finding workflow files:", error);
    }

    return workflows;
  }

  async findComponentFiles(paths) {
    const fs = require("fs").promises;
    const path_module = require("path");
    const components = [];

    try {
      for (const basePath of paths) {
        // Search for components directory in each workflow
        const workflowDirs = await fs.readdir(basePath, {
          withFileTypes: true,
        });

        for (const workflowDir of workflowDirs) {
          if (!workflowDir.isDirectory()) continue;

          const componentsPath = path_module.join(
            basePath,
            workflowDir.name,
            "components"
          );

          try {
            // Recursively search through component directories
            const searchComponents = async (dir) => {
              const entries = await fs.readdir(dir, { withFileTypes: true });

              for (const entry of entries) {
                const fullPath = path_module.join(dir, entry.name);
                if (entry.isDirectory()) {
                  await searchComponents(fullPath);
                } else if (
                  entry.name.endsWith(".js") &&
                  !entry.name.endsWith(".test.js")
                ) {
                  components.push(fullPath);
                }
              }
            };

            await searchComponents(componentsPath);
          } catch (error) {
            // Skip if components directory doesn't exist
            continue;
          }
        }
      }
    } catch (error) {
      console.error("Error finding component files:", error);
    }

    return components;
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
 * Testing Utilities
 */
class MotiaTest {
  /**
   * Create a mock emit function for testing
   */
  static mockEmit() {
    // jest.Mock type is TS-specific. Just return a generic mock function.
    // If you're using Jest, it can be jest.fn().
    // If not, just return a function.
    const mock = (...args) => {};
    mock.mock = { calls: [] };
    const wrapper = (event, options) => {
      mock.mock.calls.push([event, options]);
    };
    return wrapper;
  }

  /**
   * Create a test helper for components
   */
  static createComponentTest(component, options) {
    return async (input, emit) => {
      const mockEmit = emit || MotiaTest.mockEmit();

      // Replace dependencies with mocks if needed
      if (options && options.mocks) {
        for (const [key, mock] of Object.entries(options.mocks)) {
          jest.mock(key, () => mock);
        }
      }

      await component(input, mockEmit, "test.event");

      // Clear mocks
      if (options && options.mocks) {
        jest.resetModules();
      }
    };
  }

  /**
   * Create a test helper for thresholds
   */
  static createThresholdTest(component, options) {
    return async () => {
      const results = {
        accuracy: 0,
        latency: {
          p95: 0,
          p99: 0,
        },
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

class MotiaServer {
  constructor() {
    this.routes = new Map();
    this.express = require("express")();
    this.express.use(require("body-parser").json());
  }

  async findRouteFiles(paths) {
    const fs = require("fs").promises;
    const path_module = require("path");
    const routeFiles = [];

    const searchRoutes = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path_module.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchRoutes(fullPath);
        } else if (
          entry.name.endsWith(".js") &&
          !entry.name.endsWith(".test.js")
        ) {
          const relativePath =
            "./" +
            path_module.relative(__dirname, fullPath).replace(/\.js$/, "");
          routeFiles.push(relativePath);
        }
      }
    };

    for (const basePath of paths) {
      const absolutePath = path_module.resolve(__dirname, basePath);
      await searchRoutes(absolutePath);
    }

    return routeFiles;
  }

  async initialize(core, routePaths) {
    this.core = core;

    const allRouteFiles = await this.findRouteFiles(routePaths);

    for (const routeFile of allRouteFiles) {
      // Dynamically import the route file as ESM
      const routeModule = await import(routeFile + ".js");
      // If routeModule.default is an array, use it as-is; if not, convert to array
      const routeConfigs = Array.isArray(routeModule.default)
        ? routeModule.default
        : [routeModule.default];

      for (const config of routeConfigs) {
        this.registerRoute(config);
      }
    }

    this.routes.forEach((config, path) => {
      this.express[config.method.toLowerCase()](path, async (req, res) => {
        try {
          await this.handleRequest(req, res);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    });

    this.express.listen(process.env.PORT || 3000);
  }

  async handleRequest(req, res) {
    const route = this.routes.get(req.path);
    if (!route) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    try {
      if (route.authorize) {
        try {
          await route.authorize(req);
        } catch (error) {
          res.status(401).json({ error: error.message });
          return;
        }
      }

      const event = await route.transform(req);

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

  registerRoute(config) {
    if (!config.path || !config.method || !config.transform) {
      throw new Error("Invalid route configuration");
    }

    const path = config.path.startsWith("/") ? config.path : `/${config.path}`;

    this.routes.set(path, config);
  }
}

class VersionControl {
  static async bumpVersion(path, metrics) {
    const fs = require("fs").promises;
    const currentVersion = await VersionControl.loadVersion(path);

    const [major, minor, patch] = currentVersion.version.split(".").map(Number);

    const newVersion = {
      version: `${major}.${minor}.${patch + 1}`,
      lastTested: new Date().toISOString(),
      metrics: {
        ...currentVersion.metrics,
        ...metrics,
      },
    };

    await fs.writeFile(path, JSON.stringify(newVersion, null, 2), "utf8");
  }

  static async loadVersion(path) {
    const fs = require("fs").promises;
    try {
      const content = await fs.readFile(path, "utf8");
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

class MotiaScheduler {
  constructor() {
    this.schedules = new Map();
    this.activeJobs = new Map();
  }

  async findScheduleFiles(paths) {
    const fs = (await import("fs")).default.promises;
    const path_module = (await import("path")).default;
    const schedules = [];

    const searchSchedules = async (dir) => {
      let entries;
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        // Directory might not exist, skip
        return;
      }

      for (const entry of entries) {
        const fullPath = path_module.join(dir, entry.name);
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
      // For each workflow path, look for a 'scheduler' directory
      const schedulerPath = path_module.join(basePath, "scheduler");
      await searchSchedules(schedulerPath);
    }

    return schedules;
  }

  async initialize(core, schedulePaths) {
    this.core = core;

    // Find all schedule files from provided directories
    const scheduleFiles = await this.findScheduleFiles(schedulePaths);

    // Import each schedule file
    for (const file of scheduleFiles) {
      const scheduleModule = await import(file);
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

function defineRoute(config) {
  return config;
}

module.exports = {
  MotiaCore,
  MotiaServer,
  MotiaScheduler,
  MotiaTest,
  MessageBus: InMemoryMessageBus,
  InMemoryMessageBus,
  VersionControl,
  defineRoute,
};
