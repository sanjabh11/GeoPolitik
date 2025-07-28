"""
Advanced Analytics Service
Backend service for natural language queries, ensemble predictions, and automated reports
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
class NLQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

class NLQueryResponse(BaseModel):
    query: str
    response: Dict[str, Any]
    confidence: float
    sources: List[str]
    generated_at: str
    processing_time: float

class EnsemblePredictionRequest(BaseModel):
    models: List[str]
    data: Dict[str, Any]
    scenario: str
    timeframe: str
    user_id: Optional[str] = None

class EnsemblePredictionResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    consensus_score: float
    confidence_intervals: Dict[str, List[float]]
    key_factors: List[str]
    generated_at: str

class AutomatedReportRequest(BaseModel):
    report_type: str  # 'risk_assessment', 'economic_analysis', 'crisis_report', 'strategic_overview'
    data_sources: List[str]
    timeframe: str
    include_visualizations: bool = True
    user_id: Optional[str] = None

class AutomatedReportResponse(BaseModel):
    report_id: str
    title: str
    sections: List[Dict[str, str]]
    visualizations: List[Dict[str, Any]]
    summary: str
    generated_at: str

class AdvancedAnalyticsService:
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"
        self.news_api_key = os.getenv('NEWS_API_KEY')

    async def process_natural_language_query(self, request: NLQueryRequest) -> NLQueryResponse:
        """Process natural language queries with AI analysis"""
        
        start_time = datetime.utcnow()
        
        prompt = self._build_nl_query_prompt(request)
        
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
                            "temperature": 0.2,
                            "maxOutputTokens": 2048,
                            "response_mime_type": "application/json"
                        }
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="AI service unavailable")
                
                result = response.json()
                ai_response = json.loads(result["candidates"][0]["content"]["parts"][0]["text"])
                
                processing_time = (datetime.utcnow() - start_time).total_seconds()
                
                return NLQueryResponse(
                    query=request.query,
                    response=ai_response,
                    confidence=ai_response.get("confidence", 0.8),
                    sources=ai_response.get("sources", ["AI analysis"]),
                    generated_at=datetime.utcnow().isoformat(),
                    processing_time=processing_time
                )
                
        except Exception as e:
            logger.error(f"Error processing NL query: {e}")
            return await self._fallback_nl_response(request)

    async def generate_ensemble_prediction(self, request: EnsemblePredictionRequest) -> EnsemblePredictionResponse:
        """Generate ensemble predictions from multiple models"""
        
        prompt = self._build_ensemble_prompt(request)
        
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
                            "temperature": 0.1,
                            "maxOutputTokens": 2048,
                            "response_mime_type": "application/json"
                        }
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="AI service unavailable")
                
                result = response.json()
                ensemble_result = json.loads(result["candidates"][0]["content"]["parts"][0]["text"])
                
                return EnsemblePredictionResponse(
                    predictions=ensemble_result["predictions"],
                    consensus_score=ensemble_result.get("consensus_score", 0.75),
                    confidence_intervals=ensemble_result.get("confidence_intervals", {}),
                    key_factors=ensemble_result.get("key_factors", []),
                    generated_at=datetime.utcnow().isoformat()
                )
                
        except Exception as e:
            logger.error(f"Error generating ensemble prediction: {e}")
            return await self._fallback_ensemble_response(request)

    async def generate_automated_report(self, request: AutomatedReportRequest) -> AutomatedReportResponse:
        """Generate comprehensive automated reports"""
        
        prompt = self._build_report_prompt(request)
        
        try:
            # Fetch additional data sources
            additional_data = await self._fetch_report_data(request.data_sources, request.timeframe)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.gemini_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "contents": [{"parts": [{"text": prompt + f"\n\nAdditional Data: {json.dumps(additional_data, indent=2)}"}]}],
                        "generationConfig": {
                            "temperature": 0.2,
                            "maxOutputTokens": 3000,
                            "response_mime_type": "application/json"
                        }
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="AI service unavailable")
                
                result = response.json()
                report_data = json.loads(result["candidates"][0]["content"]["parts"][0]["text"])
                
                return AutomatedReportResponse(
                    report_id=f"report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    title=report_data["title"],
                    sections=report_data["sections"],
                    visualizations=report_data.get("visualizations", []),
                    summary=report_data["summary"],
                    generated_at=datetime.utcnow().isoformat()
                )
                
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return await self._fallback_report_response(request)

    def _build_nl_query_prompt(self, request: NLQueryRequest) -> str:
        return f"""
        Analyze this geopolitical/game theory question and provide a comprehensive, data-driven response:
        
        Question: {request.query}
        Context: {request.context or 'General inquiry'}
        
        Provide a structured response including:
        1. Direct answer to the question
        2. Supporting analysis with data
        3. Confidence level (0-1)
        4. Key factors and assumptions
        5. Sources and methodology
        6. Potential limitations or uncertainties
        
        Format as JSON with these keys: answer, analysis, confidence, factors, sources, limitations
        """

    def _build_ensemble_prompt(self, request: EnsemblePredictionRequest) -> str:
        return f"""
        Generate ensemble predictions for this geopolitical scenario using multiple analytical approaches:
        
        Scenario: {request.scenario}
        Models: {', '.join(request.models)}
        Timeframe: {request.timeframe}
        Data: {json.dumps(request.data, indent=2)}
        
        Provide ensemble predictions including:
        1. Individual model predictions
        2. Consensus score (0-1)
        3. Confidence intervals for key metrics
        4. Key factors driving predictions
        5. Scenario variations and sensitivity analysis
        
        Format as JSON with these keys: predictions, consensus_score, confidence_intervals, key_factors
        """

    def _build_report_prompt(self, request: AutomatedReportRequest) -> str:
        return f"""
        Generate a comprehensive {request.report_type} report based on the provided data sources:
        
        Report Type: {request.report_type}
        Data Sources: {', '.join(request.data_sources)}
        Timeframe: {request.timeframe}
        
        Structure the report with:
        1. Executive Summary
        2. Key Findings and Analysis
        3. Data Visualizations (if requested)
        4. Risk Assessment
        5. Recommendations
        6. Methodology and Sources
        
        Format as JSON with these keys: title, sections, visualizations, summary
        """

    async def _fetch_report_data(self, data_sources: List[str], timeframe: str) -> Dict[str, Any]:
        """Fetch additional data for report generation"""
        
        data = {}
        
        # Mock data fetching - in real implementation, fetch from various APIs
        if "news" in data_sources and self.news_api_key:
            data["recent_news"] = await self._fetch_recent_news(timeframe)
        
        if "economic" in data_sources:
            data["economic_indicators"] = await self._fetch_economic_data(timeframe)
        
        return data

    async def _fetch_recent_news(self, timeframe: str) -> List[Dict[str, Any]]:
        """Fetch recent geopolitical news"""
        # Mock implementation
        return [
            {"title": "Recent geopolitical development", "date": "2024-01-15", "impact": "medium"}
        ]

    async def _fetch_economic_data(self, timeframe: str) -> Dict[str, Any]:
        """Fetch economic indicators"""
        # Mock implementation
        return {
            "gdp_growth": 2.3,
            "inflation": 3.1,
            "unemployment": 4.2
        }

    async def _fallback_nl_response(self, request: NLQueryRequest) -> NLQueryResponse:
        """Fallback response when AI service is unavailable"""
        
        return NLQueryResponse(
            query=request.query,
            response={
                "answer": "Analysis temporarily unavailable. Please try again later.",
                "analysis": "Service currently experiencing issues",
                "confidence": 0.1,
                "factors": ["Service unavailable"],
                "sources": ["Fallback response"],
                "limitations": ["AI service temporarily unavailable"]
            },
            confidence=0.1,
            sources=["Fallback"],
            generated_at=datetime.utcnow().isoformat(),
            processing_time=0.0
        )

    async def _fallback_ensemble_response(self, request: EnsemblePredictionRequest) -> EnsemblePredictionResponse:
        """Fallback ensemble response"""
        
        return EnsemblePredictionResponse(
            predictions=[{"model": "fallback", "prediction": "Service unavailable"}],
            consensus_score=0.0,
            confidence_intervals={},
            key_factors=["Service temporarily unavailable"],
            generated_at=datetime.utcnow().isoformat()
        )

    async def _fallback_report_response(self, request: AutomatedReportRequest) -> AutomatedReportResponse:
        """Fallback report response"""
        
        return AutomatedReportResponse(
            report_id=f"fallback_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            title=f"{request.report_type.title()} Report",
            sections=[
                {"title": "Status", "content": "Report generation temporarily unavailable"},
                {"title": "Next Steps", "content": "Please try again later"}
            ],
            visualizations=[],
            summary="Service temporarily unavailable. Please try again.",
            generated_at=datetime.utcnow().isoformat()
        )

# FastAPI router
router = APIRouter(prefix="/analytics", tags=["analytics"])
service = AdvancedAnalyticsService()

@router.post("/nl-query", response_model=NLQueryResponse)
async def process_natural_language_query(
    request: NLQueryRequest
):
    """Process natural language geopolitical queries"""
    return await service.process_natural_language_query(request)

@router.post("/ensemble-prediction", response_model=EnsemblePredictionResponse)
async def generate_ensemble_prediction(
    request: EnsemblePredictionRequest
):
    """Generate ensemble predictions from multiple models"""
    return await service.generate_ensemble_prediction(request)

@router.post("/automated-report", response_model=AutomatedReportResponse)
async def generate_automated_report(
    request: AutomatedReportRequest
):
    """Generate comprehensive automated reports"""
    return await service.generate_automated_report(request)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
