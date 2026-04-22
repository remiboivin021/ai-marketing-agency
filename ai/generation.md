# Test Generation Guidelines

> Topic: Guidelines | Audience: developers

## Purpose

Defines rules for generating tests with AI assistance in the SpikeFormer project. Answers: what test types to generate, coverage requirements, test patterns for SNN/Transformer pipeline, event bus, and ROS 2 integration.

## Required Test Types

| Test Type | When Required | Coverage Target |
|-----------|---------------|-----------------|
| Unit tests | Every function/method | >80% branch, >80% function |
| Integration tests | ROS node interactions, event bus | >70% |
| Timing tests | Real-time constraints | WCET verification |
| E2E tests | Full pipeline | Critical paths only |

## Test Patterns

### Unit Test Template (pytest)
```python
import pytest
from spikeformer.modules import EventProcessor

@pytest.fixture
def event_processor():
    return EventProcessor(max_queue_size=100)

def test_event_processor_enqueue(event_processor):
    """Test positive path: event enqueued successfully."""
    event = {"type": "spike", "timestamp": 1000}
    result = event_processor.enqueue(event)
    assert result is True

def test_event_processor_queue_full(event_processor):
    """Test negative path: queue full returns False."""
    for _ in range(100):
        event_processor.enqueue({"type": "spike", "timestamp": 0})
    result = event_processor.enqueue({"type": "spike", "timestamp": 1001})
    assert result is False

def test_event_processor_timeout():
    """Test error path: timeout raises exception."""
    with pytest.raises(TimeoutError):
        EventProcessor(timeout_ms=0).wait_for_event()
```

### Integration Test Template
```python
import pytest
import rclpy
from spikeformer.nodes import SpikingNode

@pytest.fixture
def ros_context():
    rclpy.init()
    yield
    rclpy.shutdown()

@pytest.fixture
def spiking_node(ros_context):
    node = SpikingNode()
    yield node
    node.destroy_node()

def test_spiking_node_publishes(spiking_node):
    """Test node publishes events correctly."""
    # Spin node and verify publication
    pass
```

### Timing Test Template
```python
import pytest
import time

def test_reactive_path_wcet():
    """Test reactive path WCET < 10ms."""
    iterations = 100
    start = time.perf_counter()
    for _ in range(iterations):
        # Execute reactive path
        pass
    elapsed = (time.perf_counter() - start) / iterations
    assert elapsed < 0.01  # 10ms WCET
```

## Coverage Requirements

- Minimum branch coverage: 80%
- Minimum function coverage: 80%
- Minimum path coverage (critical): 100%
- Timing bounds must be verified

## Test Naming

- `test_<module>_<function>.py` - test files mirror source module
- `test_<class>_<method>` - test functions follow this pattern
- `test_<module>` - for integration test files
- Examples: `test_event_processor_enqueue.py`, `test_snn_forward.py`

## Assertions

- Must include positive assertions (normal operation)
- Must include negative assertions (invalid input)
- Must test error paths (exceptions, timeouts)
- Must verify timing bounds for real-time code
- Must verify event ordering

## Validation

All AI-generated tests must:

- [ ] Pass locally (`pytest`)
- [ ] Be deterministic (no flakiness)
- [ ] Pass ruff check
- [ ] Respect timing constraints
- [ ] Clean up ROS context properly

## Prohibited

- Blocking waits in tests (`time.sleep` with real delays)
- Tests that depend on wall clock time
- Tests that allocate dynamically in RTOS path
- Flaky tests with race conditions

## Open Questions

- [ ] Event priority test scenarios → discuss with team

---
Author: Synaptix Team
Version: 0.1.0
Date: 2026-04-13