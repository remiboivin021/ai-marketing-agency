# Network Boundary — <SystemName>

> Boundary Type: Network | Audience: ops, architects, infra

## Purpose
<!-- Définit les segments réseau, les règles de routage, et les points d'exposition.
     Répond à : "qu'est-ce qui est joignable depuis où ?" -->

## Network Segments
| Segment | Type | CIDR / Location | Public | Notes |
|---------|------|-----------------|--------|-------|
| <name> | VPC / subnet / DMZ / edge / ... | <range or region> | yes / no | |

## Ingress / Egress Rules
| From | To | Port / Protocol | Direction | Justification |
|------|----|-----------------|-----------|---------------|
| <segment> | <segment> | 443/HTTPS | ingress | |

## Diagram

```mermaid
flowchart TD
  subgraph internet["Internet"]
    CLIENT(["Client"])
  end

  subgraph edge["Edge — Public Subnet"]
    CDN["CDN / WAF"]
    GW["API Gateway"]
  end

  subgraph app_subnet["App Subnet — Private"]
    SVC_A["Service A"]
    SVC_B["Service B"]
  end

  subgraph data_subnet["Data Subnet — Isolated"]
    DB[("Primary DB")]
    REPLICA[("Read Replica")]
  end

  CLIENT -->|"443"| CDN
  CDN -->|"443"| GW
  GW -->|"8080 internal"| SVC_A
  SVC_A -->|"internal"| SVC_B
  SVC_A -->|"5432 internal"| DB
  DB -.->|"replication"| REPLICA
```

## Firewall / Security Group Rules Summary
<!-- Résumé des règles non évidentes depuis le diagramme. -->

## Egress Constraints
<!-- Ce qui ne peut PAS sortir, ou qui doit passer par un proxy. -->

## Open Questions
- [ ] <question> → route to $architect / infra

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: <SEM_VERSION (start at 0.1.0)>
ADR: <link or n/a>
Status: DRAFT / APPROVED
Last modified: <DATE>
---
