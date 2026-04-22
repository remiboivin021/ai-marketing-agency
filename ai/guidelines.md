# Prompting Guidelines

> Topic: Guidelines | Audience: developers

## Purpose

Defines how to structure prompts so AI outputs are constrained, reviewable, and useful for the SpikeFormer project. Answers: what to include, what to avoid, how to measure success when generating SNN/Transformer code.

## Include in Prompts

| Element | Description | Example |
|---------|-------------|---------|
| Goal | What must be achieved | Implement spike event handler for tactile sensor |
| Scope | Which files or areas may change | `spikeformer/nodes/spiking_node.py` only |
| Constraints | Architecture, WCET <10ms, event-driven | No dynamic allocation, deterministic |
| Validation | How success will be checked | pytest passes, WCET verified |
| Non-goals | What must not be changed | Auth logic, storage schema |

## Good Prompt Shape

Use the form: **context, task, constraints, acceptance criteria**.

```
Context: SpikeFormer processes tactile sensor events via event bus.
Task: Add spike event handler in SpikingNode with WCET <1ms.
Constraints: No dynamic allocation, follow hexagonal architecture, use typed events.
Acceptance: pytest passes, timing test confirms WCET, follows event-driven pattern.
```

## Avoid

- Ambiguous success criteria
- Requests that mix unrelated tasks
- Asking for speculative features not grounded in repository context
- Violating real-time constraints
- Changing forbidden areas without approval

## Prompt Templates

### Feature Request
```
Context: <current state - e.g., "SpikingNode publishes to event bus">
Task: <what feature to add - e.g., "Add priority-based event ordering">
Constraints: <architecture, WCET, compatibility - e.g., "Keep FIFO, add priority field to Event">
Acceptance: <success criteria - e.g., "pytest passes, event ordering verified">
```

### Bug Fix
```
Context: <describe the bug and where it occurs - e.g., "Event timeout in reactive path">
Task: <what to fix - e.g., "Fix timeout handling in event handler">
Constraints: <don't break other functionality - e.g., "WCET must stay <10ms">
Acceptance: <test case that verifies fix - e.g., "test_event_timeout passes">
```

### Refactoring
```
Context: <what to improve - e.g., "Event processing分散">
Task: <specific refactoring - e.g., "Consolidate to single EventProcessor">
Constraints: <maintain behavior, don't change API - e.g., "Keep Event interface">
Acceptance: <tests still pass - e.g., "pytest passes">
```

## SpikeFormer-Specific Examples

### SNN Layer Request
```
Context: SpikeFormer uses Leaky Integrate-and-Fire neurons.
Task: Implement LIF neuron layer with configurable threshold and decay.
Constraints: Deterministic, typed, no dynamic allocation.
Acceptance: Unit tests pass with WCET <5ms per batch.
```

### Event Bus Integration
```
Context: ROS 2 node publishes spike events to event bus.
Task: Add event bus adapter for spike events.
Constraints: Follow ports/adapters pattern, event-driven.
Acceptance: Integration test confirms events published.
```

### Real-Time Constraint
```
Context: Reactive path processes spikes within 10ms WCET.
Task: Optimize spike processing pipeline.
Constraints: Deterministic timing, no blocking calls.
Acceptance: Timing test verifies WCET <10ms.
```

## Open Questions

- [ ] Event priority scheme → discuss with team
- [ ] Backpressure strategy → discuss with team

---
Author: Synaptix Team
Version: 0.1.0
Date: 2026-04-13