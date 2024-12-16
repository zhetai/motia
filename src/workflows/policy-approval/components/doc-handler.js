import { getDocContent } from "../../../traffic/outbound/google-drive-api.js";

export const subscribe = ["doc.needs_approval", "doc.updated", "doc.escalate"];

export default async function docHandler(input, emit, eventType) {
  const { fileId } = input;

  if (eventType === "doc.updated") {
    const content = await getDocContent(fileId);
    if (content.includes("Status: Approved")) {
      emit({ type: "doc.human_reviewed", data: { fileId } });
      emit({ type: "doc.approved", data: { fileId } });
      emit({ type: "doc.finalized", data: { fileId, result: "Approved" } });
    }
  }

  if (eventType === "doc.escalate") {
    emit({ type: "doc.finalized", data: { fileId, result: "Escalated" } });
  }
}
