import { ComponentFunction, Emit } from "../../../../motia";

export const subscribe = ["doc.uploaded"];

const docUploadTrigger: ComponentFunction = async (input, emit: Emit) => {
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
