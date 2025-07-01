# Motia

<p align="center">
  <img src="https://motia.dev/icon.png" alt="Motia Logo" width="200" />
</p>

<p align="center">
  <strong>🔥 A Modern Unified Backend Framework for APIs, Events and Agents 🔥</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/motia">
    <img src="https://img.shields.io/npm/v/motia?style=flat&logo=npm&logoColor=white&color=CB3837&labelColor=000000" alt="npm version">
  </a>
  <a href="https://github.com/MotiaDev/motia/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat&logo=opensourceinitiative&logoColor=white&labelColor=000000" alt="license">
  </a>
  <a href="https://github.com/MotiaDev/motia">
    <img src="https://img.shields.io/github/stars/MotiaDev/motia?style=flat&logo=github&logoColor=white&color=yellow&labelColor=000000" alt="GitHub stars">
  </a>
  <a href="https://twitter.com/motiadev" target="_blank">
    <img src="https://img.shields.io/badge/Follow-@motiadev-1DA1F2?style=flat&logo=twitter&logoColor=white&labelColor=000000" alt="Twitter Follow">
  </a>
  <a href="https://discord.gg/EnfDRFYW" target="_blank">
    <img src="https://img.shields.io/discord/1322278831184281721?style=flat&logo=discord&logoColor=white&color=5865F2&label=Discord&labelColor=000000" alt="Discord">
  </a>
</p>


<p align="center">
  <a href="https://www.motia.dev/manifesto">💡 Motia Manifesto</a> •
  <a href="https://www.motia.dev/docs/getting-started/quick-start">🚀 Quick Start</a> •
  <a href="https://www.motia.dev/docs/concepts/steps/defining-steps">📋 Defining Steps</a> •
  <a href="https://motia.dev/docs">📚 Docs</a>
</p>

---

## 🎯 What is Motia?

Motia is a **modern backend framework** that unifies APIs, background jobs, events, and AI agents into a single cohesive system. Eliminate runtime complexity and build unified backends where **JavaScript, TypeScript, Python, etc**, work together in event-driven workflows, with built-in state management, observability, and one-click deployments.

Motia brings cohesion to the fragmented backend world with our core primitive: the **Step**. Think of Steps like React Components, but for backends.

![Motia combines APIs, background queues, and AI agents into one system](/assets/motia-architecture-with-bg.png)

### 🧱 The Step Philosophy

- **🎯 Your Logic, Your Step**: A Step holds your business logic. It can be a simple function, a call to a database, or a complex AI agent. This is where your application's real work gets done.
- **🌍 Any Language, One Workflow**: Write Steps in TypeScript, Python, and other languages to come. all in the same project. Use Python for your AI agents and TypeScript for your API, and Motia makes them work together effortlessly.
- **⚡ Full Power, No Boilerplate**: Inside a Step's `handler`, you have the full power of the Node.js or Python ecosystem. Install any package, call any API, connect to any database. No restrictions, just your code.
- **👁️ Zero-Config Observability**: Get full end-to-end tracing and logging for every Step execution, automatically. No setup required. See exactly what happened, when, and why.
- **🌊 Simple & Powerful Workflows**: Connect Steps together by emitting and subscribing to events. Build complex, multi-stage processes with simple, declarative code.
- **🏪 Unified State**: Share data between Steps effortlessly. Motia provides built-in state management that is automatically traced, giving you a complete picture of your data's lifecycle through a workflow.

---

## 🚧 The Problem

Backend teams juggle **fragmented runtimes** across APIs, background queues, and AI agents. This creates deployment complexity, debugging gaps, and cognitive overhead from context-switching between frameworks.

**This fragmentation demands a unified system.**

---

## ✅ The Unified System

Motia unifies your entire backend into a **unified state**. APIs, background jobs, and AI agents become interconnected Steps with shared state and integrated observability.

| **Before**                  | **After (Motia)**                       |
| --------------------------- | --------------------------------------- |
| Multiple deployment targets | **Single unified deployment**           |
| Fragmented observability    | **End-to-end tracing**                  |
| Language dependent          | **JavaScript, TypeScript, Python, etc** |
| Context-switching overhead  | **Single intuitive model**              |
| Complex error handling      | **Automatic retries & fault tolerance** |

---

## 🔧 Supported Step Types

| Type        | Trigger               | Use Case                              |
| ----------- | --------------------- | ------------------------------------- |
| **`api`**   | HTTP Request          | Expose REST endpoints                 |
| **`event`** | Emitted Topics        | React to internal or external events  |
| **`cron`**  | Scheduled Time (cron) | Automate recurring jobs               |
| **`noop`**  | None                  | Placeholder for manual/external tasks |

