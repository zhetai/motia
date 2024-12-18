import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/greeting/start",
  method: "POST",
  transform: (req) => {
    return {
      type: "greeting.start",
      data: {},
    };
  },
});
