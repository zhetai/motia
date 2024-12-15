import { ComponentFunction, Emit } from "../../../../motia";
import { Configuration, OpenAIApi } from "openai";

export const subscribe = ["doc.ready_for_classification"];

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function classifyDoc(
  originalDoc: string,
  rules: string
): Promise<{ autoApproved: boolean, summary: string }> {
  const prompt = `
Given these policy rules:
${rules}

And this new policy document:
${originalDoc}

Determine if the new document fully complies with the rules.
If fully compliant, answer with:
STATUS: AUTO_APPROVE
SUMMARY: <brief summary>

If not compliant, answer with:
STATUS: NEEDS_APPROVAL
SUMMARY: <brief explanation>
`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 300,
    temperature: 0,
  });

  const text = response.data.choices?.[0]?.text?.trim() ?? "";
  const statusMatch = text.match(/STATUS:\s*(AUTO_APPROVE|NEEDS_APPROVAL)/i);
  const summaryMatch = text.match(/SUMMARY:\s*(.*)/i);

  let autoApproved = false;
  let summary = "No summary found.";

  if (statusMatch) {
    autoApproved = statusMatch[1].toUpperCase() === "AUTO_APPROVE";
  }
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  }

  return { autoApproved, summary };
}

const llmClassifier: ComponentFunction = async (input, emit: Emit) => {
  const {
    originalDocContent,
    docContent: rulesContent,
    originalFileId,
  } = input;
  const { autoApproved, summary } = await classifyDoc(
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
      data: { fileId: originalFileId, summary },
    });
  }
};

export default llmClassifier;
