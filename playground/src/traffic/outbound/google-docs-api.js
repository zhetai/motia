import { google } from "googleapis";

export async function updateDocument(fileId, requests) {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
    ],
  });

  const docsClient = google.docs({
    version: "v1",
    auth: await auth.getClient(),
  });

  await docsClient.documents.batchUpdate({
    documentId: fileId,
    requestBody: { requests },
  });
}
