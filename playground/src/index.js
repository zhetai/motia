import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { MotiaCore, MotiaServer } from "motia";
import { createMessageBusAdapter } from "motia/core/adapters";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Move some of this config as defaults to motia
async function main() {
  console.log(
    "[Startup] Using message bus type:",
    process.env.MESSAGE_BUS_TYPE
  );
  // Create and initialize the message bus adapter
  const messageBus = createMessageBusAdapter(
    process.env.MESSAGE_BUS_TYPE || "memory",
    {
      // Redis config
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,

      // Kafka config
      brokers: process.env.KAFKA_BROKERS?.split(","),
      clientId: process.env.KAFKA_CLIENT_ID,
      groupId: process.env.KAFKA_GROUP_ID,
    }
  );

  await messageBus.initialize();

  // Create core with the message bus
  const core = new MotiaCore();
  const server = new MotiaServer();

  console.log("Initializing Motia...");

  // Pass the message bus to core initialization
  await core.initialize({
    workflowPaths: [path.join(__dirname, "workflows")],
    messageBus,
    agents: {
      "node-agent": {
        url: "http://localhost:3000",
        runtime: "node",
      },
      "python-agent": {
        url: "http://localhost:8000",
        runtime: "python",
      },
    },
  });

  // Initialize server with correct traffic paths
  await server.initialize(core, [path.join(__dirname, "traffic/inbound")]);

  console.log("Workflow initialized. Listening for events...");

  // Handle cleanup on shutdown
  process.on("SIGTERM", async () => {
    console.log("Shutting down...");
    await Promise.all([messageBus.cleanup()]);
    process.exit(0);
  });
}

main().catch(console.error);
