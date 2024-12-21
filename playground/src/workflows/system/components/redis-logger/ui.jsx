// playground/src/workflows/system/components/redis-logger/ui.jsx
import React from "react";
import { Handle, Position } from "reactflow";

export default function RedisLoggerNode() {
  return (
    <div className="node-container">
      <Handle type="target" position={Position.Top} />
      <p className="node-title">Redis Logger</p>
      <p className="node-subtitle">Subscribes to: monitor.redis.status</p>
    </div>
  );
}
