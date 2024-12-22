// packages/motia/src/core/logging/RedisLogger.js
import Redis from "ioredis";

export class RedisLogger {
  constructor(config = {}) {
    this.config = {
      host: config.host || "localhost",
      port: config.port || 6379,
      ...config,
    };
    this.monitorClient = null;
  }

  async initialize() {
    this.monitorClient = new Redis(this.config);

    // Start monitoring Redis commands
    await this.monitorClient.monitor((err, monitor) => {
      if (err) {
        console.error("[Redis Logger] Monitor Error:", err);
        return;
      }

      monitor.on("monitor", (time, args) => {
        if (args[0] === "publish") {
          const event = {
            timestamp: new Date(time * 1000).toISOString(),
            channel: args[1],
            message: args[2],
          };

          try {
            const parsedMessage = JSON.parse(args[2]);
            this.config.onEvent?.({
              ...event,
              type: parsedMessage.type,
              data: parsedMessage.data,
            });
          } catch (err) {
            console.error("[Redis Logger] Error parsing message:", err);
          }
        }
      });
    });

    this.monitorClient.on("error", (err) => {
      console.error("[Redis Logger] Error:", err);
    });
  }

  async cleanup() {
    await this.monitorClient?.quit();
  }
}
