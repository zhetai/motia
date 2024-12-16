import { google } from "googleapis";

export async function getDocContent(fileId) {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}");
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });

  const res = await drive.files.export(
    { fileId, mimeType: "text/plain" },
    { responseType: "text" }
  );

  return res.data;
}
