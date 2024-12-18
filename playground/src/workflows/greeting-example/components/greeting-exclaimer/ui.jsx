import React from 'react';

export default function GreetingExclaimerNode({ data }) {
  return (
    <div className="node-container">
      <p className="node-title">Greeting Exclaimer</p>
      <p className="node-subtitle">Subscribes to: greeting.uppercased</p>
      <p className="node-subtitle">Emits: greeting.final (e.g. "HELLO!!!")</p>
    </div>
  );
}
