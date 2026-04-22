# Architecture Documentation

This directory describes the system architecture.

It focuses on **structure, boundaries, and invariants**, not implementation details.

---

## Purpose

Architecture documentation exists to:
- align contributors
- guide design decisions
- constrain AI-generated solutions

---

## Structure

- `index.md`  
  Entry point and architecture overview.

- `assumptions.md`  
  Explicit assumptions the architecture relies on.

- `system-boundaries.md`  
  What is inside vs outside the system.

- `interfaces.md`  
  External and internal interfaces.

- `data-flow.md`  
  Key data flows and lifecycle.

- `deployment.md`  
  Deployment model and environment assumptions.

- `security-architecture.md`  
  Security principles at the architectural level.

- `modularity-principles.md`  
  Rules governing modularity and coupling.

- `c4/`  
  C4-style architectural views (context, container, component, code).

---

## Implementation Modules

### SpikeFormer (`src/spikeformer/`)

Event-driven robotics framework built on hexagonal architecture.

| Layer | Directory | Purpose |
|-------|----------|---------|
| Domain | `domain/` | Core events (`SensorEvent`, `SpikeEvent`, `TriggerEvent`, `TokenEvent`, `DecisionEvent`) and ports (`PublisherPort`, `SubscriberPort`) |
| Application | `application/` | Use cases (`ProcessSensorEvent`, `TriggerReactiveControl`, `AggregateForReasoning`) |
| Runtime | `runtime/` | Event bus for pub/sub communication |
| Adapters | `adapters/ros2/` | ROS 2 integration (`ROS2NodeAdapter`) |

See [synaptix_nlspec.md](../synaptix_nlspec.md) as the source of truth.

---

## Rules

- Architecture changes require explicit documentation updates
- Major changes should be backed by an ADR
- Diagrams must match textual descriptions