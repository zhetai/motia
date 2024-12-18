export const subscribe = ["*"];

// In-memory store for events
globalThis.__motiaLoggedEvents = globalThis.__motiaLoggedEvents || [];

export default async function logger(input, emit, eventType) {
  if (eventType === "logger.query") return;
  const eventData = JSON.parse(JSON.stringify(input));
  const eventInfo = { type: eventType, data: eventData, timestamp: Date.now() };
  globalThis.__motiaLoggedEvents.push(eventInfo);
  console.log("LOGGER:", eventType, eventData);
}
