# Enhanced Game Theory Platform - Complete Deployment Guide

## 🚀 Overview
This guide provides complete instructions for deploying the Enhanced Game Theory Platform with all five critical gaps addressed:

1. **Enhanced Game Theory Tutor** - Formal game theory computations with Gambit
2. **Research Integration** - Real-time academic research updates
3. **Enhanced Backtesting** - Rigorous model validation with academic benchmarking
4. **MARL Simulation** - Multi-agent reinforcement learning simulations
5. **Collaborative Research Tools** - Peer review and contribution tracking
6. **Real-time Updates** - Live notifications and system updates

## 📋 Prerequisites

### System Requirements
- Python 3.8+ (tested with 3.13.5)
- Node.js 16+ and npm
- Supabase CLI
- PostgreSQL 14+
- Redis (optional, for caching)
- Git

### API Keys Required
- **Google Gemini API Key** (for AI content generation)
- **Supabase Project URL and Anon Key**
- **Optional**: Papers with Code API access

## 🛠️ Installation Steps

### 1. Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd game-theory

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
cd python-services
pip install -r requirements.txt

# Install Node.js dependencies (if needed)
npm install  # or yarn install
```

### 2. Configuration

#### Environment Variables
Create `.env` files in both root and python-services directories:

```bash
# Root .env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
PYTHON_SERVICE_URL=http://localhost:8001

# python-services/.env
PYTHON_SERVICE_HOST=0.0.0.0
PYTHON_SERVICE_PORT=8001
GEMINI_API_KEY=your_gemini_api_key
```

#### Supabase Configuration
```bash
# Initialize Supabase
supabase init

# Start Supabase services
supabase start

# Apply database migrations
supabase db reset
```

### 3. Service Deployment

#### Python Microservices
```bash
# Start Python services
cd python-services
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Or use the provided script
./start_python_services.sh
```

#### Supabase Edge Functions
```bash
# Deploy all functions
supabase functions deploy enhanced-game-theory-tutor
supabase functions deploy research-integration
supabase functions deploy enhanced-backtesting
supabase functions deploy marl-simulation
supabase functions deploy collaborative-research
supabase functions deploy real-time-updates
```

### 4. Database Setup

#### Run Database Migrations
```bash
# Apply all database migrations
supabase db reset

# Or apply specific migration
supabase migration up
```

#### Verify Database Schema
```sql
-- Check if all tables are created
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verify RLS policies
SELECT * FROM information_schema.role_table_grants;
```

## 🔧 Service Endpoints

### Python Microservices
- **Base URL**: `http://localhost:8001`
- **Gambit Service**: `/gambit/*`
- **MARL Service**: `/marl/*`
- **Backtesting Service**: `/backtesting/*`
- **Research Service**: `/research/*`

### Supabase Edge Functions
- **Base URL**: `http://localhost:54321/functions/v1`
- **Enhanced Game Theory Tutor**: `/enhanced-game-theory-tutor`
- **Research Integration**: `/research-integration`
- **Enhanced Backtesting**: `/enhanced-backtesting`
- **MARL Simulation**: `/marl-simulation`
- **Collaborative Research**: `/collaborative-research`
- **Real-time Updates**: `/real-time-updates`

## 🧪 Testing

### Quick Health Check
```bash
# Run the provided test script
./run_tests.sh

# Or test individual services
curl http://localhost:8001/health
curl http://localhost:8001/gambit/capabilities
curl http://localhost:54321/functions/v1/enhanced-game-theory-tutor/health
```

### Comprehensive Testing
```bash
# Run integration tests
python3 tests/test_integration.py

# Test specific workflows
./test_workflows.sh
```

## 📊 API Usage Examples

### 1. Game Theory Tutor
```bash
curl -X POST http://localhost:54321/functions/v1/enhanced-game-theory-tutor \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "game_type": "prisoners_dilemma",
    "complexity_level": "intermediate"
  }'
```

### 2. MARL Simulation
```bash
curl -X POST http://localhost:54321/functions/v1/marl-simulation \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": {
      "name": "geopolitical_test",
      "actors": [{"id": "actor1", "type": "state"}]
    },
    "simulation_parameters": {
      "num_agents": 3,
      "episodes": 100
    }
  }'
```

### 3. Backtesting Analysis
```bash
curl -X POST http://localhost:54321/functions/v1/enhanced-backtesting \
  -H "Content-Type: application/json" \
  -d '{
    "model_predictions": [...],
    "actual_outcomes": [...],
    "benchmark_sources": ["papers_with_code"]
  }'
```

## 🔍 Monitoring & Debugging

### Service Logs
```bash
# Python services logs
tail -f python-services/logs/app.log

# Supabase function logs
supabase functions logs enhanced-game-theory-tutor
supabase functions logs marl-simulation
```

### Health Monitoring
```bash
# Check service health
curl http://localhost:8001/health
curl http://localhost:54321/functions/v1/health

# Monitor performance
./monitor_performance.sh
```

### Database Monitoring
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Monitor table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname NOT IN ('information_schema', 'pg_catalog') 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🚨 Troubleshooting

### Common Issues

1. **Service Not Starting**
   ```bash
   # Check port conflicts
   lsof -i :8001
   lsof -i :54321
   
   # Check Python dependencies
   pip list | grep -E "(fastapi|uvicorn|gambit|nashpy)"
   ```

2. **Database Connection Issues**
   ```bash
   # Check database connection
   supabase status
   
   # Reset database if needed
   supabase db reset
   ```

3. **API Key Issues**
   ```bash
   # Verify environment variables
   echo $GEMINI_API_KEY
   echo $SUPABASE_URL
   
   # Check service configuration
   cat python-services/.env
   ```

4. **Function Deployment Issues**
   ```bash
   # Check function status
   supabase functions list
   
   # Redeploy specific function
   supabase functions deploy function-name --no-verify-jwt
   ```

### Performance Issues
```bash
# Check resource usage
htop
docker stats

# Monitor API response times
./test_performance.sh
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy Enhanced Game Theory Platform
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          pip install -r python-services/requirements.txt
      - name: Run tests
        run: |
          ./run_tests.sh
```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_user_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX idx_papers_published_date ON research_papers(published_date);
CREATE INDEX idx_simulations_created_at ON marl_simulations(created_at);
```

### Caching Strategy
```python
# Redis caching example
import redis
r = redis.Redis(host='localhost', port=6379, db=0)
r.setex('research_papers_latest', 3600, json.dumps(papers))
```

## 🎯 Production Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up -d

# Scale services
docker-compose up -d --scale python-services=3
```

### Cloud Deployment
```bash
# Deploy to cloud provider
# Example for AWS ECS, Google Cloud Run, or Azure Container Instances
```

## 📞 Support

### Getting Help
1. Check this deployment guide
2. Review service logs
3. Run diagnostic tests
4. Check GitHub issues
5. Contact development team

### Useful Commands
```bash
# Quick system status
./run_tests.sh

# Service health check
./health_check.sh

# Performance monitoring
./monitor_performance.sh
```

## 🎉 Success Verification

After successful deployment, you should be able to:

1. ✅ Access all Python microservices at `http://localhost:8001`
2. ✅ Access all Supabase functions at `http://localhost:54321/functions/v1`
3. ✅ Run integration tests successfully
4. ✅ Execute all API endpoints
5. ✅ See data flowing through the system
6. ✅ Monitor real-time updates

**Congratulations!** Your Enhanced Game Theory Platform is now fully deployed and operational!
