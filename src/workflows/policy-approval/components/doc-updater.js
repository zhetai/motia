import "dotenv/config";
import { google } from "googleapis";

export const subscribe = ["doc.needs_approval"];

async function docUpdater(input, emit) {
  const { fileId, recommendations } = input;

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

  const requests = [
    {
      replaceAllText: {
        containsText: { text: "Document Status: Draft", matchCase: true },
        replaceText: "Document Status: LLM Reviewed",
      },
    },
    {
      replaceAllText: {
        containsText: { text: "Recommendation:", matchCase: true },
        replaceText: `Recommendation: ${
          recommendations || "No recommendations."
        }`,
      },
    },
  ];

  await docsClient.documents.batchUpdate({
    documentId: fileId,
    requestBody: { requests },
  });
}

export default docUpdater;
