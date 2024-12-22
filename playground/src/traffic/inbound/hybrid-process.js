import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/hybrid/process",
  method: "POST",
  transform: (req) => ({
    type: "hybrid.received",
    data: { data: req.body.data },
  }),
});
