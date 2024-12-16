import { MotiaCore, MotiaServer } from "./../../motia.js";

(async function main() {
  const core = new MotiaCore();
  const server = new MotiaServer();
  await core.initialize({
    workflowPaths: ["./src/workflows"],
  });
  await server.initialize(core, ["./routes/incoming"]);

  console.log("Emitting doc.uploaded event...");
  await core.emit({
    type: "doc.uploaded",
    data: {
      fileId: "FAKE_FILE_ID",
      fileName: "Contract.docx",
    },
  });
})().catch(console.error);
