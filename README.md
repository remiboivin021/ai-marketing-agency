# Marketing AI Agency (Personal Brand OS)

## Overview

Système multi-agents IA qui analyse la présence en ligne (LinkedIn, YouTube, site web), critique les contenus et produit un plan d'action marketing priorisé pour optimiser le positionnement d'un freelance expert en systèmes embarqués.

## Architecture

Le système suit une architecture en couches strictes :

1. **Ingestion** : Collecte de données depuis LinkedIn, YouTube, site web, et imports manuels
2. **Memory** : RAG Core Memory avec Qdrant (vectoriel) et PostgreSQL (métriques)
3. **Agents** : 10 agents spécialisés orchestrés par CrewAI
4. **Orchestrator** : Chef d'orchestre qui construit le Crew et gère le lifecycle des runs
5. **API** : FastAPI thin wrapper exposant les endpoints REST
6. **Dashboard** : Frontend SPA (à implémenter)

## Quick Start

### Prérequis

- Docker & Docker Compose
- Python 3.12+
- Clé API OpenRouter

### Installation

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env et ajouter OPENROUTER_API_KEY

# Démarrer l'infrastructure (PostgreSQL + Qdrant)
docker-compose up -d postgres qdrant

# Appliquer les migrations DB
alembic upgrade head

# (Optionnel) Démarrer l'application complète
docker-compose up -d
```

### Structure du Projet

```
marketing-ai-agency/
├── ingestion/          # Data collection (scraping, APIs)
├── memory/             # RAG Core Memory (Qdrant + PG clients)
├── agents/             # Agents spécialisés + registry
├── orchestrator/       # CrewAI orchestration
├── api/                # FastAPI endpoints
├── dashboard/          # Frontend SPA
├── infra/              # Docker, Alembic migrations
├── tests/              # Tests unitaires et intégration
└── docs/adr/           # Architecture Decision Records
```

## Invariants Architecturaux

| ID | Invariant | Description |
|----|-----------|-------------|
| I1 | Schéma PostgreSQL | Source de vérité quantitative, migrations Alembic obligatoires |
| I2 | Contrat AgentBase | Signature `run(context: AgentContext) → AgentOutput` immuable sans ADR |
| I3 | Séparation ingestion ↔ agents | Les agents ne fetch jamais de données brutes directement |
| I4 | Orchestrateur = seul caller | Les agents ne s'appellent pas entre eux |
| I5 | Contexte RAG immutable | Snapshot au début du run, pas d'écriture pendant exécution |
| I6 | FastAPI = thin wrapper | Aucune logique métier dans l'API |

## Contrats

### AgentContext (Entrée)

```python
class AgentContext(BaseModel):
    run_id: str
    query: str
    semantic_docs: list[SemanticDoc]
    metrics: MetricsSnapshot
    user_profile: UserProfile
    scope: list[str]
    created_at: datetime
```

### AgentOutput (Sortie)

```python
class AgentOutput(BaseModel):
    agent_name: str
    run_id: str
    status: Literal["ok", "partial", "failed"]
    insights: list[str]
    recommendations: list[Action]
    confidence: float
    token_usage: TokenUsage
    duration_ms: int
    errors: list[str]
```

## API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/runs` | POST | Créer un nouveau run d'analyse |
| `/api/v1/runs/{id}` | GET | Statut d'un run |
| `/api/v1/reports/{run_id}` | GET | Rapport complet d'un run |
| `/api/v1/ingest/{source}` | POST | Déclencher une ingestion |
| `/api/v1/health` | GET | Health check |

## Agents

| Agent | Rôle | Priorité |
|-------|------|----------|
| Knowledge Synthesizer | Chief Knowledge Officer | 1 |
| Strategic Intelligence | Chief Strategy Officer | 2 |
| Content Performance | Content Analytics Lead | 3 |
| Content Critic | Senior Content Editor | 4 |
| Audience Persona | Audience Research Specialist | 5 |
| Growth Experiment | Growth Marketing Lead | 6 |
| YouTube Script | Video Content Strategist | 7 |
| Website Conversion | CRO Specialist | 8 |
| SEO Keyword | SEO Strategist | 9 |
| Brand Voice | Brand Consistency Guardian | 10 |

## Développement

### Ajouter un nouvel agent

1. Créer `agents/nom_agent.py` avec classe héritant de `AgentBase`
2. Implémenter la méthode `run(self, context: AgentContext) -> AgentOutput`
3. Ajouter entrée dans `agents/registry.yaml`
4. Écrire tests unitaires dans `tests/unit/test_nom_agent.py`

### Tests

```bash
# Tests unitaires (sans réseau)
pytest tests/unit -v

# Tests d'intégration (nécessite Docker)
pytest tests/integration -v

# Couverture
pytest --cov=. --cov-report=html
```

## Observabilité

### Logs

Format JSON structuré avec champs obligatoires :
- `timestamp`, `level`, `run_id`, `agent_name`, `event`, `duration_ms`, `details`

### Métriques (Prometheus-compatible)

- `run_started_total{scope}`
- `run_completed_total{status}`
- `agent_run_total{agent_name, status}`
- `agent_duration_ms{agent_name}`
- `llm_retry_total{agent_name}`

## Roadmap

### Phase 1 — Foundation (Semaine 1) ✅
- [x] Config, Docker Compose, schéma DB
- [x] AgentContext / AgentOutput / AgentBase
- [x] Clients Qdrant + PostgreSQL
- [ ] Registry loader

### Phase 2 — Ingestion (Semaine 1-2)
- [ ] Manual loader + embedder
- [ ] Website crawler
- [ ] LinkedIn scraper (fixtures en test)
- [ ] YouTube fetcher + metrics writer

### Phase 3 — Agents Core (Semaine 2-3)
- [ ] Context builder
- [ ] Knowledge Synthesizer
- [ ] Strategic Intelligence + Content Performance
- [ ] Autres agents (1 par fichier)

### Phase 4 — Orchestrateur (Semaine 3)
- [ ] Task planner
- [ ] Crew builder
- [ ] Run manager
- [ ] Report compiler

### Phase 5 — API + Dashboard (Semaine 4)
- [ ] Endpoints FastAPI
- [ ] Middleware logging
- [ ] Dashboard SPA

### Phase 6 — Hardening (Semaine 4-5)
- [ ] Cron watchdog (FM6)
- [ ] Tests de régression golden
- [ ] Documentation ADR

## Constraints

### Ce qui PEUT changer
- Nombre d'agents activés par run
- Prompts internes des agents
- Dashboard UI
- Modèle LLM utilisé

### Ce qui NE PEUT PAS changer sans ADR
- Signature `AgentBase.run()` et modèles `AgentContext` / `AgentOutput`
- Schéma PostgreSQL (migrations Alembic obligatoires)
- Rôle exclusif de l'orchestrateur comme caller d'agents
- Immutabilité du contexte RAG pendant un run
- Règle : les agents sont read-only sur les storages

### Hors scope v1 (YAGNI)
- Publication automatique de contenu
- Multi-utilisateur / multi-tenant
- Fine-tuning de modèles
- Streaming WebSocket vers dashboard
- Cloud deployment

## License

Propriétaire - Usage personnel uniquement.
