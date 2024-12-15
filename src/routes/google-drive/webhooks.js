import { defineRoute } from "../../motia.js";

export default [
  defineRoute({
    path: "/api/docs/uploaded",
    method: "POST",
    transform: (req) => ({
      type: "doc.uploaded",
      data: {
        fileId: req.body.fileId,
        fileName: req.body.fileName,
      },
    }),
  }),
  defineRoute({
    path: "/api/docs/updated",
    method: "POST",
    transform: (req) => ({
      type: "doc.updated",
      data: {
        fileId: req.body.fileId,
      },
    }),
  }),
];
