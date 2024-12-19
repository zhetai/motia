import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { MotiaCore, MotiaServer } from "motia";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const core = new MotiaCore();
  const server = new MotiaServer();

  console.log("Initializing Motia...");

  // Initialize with correct workflow paths
  await core.initialize({
    workflowPaths: [path.join(__dirname, "workflows")],
  });

  // Initialize server with correct traffic paths - note the src/traffic/inbound path
  await server.initialize(core, [path.join(__dirname, "traffic/inbound")]);

  console.log("Workflow initialized. Listening for events...");
}

main().catch(console.error);
