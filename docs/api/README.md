# GeoPolitik REST API Documentation

## Overview
Comprehensive REST API for integrating GeoPolitik's geopolitical intelligence and game theory insights into enterprise systems.

## Authentication
All API requests require authentication via Bearer token:
```
Authorization: Bearer YOUR_API_KEY
```

## Rate Limiting
- **Free tier**: 100 requests/hour
- **Enterprise tier**: 10,000 requests/hour  
- **Rate limit headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Base URL
```
https://api.geopolitik.app/v1
```

## Endpoints

### Risk Assessment
```
GET /risk-assessment
Parameters:
- region: string (required)
- factors: string[] (optional)
- timeframe: string (optional, default: "current")

Response:
{
  "region": "eastern-europe",
  "risk_score": 7.8,
  "confidence": 0.92,
  "factors": ["military", "economic"],
  "predictions": [...],
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### Game Theory Analysis
```
POST /game-theory/analyze
Body:
{
  "scenario": "trade-war",
  "actors": ["USA", "China", "EU"],
  "parameters": {...}
}

Response:
{
  "nash_equilibrium": [...],
  "payoff_matrix": {...},
  "strategic_insights": [...]
}
```

### Historical Patterns
```
GET /historical-patterns
Parameters:
- region: string (optional)
- type: string (optional)
- timeframe: string (optional)

Response:
{
  "patterns": [...],
  "events": [...],
  "confidence_scores": {...}
}
```

### Webhooks
```
POST /webhooks/subscribe
Body:
{
  "url": "https://your-domain.com/webhook",
  "events": ["risk_update", "alert_triggered"],
  "secret": "your-webhook-secret"
}
```

## SDKs
- **Node.js**: `npm install geopolitik-sdk`
- **Python**: `pip install geopolitik-sdk`
- **Java**: `implementation 'com.geopolitik:sdk:1.0.0'`
- **Go**: `go get github.com/geopolitik/sdk-go`

## Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `429`: Rate Limited
- `500`: Internal Server Error

## Enterprise Features
- Custom rate limits
- White-label endpoints
- Advanced analytics
- Priority support
