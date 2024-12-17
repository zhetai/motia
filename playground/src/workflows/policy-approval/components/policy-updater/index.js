// index.js boilerplate
export const subscribe = ["example.my-event"];

export default async function policyUpdaterHandler(input, emit, eventType) {
  // Add your logic here
  console.log("Received event:", eventType, input);
}
