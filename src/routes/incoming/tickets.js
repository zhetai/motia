import { defineRoute } from "./../../motia.js";

export default defineRoute({
  path: "/api/tickets",
  method: "POST",
  transform: (req) => ({
    type: "ticket.submitted",
    data: {
      text: req.body.text,
      userId: req.body.userId,
    },
  }),
});
