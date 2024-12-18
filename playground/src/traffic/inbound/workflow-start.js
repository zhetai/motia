import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/workflow/start",
  method: "POST",
  transform: (req) => {
    return {
      type: "workflow.start",
      data: {}
    };
  }
});
