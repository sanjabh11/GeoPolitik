#!/usr/bin/env python3
"""
Enhanced Game Theory Platform - Python Microservices
Main entry point for all Python computation services
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from pathlib import Path
import os
from dotenv import load_dotenv

# Import service modules
from services.gambit_service import router as gambit_router
from services.marl_service import router as marl_router
from services.backtesting_service import router as backtesting_router
from services.research_service import router as research_router
from services.resource_service import router as resource_router
from services.suggested_resources_service import router as suggested_resources_router
from services.advanced_analytics_service import router as advanced_analytics_router
from services.research_pipeline_service import router as research_pipeline_router
from services.collaborative_workspace_service import router as collaborative_workspace_router
from services.enterprise_sso_service import router as enterprise_sso_router
from services.backtesting_framework_service import router as backtesting_framework_router
from services.ar_vr_service import router as ar_vr_router
from services.blockchain_service import router as blockchain_router
from services.quantum_service import router as quantum_router
from services.regulatory_service import router as regulatory_router
from services.catalogue_service import router as catalogue_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Enhanced Game Theory Platform",
    description="Comprehensive game theory computation and analysis services",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(gambit_router, prefix="/gambit", tags=["gambit"])
app.include_router(marl_router, prefix="/marl", tags=["marl"])
app.include_router(backtesting_router, prefix="/backtesting", tags=["backtesting"])
app.include_router(research_router, prefix="/research", tags=["research"])
app.include_router(resource_router, prefix="/api", tags=["resources"])
app.include_router(suggested_resources_router, prefix="/api", tags=["suggested-resources"])
app.include_router(advanced_analytics_router, prefix="/api", tags=["analytics"])
app.include_router(research_pipeline_router, prefix="/api", tags=["research-pipeline"])
app.include_router(collaborative_workspace_router, prefix="/api", tags=["collaboration"])
app.include_router(enterprise_sso_router, prefix="/api", tags=["enterprise"])
app.include_router(backtesting_framework_router, prefix="/api", tags=["backtesting"])
app.include_router(ar_vr_router, prefix="/api", tags=["arvr"])
app.include_router(blockchain_router, prefix="/api", tags=["blockchain"])
app.include_router(quantum_router, prefix="/api", tags=["quantum"])
app.include_router(regulatory_router, prefix="/api", tags=["regulatory"])
app.include_router(catalogue_router, prefix="/api", tags=["catalogue"])

@app.get("/")
async def root():
    """Root endpoint with service status"""
    return {
        "message": "Enhanced Game Theory Platform Python Services",
        "status": "running",
        "services": {
            "gambit": "active",
            "marl": "active", 
            "backtesting": "active",
            "research": "active",
            "suggested-resources": "active",
            "advanced-analytics": "active",
            "research-pipeline": "active",
            "collaboration": "active",
            "enterprise": "active",
            "backtesting-framework": "active",
            "arvr": "active",
            "blockchain": "active",
            "quantum": "active",
            "regulatory": "active"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "gambit": "operational",
            "marl": "operational",
            "backtesting": "operational",
            "research": "operational",
            "suggested-resources": "operational",
            "advanced-analytics": "operational",
            "research-pipeline": "operational"
        }
    }

@app.get("/status")
async def detailed_status():
    """Detailed service status"""
    return {
        "services": {
            "gambit": {
                "status": "operational",
                "capabilities": ["nash_equilibrium", "cooperative_games", "extensive_form"],
                "version": "16.0.1"
            },
            "marl": {
                "status": "operational", 
                "capabilities": ["multi_agent_simulation", "strategic_analysis", "coalition_dynamics"],
                "algorithms": ["Q-learning", "Policy-Gradient", "MADDPG", "Actor-Critic"]
            },
            "backtesting": {
                "status": "operational",
                "capabilities": ["model_validation", "academic_benchmarking", "temporal_analysis"],
                "metrics": ["accuracy", "precision", "recall", "f1_score", "mae", "rmse"]
            },
            "research": {
                "status": "operational",
                "capabilities": ["academic_integration", "paper_analysis", "citation_tracking"],
                "sources": ["papers_with_code", "arxiv", "semantic_scholar"]
            },
            "suggested-resources": {
                "status": "operational",
                "capabilities": ["ai_recommendations", "personalized_learning", "resource_curation"],
                "features": ["context_aware_suggestions", "difficulty_matching", "progress_tracking"]
            },
            "advanced-analytics": {
                "status": "operational",
                "capabilities": ["natural_language_queries", "ensemble_predictions", "automated_reports"],
                "features": ["multi_model_analysis", "confidence_scoring", "data_visualization"]
            },
            "research-pipeline": {
                "status": "operational",
                "capabilities": ["paper_search", "trend_analysis", "academic_insights"],
                "sources": ["papers_with_code", "arxiv", "semantic_scholar"]
            },
            "collaboration": {
                "status": "operational",
                "capabilities": ["real_time_collaboration", "document_management", "team_workspaces"],
                "features": ["live_editing", "comment_system", "version_control", "permission_management"]
            },
            "enterprise": {
                "status": "operational",
                "capabilities": ["single_sign_on", "identity_management", "enterprise_integration"],
                "features": ["saml_oauth_support", "multi_provider", "session_management", "audit_logging"]
            },
            "backtesting-framework": {
                "status": "operational",
                "capabilities": ["comprehensive_backtesting", "academic_benchmarking", "performance_analysis"],
                "features": ["multi_strategy_support", "real_time_validation", "benchmark_comparison", "risk_metrics"]
            },
            "arvr": {
                "status": "operational",
                "capabilities": ["augmented_reality", "virtual_reality", "mixed_reality", "immersive_visualization"],
                "features": ["multi_device_support", "real_time_collaboration", "3d_game_visualization", "interactive_simulations"]
            },
            "blockchain": {
                "status": "operational",
                "capabilities": ["smart_contracts", "decentralized_games", "blockchain_integration", "cryptocurrency_support"],
                "features": ["multi_chain_support", "gas_optimization", "secure_transactions", "transparent_governance"]
            },
            "quantum": {
                "status": "operational",
                "capabilities": ["quantum_algorithms", "quantum_games", "quantum_advantage", "quantum_simulation"],
                "features": ["multiple_backends", "quantum_error_correction", "entanglement_utilization", "quantum_benchmarking"]
            },
            "regulatory": {
                "status": "operational",
                "capabilities": ["compliance_assessment", "privacy_management", "audit_logging", "regulatory_reporting"],
                "features": ["multi_jurisdiction_support", "automated_compliance", "risk_assessment", "regulatory_updates"]
            }
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PYTHON_SERVICE_PORT", 8001))
    host = os.getenv("PYTHON_SERVICE_HOST", "0.0.0.0")
    
    logger.info(f"Starting Python services on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("PYTHON_SERVICE_RELOAD", "false").lower() == "true",
        log_level="info"
    )
