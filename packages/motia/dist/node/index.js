// src/core/MessageBus.js
var InMemoryMessageBus = class {
  constructor() {
    this.subscribers = [];
  }
  async publish(event, options) {
    await Promise.all(
      this.subscribers.map(
        (subscriber) => subscriber(event, options).catch((error) => {
          console.error("Error in subscriber:", error);
        })
      )
    );
  }
  subscribe(handler) {
    this.subscribers.push(handler);
  }
};

// src/core/MotiaCore.js
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs2 from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var MotiaCore = class {
  constructor() {
    this.messageBus = new InMemoryMessageBus();
    this.workflows = /* @__PURE__ */ new Map();
    this.components = /* @__PURE__ */ new Map();
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
              subscribe: compModule.subscribe || []
            };
          })
        };
      })
    };
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
    this.workflows = /* @__PURE__ */ new Map();
    this.components = /* @__PURE__ */ new Map();
    const absoluteWorkflowPaths = workflowPaths.map((p) => path.resolve(p));
    for (const wPath of absoluteWorkflowPaths) {
      const workflowFiles = await this.findWorkflowFiles(wPath);
      for (const file of workflowFiles) {
        await this.registerWorkflow(file);
      }
    }
    const componentFiles = await this.findComponentFiles(absoluteWorkflowPaths);
    for (const file of componentFiles) {
      await this.registerComponent(file);
    }
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
      const entries = await fs2.promises.readdir(basePath, {
        withFileTypes: true
      });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const workflowPath = path.join(basePath, entry.name);
          const files = await fs2.promises.readdir(workflowPath);
          if (files.includes("config.js") && files.includes("version.json")) {
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
        const workflowDirs = await fs2.promises.readdir(basePath, {
          withFileTypes: true
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
      entries = await fs2.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.searchComponents(fullPath, components);
      } else if (entry.name.endsWith(".js") && !entry.name.endsWith(".test.js")) {
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
};

// src/core/MotiaServer.js
import express from "express";
import bodyParser from "body-parser";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var MotiaServer = class {
  constructor() {
    this.traffic = /* @__PURE__ */ new Map();
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
        const fullPath = path2.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchTraffic(fullPath);
        } else if (entry.name.endsWith(".js") && !entry.name.endsWith(".test.js")) {
          const relativePath = "./" + path2.relative(__dirname2, fullPath).replace(/\.js$/, "");
          trafficFiles.push(relativePath);
        }
      }
    };
    for (const basePath of paths) {
      const absolutePath = path2.resolve(__dirname2, basePath);
      await searchTraffic(absolutePath);
    }
    return trafficFiles;
  }
  async initialize(core, trafficPaths = ["./traffic/inbound"]) {
    this.core = core;
    const allTrafficFiles = await this.findTrafficFiles(trafficPaths);
    for (const trafficFile of allTrafficFiles) {
      const trafficModule = await import(trafficFile + ".js");
      const trafficConfigs = Array.isArray(trafficModule.default) ? trafficModule.default : [trafficModule.default];
      for (const config of trafficConfigs) {
        this.registerTraffic(config);
      }
    }
    this.traffic.forEach((config, routePath) => {
      this.express[config.method.toLowerCase()](routePath, async (req, res) => {
        try {
          await this.handleRequest(req, res);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    });
    this.express.use(express.static(path2.join(__dirname2, "../dist")));
    this.express.get("/api/workflows", (req, res) => {
      res.json(this.core.describeWorkflows());
    });
    this.express.get("*", (req, res) => {
      res.sendFile(path2.join(__dirname2, "../dist/index.html"));
    });
    this.express.listen(process.env.PORT || 3e3);
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
          method: req.method
        }
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
    const routePath = config.path.startsWith("/") ? config.path : `/${config.path}`;
    this.traffic.set(routePath, config);
  }
};

// src/core/MotiaScheduler.js
import fs3 from "fs";
import path3 from "path";
import { pathToFileURL as pathToFileURL2 } from "url";
var MotiaScheduler = class {
  constructor() {
    this.schedules = /* @__PURE__ */ new Map();
    this.activeJobs = /* @__PURE__ */ new Map();
  }
  async findScheduleFiles(paths) {
    const fsPromises = fs3.promises;
    const schedules = [];
    const searchSchedules = async (dir) => {
      let entries;
      try {
        entries = await fsPromises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const fullPath = path3.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchSchedules(fullPath);
        } else if (entry.name.endsWith(".js") && !entry.name.endsWith(".test.js")) {
          schedules.push(fullPath);
        }
      }
    };
    for (const basePath of paths) {
      const schedulerPath = path3.join(basePath, "scheduler");
      await searchSchedules(schedulerPath);
    }
    return schedules;
  }
  async initialize(core, schedulePaths = ["./src/workflows"]) {
    this.core = core;
    const scheduleFiles = await this.findScheduleFiles(
      schedulePaths.map((p) => path3.resolve(p))
    );
    for (const file of scheduleFiles) {
      const scheduleModule = await import(pathToFileURL2(file).href);
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
              scheduledAt: (/* @__PURE__ */ new Date()).toISOString(),
              scheduleId: id
            }
          },
          {
            metadata: {
              source: "scheduler",
              scheduleId: id
            }
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
          return num * 1e3;
        case "m":
          return num * 60 * 1e3;
        case "h":
          return num * 60 * 60 * 1e3;
        case "d":
          return num * 24 * 60 * 60 * 1e3;
        default:
          return 0;
      }
    }
    if (schedule.split(" ").length === 5) {
      return 60 * 60 * 1e3;
    }
    throw new Error(`Invalid schedule format: ${schedule}`);
  }
};

// src/core/MotiaTest.js
var MotiaTest = class _MotiaTest {
  static mockEmit() {
    const mock = (...args) => {
    };
    mock.mock = { calls: [] };
    const wrapper = (event, options) => {
      mock.mock.calls.push([event, options]);
    };
    return wrapper;
  }
  static createComponentTest(component, options) {
    return async (input, emit) => {
      const mockEmit = emit || _MotiaTest.mockEmit();
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
        errors: []
      };
      const runTest = async (input) => {
        const startTime = Date.now();
        try {
          const mockEmit = _MotiaTest.mockEmit();
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
        const interval = 1e3 / rps;
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
      results.successRate = (results.totalRuns - results.errors.length) / results.totalRuns;
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
        errors: []
      };
      for (const data of options.testData) {
        const outputs = [];
        for (let i = 0; i < (options.consistencyRuns || 1); i++) {
          const mockEmit = _MotiaTest.mockEmit();
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
          const mockEmit = _MotiaTest.mockEmit();
          try {
            await component(edgeCase.input, mockEmit, "test.event");
            const output = mockEmit.mock.calls[0]?.[0]?.data;
            results.edgeCaseResults.push({
              input: edgeCase.input,
              expected: edgeCase.expect,
              actual: output,
              passed: output === edgeCase.expect
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
};

// src/core/index.js
function defineTraffic(config) {
  return config;
}
function defineRoute(config) {
  return config;
}
export {
  InMemoryMessageBus,
  MotiaCore,
  MotiaScheduler,
  MotiaServer,
  MotiaTest,
  defineRoute,
  defineTraffic
};
//# sourceMappingURL=index.js.map
