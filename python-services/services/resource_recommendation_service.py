"""
Resource recommendation service
Provides AI-driven personalized resource recommendations based on user behavior and preferences
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Body
import uuid
import json
import logging
from datetime import datetime
import asyncio
from enum import Enum
import os

logger = logging.getLogger(__name__)

class ResourceType(str, Enum):
    BOOK = "book"
    VIDEO = "video"
    ARTICLE = "article"
    COURSE = "course"
    TUTORIAL = "tutorial"
    RESEARCH_PAPER = "research_paper"

class RecommendationReason(str, Enum):
    BASED_ON_HISTORY = "based_on_history"
    SIMILAR_USERS = "similar_users"
    TRENDING = "trending"
    COMPLETION_PATH = "completion_path"
    SKILL_GAP = "skill_gap"

class UserResourceInteraction(BaseModel):
    user_id: str
    resource_id: str
    resource_type: ResourceType
    interaction_type: str  # "view", "read", "watch", "complete", "bookmark", "rate"
    duration: Optional[int] = None  # in seconds
    rating: Optional[int] = None  # 1-5 stars
    timestamp: str
    context: Dict[str, Any] = {}

class ResourceMetadata(BaseModel):
    id: str
    title: str
    description: str
    type: ResourceType
    difficulty: str  # "beginner", "intermediate", "advanced", "expert"
    topics: List[str]
    duration: Optional[int] = None  # estimated time in minutes
    url: str
    thumbnail_url: Optional[str]
    author: str
    source: str
    tags: List[str]
    prerequisites: List[str]
    learning_outcomes: List[str]
    created_at: str
    updated_at: str

class RecommendedResource(BaseModel):
    resource: ResourceMetadata
    score: float
    reason: RecommendationReason
    explanation: str
    confidence: float
    estimated_completion_time: Optional[int]
    next_resources: List[str]

class ResourceRecommendationRequest(BaseModel):
    user_id: str
    topics: List[str]
    difficulty: Optional[str] = None
    resource_types: List[ResourceType]
    max_results: int = 10
    exclude_completed: bool = True
    learning_goals: List[str]

class ResourceRecommendationResponse(BaseModel):
    recommendations: List[RecommendedResource]
    user_id: str
    query_id: str
    generated_at: str
    total_available: int
    confidence_score: float

class ResourceRecommendationService:
    def __init__(self):
        self.user_interactions: Dict[str, List[UserResourceInteraction]] = {}
        self.resources: Dict[str, ResourceMetadata] = {}
        self.recommendation_cache: Dict[str, List[RecommendedResource]] = {}
        
        # Mock data for demonstration
        self._initialize_mock_data()
    
    def _initialize_mock_data(self):
        """Initialize mock resources for demonstration"""
        
        mock_resources = [
            ResourceMetadata(
                id="book_001",
                title="Introduction to Game Theory",
                description="Comprehensive introduction to game theory concepts",
                type=ResourceType.BOOK,
                difficulty="beginner",
                topics=["game_theory", "nash_equilibrium", "prisoners_dilemma"],
                duration=480,  # 8 hours
                url="/api/books/book_001",
                thumbnail_url="https://example.com/book1.jpg",
                author="John Nash",
                source="open_library",
                tags=["fundamentals", "mathematics"],
                prerequisites=["basic_mathematics"],
                learning_outcomes=["understand_nash_equilibrium", "solve_simple_games"],
                created_at="2024-01-01T00:00:00Z",
                updated_at="2024-01-01T00:00:00Z"
            ),
            ResourceMetadata(
                id="video_001",
                title="Game Theory Explained",
                description="Visual explanation of game theory concepts",
                type=ResourceType.VIDEO,
                difficulty="beginner",
                topics=["game_theory", "visual_learning"],
                duration=45,  # 45 minutes
                url="/api/videos/video_001",
                thumbnail_url="https://example.com/video1.jpg",
                author="MIT OpenCourseWare",
                source="youtube",
                tags=["lecture", "visual"],
                prerequisites=[],
                learning_outcomes=["visualize_game_theory", "understand_basic_concepts"],
                created_at="2024-01-02T00:00:00Z",
                updated_at="2024-01-02T00:00:00Z"
            ),
            ResourceMetadata(
                id="article_001",
                title="Advanced Game Theory Applications",
                description="Research paper on advanced game theory applications",
                type=ResourceType.ARTICLE,
                difficulty="advanced",
                topics=["game_theory", "mechanism_design", "auctions"],
                duration=120,  # 2 hours
                url="/api/articles/article_001",
                thumbnail_url="https://example.com/article1.jpg",
                author="Research Team",
                source="arxiv",
                tags=["research", "advanced"],
                prerequisites=["game_theory_basics", "mathematics"],
                learning_outcomes=["understand_mechanism_design", "analyze_auctions"],
                created_at="2024-01-03T00:00:00Z",
                updated_at="2024-01-03T00:00:00Z"
            )
        ]
        
        for resource in mock_resources:
            self.resources[resource.id] = resource
    
    async def record_interaction(self, interaction: UserResourceInteraction) -> bool:
        """Record a user interaction with a resource"""
        
        user_id = interaction.user_id
        if user_id not in self.user_interactions:
            self.user_interactions[user_id] = []
        
        self.user_interactions[user_id].append(interaction)
        
        # Clear cache for this user
        if user_id in self.recommendation_cache:
            del self.recommendation_cache[user_id]
        
        return True
    
    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user learning profile based on interactions"""
        
        interactions = self.user_interactions.get(user_id, [])
        
        if not interactions:
            return {
                "user_id": user_id,
                "completed_resources": [],
                "favorite_topics": [],
                "preferred_difficulty": "beginner",
                "total_learning_time": 0,
                "average_rating": None,
                "learning_goals": []
            }
        
        # Analyze user behavior
        completed_resources = [i.resource_id for i in interactions if i.interaction_type == "complete"]
        topics = []
        difficulties = []
        total_time = 0
        ratings = []
        
        for interaction in interactions:
            resource = self.resources.get(interaction.resource_id)
            if resource:
                topics.extend(resource.topics)
                difficulties.append(resource.difficulty)
                if interaction.duration:
                    total_time += interaction.duration
                if interaction.rating:
                    ratings.append(interaction.rating)
        
        return {
            "user_id": user_id,
            "completed_resources": completed_resources,
            "favorite_topics": list(set(topics)),
            "preferred_difficulty": max(set(difficulties), key=difficulties.count) if difficulties else "beginner",
            "total_learning_time": total_time,
            "average_rating": sum(ratings) / len(ratings) if ratings else None,
            "learning_goals": ["improve_game_theory_knowledge", "understand_practical_applications"]
        }
    
    async def generate_recommendations(self, request: ResourceRecommendationRequest) -> ResourceRecommendationResponse:
        """Generate personalized resource recommendations"""
        
        user_id = request.user_id
        user_profile = await self.get_user_profile(user_id)
        
        # Filter resources based on criteria
        candidate_resources = []
        for resource_id, resource in self.resources.items():
            # Check resource type
            if resource.type not in request.resource_types:
                continue
            
            # Check difficulty
            if request.difficulty and resource.difficulty != request.difficulty:
                continue
            
            # Check topics
            if request.topics and not any(topic in resource.topics for topic in request.topics):
                continue
            
            # Check if already completed
            if request.exclude_completed and resource_id in user_profile["completed_resources"]:
                continue
            
            candidate_resources.append(resource)
        
        # Calculate recommendation scores
        recommendations = []
        for resource in candidate_resources:
            score = await self.calculate_recommendation_score(user_profile, resource, request)
            
            if score > 0:
                recommendation = RecommendedResource(
                    resource=resource,
                    score=score,
                    reason=RecommendationReason.BASED_ON_HISTORY,
                    explanation=f"Recommended based on your interest in {', '.join(resource.topics)}",
                    confidence=score,
                    estimated_completion_time=resource.duration,
                    next_resources=[r.id for r in candidate_resources if r.id != resource.id][:3]
                )
                recommendations.append(recommendation)
        
        # Sort by score
        recommendations.sort(key=lambda x: x.score, reverse=True)
        
        # Limit results
        recommendations = recommendations[:request.max_results]
        
        response = ResourceRecommendationResponse(
            recommendations=recommendations,
            user_id=user_id,
            query_id=str(uuid.uuid4()),
            generated_at=datetime.utcnow().isoformat(),
            total_available=len(candidate_resources),
            confidence_score=0.85  # Mock confidence score
        )
        
        # Cache the response
        self.recommendation_cache[user_id] = recommendations
        
        return response
    
    async def calculate_recommendation_score(self, user_profile: Dict[str, Any], resource: ResourceMetadata, request: ResourceRecommendationRequest) -> float:
        """Calculate recommendation score based on user profile and resource"""
        
        score = 0.0
        
        # Topic relevance
        user_topics = user_profile["favorite_topics"]
        resource_topics = resource.topics
        topic_overlap = len(set(user_topics) & set(resource_topics))
        score += topic_overlap * 0.3
        
        # Difficulty match
        if user_profile["preferred_difficulty"] == resource.difficulty:
            score += 0.2
        elif user_profile["preferred_difficulty"] in ["intermediate", "advanced"] and resource.difficulty == "advanced":
            score += 0.1
        
        # Learning goals alignment
        for goal in request.learning_goals:
            if any(goal.lower() in topic.lower() for topic in resource.topics):
                score += 0.25
        
        # Resource quality (mock data)
        if resource.author in ["MIT OpenCourseWare", "Stanford", "Harvard"]:
            score += 0.15
        
        # Recency bonus
        created_date = datetime.fromisoformat(resource.created_at.replace('Z', '+00:00'))
        if (datetime.utcnow() - created_date).days < 30:
            score += 0.1
        
        return min(score, 1.0)  # Cap at 1.0
    
    async def get_trending_resources(self, resource_types: List[ResourceType], limit: int = 10) -> List[RecommendedResource]:
        """Get trending resources"""
        
        trending = []
        for resource in self.resources.values():
            if resource.type in resource_types:
                recommendation = RecommendedResource(
                    resource=resource,
                    score=0.8,  # Mock trending score
                    reason=RecommendationReason.TRENDING,
                    explanation="Trending in the community",
                    confidence=0.8,
                    estimated_completion_time=resource.duration,
                    next_resources=[]
                )
                trending.append(recommendation)
        
        return trending[:limit]
    
    async def get_completion_path(self, user_id: str, goal: str) -> List[RecommendedResource]:
        """Get recommended completion path for a learning goal"""
        
        # Mock completion path generation
        path = []
        
        # Basic resources
        basic_resources = [r for r in self.resources.values() if r.difficulty == "beginner"]
        intermediate_resources = [r for r in self.resources.values() if r.difficulty == "intermediate"]
        advanced_resources = [r for r in self.resources.values() if r.difficulty == "advanced"]
        
        # Create path based on goal
        if goal == "master_game_theory":
            path.extend([
                RecommendedResource(
                    resource=basic_resources[0],
                    score=1.0,
                    reason=RecommendationReason.COMPLETION_PATH,
                    explanation="Essential foundation for game theory",
                    confidence=1.0,
                    estimated_completion_time=basic_resources[0].duration,
                    next_resources=[r.id for r in intermediate_resources[:2]]
                ),
                RecommendedResource(
                    resource=intermediate_resources[0],
                    score=0.9,
                    reason=RecommendationReason.COMPLETION_PATH,
                    explanation="Builds upon basic concepts",
                    confidence=0.9,
                    estimated_completion_time=intermediate_resources[0].duration,
                    next_resources=[r.id for r in advanced_resources[:1]]
                )
            ])
        
        return path

# FastAPI router
router = APIRouter(prefix="/api/suggested-resources", tags=["suggested-resources"])
service = ResourceRecommendationService()

@router.post("/recommend", response_model=ResourceRecommendationResponse)
async def get_recommendations(request: ResourceRecommendationRequest):
    """Get personalized resource recommendations"""
    return await service.generate_recommendations(request)

@router.post("/interactions")
async def record_interaction(interaction: UserResourceInteraction):
    """Record user interaction with a resource"""
    return {"success": await service.record_interaction(interaction)}

@router.get("/trending")
async def get_trending_resources(
    resource_types: List[ResourceType] = Query(..., description="Resource types to include"),
    limit: int = Query(10, ge=1, le=50)
):
    """Get trending resources"""
    return await service.get_trending_resources(resource_types, limit)

@router.get("/completion-path/{user_id}")
async def get_completion_path(
    user_id: str,
    goal: str = Query(..., description="Learning goal")
):
    """Get recommended completion path for a learning goal"""
    return await service.get_completion_path(user_id, goal)

@router.get("/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user learning profile"""
    return await service.get_user_profile(user_id)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
