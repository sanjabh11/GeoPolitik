#!/bin/bash

# GeoPolitik API Integration Testing Script
# Tests all API endpoints, edge functions, and SDK integration

set -e

echo "🚀 GeoPolitik API Integration Testing"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_BASE_URL="http://localhost:54321/functions/v1"
SUPABASE_URL="http://localhost:54321"
PROJECT_ID="geopolitik-platform"

# Helper functions
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Check Supabase Functions
print_info "Testing Supabase Functions..."
supabase functions list --project-ref $PROJECT_ID
print_status "Supabase Functions List"

# Test 2: Risk Assessment API
print_info "Testing Risk Assessment API..."
curl -X POST "$API_BASE_URL/risk-assessment" \
  -H "Content-Type: application/json" \
  -d '{
    "region": "eastern-europe",
    "factors": ["military", "economic"],
    "timeframe": "current"
  }' \
  --compressed \
  --connect-timeout 10 \
  --max-time 30
print_status "Risk Assessment API"

# Test 3: Game Theory Analysis API
print_info "Testing Game Theory Analysis API..."
curl -X POST "$API_BASE_URL/game-theory/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "trade-war",
    "actors": ["USA", "China", "EU"],
    "parameters": {
      "timeline": "2024-2025",
      "economic_factors": ["tariffs", "supply_chain"]
    }
  }' \
  --compressed \
  --connect-timeout 10 \
  --max-time 30
print_status "Game Theory Analysis API"

# Test 4: Historical Patterns API
print_info "Testing Historical Patterns API..."
curl -X GET "$API_BASE_URL/historical-patterns?region=eastern-europe&type=conflict&timeframe=2020-2024" \
  --compressed \
  --connect-timeout 10 \
  --max-time 30
print_status "Historical Patterns API"

# Test 5: Rate Limiting
print_info "Testing Rate Limiting..."
for i in {1..5}; do
    curl -X POST "$API_BASE_URL/risk-assessment" \
      -H "Content-Type: application/json" \
      -d '{"region": "test-region", "factors": ["test"]}' \
      --compressed \
      --connect-timeout 5 \
      --max-time 10
    echo "Rate limit test $i/5"
done
print_status "Rate Limiting"

# Test 6: Webhook Subscription
print_info "Testing Webhook Subscription..."
curl -X POST "$API_BASE_URL/webhooks/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/test-webhook",
    "events": ["risk_update", "alert_triggered"],
    "secret": "test-secret-key"
  }' \
  --compressed \
  --connect-timeout 10 \
  --max-time 30
print_status "Webhook Subscription"

# Test 7: SDK Integration
print_info "Testing Node.js SDK..."
cd sdk/nodejs
npm install
npm test
print_status "Node.js SDK"

# Test 8: Edge Function Health
print_info "Testing Edge Function Health..."
curl -X GET "$API_BASE_URL/health" \
  --compressed \
  --connect-timeout 5 \
  --max-time 10
print_status "Edge Function Health"

# Test 9: Authentication
print_info "Testing Authentication..."
curl -X POST "$API_BASE_URL/risk-assessment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-api-key" \
  -d '{"region": "test-region"}' \
  --compressed \
  --connect-timeout 10 \
  --max-time 30
print_status "Authentication"

# Test 10: Error Handling
print_info "Testing Error Handling..."
curl -X POST "$API_BASE_URL/risk-assessment" \
  -H "Content-Type: application/json" \
  -d '{}' \
  --compressed \
  --connect-timeout 10 \
  --max-time 30
print_status "Error Handling"

echo ""
echo "🎉 API Integration Testing Complete!"
echo "==================================="
echo "All tests completed. Check individual results above."
echo ""
echo "Next steps:"
echo "1. Review any failed tests above"
echo "2. Check Supabase logs for edge function errors"
echo "3. Validate SDK functionality"
echo "4. Run production deployment tests"
