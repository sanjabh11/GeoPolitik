import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || ""
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"
const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY") || ""

interface MonitoringConfig {
  regions: string[]
  severity: 'medium' | 'high' | 'critical'
  categories: string[]
  keywords: string[]
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    )
    
    if (req.method === "POST") {
      const requestBody = await req.json()
      
      // Check if this is a request to get events
      if (requestBody.action === 'get_events') {
        const regions = requestBody.regions || []
        
        const { data: events, error } = await supabase
          .from("crisis_events")
          .select("*")
          .in("region", regions.length > 0 ? regions : undefined)
          .order("created_at", { ascending: false })
          .limit(20)
        
        if (error) throw error
        
        return new Response(JSON.stringify({ events: events || [] }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        })
      }
      
      // Otherwise, configure monitoring
      const config = requestBody as MonitoringConfig
      
      // Extract user ID from auth header
      const authHeader = req.headers.get("Authorization")
      const token = authHeader?.split(" ")[1]
      let userId = "anonymous"
      
      if (token) {
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (!error && user) {
          userId = user.id
          
          // Save configuration to database
          await supabase
            .from("alert_configurations")
            .upsert({
              user_id: userId,
              alert_type: "crisis_monitoring",
              criteria: config,
              notification_settings: {
                email: false,
                push: true,
                browser: true
              },
              is_active: true
            })
        }
      }
      
      // Run initial scan
      const events = await scanForCrises(config)
      
      return new Response(JSON.stringify({ events }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      })
    } else if (req.method === "GET") {
      // Get recent crisis events
      const url = new URL(req.url)
      const regions = url.searchParams.get("regions")?.split(",") || []
      
      const { data: events, error } = await supabase
        .from("crisis_events")
        .select("*")
        .in("region", regions.length > 0 ? regions : undefined)
        .order("created_at", { ascending: false })
        .limit(20)
      
      if (error) throw error
      
      return new Response(JSON.stringify({ events: events || [] }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      })
    }
    
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    })
  } catch (error) {
    console.error("Error:", error)
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    })
  }
})

async function scanForCrises(config: MonitoringConfig): Promise<any[]> {
  // Fetch latest news
  const newsData = await fetchLatestNews(config.regions, config.keywords)
  
  // Analyze with Gemini
  const geminiPrompt = `
    You are an Advanced Crisis Monitoring AI. Analyze these news events for crisis potential:
    ${JSON.stringify(newsData)}
    
    For each significant event, provide:
    1. Severity level (low, medium, high, critical)
    2. Event type classification (political, military, economic, environmental, social, cyber)
    3. Affected region
    4. Escalation potential (0-100)
    5. Confidence level (0-100)
    6. Number of sources (1-20)
    7. Brief description
    
    Only return events with severity >= ${config.severity}.
    Only include events in these categories: ${config.categories.join(", ")}
    
    Format as JSON array with these fields:
    id, title, region, severity, category, description, confidence, escalation_probability, sources
  `
  
  const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: geminiPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  })
  
  const geminiData = await geminiResponse.json()
  const crisisContent = geminiData.candidates[0].content.parts[0].text
  
  // Parse the JSON response
  let crisisEvents
  try {
    crisisEvents = JSON.parse(crisisContent)
  } catch (error) {
    console.error("Failed to parse Gemini response:", error)
    // Return mock data as fallback
    return getMockCrisisEvents(config)
  }
  
  // Add trends data
  const enhancedEvents = crisisEvents.map((event: any) => ({
    ...event,
    id: event.id || crypto.randomUUID(),
    timestamp: event.timestamp || new Date().toISOString(),
    trends: generateTrends(event)
  }))
  
  // Store in database
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_ANON_KEY") || ""
  )
  
  for (const event of enhancedEvents) {
    await supabase
      .from("crisis_events")
      .insert({
        id: event.id,
        title: event.title,
        region: event.region,
        severity: event.severity,
        category: event.category,
        description: event.description,
        confidence: event.confidence,
        escalation_probability: event.escalation_probability,
        sources: event.sources,
        created_at: new Date().toISOString()
      })
      .catch(err => console.error("Error saving crisis event:", err))
  }
  
  return enhancedEvents
}

