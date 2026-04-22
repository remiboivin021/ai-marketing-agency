# Coding Rules

> Topic: Rules | Audience: developers

## Purpose

Defines mandatory coding standards for AI-generated code in the SpikeFormer project. Answers: what rules must be followed, what patterns to use, what to avoid when generating SNN/Transformer, event bus, and ROS 2 code.

## Mandatory Standards

| Rule | Description | Priority |
|------|-------------|----------|
| No dynamic allocation in RTOS path | Pre-allocate all buffers, use object pools | high |
| Deterministic operations | No random, no GC timing variation | high |
| Event-driven architecture | Use event bus, avoid polling | high |
| WCET constraints | Reactive <10ms, cognitive <150ms | high |
| Hexagonal architecture | Ports & adapters pattern | high |
| Type hints required | Use typing module | medium |
| ruff formatting | Run ruff check before commit | medium |

## Required Patterns

### Hexagonal Ports/Adapter
```python
from abc import ABC, abstractmethod
from typing import Protocol

class EventHandler(Protocol):
    """Port: event handler interface."""
    @abstractmethod
    def handle(self, event: Event) -> None:
        """Handle event with bounded WCET."""
        ...

class SpikingAdapter(EventHandler):
    """Adapter: implements event handling."""
    def handle(self, event: Event) -> None:
        # Pre-allocated processing
        pass
```

### ROS 2 Node Structure
```python
import rclpy
from rclpy.node import Node

class SpikingNode(Node):
    """ROS 2 node for spike processing."""
    def __init__(self) -> None:
        super().__init__('spiking_node')
        self._queue: list[Event] = []  # Pre-allocated
        self._sub = self.create_subscription(Event, 'spikes', self._on_spike, 10)
        self._pub = self.create_publisher(Event, 'output', 10)

    def _on_spike(self, msg: Event) -> None:
        self._queue.append(msg)  # Bound check required
```

### Event Handler (Non-blocking)
```python
def handle_event(event: Event, timeout_ms: int = 0) -> bool:
    """Process event with bounded time."""
    start = perf_counter()
    while perf_counter() - start < timeout_ms:
        if process_single(event):
            return True
    return False
```

## Prohibited Patterns

- `malloc` / `new` / `list.append()` without bounds in reactive path
- `time.sleep()` in reactive path
- Global mutable state in critical loop
- Blocking I/O in event handlers
- Non-deterministic operations (`random`, threading)
- Recursive calls without bounded depth

## Style Guidelines

- Use `ruff` for formatting
- Use `typing` module (not `type[]`)
- Use `Protocol` for duck typing
- Pre-allocate with fixed-size containers
- Explicit error handling
- No bare `except:`

## Validation

All AI-generated code must:

- [ ] Pass ruff check (`ruff check .`)
- [ ] Pass type checking (`ruff check --type-checking .`)
- [ ] Pass existing test suite (`pytest`)
- [ ] Pass timing tests (WCET verified)
- [ ] No new warnings in build

## SpikeFormer-Specific Rules

- Events: typed `dataclass` with `timestamp`, `type`, `payload`
- Queues: pre-allocated with max size
- Time: use `time.perf_counter()` not `time.time()`
- Logging: use structured logging, no secrets

## Open Questions

- [ ] Event serialization format → discuss with team

---
Author: Synaptix Team
Version: 0.1.0
Date: 2026-04-13