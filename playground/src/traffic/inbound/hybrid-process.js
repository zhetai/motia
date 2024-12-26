export const path = "/api/hybrid/process";
export const method = "POST";

export default (req) => {
  return {
    type: "hybrid.received",
    data: { data: req.body.data },
  };
};

// curl -X POST http://localhost:4000/api/hybrid/process \
// -H "Content-Type: application/json" \
// -d '{"data": [{"id": 1, "value": 100}, {"id": 2, "value": 200}]}'
