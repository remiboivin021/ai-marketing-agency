# File Interface

This document describes a file-based interface the system consumes or produces, with emphasis on format stability and schema.

## Overview

- **Type**: `<input | output | config | log | data exchange>`
- **Location**: `<path or directory>`
- **Owner**: `<team or role>`

## Format

- **Schema**: `<JSON | YAML | TOML | XML | CSV | binary | custom>`
- **Encoding**: `<UTF-8 | ASCII | binary>`
- **Compression**: `<none | gzip | etc.>`

## Schema

```json
{
  "<field>": {
    "type": "<type>",
    "description": "<description>",
    "required": <true/false>,
    "default": "<default value>"
  }
}
```

## Validation rules

- `<rule 1>`
- `<rule 2>`

## Lifecycle

- Created by: `<source>`
- Updated by: `<source>`
- Retention: `<period or policy>`

## Migration path

Document how to handle format changes without breaking existing consumers.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>