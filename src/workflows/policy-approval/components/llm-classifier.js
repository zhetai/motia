import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const subscribe = ["doc.ready_for_classification"];

async function classifyDoc(originalDoc, rules) {
  const prompt = `
Given these policy rules:
${rules}

And this new policy document:
${originalDoc}

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

  // Using chat-based completion
  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo", // Use 'gpt-4' if you have access
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600,
    temperature: 0,
  });

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

  return { autoApproved, summary, recommendations };
}

const llmClassifier = async (input, emit) => {
  const {
    originalDocContent,
    docContent: rulesContent,
    originalFileId,
  } = input;

  const { autoApproved, summary, recommendations } = await classifyDoc(
    originalDocContent,
    rulesContent
  );

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
};

export default llmClassifier;
