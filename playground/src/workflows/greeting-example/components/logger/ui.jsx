import React, { useEffect, useState } from 'react';

export default function LoggerNode({ data }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/logger/events');
        if (res.ok) {
          const json = await res.json();
          setEvents(json.events || []);
        }
      } catch (err) {
        console.error("Failed to fetch logger events:", err);
      }
    }
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="node-container" style={{ maxWidth: '250px', overflow: 'auto' }}>
      <p className="node-title">Logger</p>
      <p className="node-subtitle">Subscribes to: *</p>
      <p className="node-subtitle">Shows event history:</p>
      <ul style={{ fontSize: '12px', listStyle: 'none', paddingLeft: 0 }}>
        {events.map((e, idx) => (
          <li key={idx}>
            <strong>{e.type}</strong> at {new Date(e.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
