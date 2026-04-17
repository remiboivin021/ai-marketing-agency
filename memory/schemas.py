"""Memory layer schemas for Marketing AI Agency."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class SemanticDoc(BaseModel):
    """A document chunk retrieved from Qdrant."""

    id: str
    content: str
    source: str  # "linkedin", "youtube", "website", "manual"
    content_hash: str
    score: float = Field(ge=0.0, le=1.0)
    metadata: dict = Field(default_factory=dict)


class MetricsSnapshot(BaseModel):
    """Aggregated metrics from PostgreSQL for the last 30 days."""

    linkedin_posts_count: int = 0
    linkedin_avg_engagement_rate: float = 0.0
    youtube_videos_count: int = 0
    youtube_avg_views: int = 0
    youtube_avg_ctr: float = 0.0
    website_page_views: int = 0
    website_conversion_rate: float = 0.0
    period_start: datetime
    period_end: datetime


class UserProfile(BaseModel):
    """User profile information for context."""

    name: str = "Rémi"
    expertise: list[str] = Field(default_factory=lambda: ["systèmes embarqués"])
    target_audiences: list[str] = Field(default_factory=list)
    content_goals: list[str] = Field(default_factory=list)
    brand_voice_attributes: list[str] = Field(default_factory=list)


class AgentContext(BaseModel):
    """Universal input contract for all agents.
    
    Invariant: This context is immutable during a run (frozen).
    """

    run_id: str
    query: str
    semantic_docs: list[SemanticDoc] = Field(default_factory=list)
    metrics: Optional[MetricsSnapshot] = None
    user_profile: UserProfile = Field(default_factory=UserProfile)
    scope: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        frozen = True


class TokenUsage(BaseModel):
    """Token usage tracking for an agent run."""

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class Action(BaseModel):
    """A recommended action from an agent."""

    title: str
    description: str
    priority: int = Field(ge=1, le=5)  # 1 = highest priority
    estimated_effort: str = "medium"  # "low", "medium", "high"
    related_content_ids: list[str] = Field(default_factory=list)


class AgentOutput(BaseModel):
    """Universal output contract for all agents.
    
    Invariant: status is always present, insights can be empty if partial/failed.
    """

    agent_name: str
    run_id: str
    status: str  # "ok", "partial", "failed"
    insights: list[str] = Field(default_factory=list)
    recommendations: list[Action] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0, default=0.5)
    token_usage: Optional[TokenUsage] = None
    duration_ms: int = 0
    errors: list[str] = Field(default_factory=list)
