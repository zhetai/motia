export function trackTwitterEvent(eventId: string, parameters: Record<string, string> = {}) {
  if (typeof window !== 'undefined' && window.twq) {
    window.twq('event', eventId, parameters);
  }
}

declare global {
  interface Window {
    twq: (command: string, ...args: unknown[]) => void;
  }
} 