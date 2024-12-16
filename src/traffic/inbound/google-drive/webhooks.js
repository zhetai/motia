import { defineTraffic } from "../../../motia.js";

export default defineTraffic({
  path: "/api/docs/uploaded",
  method: "POST",
  transform: (req) => ({
    type: "doc.uploaded",
    data: {
      fileId: req.body.fileId,
      fileName: req.body.fileName,
    },
  }),
});
