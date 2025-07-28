#!/bin/bash

# Enhanced Game Theory Platform - Environment Setup Script
# This script configures the environment, sets API keys, and starts services

set -e  # Exit on any error

echo "🚀 Enhanced Game Theory Platform - Environment Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get user input
get_input() {
    read -p "$1: " input
    echo "$input"
}

# Function to validate API key format
validate_api_key() {
    local key=$1
    local service=$2
    
    if [[ -z "$key" ]]; then
        print_warning "No $service API key provided - some features may be limited"
        return 1
    fi
    
    case $service in
        "gemini")
            if [[ ${#key} -lt 30 ]]; then
                print_warning "Gemini API key seems too short - please verify"
                return 1
            fi
            ;;
        "supabase")
            if [[ ! $key =~ ^https://.*supabase\.co ]]; then
                print_warning "Supabase URL format seems incorrect - please verify"
                return 1
            fi
            ;;
    esac
    
    return 0
}

# Welcome message
echo ""
echo "This script will help you configure the Enhanced Game Theory Platform."
echo "You'll need to provide API keys for the following services:"
echo ""
echo "Required:"
echo "  - Google Gemini API Key"
echo "  - Supabase Project URL"
echo "  - Supabase Anon Key"
echo ""
echo "Optional:"
echo "  - Papers with Code API Key"
echo "  - News API Key"
echo "  - Additional service keys"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    print_status 0 "Python 3 found: $PYTHON_VERSION"
else
    print_status 1 "Python 3 not found - please install Python 3.8+"
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version 2>&1)
    print_status 0 "Node.js found: $NODE_VERSION"
else
    print_status 1 "Node.js not found - please install Node.js 16+"
    exit 1
fi

# Check Supabase CLI
if command_exists supabase; then
    SUPABASE_VERSION=$(supabase --version 2>&1)
    print_status 0 "Supabase CLI found: $SUPABASE_VERSION"
else
    print_status 1 "Supabase CLI not found - please install: npm install -g supabase"
    exit 1
fi

# Create environment file if it doesn't exist
if [[ ! -f .env ]]; then
    print_info "Creating .env file from template..."
    cp .env.example .env
    print_status 0 "Created .env file"
else
    print_info "Using existing .env file"
fi

# Collect API keys
echo ""
echo "🔑 Collecting API Keys..."
echo ""

# Gemini API Key
echo "Google Gemini API Key (Required for AI features):"
echo "Get your key at: https://makersuite.google.com/app/apikey"
GEMINI_KEY=$(get_input "Enter Gemini API Key")
if validate_api_key "$GEMINI_KEY" "gemini"; then
    sed -i '' "s|your_gemini_api_key_here|$GEMINI_KEY|g" .env 2>/dev/null || sed -i "s|your_gemini_api_key_here|$GEMINI_KEY|g" .env
    print_status 0 "Gemini API key configured"
else
    print_warning "Gemini API key not configured - AI features will be limited"
fi

# Supabase Configuration
echo ""
echo "Supabase Configuration (Required):"
echo "Get your project URL and anon key from: https://app.supabase.com"
SUPABASE_URL=$(get_input "Enter Supabase Project URL")
if validate_api_key "$SUPABASE_URL" "supabase"; then
    sed -i '' "s|your_supabase_project_url|$SUPABASE_URL|g" .env 2>/dev/null || sed -i "s|your_supabase_project_url|$SUPABASE_URL|g" .env
    print_status 0 "Supabase URL configured"
else
    print_warning "Supabase URL not configured"
fi

SUPABASE_ANON_KEY=$(get_input "Enter Supabase Anon Key")
if [[ -n "$SUPABASE_ANON_KEY" ]]; then
    sed -i '' "s|your_supabase_anon_key|$SUPABASE_ANON_KEY|g" .env 2>/dev/null || sed -i "s|your_supabase_anon_key|$SUPABASE_ANON_KEY|g" .env
    print_status 0 "Supabase anon key configured"
else
    print_warning "Supabase anon key not configured"
fi

# Optional API Keys
echo ""
echo "Optional API Keys (press Enter to skip):"

# Papers with Code API
PAPERS_KEY=$(get_input "Enter Papers with Code API Key (optional)")
if [[ -n "$PAPERS_KEY" ]]; then
    sed -i '' "s|your_papers_with_code_key|$PAPERS_KEY|g" .env 2>/dev/null || sed -i "s|your_papers_with_code_key|$PAPERS_KEY|g" .env
    print_status 0 "Papers with Code API key configured"
fi

# News API
NEWS_KEY=$(get_input "Enter News API Key (optional)")
if [[ -n "$NEWS_KEY" ]]; then
    sed -i '' "s|your_news_api_key_here|$NEWS_KEY|g" .env 2>/dev/null || sed -i "s|your_news_api_key_here|$NEWS_KEY|g" .env
    print_status 0 "News API key configured"
fi

# Additional configuration
echo ""
echo "🔧 Additional Configuration..."

# Set Python service URLs
sed -i '' "s|http://localhost:8001|http://localhost:8001|g" .env 2>/dev/null || sed -i "s|http://localhost:8001|http://localhost:8001|g" .env

# Set development defaults
sed -i '' "s|development|development|g" .env 2>/dev/null || sed -i "s|development|development|g" .env
sed -i '' "s|true|true|g" .env 2>/dev/null || sed -i "s|true|true|g" .env

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
cd python-services
if [[ -f requirements.txt ]]; then
    pip3 install -r requirements.txt
    print_status $? "Python dependencies installed"
else
    print_warning "requirements.txt not found in python-services"
fi

# Create Python services environment
echo ""
echo "🐍 Setting up Python services..."
if [[ ! -f .env ]]; then
    cp ../.env .env
    print_status 0 "Python services environment configured"
fi

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
cd ..
if [[ -f package.json ]]; then
    npm install
    print_status $? "Node.js dependencies installed"
else
    print_warning "package.json not found"
fi

# Initialize Supabase
echo ""
echo "⚡ Setting up Supabase..."
if [[ -f supabase/config.toml ]]; then
    supabase start
    print_status $? "Supabase services started"
else
    print_warning "Supabase not initialized - run 'supabase init' first"
fi

# Database setup
echo ""
echo "🗄️ Setting up database..."
if command_exists supabase; then
    supabase db reset
    print_status $? "Database reset completed"
    
    # Deploy functions
    echo "📡 Deploying Supabase functions..."
    supabase functions deploy enhanced-game-theory-tutor
    supabase functions deploy research-integration
    supabase functions deploy enhanced-backtesting
    supabase functions deploy marl-simulation
    supabase functions deploy collaborative-research
    supabase functions deploy real-time-updates
    print_status $? "Supabase functions deployed"
fi

# Start services
echo ""
echo "🚀 Starting services..."

# Start Python services
echo "Starting Python microservices..."
cd python-services
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload > ../logs/python-services.log 2>&1 &
PYTHON_PID=$!
echo $PYTHON_PID > ../logs/python-services.pid
print_status $? "Python services started on port 8001"

# Wait for services to start
sleep 5

# Health check
echo ""
echo "🏥 Health check..."

# Check Python services
if curl -s http://localhost:8001/health > /dev/null; then
    print_status 0 "Python services healthy"
else
    print_warning "Python services may not be responding"
fi

# Check Supabase functions
if curl -s http://localhost:54321/functions/v1/health > /dev/null; then
    print_status 0 "Supabase functions healthy"
else
    print_warning "Supabase functions may not be responding"
fi

# Create logs directory
mkdir -p logs

# Summary
echo ""
echo "================================================"
echo "🎉 Setup Complete!"
echo "================================================"
echo ""
echo "📊 Services Status:"
echo "  - Python Microservices: http://localhost:8001"
echo "  - Supabase Functions: http://localhost:54321"
echo "  - Database: PostgreSQL via Supabase"
echo ""
echo "🧪 Testing:"
echo "  - Run: ./run_tests.sh"
echo "  - Check: curl http://localhost:8001/health"
echo "  - Check: curl http://localhost:54321/functions/v1/health"
echo ""
echo "📋 Next Steps:"
echo "  1. Verify all services are running"
echo "  2. Run integration tests"
echo "  3. Test API endpoints"
echo "  4. Check logs in ./logs/ directory"
echo ""
echo "🔍 Monitoring:"
echo "  - Python logs: tail -f logs/python-services.log"
echo "  - Supabase logs: supabase functions logs"
echo ""
echo "🎯 Ready to use! Access the platform at your configured URL"
