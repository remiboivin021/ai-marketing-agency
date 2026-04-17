"""Base classes for all agents in the Marketing AI Agency system."""

from abc import ABC, abstractmethod
import time
import logging
from typing import Optional

from memory.schemas import AgentContext, AgentOutput, TokenUsage

logger = logging.getLogger(__name__)


class AgentBase(ABC):
    """Abstract base class for all agents.
    
    Invariant: Agents are read-only on storage (Qdrant, PostgreSQL).
    Invariant: run() method signature cannot change without ADR.
    """

    def __init__(self, name: str, role: str, goal: str, backstory: str = ""):
        self.name = name
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self._llm_client = None  # Lazy initialization

    @abstractmethod
    def run(self, context: AgentContext) -> AgentOutput:
        """Execute the agent's logic and return structured output.
        
        This is the only method that should be called by the orchestrator.
        
        Args:
            context: Immutable context containing RAG docs, metrics, user profile
            
        Returns:
            AgentOutput with status, insights, recommendations, and metadata
        """
        pass

    def _build_prompt(self, context: AgentContext) -> str:
        """Build the prompt for this agent based on context.
        
        Override in subclasses to customize prompt structure.
        """
        scope_str = ", ".join(context.scope) if context.scope else "all channels"
        
        docs_context = ""
        if context.semantic_docs:
            docs_context = "\n\n".join([
                f"[{doc.source}] {doc.content[:500]}..." 
                for doc in context.semantic_docs[:10]  # Limit docs in prompt
            ])
        
        metrics_context = ""
        if context.metrics:
            m = context.metrics
            metrics_context = f"""
Performance Metrics (last 30 days):
- LinkedIn: {m.linkedin_posts_count} posts, avg engagement rate: {m.linkedin_avg_engagement_rate:.2%}
- YouTube: {m.youtube_videos_count} videos, avg views: {m.youtube_avg_views}, CTR: {m.youtube_avg_ctr:.2%}
- Website: {m.website_page_views} page views, conversion rate: {m.website_conversion_rate:.2%}
"""
        
        prompt = f"""You are {self.name}, {self.role}.
Your goal: {self.goal}
{f"Background: {self.backstory}" if self.backstory else ""}

User Query: {context.query}
Scope: {scope_str}
{metrics_context}
Relevant Content from Memory:
{docs_context}

Provide your analysis as a structured response with clear insights and actionable recommendations.
"""
        return prompt

    def _call_llm(self, prompt: str, max_tokens: int = 2000) -> tuple[str, TokenUsage]:
        """Call the LLM via OpenRouter.
        
        Returns:
            Tuple of (response_text, token_usage)
            
        Raises:
            Exception: If LLM call fails after retries
        """
        # Import here to avoid circular dependencies and allow mocking in tests
        from config import settings
        
        try:
            import httpx
            
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/marketing-ai-agency",
                "X-Title": "Marketing AI Agency"
            }
            
            payload = {
                "model": settings.DEFAULT_LLM_MODEL,
                "messages": [
                    {"role": "system", "content": f"You are {self.name}, {self.role}. {self.goal}"},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7
            }
            
            response = httpx.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            usage = data.get("usage", {})
            token_usage = TokenUsage(
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                total_tokens=usage.get("total_tokens", 0)
            )
            
            return content, token_usage
            
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            raise

    def _create_output(
        self,
        status: str,
        insights: list[str],
        recommendations: list,
        confidence: float,
        token_usage: Optional[TokenUsage] = None,
        duration_ms: int = 0,
        errors: list[str] = None
    ) -> AgentOutput:
        """Helper to create AgentOutput with common fields.
        
        Subclasses should use this to ensure consistent output format.
        """
        return AgentOutput(
            agent_name=self.name,
            run_id="",  # Will be set by orchestrator
            status=status,
            insights=insights,
            recommendations=recommendations,
            confidence=confidence,
            token_usage=token_usage,
            duration_ms=duration_ms,
            errors=errors or []
        )

    def execute_with_timing(self, context: AgentContext) -> AgentOutput:
        """Wrapper that adds timing and error handling to run().
        
        This ensures all agents log duration and handle exceptions consistently.
        """
        start_time = time.time()
        
        try:
            output = self.run(context)
            output.duration_ms = int((time.time() - start_time) * 1000)
            output.run_id = context.run_id
            return output
            
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            logger.exception(f"Agent {self.name} failed: {e}")
            
            return AgentOutput(
                agent_name=self.name,
                run_id=context.run_id,
                status="failed",
                insights=[],
                recommendations=[],
                confidence=0.0,
                duration_ms=duration_ms,
                errors=[str(e)]
            )
