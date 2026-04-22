# Deployment Topology

This document describes the deployment topology, including the number and arrangement of processes, services, or containers.

## Overview

- **Topology type**: `<single process | service | multi-service | microservices | serverless>`
- **Process count**: `<N>`

## Components

| Component | Type | Count | Description |
|-----------|------|-------|-------------|
| `<name>` | `<type>` | `<N>` | `<description>` |

## Communication

| From | To | Protocol | Purpose |
|------|-----|----------|---------|
| `<component>` | `<component>` | `<protocol>` | `<purpose>` |

## Scaling

- Horizontal scaling: `<yes/no | details>`
- Vertical scaling: `<yes/no | details>`
- Auto-scaling triggers: `<list>`

## High availability

- Redundancy: `<N+1 | active-passive | active-active>`
- Failover: `<mechanism>`
- RTO / RPO: `<targets>`

## External dependencies

- `<dependency>`: `<purpose>`
- `<dependency>`: `<purpose>`

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>