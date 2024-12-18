import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/logger/events",
  method: "GET",
  transform: (req) => {
    const events = globalThis.__motiaLoggedEvents || [];
    return {
      type: "logger.query",
      data: { events }
    };
  }
});
