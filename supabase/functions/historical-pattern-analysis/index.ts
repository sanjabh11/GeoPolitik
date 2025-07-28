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

    // Query historical events with filters
    let query = supabase
      .from('historical_events')
      .select('*')
      .order('date', { ascending: false })

    if (region) {
      query = query.eq('region', region)
    }
    if (conflict_type) {
      query = query.eq('conflict_type', conflict_type)
    }
    if (time_range) {
      const [start_date, end_date] = time_range.split(',')
      query = query.gte('date', start_date).lte('date', end_date)
    }

    const { data: events, error } = await query

    if (error) throw error

    // Pattern analysis
    const patterns = analyzePatterns(events || [])

    return new Response(JSON.stringify({
      events: events || [],
      patterns,
      analysis: {
        total_events: events?.length || 0,
        unique_regions: [...new Set(events?.map(e => e.region))],
        common_triggers: patterns.triggers,
        escalation_patterns: patterns.escalations
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
    .filter(e => e.trigger_event)
    .map(e => e.trigger_event)
    .reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1
      return acc
    }, {})

  const escalations = events
    .filter(e => e.escalation_level)
    .reduce((acc, event) => {
      const level = event.escalation_level
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
  
  const sorted = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return sorted.map(event => ({
    date: event.date,
    event: event.title,
    type: event.conflict_type,
    severity: event.severity_score,
    region: event.region
  }))
}
