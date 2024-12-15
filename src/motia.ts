/**
 * Message Bus Interface
 * Handles routing of events between components in the system.
 */
interface MessageBus {
  publish(event: MotiaEvent, options?: EmitOptions): Promise<void>;
  subscribe(
    handler: (event: MotiaEvent, options?: EmitOptions) => Promise<void>
  ): void;
}

interface RouteConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  authorize?: (req: any) => Promise<void>;
  transform: (req: any) => MotiaEvent | Promise<MotiaEvent>;
}

/**
 * In-Memory Message Bus Implementation
 * Default message bus used by motia-core for development and simple deployments
 */
class InMemoryMessageBus implements MessageBus {
  private subscribers: ((
    event: MotiaEvent,
    options?: EmitOptions
  ) => Promise<void>)[] = [];

  async publish(event: MotiaEvent, options?: EmitOptions): Promise<void> {
    await Promise.all(
      this.subscribers.map((subscriber) =>
        subscriber(event, options).catch((error) => {
          console.error("Error in subscriber:", error);
        })
      )
    );
  }

  subscribe(
    handler: (event: MotiaEvent, options?: EmitOptions) => Promise<void>
  ): void {
    this.subscribers.push(handler);
  }
}

/**
 * Core Event Type
 * Represents events that flow through the system
 */
interface MotiaEvent {
  type: string;
  data: any;
}

/**
 * Options for event emission
 */
interface EmitOptions {
  traceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Emit function type used by components
 */
type Emit<T extends { type: string; data: any } = any> = (
  event: T,
  options?: EmitOptions
) => void;

/**
 * Component function type
 * Represents the structure of a component implementation
 */
type ComponentFunction<
  TInput = any,
  TEmit extends { type: string; data: any } = any
> = (
  input: TInput,
  emit: Emit<TEmit>,
  eventType: string
) => void | Promise<void>;

/**
 * Quality thresholds interface for components and workflows
 */
interface Thresholds {
  [key: string]: number | { [key: string]: number } | undefined;
  latency?: {
    p95?: number;
    p99?: number;
  };
}

/**
 * Configuration for Motia Core initialization
 */
interface MotiaCoreOptions {
  workflowPaths: string[];
  messageBus?: MessageBus;
}

/**
 * Version information for workflows and components
 */
interface VersionInfo {
  version: string;
  lastTested: string;
  metrics: {
    [key: string]: number;
  };
}

/**
 * Route configuration for motia-server
 */
interface RouteConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  authorize?: (req: any) => Promise<void>;
  transform: (req: any) => MotiaEvent | Promise<MotiaEvent>;
}

/**
 * Edge case result interface for LLM tests
 */
interface EdgeCaseResult {
  input: any;
  expected: any;
  actual: any;
  passed: boolean;
}

/**
 * Results interface for LLM tests
 */
interface LLMTestResults {
  accuracy: number;
  consistency: number;
  averageConfidence: number;
  edgeCaseResults: EdgeCaseResult[];
  errors: Error[];
}

/**
 * Main Motia Core Class
 * Central orchestrator for the entire framework
 */
class MotiaCore {
  private messageBus: MessageBus;
  private workflows: Map<string, any>;
  private components: Map<string, ComponentFunction>;

  constructor() {
    this.messageBus = new InMemoryMessageBus();
    this.workflows = new Map();
    this.components = new Map();
  }

  private async registerWorkflow(path: string): Promise<void> {
    try {
      const config = require(path);
      this.workflows.set(path, config);
    } catch (error) {
      console.error(`Error registering workflow at ${path}:`, error);
    }
  }

