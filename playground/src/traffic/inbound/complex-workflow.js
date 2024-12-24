import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/complex/start",
  method: "POST",
  transform: (req) => {
    const { data = [], cycleCount = 1 } = req.body;

    return {
      type: "complex.start",
      data: {
        cycleCount,
        items: Array.isArray(data) ? data : [data],
      },
    };
  },
});

// curl -X POST http://localhost:4000/api/complex/start \
//   -H "Content-Type: application/json" \
//   -d '{
//     "data": [1, 2, 3, 4],
//     "cycleCount": 1
//   }'
