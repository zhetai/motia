import { runChatCompletion } from "../../../traffic/outbound/openai-api.js";

export const subscribe = ["doc.ready_for_classification"];

export default async function llmClassifier(input, emit) {
  const {
    originalDocContent,
    docContent: rulesContent,
    originalFileId,
  } = input;

  const prompt = `
Given these policy rules:
${rulesContent}

And this new policy document:
${originalDocContent}

1) Determine if the new document fully complies with the rules.
   If fully compliant, answer with:
   STATUS: AUTO_APPROVE
   SUMMARY: <brief summary>

   If not compliant, answer with:
   STATUS: NEEDS_APPROVAL
   SUMMARY: <brief explanation>

2) If STATUS is NEEDS_APPROVAL, also provide:
   RECOMMENDATIONS: <list suggestions on how to modify the document to comply with the rules>
`;

  const response = await runChatCompletion([{ role: "user", content: prompt }]);
  const text = response.choices[0].message.content.trim();

  const statusMatch = text.match(/STATUS:\s*(AUTO_APPROVE|NEEDS_APPROVAL)/i);
  const summaryMatch = text.match(/SUMMARY:\s*(.*)/i);
  const recommendationsMatch = text.match(/RECOMMENDATIONS:\s*(.*)/is);

  let autoApproved = false;
  let summary = "No summary found.";
  let recommendations = "";

  if (statusMatch) {
    autoApproved = statusMatch[1].toUpperCase() === "AUTO_APPROVE";
  }
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  }
  if (!autoApproved && recommendationsMatch) {
    recommendations = recommendationsMatch[1].trim();
  }

  if (autoApproved) {
    emit({
      type: "doc.auto_approved",
      data: { fileId: originalFileId, summary },
    });
  } else {
    emit({
      type: "doc.needs_approval",
      data: { fileId: originalFileId, summary, recommendations },
    });
  }
}
