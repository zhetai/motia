import { MotiaCore, MotiaServer, MotiaScheduler } from "./motia.js";
import "dotenv/config";

async function main() {
  const core = new MotiaCore();
  const server = new MotiaServer();
  const scheduler = new MotiaScheduler();

  console.log("Initializing Motia...");

  await core.initialize({
    workflowPaths: ["./src/workflows"],
  });

  await server.initialize(core, ["./traffic/google-drive"]);

  await scheduler.initialize(core, ["./src/workflows/policy-approval"]);
  scheduler.start();

  console.log("Workflow initialized. Listening for events...");
}

main().catch(console.error);
