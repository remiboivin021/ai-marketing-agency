# Review Checklist

> Topic: Checklist | Audience: developers

## Purpose

Defines checklist for reviewing AI-generated outputs in the SpikeFormer project. Answers: what to verify, what questions to ask, what red flags to look for when reviewing SNN/Transformer pipeline code, event bus integration, and ROS 2 node implementations.

## Pre-Review

- [ ] Verify scope matches the original request
- [ ] Check architecture alignment with hexagonal ports/adapters pattern
- [ ] Confirm event-driven design is properly implemented
- [ ] Verify no changes to forbidden areas (storage schema, auth logic, core pipelines)

## Functional Correctness

- [ ] Code implements SNN/Transformer pipeline correctly
- [ ] Event bus integration follows event-driven pattern
- [ ] ROS 2 node structure is correct (rclpy)
- [ ] Edge cases are handled (event queue full, timeout, disconnection)
- [ ] WCET constraints are respected (<10ms reactive, <150ms cognitive)

## Code Quality

- [ ] Follows hexagonal architecture (ports & adapters)
- [ ] No dynamic allocation in real-time path
- [ ] Deterministic operations only
- [ ] No blocking calls in reactive path
- [ ] No global state in critical loop
- [ ] Event handlers are properly typed
- [ ] No security vulnerabilities introduced
- [ ] No hardcoded secrets or credentials
- [ ] No unintended logging of sensitive data

## Testing

- [ ] Unit tests cover new functionality (>80%)
- [ ] Existing tests still pass
- [ ] Integration tests for ROS 2 nodes pass
- [ ] Timing constraints are verified with tests

## Documentation

- [ ] Event interfaces are documented
- [ ] WCET assumptions are stated
- [ ] Event ordering guarantees are documented
- [ ] Fallback behavior is documented

## Red Flags

- Timing violations in reactive path (>10ms WCET)
- Memory leaks or dynamic allocation in RTOS path
- Blocking calls in critical loop
- Event ordering violations
- Race conditions in event handlers
- Missing input validation on event payloads

## Questions to Ask

1. Is WCET compliance verified for the reactive path?
2. What is the event ordering guarantee (FIFO, priority)?
3. What happens when event queue is full (backpressure)?
4. Is fallback behavior defined for ROS disconnection?

## Approval Criteria

- [ ] All checklist items passed
- [ ] ruff check passes
- [ ] pytest passes
- [ ] Timing tests verify WCET constraints
- [ ] At least one human reviewer has approved

## Open Questions

- [ ] Event priority scheme defined? → discuss with team
- [ ] Backpressure strategy? → discuss with team

---
Author: Synaptix Team
Version: 0.1.0
Date: 2026-04-13