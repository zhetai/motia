import { MotiaCore, MotiaServer, MotiaScheduler } from "./motia";

async function main() {
  const core = new MotiaCore();
  const server = new MotiaServer();
  const scheduler = new MotiaScheduler();

  console.log("Initializing Motia...");

  await core.initialize({
    workflowPaths: ["./src/workflows"],
  });

  await server.initialize(core, ["./routes/google-drive"]);

  await scheduler.initialize(core, ["./src/workflows/policy-approval"]);
  scheduler.start();

  console.log("Workflow initialized. Listening for events...");

  // Test event
  await core.emit({
    type: "doc.uploaded",
    data: {
      fileId: "YOUR_TEST_FILE_ID",
      fileName: "Contract.docx",
    },
  });
}

main().catch(console.error);
