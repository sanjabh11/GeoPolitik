#!/bin/bash

# Deployment validation script for geopolitical game theory platform
# Tests all edge functions and API endpoints

set -e

echo "🔍 Starting deployment validation tests..."

# Load environment variables safely
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Test configuration
SUPABASE_URL="https://kvunnankqgfokeufvsrv.supabase.co"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY not found in environment"
  exit 1
fi

echo "✅ Service role key configured"

# Test endpoints
endpoints=(
  "health"
  "game-theory-tutor"
  "risk-assessment"
  "scenario-simulation"
  "crisis-monitoring"
)

passed=0
failed=0

for endpoint in "${endpoints[@]}"; do
  echo "Testing $endpoint endpoint..."
  
  response=$(curl -s -X POST "$SUPABASE_URL/functions/v1/$endpoint" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -d '{"test": true}' \
    -w "%{http_code}" \
    -o /tmp/response_${endpoint}.json \
    --max-time 30)
  
  if [ "$response" -eq 200 ]; then
    echo "✅ $endpoint: HTTP 200 OK"
    ((passed++))
  else
    echo "❌ $endpoint: HTTP $response"
    echo "Response:"
    cat /tmp/response_${endpoint}.json
    ((failed++))
  fi
done

echo ""
echo "📊 Test Results:"
echo "Passed: $passed"
echo "Failed: $failed"
echo "Total: $((passed + failed))"

if [ $failed -eq 0 ]; then
  echo "🎉 All tests passed! Platform is ready for deployment."
  exit 0
else
  echo "⚠️  Some tests failed. Review the issues above."
  exit 1
fi
