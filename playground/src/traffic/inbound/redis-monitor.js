export const path = "/api/monitor/redis";
export const method = "POST";

export default (req) => {
  return {
    type: "monitor.redis.status",
    data: {
      status: "monitoring",
      timestamp: new Date().toISOString(),
    },
  };
};
