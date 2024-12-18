// playground/src/workflows/policy-approval/components/policy-fixer/index.js
import { runChatCompletion } from "../../../../traffic/outbound/openai-api.js";
import { updateDocument } from "../../../../traffic/outbound/google-docs-api.js";

export const subscribe = ["doc.needs_approval"];

export default async function policyFixerHandler(input, emit) {
  const { fileId } = input;

  const response = await runChatCompletion([
    {
      role: "system",
      content: `You are helping fix policy documents to ensure compliance with company rules.
                Follow these guidelines:
                - Keep the same general structure and intent
                - Fix any compliance issues mentioned in recommendations
                - Update language to be clear and compliant
                - Remove any problematic sections
                - Only output the revised policy text`,
    },
    {
      role: "user",
      content: `Update this policy document to be compliant: [Your document content will be here]`,
    },
  ]);

  const updatedContent = response.choices[0].message.content.trim();

  // Update the document by appending the suggested policy
  const requests = [
    {
      insertText: {
        text: "\n\nSuggested Policy:\n" + updatedContent,
        location: {
          index: 1, // This will add it near the start of the document
        },
      },
    },
  ];

  await updateDocument(fileId, requests);

  emit({
    type: "doc.updated",
    data: {
      fileId,
      status: "suggested_update_added",
    },
  });
}
