# Value Prop

Wistro is a developer-first, event-driven framework that scales with your needs - from simple automation to complex distributed workflows. It lets you focus purely on workflow logic while it handles orchestrating across multiple endpoints, languages, and platforms - providing a unified, type-safe interface with real-time visualization and testing.

## Pain Points It Solves:

- Developer-First Framework: Wistro provides a rigorous, convention-based framework that developers love. Start simple with basic workflows that are up and running in minutes, then seamlessly scale to more sophisticated scenarios as your needs grow. Its carefully crafted guardrails and patterns dramatically speed up development while ensuring consistency and reliability across workflows of any complexity. Whether you're building a simple approval flow or orchestrating complex distributed systems, you get the perfect balance of flexibility and structure.

- Multi-Endpoint Reality: Modern systems rarely live in one place. Write and manage your workflows in one place, then deploy them anywhere. Wistro embraces distributed systems, making it natural to build workflows that connect cloud services, on-prem systems, edge devices, and third-party APIs through a unified event-based interface. Design your workflow once in Wistro's intuitive interface, and let the framework handle the complexity of deploying and orchestrating across your entire infrastructure - from cloud to edge to on-premises systems.

- Language & Runtime Freedom: Workflow components can be written in any language and run anywhere - from laptops and phones to IoT devices and servers. Just install the lightweight Wistro agent and it handles everything else - deployment, versioning, updates, runtime management, and secure inbound/outbound traffic management. Whether you're running Node.js microservices, Python data processing, mobile apps, IoT firmware, or cloud functions, Wistro's lightweight event-based protocol means anything that can send and receive events can be part of your workflow. No complex setup, infrastructure management, or security configuration required - Wistro takes care of the operational complexity so you can focus on your workflow logic.

- Event-Driven Simplicity: Rather than forcing complex RPC or REST patterns, Wistro uses simple event-based communication with clear conventions. Components listen for events they care about and emit events when they do something, making it easy to build loosely coupled, resilient workflows while maintaining predictability.

- Human & External System Integration: Because Wistro is message-based, workflows can naturally pause for human approval, external system processing, or long-running operations. When the response comes back - whether it's a manager's approval, a third-party API callback, or a webhook from another system - the workflow simply picks up exactly where it left off. This makes it trivial to build workflows that span human decision points, external services, and time delays without complex state management.

- Type Safety Without Lock-in: While Wistro provides TypeScript definitions for excellent developer experience, the underlying protocol is language-agnostic. Get great tooling while developing, without constraining where and how components run.

- Universal Connectivity: Whether you're integrating with legacy systems, cloud services, message queues, or custom protocols, Wistro's adapter pattern makes it easy to bring any endpoint into your workflow while maintaining type safety and visibility.
