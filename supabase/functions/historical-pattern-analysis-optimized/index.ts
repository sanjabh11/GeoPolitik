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
    const { region, conflict_type, time_range } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Use existing tables instead of new historical_events table
    // This optimizes for plan limit by reusing existing data
    const { data: events, error } = await supabase
      .from('crisis_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      // Fallback to mock data if table doesn't exist
      const mockEvents = generateMockHistoricalData(region, conflict_type, time_range)
      return new Response(JSON.stringify({
        events: mockEvents,
        patterns: analyzePatterns(mockEvents),
        analysis: {
          total_events: mockEvents.length,
          unique_regions: [...new Set(mockEvents.map(e => e.region))],
          data_source: 'mock_fallback'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const patterns = analyzePatterns(events || [])

    return new Response(JSON.stringify({
      events: events || [],
      patterns,
      analysis: {
        total_events: events?.length || 0,
        unique_regions: [...new Set(events?.map(e => e.region))],
        common_triggers: patterns.triggers,
        escalation_patterns: patterns.escalations,
        data_source: 'live'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

function analyzePatterns(events: any[]) {
  const triggers = events
    .filter(e => e.trigger)
    .map(e => e.trigger)
    .reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1
      return acc
    }, {})

  const escalations = events
    .filter(e => e.severity)
    .reduce((acc, event) => {
      const level = event.severity
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})

  return {
    triggers: Object.entries(triggers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    escalations,
    timeline_analysis: generateTimeline(events)
  }
}

function generateTimeline(events: any[]) {
  if (events.length === 0) return []
  
  const sorted = events.sort((a, b) => new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime())
  
  return sorted.map(event => ({
    date: event.created_at || event.date,
    event: event.title || event.name,
    type: event.type || event.category,
    severity: event.severity || event.impact_level,
    region: event.region
  }))
}

function generateMockHistoricalData(region?: string, conflict_type?: string, time_range?: string) {
  const mockData = [
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

  return mockData.filter(event => {
    if (region && !event.region.toLowerCase().includes(region.toLowerCase())) return false
    if (conflict_type && !event.type.toLowerCase().includes(conflict_type.toLowerCase())) return false
    return true
  })
}
