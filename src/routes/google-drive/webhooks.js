import { defineRoute } from "../../motia.js";

export default defineRoute({
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
