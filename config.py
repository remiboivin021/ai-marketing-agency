"""Configuration settings for Marketing AI Agency."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Project
    PROJECT_NAME: str = "Marketing AI Agency"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    # LLM (OpenRouter)
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    DEFAULT_LLM_MODEL: str = "anthropic/claude-3-5-sonnet"

    # PostgreSQL
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "marketing_ai"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Qdrant
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_GRPC_PORT: int = 6334
    QDRANT_COLLECTION_NAME: str = "marketing_content"

    @property
    def QDRANT_URL(self) -> str:
        return f"http://{self.QDRANT_HOST}:{self.QDRANT_PORT}"

    # API
    API_V1_PREFIX: str = "/api/v1"
    API_TOKEN: str = "dev-token-change-in-prod"  # Simple static token for v1

    # Run constraints
    MAX_RUN_DURATION_SECONDS: int = 600  # 10 minutes
    MAX_CONTEXT_DOCS: int = 50
    MAX_TOKENS_PER_AGENT: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
