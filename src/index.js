import { MotiaCore, MotiaServer, MotiaScheduler } from "./motia.js";
import "dotenv/config";

async function main() {
  const core = new MotiaCore();
  const server = new MotiaServer();
  const scheduler = new MotiaScheduler();

  console.log("Initializing Motia...");

  await core.initialize();
  await server.initialize(core);
  await scheduler.initialize(core);
  scheduler.start();

  console.log("Workflow initialized. Listening for events...");
}

main().catch(console.error);
