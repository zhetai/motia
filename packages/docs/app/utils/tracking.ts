export function trackTwitterEvent(eventId: string, parameters: Record<string, string> = {}) {
  if (typeof window !== 'undefined' && window.twq) {
    window.twq('event', eventId, parameters);
  }
}

export function trackGTMEvent(eventName: string, eventParameters: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventParameters
    });
  }
}