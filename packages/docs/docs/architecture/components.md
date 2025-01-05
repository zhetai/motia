---
sidebar_position: 2
---

# Components

Description of the architectural components for Wistro

| **Component** | **Description**                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| Step          | Actionable component that emits and subscribes to events, each component has specific logic that performs a task |
| Workflow      | Group of steps                                                                                                   |
| Trigger       | Entry point to a workflow which emits an event                                                                   |
| State Adapter | A state manager which is consumed by the steps in order to persist a given workflow state                        |
| Event Manager | The event manager registers steps based on their subscriptions and allows steps and triggers to emit events      |

![Architecture Components](./img/arch-diagram.png)
