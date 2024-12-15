export const subscribe = ["doc.uploaded"];

const docUploadTrigger = async (input, emit) => {
  const { fileId } = input;
  emit({
    type: "doc.fetch_requested",
    data: {
      fileId,
      originalFileId: fileId,
      targetEvent: "doc.content_fetched",
    },
  });
};

export default docUploadTrigger;
