# Data Protection

This document classifies data by sensitivity and specifies the handling requirements for each level.

## Classification levels

### Public

- **Description**: Information that can be freely shared
- **Examples**: `<list>`
- **Handling**: No special protection required

### Internal

- **Description**: Information for internal use only
- **Examples**: `<list>`
- **Handling**: Basic access control, no encryption at rest

### Confidential

- **Description**: Sensitive business information
- **Examples**: `<list>`
- **Handling**: Encryption at rest and in transit, access logging

### Restricted

- **Description**: Highly sensitive data requiring strict controls
- **Examples**: `<list>`
- **Handling**: Encryption, strict access control, audit trail, limited retention

## Data inventory

| Data type | Classification | Storage | Retention | Disposal |
|-----------|---------------|---------|-----------|-----------|
| `<type>` | `<level>` | `<location>` | `<period>` | `<method>` |

## Encryption

- **At rest**: `<algorithm | tool>`
- **In transit**: `<TLS version | protocol>`
- **Key management**: `<service | rotation policy>`

## Compliance

- GDPR: `<compliant | not applicable | controls>`
- `<Other regulation>`: `<status>`

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>