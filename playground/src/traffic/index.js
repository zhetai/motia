export const config = {
  hybridEndpointExample: {
    path: "/api/hybrid-endpoint-example",
    method: "POST",
    type: "hybrid.received",
    // Handler is optional if it is simply a pass through proxy
    // handler: (req) => ({
    //   type: "hybrid.received",
    //   data: { data: req.body.data },
    // }),
  },
  // curl -X POST http://localhost:4000/api/hybrid-endpoint-example \
  //   -H "Content-Type: application/json" \
  //   -d '{
  //     "data": [
  //       { "id": 1, "value": 100 },
  //       { "id": 2, "value": 200 }
  //     ]
  //   }'
  wistroServerExample: {
    type: "ws-server-example.trigger",
    path: "/api/wistro-server-example",
    method: "POST",
  },
  // curl -X POST http://localhost:4000/api/wistro-server-example \
  //   -H "Content-Type: application/json" \
  //   -d '{
  //     "message": "Hello from cURL!"
  //    }'
  endpointServerHandshake: {
    type: "handshake.initiate",
    path: "/api/endpoint-server-handshake",
    method: "POST",
  },
  // curl -X POST http://localhost:4000/api/endpoint-server-handshake \
  //   -H "Content-Type: application/json" \
  //   -d '{
  //     "message": "Starting the endpoint-server handshake"
  //   }'
};
