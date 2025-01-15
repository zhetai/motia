---
sidebar_position: 2
---

# Components

Description of the architectural components for Motia

| **Component** | **Description**                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| Step          | Actionable component that emits and subscribes to events, each component has specific logic that performs a task |
| Flow          | Group of steps                                                                                                   |
| Trigger       | Entry point to a flow which emits an event                                                                       |
| State Adapter | A state manager which is consumed by the steps in order to persist a given flow state                            |
| Event Manager | The event manager registers steps based on their subscriptions and allows steps and triggers to emit events      |

![Architecture Components](./img/arch-diagram.png)
