import { google } from "googleapis";

export const subscribe = ["doc.fetch_requested"];

async function fetchDocContentFromDrive(rulesFileId) {
  // Auth with Google
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}");
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });

  // Export doc as text if it's a Google Doc. If it's a PDF or another format,
  // you may need different logic. Here we assume a Google Doc.
  const res = await drive.files.export(
    {
      fileId,
      mimeType: "text/plain",
    },
    { responseType: "text" }
  );

  // @ts-ignore types for drive export might differ, just assume text
  return res.data;
}

const driveDocFetcher = async (input, emit) => {
  const { fileId, targetEvent, ...rest } = input;
  const docContent = await fetchDocContentFromDrive(fileId);

  emit({
    type: targetEvent,
    data: { fileId, docContent, ...rest },
  });
};

export default driveDocFetcher;
