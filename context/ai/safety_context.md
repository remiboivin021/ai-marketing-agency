# Safety Context

## Content Policy

- Content filtering: `<!-- FILL: provider-side | custom | both | none -->`
- Blocked categories: `<!-- FILL: violence | hate | sexual | self-harm | other -->`
- PII handling: `<!-- FILL: redact | anonymize | block | allowed -->`
- User input sanitization: `<!-- FILL: method or "none" -->`

## Trust Boundaries

- User input trusted: `no`
- Model output trusted: `no`
- Tool results trusted: `<!-- FILL: yes/no, with justification -->`
- External API responses trusted: `<!-- FILL: yes/no -->`

## Output Validation

- Output validated before use: `<!-- FILL: yes/no -->`
- Validation method: `<!-- FILL: schema | human review | automated checks | none -->`
- Fallback on invalid output: `<!-- FILL: retry | error | default value -->`

## Prompt Injection Defense

- Input sanitization: `<!-- FILL: method or "not implemented" -->`
- Output parsing: `<!-- FILL: strict schema | regex | none -->`
- Privileged context separation: `<!-- FILL: yes/no -->`

## Data Privacy

- Data sent to model: `<!-- FILL: describe what data is sent -->`
- Data retention by provider: `<!-- FILL: none | 30-days | unknown -->`
- Compliance requirements: `<!-- FILL: GDPR | HIPAA | SOC2 | none -->`
- Data residency: `<!-- FILL: region or "no requirement" -->`

## Rate Limiting & Abuse Prevention

- Per-user rate limit: `<!-- FILL: or "none" -->`
- Per-session limit: `<!-- FILL: or "none" -->`
- Cost cap per request: `<!-- FILL: or "none" -->`
- Abuse detection: `<!-- FILL: method or "none" -->`

## Incident Response

- Model failure escalation: `<!-- FILL: process or "not defined" -->`
- Safety incident process: `<!-- FILL: process or "not defined" -->`
- Kill switch: `<!-- FILL: yes/no, mechanism -->`
