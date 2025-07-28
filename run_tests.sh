#!/bin/bash

# Enhanced Game Theory Platform - Integration Test Runner
echo "🚀 Starting Enhanced Game Theory Platform Integration Tests"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if services are running
echo "🔍 Checking service availability..."

# Test Python services
echo "🐍 Testing Python microservices..."

# Test gambit service
curl -s http://localhost:8001/gambit/capabilities > /dev/null 2>&1
print_status $? "Gambit service is running"

# Test MARL service
curl -s http://localhost:8001/marl/capabilities > /dev/null 2>&1
print_status $? "MARL service is running"

# Test backtesting service
curl -s http://localhost:8001/backtesting/capabilities > /dev/null 2>&1
print_status $? "Backtesting service is running"

# Test research service
curl -s http://localhost:8001/research/capabilities > /dev/null 2>&1
print_status $? "Research service is running"

# Test Supabase functions
echo "⚡ Testing Supabase Edge Functions..."

# Test enhanced game theory tutor
curl -s http://localhost:54321/functions/v1/enhanced-game-theory-tutor/health > /dev/null 2>&1
print_status $? "Enhanced game theory tutor is running"

# Test research integration
curl -s http://localhost:54321/functions/v1/research-integration/health > /dev/null 2>&1
print_status $? "Research integration service is running"

# Test enhanced backtesting
curl -s http://localhost:54321/functions/v1/enhanced-backtesting/health > /dev/null 2>&1
print_status $? "Enhanced backtesting service is running"

# Test MARL simulation
curl -s http://localhost:54321/functions/v1/marl-simulation/health > /dev/null 2>&1
print_status $? "MARL simulation service is running"

# Test collaborative research
curl -s http://localhost:54321/functions/v1/collaborative-research/health > /dev/null 2>&1
print_status $? "Collaborative research service is running"

# Test real-time updates
curl -s http://localhost:54321/functions/v1/real-time-updates/health > /dev/null 2>&1
print_status $? "Real-time updates service is running"

# Run basic API tests
echo "🔬 Running basic API tests..."

# Test gambit computation test_data='{"matrix": [[3, 0], [5, 1]], "players": ["player1", "player2"], "game_type": "normal_form"}'
curl -s -X POST http://localhost:8001/gambit/compute_nash \
  -H "Content-Type: application/json" \
  -d "$test_data" > /dev/null 2>&1
print_status $? "Gambit computation test"

# Test MARL simulation test_data='{"scenario": {"name": "test", "actors": [{"id": "test", "type": "state"}]}, "simulation_parameters": {"num_agents": 2, "episodes": 5}}'
curl -s -X POST http://localhost:8001/marl/simulate \
  -H "Content-Type: application/json" \
  -d "$test_data" > /dev/null 2>&1
print_status $? "MARL simulation test"

# Test backtesting test_data='{"model_predictions": [{"model_id": "test", "prediction_date": "2024-01-01T00:00:00Z", "predicted_outcome": {"classification": 1}, "confidence_score": 0.9}], "actual_outcomes": [{"actual_date": "2024-01-01T00:00:00Z", "actual_outcome": {"classification": 1}}]}'
curl -s -X POST http://localhost:8001/backtesting/analyze \
  -H "Content-Type: application/json" \
  -d "$test_data" > /dev/null 2>&1
print_status $? "Backtesting analysis test"

# Test research analysis test_data='{"query": "game theory", "max_results": 5}'
curl -s -X POST http://localhost:8001/research/analyze \
  -H "Content-Type: application/json" \
  -d "$test_data" > /dev/null 2>&1
print_status $? "Research analysis test"

# Print summary
echo ""
echo "================================================"
echo "📋 Test Summary"
echo "================================================"

if [ -z "$(pgrep -f 'uvicorn main:app')" ]; then
    echo -e "${YELLOW}⚠️ Python services may not be running. Start with:${NC}"
    echo "  cd python-services && python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
fi

if [ -z "$(pgrep -f 'supabase')" ]; then
    echo -e "${YELLOW}⚠️ Supabase may not be running. Start with:${NC}"
    echo "  supabase start"
fi

echo ""
echo "🎯 Next Steps:"
echo "  1. Review any failed tests above"
echo "  2. Check service logs for detailed error information"
echo "  3. Ensure all environment variables are configured"
echo "  4. Run targeted tests for any specific issues"
echo "  5. Monitor performance and scalability"

echo ""
echo "🚀 Enhanced Game Theory Platform Integration Tests Complete!"
