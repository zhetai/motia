import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/monitor/redis",
  method: "GET",
  transform: (req) => {
    return {
      type: "monitor.redis.status",
      data: {
        status: "monitoring",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
