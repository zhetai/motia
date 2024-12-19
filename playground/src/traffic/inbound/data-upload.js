// playground/src/traffic/inbound/data-upload.js
import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/data/upload",
  method: "POST",
  transform: (req) => {
    const { rawData } = req.body; // Expect an array of objects
    return { type: "data.uploaded", data: { rawData } };
  },
});
