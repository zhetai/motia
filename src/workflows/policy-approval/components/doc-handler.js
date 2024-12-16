import { google } from "googleapis";

export const subscribe = ["doc.needs_approval", "doc.updated", "doc.escalate"];

async function fetchDocContentFromDrive(fileId) {
  console.log("doc-handler", process.env.GOOGLE_CREDENTIALS);
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}");
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });

  const res = await drive.files.export(
    {
      fileId,
      mimeType: "text/plain",
    },
    { responseType: "text" }
  );

  // @ts-ignore
  return res.data;
}

const docHandler = async (input, emit, eventType) => {
  const { fileId } = input;

  if (eventType === "doc.updated") {
    const content = await fetchDocContentFromDrive(fileId);
    if (content.includes("Status: Approved")) {
      emit({ type: "doc.human_reviewed", data: { fileId } });
      emit({ type: "doc.approved", data: { fileId } });
      emit({ type: "doc.finalized", data: { fileId, result: "Approved" } });
    }
  }

  if (eventType === "doc.escalate") {
    // If no approval, escalate
    emit({ type: "doc.finalized", data: { fileId, result: "Escalated" } });
  }

  // If doc.needs_approval, you may track a timestamp somewhere, but this example is simple.
};

export default docHandler;
