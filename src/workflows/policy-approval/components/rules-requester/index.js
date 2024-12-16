export const subscribe = ["doc.content_fetched"];

const rulesRequester = async (input, emit) => {
  const { docContent, originalFileId } = input;
  const rulesFileId = process.env.POLICY_RULES_FILE_ID || "YOUR_RULES_FILE_ID";

  emit({
    type: "doc.fetch_requested",
    data: {
      fileId: rulesFileId,
      originalFileId,
      originalDocContent: docContent,
      targetEvent: "doc.ready_for_classification",
    },
  });
};

export default rulesRequester;
