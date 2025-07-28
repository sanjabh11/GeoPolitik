#!/bin/bash

# API Test Script for Edge Functions
set -e

SUPABASE_URL="${VITE_SUPABASE_URL:-https://kvunnankqgfokeufvsrv.supabase.co}"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

echo "Testing Edge Functions..."
echo "URL: $SUPABASE_URL"
echo ""

# Test health endpoint
echo "Testing health check..."
curl -s -X POST "$SUPABASE_URL/functions/v1/health" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq .

echo ""
echo "Testing game theory tutor..."
curl -s -X POST "$SUPABASE_URL/functions/v1/game-theory-tutor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{"level": "basic", "topic": "nash_equilibrium"}' \
  | jq .

echo ""
echo "Testing risk assessment..."
curl -s -X POST "$SUPABASE_URL/functions/v1/risk-assessment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{"regions": ["Asia"], "factors": ["political", "economic"]}' \
  | jq .

echo ""
echo "Testing scenario simulation..."
curl -s -X POST "$SUPABASE_URL/functions/v1/scenario-simulation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{"scenario": {"type": "trade_war", "actors": ["USA", "China"], "parameters": {"tariffs": [25, 15], "timeline": "6months"}}}' \
  | jq .

echo ""
echo "Testing crisis monitoring..."
curl -s -X POST "$SUPABASE_URL/functions/v1/crisis-monitoring" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{"regions": ["Asia", "Europe"], "severity": "medium"}' \
  | jq .

echo ""
echo "Testing historical pattern analysis..."
curl -s -X POST "$SUPABASE_URL/functions/v1/historical-pattern-analysis" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{"regions": ["Asia"], "conflict_type": "territorial_dispute", "time_range": "1950-01-01,2024-12-31"}' \
  | jq .

echo ""
echo "All tests completed!"
