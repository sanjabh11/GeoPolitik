"""
Research Pipeline Service
Backend service for academic paper integration, analysis, and insights
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Body
import httpx
import os
import json
import logging
from datetime import datetime, timedelta
import asyncio
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Pydantic models
class ResearchQuery(BaseModel):
    query: str
    sources: List[str] = ["papers_with_code", "arxiv", "semantic_scholar"]
    timeframe: str = "6m"  # 1m, 3m, 6m, 1y, 2y
    min_citations: int = 10
    max_results: int = 20
    topics: List[str] = []
    user_id: Optional[str] = None

class ResearchPaper(BaseModel):
    id: str
    title: str
    authors: List[str]
    abstract: str
    url: str
    pdf_url: Optional[str] = None
    published_date: str
    citations: int
    venue: str
    topics: List[str]
    github_url: Optional[str] = None
    datasets: List[str]
    methods: List[str]
    relevance_score: float

class ResearchInsights(BaseModel):
    papers: List[ResearchPaper]
    trends: Dict[str, Any]
    recommendations: Dict[str, Any]
    summary: str
    generated_at: str

class TrendAnalysis(BaseModel):
    emerging_topics: List[str]
    methodology_evolution: List[str]
    performance_metrics: Dict[str, float]
    key_insights: List[str]

class ResearchPipelineService:
    def __init__(self):
        self.papers_with_code_key = os.getenv('PAPERS_WITH_CODE_API_KEY')
        self.semantic_scholar_key = os.getenv('SEMANTIC_SCHOLAR_API_KEY')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

    async def search_papers(self, query: ResearchQuery) -> ResearchInsights:
        """Search academic papers from multiple sources"""
        
        papers = []
        
        # Search Papers with Code
        if "papers_with_code" in query.sources:
            pwc_papers = await self._search_papers_with_code(query)
            papers.extend(pwc_papers)
        
        # Search ArXiv
        if "arxiv" in query.sources:
            arxiv_papers = await self._search_arxiv(query)
            papers.extend(arxiv_papers)
        
        # Search Semantic Scholar
        if "semantic_scholar" in query.sources:
            ss_papers = await self._search_semantic_scholar(query)
            papers.extend(ss_papers)
        
        # Enhance with AI analysis
        enhanced_papers = await self._enhance_papers_with_ai(papers, query)
        
        # Generate insights
        insights = await self._generate_insights(enhanced_papers, query)
        
        return ResearchInsights(
            papers=enhanced_papers,
            trends=insights["trends"],
            recommendations=insights["recommendations"],
            summary=insights["summary"],
            generated_at=datetime.utcnow().isoformat()
        )

    async def _search_papers_with_code(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Search Papers with Code API"""
        
        try:
            # Mock implementation - replace with actual Papers with Code API
            mock_papers = [
                {
                    "id": "pwc-001",
                    "title": "Deep Reinforcement Learning for Game Theory Applications",
                    "authors": ["Smith, J.", "Johnson, A.", "Williams, R."],
                    "abstract": "This paper explores the application of deep reinforcement learning techniques to game theory problems...",
                    "url": "https://paperswithcode.com/paper/deep-reinforcement-learning-game-theory",
                    "pdf_url": "https://arxiv.org/pdf/2024.001.pdf",
                    "published_date": "2024-01-15",
                    "citations": 45,
                    "venue": "NeurIPS 2024",
                    "topics": ["reinforcement-learning", "game-theory", "multi-agent-systems"],
                    "github_url": "https://github.com/example/game-theory-rl",
                    "datasets": ["OpenSpiel", "PettingZoo"],
                    "methods": ["Deep Q-Learning", "Policy Gradients", "MARL"],
                    "relevance_score": 0.95
                }
            ]
            
            return [ResearchPaper(**paper) for paper in mock_papers]
            
        except Exception as e:
            logger.error(f"Error searching Papers with Code: {e}")
            return []

    async def _search_arxiv(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Search ArXiv API"""
        
        try:
            # Mock implementation - replace with actual ArXiv API
            arxiv_query = query.query.replace(" ", "+")
            mock_papers = [
                {
                    "id": "arxiv-001",
                    "title": "Nash Equilibrium Computation in Large Games",
                    "authors": ["Chen, L.", "Zhang, M.", "Liu, K."],
                    "abstract": "We present novel algorithms for computing Nash equilibria in large-scale games...",
                    "url": f"https://arxiv.org/abs/2401.{hash(query.query) % 10000}",
                    "pdf_url": f"https://arxiv.org/pdf/2401.{hash(query.query) % 10000}.pdf",
                    "published_date": "2024-01-10",
                    "citations": 32,
                    "venue": "arXiv preprint",
                    "topics": ["nash-equilibrium", "algorithms", "large-scale-games"],
                    "github_url": None,
                    "datasets": ["GAMUT", "NashLib"],
                    "methods": ["Lemke-Howson", "Support Enumeration", "Global Newton"],
                    "relevance_score": 0.88
                }
            ]
            
            return [ResearchPaper(**paper) for paper in mock_papers]
            
        except Exception as e:
            logger.error(f"Error searching ArXiv: {e}")
            return []

    async def _search_semantic_scholar(self, query: ResearchQuery) -> List[ResearchPaper]:
        """Search Semantic Scholar API"""
        
        try:
            # Mock implementation - replace with actual Semantic Scholar API
            mock_papers = [
                {
                    "id": "ss-001",
                    "title": "Coalition Formation Games: Theory and Applications",
                    "authors": ["Thompson, D.", "Anderson, P.", "Roberts, S."],
                    "abstract": "A comprehensive analysis of coalition formation games and their applications...",
                    "url": "https://www.semanticscholar.org/paper/coalition-formation-games",
                    "pdf_url": "https://pdfs.semanticscholar.org/example.pdf",
                    "published_date": "2023-12-20",
                    "citations": 67,
                    "venue": "Journal of Game Theory",
                    "topics": ["coalition-formation", "cooperative-games", "applications"],
                    "github_url": "https://github.com/example/coalition-games",
                    "datasets": ["CoalitionGameDB"],
                    "methods": ["Core Stability", "Shapley Value", "Nucleolus"],
                    "relevance_score": 0.92
                }
            ]
            
            return [ResearchPaper(**paper) for paper in mock_papers]
            
        except Exception as e:
            logger.error(f"Error searching Semantic Scholar: {e}")
            return []

    async def _enhance_papers_with_ai(self, papers: List[ResearchPaper], query: ResearchQuery) -> List[ResearchPaper]:
        """Enhance papers with AI-generated insights"""
        
        prompt = f"""
        Analyze these research papers for relevance to game theory and geopolitical prediction:
        
        Papers: {json.dumps([paper.dict() for paper in papers], indent=2)}
        
        Query: {query.query}
        Topics: {query.topics}
        
        Enhance each paper with:
        1. Relevance score (0-1) based on query match
        2. Key contributions to game theory
        3. Practical applications
        4. Implementation potential
        5. Code availability assessment
        
        Return JSON format with enhanced paper data.
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.gemini_url,
                    headers={
                        "Authorization": f"Bearer {self.gemini_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.3,
                            "maxOutputTokens": 2000,
                            "response_mime_type": "application/json"
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    enhanced_data = json.loads(result["candidates"][0]["content"]["parts"][0]["text"])
                    
                    # Update papers with enhanced data
                    for i, paper in enumerate(papers):
                        if i < len(enhanced_data.get("papers", [])):
                            enhanced = enhanced_data["papers"][i]
                            paper.relevance_score = enhanced.get("relevance_score", paper.relevance_score)
                            paper.topics = enhanced.get("topics", paper.topics)
                
        except Exception as e:
            logger.error(f"Error enhancing papers with AI: {e}")
        
        return papers

    async def _generate_insights(self, papers: List[ResearchPaper], query: ResearchQuery) -> Dict[str, Any]:
        """Generate insights and trends from research papers"""
        
        prompt = f"""
        Analyze these research papers to identify trends and insights:
        
        Papers: {json.dumps([paper.dict() for paper in papers], indent=2)}
        
        Generate comprehensive insights including:
        1. Emerging research trends
        2. Key methodological developments
        3. Performance metrics and benchmarks
        4. Practical applications and implementations
        5. Research gaps and opportunities
        6. Recommendations for platform integration
        
        Format as JSON with these keys: trends, recommendations, summary
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.gemini_url,
                    headers={
                        "Authorization": f"Bearer {self.gemini_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.2,
                            "maxOutputTokens": 1500,
                            "response_mime_type": "application/json"
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return json.loads(result["candidates"][0]["content"]["parts"][0]["text"])
                
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
        
        # Fallback insights
        return {
            "trends": {
                "emerging_topics": ["multi-agent systems", "reinforcement learning", "game theory applications"],
                "methodology_evolution": ["deep learning integration", "scalable algorithms", "real-world applications"],
                "performance_metrics": {"accuracy": 0.85, "efficiency": 0.78, "scalability": 0.82}
            },
            "recommendations": {
                "platform_integrations": ["implement latest algorithms", "add visualization tools", "create interactive tutorials"],
                "research_opportunities": ["benchmark comparisons", "algorithm optimization", "real-world testing"],
                "curriculum_updates": ["add new methods", "update examples", "include recent papers"]
            },
            "summary": "Analysis of recent research in game theory and geopolitical prediction."
        }

    async def get_trend_analysis(self, topics: List[str], timeframe: str = "6m") -> TrendAnalysis:
        """Get trend analysis for specific topics"""
        
        query = ResearchQuery(
            query="trend analysis",
            topics=topics,
            timeframe=timeframe,
            max_results=50
        )
        
        insights = await self.search_papers(query)
        
        # Extract trends from insights
        return TrendAnalysis(
            emerging_topics=insights.trends.get("emerging_topics", []),
            methodology_evolution=insights.trends.get("methodology_evolution", []),
            performance_metrics=insights.trends.get("performance_metrics", {}),
            key_insights=insights.summary.split(". ")
        )

    async def get_research_recommendations(self, user_level: str, interests: List[str]) -> Dict[str, Any]:
        """Get personalized research recommendations"""
        
        query = ResearchQuery(
            query=f"{user_level} level {', '.join(interests)}",
            topics=interests,
            max_results=10
        )
        
        insights = await self.search_papers(query)
        
        return {
            "recommended_papers": [paper.dict() for paper in insights.papers[:5]],
            "learning_path": insights.recommendations.get("curriculum_updates", []),
            "practical_applications": insights.recommendations.get("platform_integrations", []),
            "next_topics": insights.trends.get("emerging_topics", [])[:3]
        }

# FastAPI router
router = APIRouter(prefix="/research", tags=["research"])
service = ResearchPipelineService()

@router.post("/search", response_model=ResearchInsights)
async def search_research_papers(
    query: ResearchQuery
):
    """Search academic papers from multiple sources"""
    return await service.search_papers(query)

@router.get("/trends", response_model=TrendAnalysis)
async def get_trend_analysis(
    topics: List[str] = Query(..., description="Topics to analyze"),
    timeframe: str = Query("6m", description="Timeframe for analysis")
):
    """Get trend analysis for specific topics"""
    return await service.get_trend_analysis(topics, timeframe)

@router.get("/recommendations")
async def get_research_recommendations(
    user_level: str = Query(..., description="User's current level"),
    interests: List[str] = Query(..., description="User's research interests")
):
    """Get personalized research recommendations"""
    return await service.get_research_recommendations(user_level, interests)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
