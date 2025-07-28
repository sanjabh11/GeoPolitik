import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    )

    switch (action) {
      case 'historical-patterns':
        return await handleHistoricalPatterns(payload)
      case 'risk-assessment':
        return await handleRiskAssessment(payload)
      case 'scenario-simulation':
        return await handleScenarioSimulation(payload)
      case 'crisis-monitoring':
        return await handleCrisisMonitoring(payload)
      case 'health':
        return await handleHealthCheck()
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

async function handleHistoricalPatterns(payload: any) {
  const { region, conflict_type, time_range } = payload
  
  // Generate historical pattern analysis using existing data
  const historicalData = generateHistoricalPatterns(region, conflict_type, time_range)
  
  return {
    events: historicalData,
    patterns: analyzeHistoricalPatterns(historicalData),
    analysis: {
      total_events: historicalData.length,
      unique_regions: [...new Set(historicalData.map(e => e.region))],
      common_triggers: analyzeTriggers(historicalData),
      escalation_patterns: analyzeEscalations(historicalData)
    }
  }
}

async function handleRiskAssessment(payload: any) {
  const { regions, factors } = payload
  
  return {
    assessments: regions.map((region: string) => ({
      region,
      risk_level: calculateRiskLevel(region, factors),
      factors: factors,
      recommendations: generateRecommendations(region, factors)
    }))
  }
}

async function handleScenarioSimulation(payload: any) {
  const { scenario } = payload
  
  return {
    nashEquilibrium: calculateNashEquilibrium(scenario),
    stability: assessStability(scenario),
    outcomes: generateOutcomes(scenario),
    timeline: generateTimeline(scenario)
  }
}

async function handleCrisisMonitoring(payload: any) {
  const { regions, severity } = payload
  
  return {
    events: generateCrisisEvents(regions, severity),
    alerts: generateAlerts(regions, severity),
    trends: analyzeTrends(regions)
  }
}

async function handleHealthCheck() {
  const newsApiKey = Deno.env.get('VITE_NEWS_API_KEY')
  const geminiApiKey = Deno.env.get('VITE_GEMINI_API_KEY')
  
  const newsOk = await testNewsAPI(newsApiKey)
  const geminiOk = await testGeminiAPI(geminiApiKey)
  
  return {
    status: newsOk && geminiOk ? 'healthy' : 'degraded',
    services: {
      newsapi: newsOk ? 'ok' : 'error',
      gemini: geminiOk ? 'ok' : 'error'
    },
    timestamp: new Date().toISOString()
  }
}

// Utility functions
function generateHistoricalPatterns(region?: string, conflict_type?: string, time_range?: string) {
  const events = [
    {
      id: '1',
      title: 'Cuban Missile Crisis',
      date: '1962-10-14',
      region: 'Caribbean',
      type: 'nuclear_standoff',
      severity: 'critical',
      trigger: 'missile_discovery',
      participants: ['United States', 'Soviet Union', 'Cuba'],
      outcome: 'peaceful_resolution'
    },
    {
      id: '2',
      title: 'Berlin Wall Construction',
      date: '1961-08-13',
      region: 'Europe',
      type: 'territorial_dispute',
      severity: 'high',
      trigger: 'refugee_crisis',
      participants: ['East Germany', 'West Germany', 'Soviet Union', 'United States'],
      outcome: 'wall_constructed'
    },
    {
      id: '3',
      title: 'Korean War',
      date: '1950-06-25',
      region: 'Asia',
      type: 'civil_war',
      severity: 'high',
      trigger: 'border_incursion',
      participants: ['North Korea', 'South Korea', 'United States', 'China', 'Soviet Union'],
      outcome: 'armistice_signed'
    }
  ]

  return events.filter(event => {
    if (region && !event.region.toLowerCase().includes(region.toLowerCase())) return false
    if (conflict_type && !event.type.toLowerCase().includes(conflict_type.toLowerCase())) return false
    return true
  })
}

function analyzeHistoricalPatterns(events: any[]) {
  return {
    triggers: analyzeTriggers(events),
    escalations: analyzeEscalations(events),
    timeline: events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
}

function analyzeTriggers(events: any[]) {
  return events
    .filter(e => e.trigger)
    .reduce((acc: any, event) => {
      acc[event.trigger] = (acc[event.trigger] || 0) + 1
      return acc
    }, {})
}

function analyzeEscalations(events: any[]) {
  return events
    .reduce((acc: any, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {})
}

function calculateRiskLevel(region: string, factors: string[]) {
  return Math.min(95, Math.max(20, factors.length * 15 + region.length % 10))
}

function calculateNashEquilibrium(scenario: any) {
  return {
    equilibrium: 'mixed_strategy',
    payoffs: { player1: 0.6, player2: 0.4 },
    strategies: ['cooperate', 'defect']
  }
}

function assessStability(scenario: any) {
  return Math.random() > 0.5 ? 'stable' : 'unstable'
}

function generateOutcomes(scenario: any) {
  return ['win-win', 'win-lose', 'lose-lose'].map(outcome => ({
    outcome,
    probability: Math.random()
  }))
}

function generateTimeline(scenario: any) {
  return [
    { phase: 'initial', duration: '1-2 weeks' },
    { phase: 'escalation', duration: '2-4 weeks' },
    { phase: 'resolution', duration: '1-3 months' }
  ]
}

function generateCrisisEvents(regions: string[], severity: string) {
  return regions.map(region => ({
    region,
    events: [
      {
        title: `${region} Crisis Event`,
        severity,
        timestamp: new Date().toISOString(),
        status: 'active'
      }
    ]
  }))
}

function generateAlerts(regions: string[], severity: string) {
  return regions.map(region => ({
    region,
    alert: `${severity} level crisis detected`,
    recommended_action: 'monitor closely'
  }))
}

function analyzeTrends(regions: string[]) {
  return regions.map(region => ({
    region,
    trend: 'increasing',
    risk_factors: ['political', 'economic']
  }))
}

async function testNewsAPI(apiKey?: string) {
  if (!apiKey) return false
  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apikey=${apiKey}`)
    return response.ok
  } catch {
    return false
  }
}

async function testGeminiAPI(apiKey?: string) {
  if (!apiKey) return false
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'test' }] }],
        generationConfig: { maxOutputTokens: 1 }
      })
    })
    return response.ok
  } catch {
    return false
  }
}
