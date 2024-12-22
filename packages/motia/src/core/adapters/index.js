// packages/motia/src/core/adapters/index.js
import { MessageBusAdapter } from "./MessageBusAdapter.js";
import { RedisMessageBusAdapter } from "./RedisMessageBusAdapter.js";
import { KafkaMessageBusAdapter } from "./KafkaMessageBusAdapter.js";
import { InMemoryMessageBus } from "../MessageBus.js";

export const createMessageBusAdapter = (type, config = {}) => {
  switch (type.toLowerCase()) {
    case "redis":
      return new RedisMessageBusAdapter(config);
    case "kafka":
      return new KafkaMessageBusAdapter(config);
    case "memory":
      return new InMemoryMessageBus();
    default:
      throw new Error(`Unknown message bus type: ${type}`);
  }
};

export { MessageBusAdapter, RedisMessageBusAdapter, KafkaMessageBusAdapter };
