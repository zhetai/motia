import "dotenv/config";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { MotiaCore, MotiaServer } from "motia";
import { createMessageBusAdapter } from "motia/core/adapters";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Current working directory is:", process.cwd());
  // 1) Read your new config file
  const configPath = path.join(__dirname, "../motia.config.json");
  const rawConfig = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(rawConfig);

  // 2) Create and initialize the message bus (using your env variables or defaults)
  //    Then attach it to config so MotiaCore can use it directly.
  const messageBus = createMessageBusAdapter(
    process.env.MESSAGE_BUS_TYPE || config.messageBus?.type || "memory",
    {
      host: process.env.REDIS_HOST ?? config.messageBus?.host,
      port: process.env.REDIS_PORT ?? config.messageBus?.port,
      // ...any other fields you might need (like brokers for Kafka, etc.)
    }
  );
  await messageBus.initialize();

  // 3) Update config to include the actual messageBus instance
  //    so MotiaCore can use it instead of creating a new one.
  config.messageBus = messageBus;

  // 4) Initialize MotiaCore entirely from your config
  const core = new MotiaCore();
  console.log("[playground/index] Initializing Motia from config...");
  await core.initialize(config);

  // 5) (Optional) If you still want an HTTP server for inbound traffic, set it up
  const server = new MotiaServer();
  await server.initialize(core, [path.join(__dirname, "traffic/inbound")]);

  console.log(
    "[playground/index] Workflow initialized. Listening for events..."
  );

  // 6) Gracefully shut down on SIGTERM
  process.on("SIGTERM", async () => {
    console.log("[playground/index] Shutting down...");
    await messageBus.cleanup();
    process.exit(0);
  });
}

main().catch(console.error);
