// packages/motia/src/core/adapters/KafkaMessageBusAdapter.js
import { MessageBusAdapter } from "./MessageBusAdapter.js";
import { Kafka } from "kafkajs";

export class KafkaMessageBusAdapter extends MessageBusAdapter {
  constructor(config = {}) {
    super();
    this.config = {
      brokers: config.brokers || ["localhost:9092"],
      clientId: config.clientId || "motia",
      topicPrefix: config.topicPrefix || "motia.events.",
      groupId: config.groupId || "motia-group",
      ...config,
    };
    this.kafka = null;
    this.producer = null;
    this.consumer = null;
    this.subscribers = new Set();
  }

  async initialize() {
    this.kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.brokers,
    });

    // Set up producer
    this.producer = this.kafka.producer();
    await this.producer.connect();

    // Set up consumer
    this.consumer = this.kafka.consumer({ groupId: this.config.groupId });
    await this.consumer.connect();

    // Subscribe to all topics matching our prefix
    await this.consumer.subscribe({
      topic: new RegExp(`^${this.config.topicPrefix}.*`),
      fromBeginning: false,
    });

    // Start consuming messages
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          // Fan out to all subscribers
          await Promise.all(
            Array.from(this.subscribers).map((handler) =>
              handler(event).catch((err) => {
                console.error("Error in subscriber:", err);
              })
            )
          );
        } catch (err) {
          console.error("Error processing Kafka message:", err);
        }
      },
    });
  }

  async publish(event, options = {}) {
    if (!this.producer) {
      throw new Error("Kafka adapter not initialized");
    }

    const topic = `${this.config.topicPrefix}${event.type}`;
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify({ ...event, metadata: options.metadata }),
          headers: {
            traceId: options.traceId,
            timestamp: Date.now().toString(),
          },
        },
      ],
    });
  }

  async subscribe(handler) {
    this.subscribers.add(handler);
  }

  async cleanup() {
    await Promise.all([
      this.producer?.disconnect(),
      this.consumer?.disconnect(),
    ]);
    this.subscribers.clear();
  }
}