  private async registerComponent(path: string): Promise<void> {
    try {
      console.log("Registering component:", path);
      const fixedPath = path
        .replace(/^(\.?\/)?src\//, "./")
        .replace(/\.ts$/, ""); // remove .ts extension
      console.log("Fixed path:", fixedPath);

      const component = require(fixedPath);
      if (component.subscribe) {
        this.components.set(fixedPath, component.default);
      }
    } catch (error) {
      console.error(`Error registering component at ${path}:`, error);
    }
  }

  async emit(event: MotiaEvent, options?: EmitOptions): Promise<void> {
    await this.messageBus.publish(event, options);
  }

  /**
   * Initialize the Motia runtime
   */
  async initialize(options: MotiaCoreOptions): Promise<void> {
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

  private async findWorkflowFiles(path: string): Promise<string[]> {
    const fs = require("fs").promises;
    const path_module = require("path");
    const workflows: string[] = [];

    try {
      // Read all directories in workflows path
      const entries = await fs.readdir(path, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const workflowPath = path_module.join(path, entry.name);
          // Check for config.ts and version.json
          const files = await fs.readdir(workflowPath);
          if (files.includes("config.ts") && files.includes("version.json")) {
            workflows.push(workflowPath);
          }
        }
      }
    } catch (error) {
      console.error("Error finding workflow files:", error);
    }

    return workflows;
  }

  private async findComponentFiles(paths: string[]): Promise<string[]> {
    const fs = require("fs").promises;
    const path_module = require("path");
    const components: string[] = [];

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
            const searchComponents = async (dir: string) => {
              const entries = await fs.readdir(dir, { withFileTypes: true });

              for (const entry of entries) {
                const fullPath = path_module.join(dir, entry.name);
                if (entry.isDirectory()) {
                  await searchComponents(fullPath);
                } else if (
                  entry.name.endsWith(".ts") &&
                  !entry.name.endsWith(".test.ts")
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

  private eventMatchesPattern(eventType: string, pattern: string): boolean {
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
  static mockEmit(): jest.Mock {
    return jest.fn((event: MotiaEvent, options?: EmitOptions) => {
      // Return void
    });
  }

  /**
   * Create a test helper for components
   */
  static createComponentTest(
    component: ComponentFunction,
    options?: { mocks?: Record<string, Function> }
  ): (input: any, emit?: Emit) => Promise<void> {
    return async (input: any, emit?: Emit) => {
      const mockEmit = emit || MotiaTest.mockEmit();

      // Replace any dependencies with mocks
      if (options?.mocks) {
        for (const [key, mock] of Object.entries(options.mocks)) {
          jest.mock(key, () => mock);
        }
      }

      await component(input, mockEmit, "test.event");

      // Clear mocks after test
      if (options?.mocks) {
        jest.resetModules();
      }
    };
  }

  /**
   * Create a test helper for thresholds
   */
  static createThresholdTest(
    component: ComponentFunction,
    options: {
      thresholds: Thresholds;
      testData: any[];
      loadTestOptions?: { rps: number; duration: string };
    }
  ): () => Promise<any> {
    return async () => {
      const results = {
        accuracy: 0,
        latency: {
          p95: 0,
          p99: 0,
        },
        successRate: 0,
        totalRuns: 0,
        errors: [] as Error[],
      };

      const runTest = async (input: any) => {
        const startTime = Date.now();
        try {
          const mockEmit = MotiaTest.mockEmit();
          await component(input, mockEmit, "test.event");
          results.totalRuns++;
          return Date.now() - startTime;
        } catch (error: unknown) {
          if (error instanceof Error) {
            results.errors.push(error);
          } else {
            results.errors.push(new Error(String(error)));
          }
          return null;
        }
      };

      // Run load tests if specified
      if (options.loadTestOptions) {
        const { rps, duration } = options.loadTestOptions;
        const durationMs = parseDuration(duration);
        const interval = 1000 / rps;
        const endTime = Date.now() + durationMs;
        const latencies: number[] = [];

        while (Date.now() < endTime) {
          for (const data of options.testData) {
            const latency = await runTest(data);
            if (latency) latencies.push(latency);
            await sleep(interval);
          }
        }

        // Calculate percentiles
        latencies.sort((a, b) => a - b);
        results.latency.p95 = latencies[Math.floor(latencies.length * 0.95)];
        results.latency.p99 = latencies[Math.floor(latencies.length * 0.99)];
      } else {
        // Single run of test data
        for (const data of options.testData) {
          await runTest(data);
        }
      }

      results.successRate =
        (results.totalRuns - results.errors.length) / results.totalRuns;
      return results;
    };
  }

  static createLLMTest(
    component: ComponentFunction,
    options: {
      thresholds: Thresholds;
      testData: any[];
      edgeCases?: any[];
      consistencyRuns?: number;
    }
  ): () => Promise<any> {
    return async () => {
      const results: LLMTestResults = {
        accuracy: 0,
        consistency: 0,
        averageConfidence: 0,
        edgeCaseResults: [],
        errors: [],
      };

      // Run main test cases
      for (const data of options.testData) {
        const outputs: any[] = [];

        // Run multiple times for consistency check
        for (let i = 0; i < (options.consistencyRuns || 1); i++) {
          const mockEmit = MotiaTest.mockEmit();
          try {
            await component(data, mockEmit, "test.event");
            outputs.push(mockEmit.mock.calls[0]?.[0]?.data);
          } catch (error: unknown) {
            if (error instanceof Error) {
              results.errors.push(error);
            } else {
              results.errors.push(new Error(String(error)));
            }
          }
        }

        // Calculate consistency for this input
        if (outputs.length > 1) {
          results.consistency += calculateConsistency(outputs);
        }
      }

      // Run edge cases if provided
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
          } catch (error: unknown) {
            if (error instanceof Error) {
              results.errors.push(error);
            } else {
              results.errors.push(new Error(String(error)));
            }
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

// Helper functions for MotiaTest
function parseDuration(duration: string): number {
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateConsistency(outputs: any[]): number {
  // Simple implementation - could be made more sophisticated
  const stringified = outputs.map((o) => JSON.stringify(o));
  const uniqueOutputs = new Set(stringified);
  return 1 - (uniqueOutputs.size - 1) / outputs.length;
}

function calculateAccuracy(results: { passed: boolean }[]): number {
  if (!results.length) return 0;
  return results.filter((r) => r.passed).length / results.length;
}

/**
 * Server functionality for handling HTTP requests
 */
class MotiaServer {
  private core!: MotiaCore;
  private routes: Map<string, RouteConfig>;
  private express: any; // We'll use express but keep it loosely coupled

  constructor() {
    this.routes = new Map();
    this.express = require("express")();
    this.express.use(require("body-parser").json());
  }

  private async findRouteFiles(paths: string[]): Promise<string[]> {
    const fs = require("fs").promises;
    const path_module = require("path");
    const routeFiles: string[] = [];

    const searchRoutes = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path_module.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchRoutes(fullPath);
        } else if (
          entry.name.endsWith(".ts") &&
          !entry.name.endsWith(".test.ts")
        ) {
          // Convert the absolute path to a relative one starting from motia.ts directory
          const relativePath =
            "./" +
            path_module.relative(__dirname, fullPath).replace(/\.ts$/, "");
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

  /**
   * Initialize the server with routes
   */
  async initialize(core: MotiaCore, routePaths: string[]): Promise<void> {
    this.core = core;

    // Find all route files under the given directories
    const allRouteFiles = await this.findRouteFiles(routePaths);

    // Load and register all routes
    for (const routeFile of allRouteFiles) {
      const routeModule = require(routeFile);
      if (routeModule.default) {
        this.registerRoute(routeModule.default);
      }
    }

    // Set up express routes after registering them
    this.routes.forEach((config, path) => {
      this.express[config.method.toLowerCase()](
        path,
        async (req: any, res: any) => {
          try {
            await this.handleRequest(req, res);
          } catch (error: any) {
            res.status(500).json({ error: error.message });
          }
        }
      );
    });

    // Start the server
    this.express.listen(process.env.PORT || 3000);
  }

  /**
   * Handle an incoming HTTP request
   */
  async handleRequest(req: any, res: any): Promise<void> {
    const route = this.routes.get(req.path);
    if (!route) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    try {
      // Run authorization if present
      if (route.authorize) {
        try {
          await route.authorize(req);
        } catch (error: any) {
          res.status(401).json({ error: error.message });
          return;
        }
      }

      // Transform request to event
      const event = await route.transform(req);

      // Emit the event to the core
      await this.core.emit(event, {
        traceId: req.headers["x-trace-id"],
        metadata: {
          source: "http",
          path: req.path,
          method: req.method,
        },
      });

      // Send success response
      res.status(200).json({ success: true, eventType: event.type });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Register a route configuration
   */
  private registerRoute(config: RouteConfig): void {
    // Validate route config
    if (!config.path || !config.method || !config.transform) {
      throw new Error("Invalid route configuration");
    }

    // Ensure path starts with /
    const path = config.path.startsWith("/") ? config.path : `/${config.path}`;

    // Store route config
    this.routes.set(path, config);
  }
}

/**
 * Version control utilities
 */
class VersionControl {
  /**
   * Update version information after successful tests
   */
  static async bumpVersion(
    path: string,
    metrics: Record<string, number>
  ): Promise<void> {
    const fs = require("fs").promises;
    const currentVersion = await VersionControl.loadVersion(path);

    // Parse current version (assuming semver)
    const [major, minor, patch] = currentVersion.version.split(".").map(Number);

    // Increment patch version
    const newVersion = {
      version: `${major}.${minor}.${patch + 1}`,
      lastTested: new Date().toISOString(),
      metrics: {
        ...currentVersion.metrics,
        ...metrics,
      },
    };

    // Write updated version info
    await fs.writeFile(path, JSON.stringify(newVersion, null, 2), "utf8");
  }

  /**
   * Load version information
   */
  static async loadVersion(path: string): Promise<VersionInfo> {
    const fs = require("fs").promises;
    try {
      const content = await fs.readFile(path, "utf8");
      const version = JSON.parse(content);

      // Validate version file structure
      if (!version.version || !version.lastTested) {
        throw new Error("Invalid version file format");
      }

      return version;
    } catch (error) {
      // If file doesn't exist or is invalid, return default version
      return {
        version: "0.1.0",
        lastTested: new Date().toISOString(),
        metrics: {},
      };
    }
  }
}

/**
 * Scheduler for time-based events
 */
class MotiaScheduler {
  private core!: MotiaCore;
  private schedules: Map<string, any>;
  private activeJobs: Map<string, NodeJS.Timeout>;

  constructor() {
    this.schedules = new Map();
    this.activeJobs = new Map();
  }

  /**
   * Initialize the scheduler
   */
  async initialize(core: MotiaCore, schedulePaths: string[]): Promise<void> {
    this.core = core;

    // Load all schedule configurations
    for (const path of schedulePaths) {
      const schedule = require(path);
      if (schedule.default) {
        const id = path.replace(/\.[jt]s$/, "");
        this.schedules.set(id, schedule.default);
      }
    }
  }

  /**
   * Start all scheduled tasks
   */
  start(): void {
    this.schedules.forEach((schedule, id) => {
      const interval = this.parseSchedule(schedule.interval);

      // Create the interval
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

      // Store the active job
      this.activeJobs.set(id, job);
    });
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    this.activeJobs.forEach((job) => {
      clearInterval(job);
    });
    this.activeJobs.clear();
  }

  /**
   * Parse schedule string into milliseconds
   * Supports: 1s, 1m, 1h, 1d and cron-like expressions
   */
  private parseSchedule(schedule: string): number {
    // Simple time intervals
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

    // For cron expressions, calculate next interval
    // This is a simplified version - in practice you'd want to use a library like 'cron-parser'
    if (schedule.split(" ").length === 5) {
      // TODO: Implement proper cron parsing
      // For now, default to hourly
      return 60 * 60 * 1000;
    }

    throw new Error(`Invalid schedule format: ${schedule}`);
  }
}

export function defineRoute(config: RouteConfig): RouteConfig {
  return config;
}

// Export all necessary types and classes
export {
  MotiaCore,
  MotiaServer,
  MotiaScheduler,
  MotiaTest,
  MessageBus,
  InMemoryMessageBus,
  VersionControl,
  MotiaEvent,
  EmitOptions,
  Emit,
  ComponentFunction,
  Thresholds,
  MotiaCoreOptions,
  VersionInfo,
  RouteConfig,
};
