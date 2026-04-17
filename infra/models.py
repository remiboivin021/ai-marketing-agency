"""Marketing AI Agency Database Models."""

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


def generate_uuid():
    """Generate a UUID4 string."""
    return str(uuid.uuid4())


class Run(Base):
    """Represents a single analysis run triggered by user request."""

    __tablename__ = "runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    query = Column(Text, nullable=False)
    scope = Column(JSON, default=list)  # ["linkedin", "youtube", "website"]
    status = Column(String, nullable=False, default="pending")  # pending, running, completed, failed, timeout
    progress = Column(Integer, default=0)  # 0-100 percentage
    
    # Timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    
    # Results
    report_markdown = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent_outputs = relationship("AgentOutput", back_populates="run", cascade="all, delete-orphan")
    actions = relationship("ActionItem", back_populates="run", cascade="all, delete-orphan")


class AgentOutput(Base):
    """Stores the output of each agent in a run."""

    __tablename__ = "agent_outputs"

    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("runs.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    
    # Results
    status = Column(String, nullable=False)  # ok, partial, failed
    insights = Column(JSON, default=list)  # list of strings
    recommendations = Column(JSON, default=list)  # list of Action dicts
    confidence = Column(Float, nullable=True)
    
    # Metrics
    token_usage_prompt = Column(Integer, nullable=True)
    token_usage_completion = Column(Integer, nullable=True)
    token_usage_total = Column(Integer, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    errors = Column(JSON, default=list)
    
    # Timing
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    run = relationship("Run", back_populates="agent_outputs")


class ActionItem(Base):
    """Prioritized action items extracted from agent recommendations."""

    __tablename__ = "action_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("runs.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    
    # Action details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Integer, nullable=False)  # 1-5, 1 is highest
    estimated_effort = Column(String, default="medium")  # low, medium, high
    
    # Tracking
    status = Column(String, default="pending")  # pending, in_progress, completed, skipped
    completed_at = Column(DateTime, nullable=True)
    
    # Metadata
    related_content_ids = Column(JSON, default=list)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    run = relationship("Run", back_populates="actions")


class ContentItem(Base):
    """Represents ingested content (posts, videos, pages)."""

    __tablename__ = "content_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    content_hash = Column(String, unique=True, nullable=False, index=True)
    
    # Content metadata
    source = Column(String, nullable=False)  # linkedin, youtube, website, manual
    source_url = Column(String, nullable=True)
    source_id = Column(String, nullable=True)  # platform-specific ID
    title = Column(String, nullable=True)
    
    # Content
    content_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    
    # Metrics (denormalized for quick queries)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    ctr = Column(Float, default=0.0)  # click-through rate
    
    # Timestamps
    published_at = Column(DateTime, nullable=True)
    ingested_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes
    __table_args__ = (
        # Composite index for common queries
        {'postgresql_include': ['source', 'published_at', 'engagement_rate']}
    )


class IngestionJob(Base):
    """Tracks ingestion jobs for monitoring and debugging."""

    __tablename__ = "ingestion_jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    source = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, running, completed, failed
    items_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
