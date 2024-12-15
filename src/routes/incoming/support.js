import { defineRoute } from "./../../motia.js";

export default defineRoute({
  path: "/api/support",
  method: "POST",
  transform: (req) => ({
    type: "support.submitted",
    data: {
      text: req.body.text,
      userId: req.body.userId,
    },
  }),
});
