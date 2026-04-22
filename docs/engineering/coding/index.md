# Coding Standards

> Audience: developers, code reviewers
> Maintained by: $architect | Last updated: <date>

## What is this section

This section captures durable coding conventions, patterns, and practices that should remain stable across contributors.

## Index

### Core Standards
| Topic | File | Purpose |
|-------|------|---------|
| Coding Style | [style.md](./style.md) | Language-specific conventions, formatting, naming |
| Design Patterns | [patterns.md](./patterns.md) | Reusable architectural patterns |
| Error Handling | [error_handling.md](./error_handling.md) | How to handle and report errors |
| Logging | [logging.md](./logging.md) | Logging conventions and levels |

### Testing
| Topic | File | Purpose |
|-------|------|---------|
| Unit Tests | [unit_tests.md](./unit_tests.md) | How to write good unit tests |
| Integration Tests | [integration_tests.md](./integration_tests.md) | How to write integration tests |
| Test Coverage | [test_coverage.md](./test_coverage.md) | Coverage targets and quality metrics |

### Quality
| Topic | File | Purpose |
|-------|------|---------|
| Code Review | [code_review.md](./code_review.md) | Review guidelines and checklist |
| Refactoring | [refactoring.md](./refactoring.md) | When and how to refactor safely |
| Technical Debt | [technical_debt.md](./technical_debt.md) | Managing and tracking debt |

---

## Usage Rules

- All code must follow the style guide before submission.
- Unit tests are required for new business logic.
- Code review must cover both correctness and style compliance.
- Technical debt must be tracked in the project issue tracker.

## Related
- [Engineering Index](../index.md)
- [Architecture Documentation](../architecture/c4/index.md)
- [Boundary Documentation](../architecture/boundaries/index.md)

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Last modified: <DATE>