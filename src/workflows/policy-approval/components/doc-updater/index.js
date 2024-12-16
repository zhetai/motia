import { updateDocument } from "../../../../traffic/outbound/google-docs-api.js";

export const subscribe = ["doc.needs_approval"];

export default async function docUpdater(input, emit) {
  const { fileId, recommendations } = input;

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

  await updateDocument(fileId, requests);
}