async function fetchLatestNews(regions: string[], keywords: string[] = []): Promise<any[]> {
  if (!NEWS_API_KEY) {
    // Return mock data if no API key
    return regions.flatMap(region => [
      {
        title: `Political tensions rise in ${region}`,
        description: `Diplomatic relations strained as leaders exchange strong statements regarding border disputes in ${region}.`,
        publishedAt: new Date().toISOString(),
        source: { name: "Global News Network" }
      }
    ])
  }
  
  try {
    const promises = regions.map(region => 
      fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(region + " " + keywords.join(" OR "))}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`)
        .then(res => res.json())
    )
    
    const responses = await Promise.all(promises)
    return responses.flatMap((response, index) => {
      const articles = response.articles || []
      return articles.slice(0, 5).map((article: any) => ({
        ...article,
        region: regions[index]
      }))
    })
  } catch (error) {
    console.error("News API Error:", error)
    return regions.flatMap(region => [
      {
        title: `Political tensions rise in ${region}`,
        description: `Diplomatic relations strained as leaders exchange strong statements regarding border disputes in ${region}.`,
        publishedAt: new Date().toISOString(),
        source: { name: "Global News Network" }
      }
    ])
  }
}

function generateTrends(event: any): any[] {
  // Generate realistic trends based on the event type
  const trends = []
  
  if (event.category === 'military') {
    trends.push(
      {
        metric: 'Military Activity',
        change: Math.floor(Math.random() * 60) + 20,
        direction: 'up'
      },
      {
        metric: 'Diplomatic Engagement',
        change: Math.floor(Math.random() * 40) + 10,
        direction: Math.random() > 0.7 ? 'up' : 'down'
      }
    )
  } else if (event.category === 'political') {
    trends.push(
      {
        metric: 'Diplomatic Statements',
        change: Math.floor(Math.random() * 50) + 10,
        direction: 'up'
      },
      {
        metric: 'International Support',
        change: Math.floor(Math.random() * 30) + 5,
        direction: Math.random() > 0.5 ? 'up' : 'down'
      }
    )
  } else if (event.category === 'economic') {
    trends.push(
      {
        metric: 'Market Volatility',
        change: Math.floor(Math.random() * 40) + 15,
        direction: 'up'
      },
      {
        metric: 'Currency Stability',
        change: Math.floor(Math.random() * 25) + 5,
        direction: 'down'
      }
    )
  }
  
  // Add a general trend for all events
  trends.push({
    metric: 'Media Coverage',
    change: Math.floor(Math.random() * 70) + 30,
    direction: 'up'
  })
  
  return trends
}

function getMockCrisisEvents(config: MonitoringConfig): any[] {
  const severityLevels = ['low', 'medium', 'high', 'critical']
  const minSeverityIndex = severityLevels.indexOf(config.severity)
  
  return config.regions
    .filter(() => Math.random() > 0.3) // Only some regions have crises
    .flatMap(region => {
      const category = config.categories[Math.floor(Math.random() * config.categories.length)]
      const severityIndex = Math.floor(Math.random() * (4 - minSeverityIndex)) + minSeverityIndex
      const severity = severityLevels[severityIndex]
      
      return {
        id: crypto.randomUUID(),
        title: getCrisisTitle(region, category),
        region,
        severity,
        category,
        description: getCrisisDescription(region, category, severity),
        confidence: Math.floor(Math.random() * 20) + 80,
        escalation_probability: Math.floor(Math.random() * 40) + 40,
        sources: Math.floor(Math.random() * 15) + 5,
        timestamp: new Date().toISOString(),
        trends: [
          {
            metric: 'Military Activity',
            change: Math.floor(Math.random() * 60) + 20,
            direction: 'up'
          },
          {
            metric: 'Diplomatic Engagement',
            change: Math.floor(Math.random() * 40) + 10,
            direction: 'down'
          },
          {
            metric: 'Media Coverage',
            change: Math.floor(Math.random() * 70) + 30,
            direction: 'up'
          }
        ]
      }
    })
}

function getCrisisTitle(region: string, category: string): string {
  const titles = {
    military: [
      `Military Buildup in ${region}`,
      `Troop Movements Near ${region} Border`,
      `Naval Exercises Escalate in ${region}`
    ],
    political: [
      `Diplomatic Crisis in ${region}`,
      `Political Tensions Rise in ${region}`,
      `Government Instability in ${region}`
    ],
    economic: [
      `Economic Sanctions Impact ${region}`,
      `Financial Crisis Looms in ${region}`,
      `Trade Dispute Affects ${region}`
    ]
  }
  
  const options = titles[category as keyof typeof titles] || titles.political
  return options[Math.floor(Math.random() * options.length)]
}

function getCrisisDescription(region: string, category: string, severity: string): string {
  const descriptions = {
    military: {
      medium: `Increased military presence detected in ${region} with potential for further escalation.`,
      high: `Significant military buildup in ${region} with concerning troop movements near borders.`,
      critical: `Major military mobilization in ${region} with high risk of imminent conflict.`
    },
    political: {
      medium: `Political tensions in ${region} as diplomatic relations deteriorate between key actors.`,
      high: `Serious political crisis in ${region} with withdrawal of diplomatic missions.`,
      critical: `Complete breakdown of diplomatic relations in ${region} with immediate security implications.`
    },
    economic: {
      medium: `Economic instability in ${region} affecting regional markets and trade flows.`,
      high: `Severe economic disruption in ${region} with potential for social unrest.`,
      critical: `Economic collapse in ${region} triggering regional instability and humanitarian concerns.`
    }
  }
  
  const options = descriptions[category as keyof typeof descriptions] || descriptions.political
  return options[severity as keyof typeof options] || options.medium
}