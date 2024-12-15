export const subscribe = ["support.*"];

export default async function supportEventLogger(input, emit, eventType) {
  console.log(eventType, input);
}
