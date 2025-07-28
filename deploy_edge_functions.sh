#!/bin/bash

# Supabase Edge Functions Deployment Script
# This script deploys all edge functions with updated CORS configuration

echo "🚀 Deploying Supabase Edge Functions..."

# Navigate to project root
cd "$(dirname "$0")"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy game-theory-tutor function
echo "📚 Deploying game-theory-tutor function..."
supabase functions deploy game-theory-tutor --no-verify-jwt

# Deploy crisis-monitoring function
echo "🚨 Deploying crisis-monitoring function..."
supabase functions deploy crisis-monitoring --no-verify-jwt

# Deploy risk-assessment function (if exists)
if [ -d "supabase/functions/risk-assessment" ]; then
    echo "📊 Deploying risk-assessment function..."
    supabase functions deploy risk-assessment --no-verify-jwt
fi

# Deploy economic-modeling function (if exists)
if [ -d "supabase/functions/economic-modeling" ]; then
    echo "💰 Deploying economic-modeling function..."
    supabase functions deploy economic-modeling --no-verify-jwt
fi

echo "✅ All edge functions deployed successfully!"
echo "📝 Note: Functions may take a few minutes to propagate globally."
echo "🔄 If CORS issues persist, try clearing browser cache or wait 2-3 minutes."
