import { z } from "zod";

// Define configuration schemas
const RedisConfigSchema = z.object({
  host: z.string().default("localhost"),
  port: z.number().default(6379),
  password: z.string().optional(),
});

const StateConfigSchema = z.object({
  adapter: z.enum(["redis", "memory"]).default("redis"),
  redis: RedisConfigSchema.optional(),
});

const ComponentSchema = z.object({
  id: z.string(),
  endpoint: z.string().optional(), // Change agent to endpoint
  codePath: z.string(),
  subscribe: z.array(z.string()).optional(),
  emits: z.array(z.string()).optional(),
  name: z.string().optional(),
});

const WorkflowSchema = z.object({
  name: z.string(),
  components: z.array(ComponentSchema),
});

const EndpointSchema = z.object({
  name: z.string(),
  url: z.string(), // Remove .url() validation
  runtime: z.enum(["node", "python"]),
});

const WistroConfigSchema = z.object({
  endpoints: z.array(EndpointSchema).default([]),
  state: StateConfigSchema.default({}),
  workflows: z.array(WorkflowSchema).default([]),
  traffic: z.array(z.any()).optional(), // Add traffic support
});

export class ConfigurationManager {
  constructor() {
    this._config = null;
  }

  async initialize(config) {
    try {
      // If config is already an object, use it directly
      const fileConfig =
        typeof config === "object"
          ? config
          : await this._loadConfigFile(config);

      // Load environment configuration
      const envConfig = this._loadEnvConfig();

      // Merge configurations with priority: env > file > defaults
      const mergedConfig = this._mergeConfigs(fileConfig, envConfig);

      // Validate configuration
      this._config = WistroConfigSchema.parse(mergedConfig);

      return this._config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("\n");
        throw new Error(`Configuration validation failed:\n${errors}`);
      }
      throw error;
    }
  }

  async _loadConfigFile(configPath) {
    try {
      if (!configPath) {
        throw new Error("No config path provided");
      }
      const config = await import(configPath);
      return config.default || config;
    } catch (error) {
      console.error(`Failed to load config file: ${error.message}`);
      // Don't return empty config, throw error
      throw error;
    }
  }

  _loadEnvConfig() {
    return {
      state: {
        adapter: process.env.STATE_ADAPTER,
        redis: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT
            ? parseInt(process.env.REDIS_PORT)
            : undefined,
          password: process.env.REDIS_PASSWORD,
        },
      },
    };
  }

  _mergeConfigs(fileConfig, envConfig) {
    const merged = { ...fileConfig };

    // Deep merge the configurations
    for (const [key, value] of Object.entries(envConfig)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        merged[key] = this._mergeConfigs(merged[key] || {}, value);
      } else if (value !== undefined) {
        merged[key] = value;
      }
    }

    return merged;
  }

  get(path) {
    return path.split(".").reduce((obj, key) => obj?.[key], this._config);
  }

  getRedisConfig() {
    const stateConfig = this.get("state");
    return {
      host: stateConfig?.redis?.host || process.env.REDIS_HOST || "localhost",
      port: parseInt(
        stateConfig?.redis?.port || process.env.REDIS_PORT || "6379"
      ),
      password: stateConfig?.redis?.password || process.env.REDIS_PASSWORD,
    };
  }
}
