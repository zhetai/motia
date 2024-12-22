import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { MotiaCore, MotiaServer } from "motia";
import { createMessageBusAdapter } from "motia/core/adapters";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Create and initialize the message bus adapter
  const messageBus = createMessageBusAdapter(
    process.env.MESSAGE_BUS_TYPE || "memory",
    {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }
  );

  await messageBus.initialize();

  const core = new MotiaCore();
  const server = new MotiaServer();

  console.log("[playground/index] Initializing Motia...");

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

  await server.initialize(core, [path.join(__dirname, "traffic/inbound")]);

  console.log(
    "[playground/index] Workflow initialized. Listening for events..."
  );

  process.on("SIGTERM", async () => {
    console.log("[playground/index] Shutting down...");
    await messageBus.cleanup();
    process.exit(0);
  });
}

main().catch(console.error);
