export const subscribe = ["ticket.*"];

export default async function supportEventLogger(input, emit, eventType) {
  console.log(eventType, input);
}