---

### 🤔 How it Works

Motia's architecture is built around a single, powerful primitive: the **Step**. A Step is not just a trigger; it's a powerful container for your business logic. You can write anything from a simple database query to a complex AI agent interaction inside a single step. Instead of managing separate services for APIs, background workers, and scheduled tasks, you simply define how your steps are triggered.

-   **Need a public API?** Create an `api` step. This defines a route and handler for HTTP requests. You can build a complete REST or GraphQL API just with these steps.
-   **Need a background job or queue?** Have your `api` step `emit` an event. An `event` step subscribed to that event's topic will pick up the job and process it asynchronously. This is how you handle anything that shouldn't block the main request thread, from sending emails to complex data processing.
-   **Need to run a task on a schedule?** Use a `cron` step. It will trigger automatically based on the schedule you define.

This model means you no longer need to glue together separate frameworks and tools. A single Motia application can replace a stack that might otherwise include **Nest.js** (for APIs), **Temporal** (for workflows), and **Celery/BullMQ** (for background jobs). It's all just steps and events.

## ⚡ Core Concepts

The **Step** is Motia's core primitive. The following concepts are deeply integrated with Steps to help you build powerful, complex, and scalable backends:

### ✨ Streams: Real-time Messaging

Motia Streams provide a way to push real-time updates from your asynchronous workflows to connected clients, without polling. This is perfect for applications like live dashboards, progress indicators for long-running jobs, or real-time AI agent interactions.

**Defining a Stream:**

Create a file ending in `.stream.ts` (e.g., `steps/my-stream.stream.ts`) to define a new stream:

```typescript
import { StreamConfig } from 'motia'
import { z } from 'zod'

export const config: StreamConfig = {
  name: 'myStream', // Becomes context.streams.myStream
  schema: z.object({
    message: z.string(),
    progress: z.number(),
  }),
  baseConfig: {
    storageType: 'default', // Uses the default state adapter
  },
}
```

**Using Streams in Steps:**

Once defined, you can interact with streams in any step handler via the `context.streams` object.

```typescript
export const handler: Handlers['MyStep'] = async (input, { streams, traceId }) => {
  // Set data in the stream
  await streams.myStream.set(traceId, 'unique-item-id', {
    message: 'Processing...',
    progress: 50,
  });
};
```

**Consuming Streams in the Frontend:**

With the `@motiadev/stream-client-react` package, you can easily subscribe to stream updates in your React components.

```tsx
import { useStreamItem } from '@motiadev/stream-client-react'

function MyComponent() {
  const { data } = useStreamItem({
    streamName: 'myStream',
    groupId: 'some-group-id', // Often the traceId
    id: 'unique-item-id',
  });

  return <div>Progress: {data?.progress}%</div>;
}
```

**Real-time Updates:**
When your API step updates the progress from 50 to 75, the frontend component automatically receives the new data and re-renders. No polling, no manual refresh required. This creates a complete real-time experience for users tracking long-running processes.

### 👁️ End-to-End Observability

Motia provides built-in, end-to-end observability, giving you deep insights into your application's behavior without any extra configuration.

**Automatic Tracing:**
Every workflow execution, whether triggered by an API call, an event, or a cron job, generates a detailed trace. This trace captures the entire lifecycle, including:

- **Step Executions:** See which steps ran, in what order, and for how long.
- **State Changes:** Track every `get`, `set`, and `delete` operation on the shared state.
- **Event Emissions:** View all events emitted by your steps.
- **Stream Operations:** Monitor real-time data pushes to clients.
- **Logs:** All logs are automatically correlated with the corresponding trace and step.

**The Traces UI:**
The Workbench includes a dedicated **Traces** UI where you can:
- **Visualize Timelines:** See a gantt chart of your workflow, making it easy to spot bottlenecks.
- **Inspect Payloads:** Drill down into the details of each event, including state changes and log messages.
- **Debug Errors:** Quickly identify the root cause of failures with full error messages and stack traces associated with the exact step that failed.

This unified view eliminates the need for fragmented logging and tracing tools, dramatically simplifying debugging and performance analysis.

---

## 🚀 Quickstart

Get up and running in **under 60 seconds**:

### 1. Create Your Project

```bash
npx motia@latest create -i
```
- Enter project details like template, project name, etc

### 2. Write Your First Step

Open `01-api.step.ts` and create a simple API endpoint:

