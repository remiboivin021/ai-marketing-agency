# Unit Testing Standards

> Topic: Testing | Audience: developers

## Purpose
<!-- Define how to write good unit tests.
     Answers: what makes a good unit test, what to test, how to structure? -->

## What Makes a Good Unit Test
| Characteristic | Description |
|----------------|--------------|
| Fast | <description> |
| Isolated | <description> |
| Repeatable | <description> |
| Self-Validating | <description> |
| Timely | <description> |

## Test Structure
```
Given - <precondition>
When - <action under test>
Then - <expected result>
```

## What to Test
| Category | Priority | Examples |
|----------|----------|----------|
| Happy path | Required | <examples> |
| Edge cases | Required | <examples> |
| Error cases | Required | <examples> |
| Boundary conditions | Recommended | <examples> |

## What NOT to Test
- Implementation details
- Third-party code
- <other>

## Naming Conventions
| Element | Pattern | Example |
|---------|---------|---------|
| Test class | <pattern> | <example> |
| Test method | <pattern> | <example> |

## Assertions
| Type | When to Use |
|------|-------------|
| <assertion type> | <when> |
| <assertion type> | <when> |

## Mocks and Stubs
| Type | Use Case |
|------|----------|
| Mock | <when> |
| Stub | <when> |
| Spy | <when> |

## Test Coverage
| Category | Target |
|----------|--------|
| Business logic | <target %> |
| Utility functions | <target %> |
| Critical paths | <target %> |

## Anti-Patterns
- Test logic coupling with implementation
- <pattern to avoid>

## Open Questions
- [ ] <question> → route to $architect

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: <SEM_VERSION (start at 0.1.0)>
Last modified: <DATE>