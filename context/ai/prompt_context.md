# Prompt Context

## Prompt Architecture

- Pattern: `<!-- FILL: single-shot | few-shot | chain-of-thought | ReAct | other -->`
- System prompt: `<!-- FILL: path to system prompt file or "inline" -->`
- Prompt templates location: `<!-- FILL: directory path -->`
- Template engine: `<!-- FILL: handlebars | jinja | string interpolation | none -->`

## Conventions

- Language: `<!-- FILL: language used in prompts (en, fr, etc.) -->`
- Tone: `<!-- FILL: technical | conversational | formal | neutral -->`
- Output format: `<!-- FILL: free text | JSON | markdown | structured -->`
- Schema enforcement: `<!-- FILL: JSON schema | Zod | Pydantic | none -->`

## Prompt Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `<!-- FILL -->` | `<!-- FILL -->` | `<!-- FILL -->` |

## Few-Shot Examples

- Location: `<!-- FILL: path or "none" -->`
- Selection strategy: `<!-- FILL: static | dynamic | similarity-based | none -->`

## Prompt Testing

- Eval framework: `<!-- FILL: or "none" -->`
- Eval dataset location: `<!-- FILL: or "none" -->`
- Regression criteria: `<!-- FILL: or "not defined" -->`

## Anti-Patterns to Avoid

- Do not embed secrets or credentials in prompts
- Do not include user-controlled input without sanitization
- Do not rely on model for security-critical decisions without validation
- `<!-- FILL: project-specific anti-patterns -->`
