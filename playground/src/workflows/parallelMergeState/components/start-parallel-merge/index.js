// start-event/index.js
import crypto from "crypto";

// Minimal config object for Wistro scanning
export const config = {
  name: "Start Event",
  subscribe: ["pms.initialize"],
  emits: ["pms.start"],
};

export default async function startEventHandler(input, emit) {
  console.log("[PARALLEL_MERGE] start-event is loaded from:", import.meta.url);
  // Generate a unique trace ID
  const workflowTraceId = crypto.randomBytes(6).toString("hex");
  console.log("[start-event] Generating traceId:", workflowTraceId);

  // Emit an event that triggers the parallel steps
  await emit({
    type: "pms.start",
    data: {},
    metadata: {
      workflowTraceId,
    },
  });
}