```typescript
exports.config = {
  type: 'api',           // Step type: "api", "event", "cron", or "noop"
  path: '/hello-world',  // API endpoint path
  method: 'GET',         // HTTP method
  name: 'HelloWorld',    // Step identifier
  emits: ['test-state'], // Events this step emits
  flows: ['default'],    // Flow this step belongs to
}

exports.handler = async () => {
  return {
    status: 200,
    body: { message: 'Hello World from Motia!' },
  }
}
```

### 3. Launch the Workbench

Start the visual development environment:

```bash
npm run dev
# Opens at http://localhost:3000
```

🎉 **That's it!** You now have a fully functional Motia app with:
- ✅ API endpoint at `/hello-world`
- ✅ Visual debugger and flow inspector
- ✅ Built-in observability
- ✅ Hot reload for instant feedback

### 4. Explore the Workbench

The Workbench is your command center for developing and monitoring your Motia application.

- **🌊 Flows**: Visually inspect, design, and understand the connections between your steps.
- **🔌 Endpoints**: Test your API endpoints directly from the UI, with full support for streaming responses.
- **👁️ Traces**: Dive into detailed, end-to-end traces of your workflows. See exactly how data flows, where time is spent, and what errors occurred.
- **📊 Logs**: View structured, correlated logs for every step execution.
- **🏪 States**: Inspect the internal state and data passed between steps for any given workflow execution.

---

## 🗂 Examples

| [Finance Agent](https://github.com/MotiaDev/motia-examples/tree/main/examples/finance-agent) | [GitHub Agent](https://github.com/MotiaDev/motia-examples/tree/main/examples/github-integration-workflow) | [Gmail Manager](https://github.com/MotiaDev/motia-examples/tree/main/examples/gmail-workflow) |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| ![Finance](assets/examples/finance-agent.png)<br>Financial insights                          | ![GitHub](assets/examples/github-pr-management.png)<br>PR automation                                      | ![Gmail](assets/examples/gmail-flow.png)<br>Email automation                                  |

| [Trello Automation](https://github.com/MotiaDev/motia-examples/tree/main/examples/trello-flow) | [RAG Agent](https://github.com/MotiaDev/motia-examples/tree/main/examples/rag_example) | [AI Image Gen](https://github.com/MotiaDev/motia-examples/tree/main/examples/vision-example) |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ![Trello](assets/examples/trello-manager.png)<br>Task automation                               | ![RAG](assets/examples/parse-embed-rag.png)<br>Knowledge retrieval                     | ![AI Image](assets/examples/generate-image.png)<br>Generate images                           |

---

## 🌐 Language Support

Write steps in your preferred language:

| Language       | Status        | Example           |
| -------------- | ------------- | ----------------- |
| **JavaScript** | ✅ Stable      | `handler.step.js` |
| **TypeScript** | ✅ Stable      | `handler.step.ts` |
| **Python**     | ✅ Stable      | `handler.step.py` |
| **Ruby**       | 🔄 Coming Soon | `handler.step.rb` |
| **Go**         | 🔄 Coming Soon | `handler.step.go` |
| **Rust**       | 🔄 Coming Soon | `handler.step.rs` |

---
### 💬 **Get Help**
- **📋 Questions**: Use our [Discord community](https://discord.gg/7rXsekMK)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/MotiaDev/motia/issues)
- **📖 Documentation**: [Official Docs](https://motia.dev/docs)
- **🎥 Blog**: [Motia Blog](https://dev.to/motiadev)

### 🤝 **Contributing**

#### 🚀 Roadmap

We're building Motia in the open, and we'd love for you to be a part of the journey.

Check out our public roadmap to see what's planned, what's in progress, and what's recently shipped:

👉 [View our public Roadmap](https://github.com/orgs/MotiaDev/projects/2/views/2)

We welcome contributions! Whether it's:
- 🐛 Bug fixes and improvements
- ✨ New features and step types
- 📚 Documentation and examples
- 🌍 Language support additions
- 🎨 Workbench UI enhancements

Check out our [Contributing Guide](https://github.com/MotiaDev/motia/blob/main/CONTRIBUTING.md) to get started.

---

<div align="center">

**🌟 Ready to unify your backend?**

[🚀 **Get Started Now**](https://motia.dev) • [📖 **Read the Docs**](https://motia.dev/docs) • [💬 **Join Discord**](https://discord.gg/7rXsekMK)

</div>

---
## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=motiadev/motia&type=Date)](https://www.star-history.com/#motiadev/motia&Date)

<sub>Built with ❤️ by the Motia team • **Star us on GitHub if you find Motia useful!** ⭐</sub>

</div>
