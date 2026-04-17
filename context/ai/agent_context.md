# Agent Context

## Agent Architecture

- Framework: `<!-- FILL: langchain | llamaindex | autogen | custom | none -->`
- Orchestration: `<!-- FILL: single-agent | multi-agent | pipeline | none -->`
- State management: `<!-- FILL: stateless | session-scoped | persistent -->`

## Agents

| Agent | Role | Tools | Authority |
|-------|------|-------|-----------|
| `<!-- FILL -->` | `<!-- FILL -->` | `<!-- FILL -->` | `<!-- FILL -->` |

## Tools / Functions

| Tool | Description | Side Effects | Auth Required |
|------|-------------|--------------|---------------|
| `<!-- FILL -->` | `<!-- FILL -->` | `<!-- yes/no -->` | `<!-- yes/no -->` |

## Behavior Rules

- Max iterations per request: `<!-- FILL -->`
- Timeout per agent call: `<!-- FILL -->`
- Retry policy: `<!-- FILL: none | fixed | exponential -->`
- Fallback on failure: `<!-- FILL: error | degrade | escalate -->`

## Memory & Context

- Conversation history: `<!-- FILL: none | sliding-window | summarized | full -->`
- Window size: `<!-- FILL: number of messages or tokens -->`
- External memory: `<!-- FILL: vector store | database | file | none -->`
- Context injection: `<!-- FILL: RAG | static | hybrid | none -->`

## Boundaries

- Agents must not: `<!-- FILL: project-specific restrictions -->`
- Agents may only: `<!-- FILL: project-specific permissions -->`
- Human-in-the-loop required for: `<!-- FILL: or "nothing" -->`

## Observability

- Logging: `<!-- FILL: structured | unstructured | none -->`
- Tracing: `<!-- FILL: OpenTelemetry | LangSmith | custom | none -->`
- Cost tracking: `<!-- FILL: yes/no -->`
