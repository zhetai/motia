// src/index.ts
import { MotiaCore, MotiaServer } from "./motia.js";

async function main() {
  const core = new MotiaCore();
  const server = new MotiaServer();

  // Initialize the framework
  await core.initialize({
    workflowPaths: ["./src/workflows"],
  });

  // Initialize the server
  await server.initialize(core, ["./routes/incoming"]);

  // Test event
  await core.emit({
    type: "ticket.submitted",
    data: {
      text: "My account is locked - urgent!",
      userId: "123",
    },
  });
}

main().catch(console.error);
