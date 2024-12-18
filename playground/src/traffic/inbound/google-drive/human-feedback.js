import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/docs/humanFeedback",
  method: "POST",
  transform: (req) => {
    const { fileId, action } = req.body;

    if (!fileId || !action) {
      throw new Error("fileId and action are required");
    }

    if (!["AUTO_FIX", "APPROVE", "REJECT"].includes(action)) {
      throw new Error("Invalid action. Must be AUTO_FIX, APPROVE, or REJECT");
    }

    return {
      type: "doc.human_action",
      data: {
        fileId,
        action,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
