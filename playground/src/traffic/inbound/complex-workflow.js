export const path = "/api/complex/start";
export const method = "POST";

export default (req) => {
  const { data = [], cycleCount = 1 } = req.body;
  return {
    type: "complex.start",
    data: {
      cycleCount,
      items: Array.isArray(data) ? data : [data],
    },
  };
};

// curl -X POST http://localhost:4000/api/complex/start \
//   -H "Content-Type: application/json" \
//   -d '{
//     "data": [1, 2, 3, 4],
//     "cycleCount": 1
//   }'
