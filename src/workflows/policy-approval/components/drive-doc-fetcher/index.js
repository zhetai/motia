import { getDocContent } from "../../../../traffic/outbound/google-drive-api.js";

export const subscribe = ["doc.fetch_requested"];

export default async function driveDocFetcher(input, emit) {
  const { fileId, targetEvent, ...rest } = input;
  const docContent = await getDocContent(fileId);

  emit({
    type: targetEvent,
    data: { fileId, docContent, ...rest },
  });
}
