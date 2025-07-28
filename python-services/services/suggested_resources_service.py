"""
Suggested Resources Service
AI-driven resource recommendations based on lesson context and user progress
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Depends
import httpx
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Pydantic models
class ResourceContext(BaseModel):
    current_topic: str
    current_level: str
    user_progress: Dict[str, Any]
    completed_resources: List[str]
    search_query: Optional[str] = None

class SuggestedResource(BaseModel):
    id: str
    title: str
    type: str  # 'book', 'video', 'paper', 'tutorial'
    description: str
    relevance_score: float
    difficulty_level: str
    estimated_time: str
    url: str
    thumbnail_url: Optional[str] = None
    tags: List[str]
    prerequisites: List[str]
    next_steps: List[str]

class SuggestedResourcesResponse(BaseModel):
    resources: List[SuggestedResource]
    total_count: int
    confidence_score: float
    generated_at: str

class SuggestedResourcesService:
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

    async def generate_suggestions(self, context: ResourceContext) -> SuggestedResourcesResponse:
        """Generate AI-driven resource recommendations based on context"""
        
        prompt = self._build_recommendation_prompt(context)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.gemini_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.3,
                            "maxOutputTokens": 2048,
                            "response_mime_type": "application/json"
                        }
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="AI service unavailable")
                
                result = response.json()
                ai_response = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Parse JSON response
                import json
                suggestions_data = json.loads(ai_response)
                
                return SuggestedResourcesResponse(
                    resources=[SuggestedResource(**item) for item in suggestions_data["resources"]],
                    total_count=len(suggestions_data["resources"]),
                    confidence_score=suggestions_data.get("confidence_score", 0.8),
                    generated_at=datetime.utcnow().isoformat()
                )
                
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            # Fallback to basic recommendations
            return await self._generate_fallback_suggestions(context)

    def _build_recommendation_prompt(self, context: ResourceContext) -> str:
        return f"""
        You are an expert educational AI assistant. Generate personalized resource recommendations for a game theory and geopolitics learning platform.
        
        Current Context:
        - Topic: {context.current_topic}
        - Level: {context.current_level}
        - User Progress: {context.user_progress}
        - Completed Resources: {len(context.completed_resources)}
        - Search Query: {context.search_query or 'None'}
        
        Generate 5-8 highly relevant resources (books, videos, papers, tutorials) that:
        1. Build logically on the current topic
        2. Match the user's skill level
        3. Fill knowledge gaps based on progress
        4. Include estimated time commitments
        5. Provide clear prerequisites and next steps
        
        Return JSON format:
        {{
            "resources": [
                {{
                    "id": "unique-id",
                    "title": "Resource title",
                    "type": "book|video|paper|tutorial",
                    "description": "Brief description",
                    "relevance_score": 0.85,
                    "difficulty_level": "beginner|intermediate|advanced",
                    "estimated_time": "30-45 minutes",
                    "url": "https://example.com/resource",
                    "thumbnail_url": "optional",
                    "tags": ["game-theory", "nash-equilibrium"],
                    "prerequisites": ["basic-game-theory"],
                    "next_steps": ["advanced-strategies"]
                }}
            ],
            "confidence_score": 0.9
        }}
        """

    async def _generate_fallback_suggestions(self, context: ResourceContext) -> SuggestedResourcesResponse:
        """Generate basic fallback recommendations when AI service is unavailable"""
        
        # Mock data based on topic mappings
        topic_mappings = {
            "prisoners-dilemma": [
                {
                    "id": "book-001",
                    "title": "The Evolution of Cooperation",
                    "type": "book",
                    "description": "Classic text on cooperation in game theory",
                    "relevance_score": 0.9,
                    "difficulty_level": "intermediate",
                    "estimated_time": "2-3 hours",
                    "url": "https://press.princeton.edu/books/paperback/9780691024909/the-evolution-of-cooperation",
                    "tags": ["game-theory", "cooperation", "prisoners-dilemma"],
                    "prerequisites": ["basic-game-theory"],
                    "next_steps": ["iterated-games", "evolutionary-game-theory"]
                }
            ],
            "nash-equilibrium": [
                {
                    "id": "video-001",
                    "title": "Nash Equilibrium Explained",
                    "type": "video",
                    "description": "Visual explanation of Nash equilibrium concepts",
                    "relevance_score": 0.95,
                    "difficulty_level": "beginner",
                    "estimated_time": "15-20 minutes",
                    "url": "https://www.youtube.com/watch?v=example",
                    "tags": ["nash-equilibrium", "visual-learning"],
                    "prerequisites": ["basic-game-theory"],
                    "next_steps": ["mixed-strategies", "bayesian-games"]
                }
            ]
        }
        
        # Default recommendations
        default_resources = [
            {
                "id": "tutorial-001",
                "title": "Interactive Game Theory Tutorial",
                "type": "tutorial",
                "description": "Comprehensive interactive introduction to game theory",
                "relevance_score": 0.8,
                "difficulty_level": "beginner",
                "estimated_time": "45-60 minutes",
                "url": "/tutorials/game-theory-basics",
                "tags": ["interactive", "tutorial", "basics"],
                "prerequisites": [],
                "next_steps": ["advanced-concepts", "case-studies"]
            }
        ]
        
        resources = topic_mappings.get(context.current_topic.lower(), default_resources)
        
        return SuggestedResourcesResponse(
            resources=[SuggestedResource(**resource) for resource in resources],
            total_count=len(resources),
            confidence_score=0.6,  # Lower confidence for fallback
            generated_at=datetime.utcnow().isoformat()
        )

# FastAPI router
router = APIRouter(prefix="/suggested-resources", tags=["resources"])
service = SuggestedResourcesService()

@router.get("/", response_model=SuggestedResourcesResponse)
async def get_suggested_resources(
    current_topic: str = Query(..., description="Current learning topic"),
    current_level: str = Query(..., description="User's current skill level"),
    user_id: Optional[str] = Query(None, description="User ID for personalization")
):
    """Get AI-driven resource suggestions"""
    
    # Mock user progress for now
    context = ResourceContext(
        current_topic=current_topic,
        current_level=current_level,
        user_progress={"completed_modules": ["basic-game-theory"]},
        completed_resources=["tutorial-001", "book-001"]
    )
    
    return await service.generate_suggestions(context)

@router.post("/", response_model=SuggestedResourcesResponse)
async def generate_suggestions_with_context(
    context: ResourceContext
):
    """Generate resource suggestions with detailed context"""
    return await service.generate_suggestions(context)
