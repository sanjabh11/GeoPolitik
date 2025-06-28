import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || ""
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY") || ""

interface RiskAssessmentRequest {
  regions: string[]
  factors: string[]
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const { regions, factors } = await req.json() as RiskAssessmentRequest
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    )
    
    // Check for cached assessments first
    const { data: cachedData } = await supabase
      .from("risk_assessments")
      .select("*")
      .in("region", regions)
      .gt("expires_at", new Date().toISOString())
    
    if (cachedData && cachedData.length === regions.length) {
      return new Response(JSON.stringify({
        assessments: cachedData.map(item => ({
          region: item.region,
          riskScore: item.risk_score,
          confidenceInterval: item.confidence_interval,
          primaryDrivers: item.factors,
          scenarios: {
            best: { probability: 0.2, description: "Diplomatic resolution" },
            worst: { probability: 0.3, description: "Escalation scenario" },
            mostLikely: { probability: 0.5, description: "Status quo continuation" }
          },
          lastUpdated: item.created_at
        }))
      }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      })
    }
    
    // Fetch latest news data
    const newsData = await fetchLatestNews(regions)
    
    // Generate risk assessment with Gemini 2.5 Flash
    const geminiPrompt = `
      You are an Elite Geopolitical Risk Assessment AI. Analyze current risk for regions: ${regions.join(", ")}.
      Consider factors: ${factors.join(", ") || "all relevant factors"}.
      
      Recent news: ${JSON.stringify(newsData)}
      
      For each region, provide:
      1. Risk score (0-100) with confidence interval
      2. Primary risk drivers with weights and trends
      3. Best/worst/most likely scenarios with probabilities
      
      Format as JSON:
      {
        "assessments": [{
          "region": "string",
          "riskScore": number,
          "confidenceInterval": [number, number],
          "primaryDrivers": [{"factor": "string", "weight": number, "trend": "increasing|stable|decreasing"}],
          "scenarios": {
            "best": {"probability": number, "description": "string"},
            "worst": {"probability": number, "description": "string"},
            "mostLikely": {"probability": number, "description": "string"}
          }
        }]
      }
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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    })
    
    const geminiData = await geminiResponse.json()
    const assessmentContent = geminiData.candidates[0].content.parts[0].text
    
    // Parse the JSON response
    let parsedContent
    try {
      parsedContent = JSON.parse(assessmentContent)
    } catch (error) {
      console.error("Failed to parse Gemini response:", error)
      throw new Error("Invalid response format from AI service")
    }
    
    // Store in Supabase with expiration
    for (const assessment of parsedContent.assessments) {
      await supabase
        .from("risk_assessments")
        .insert({
          region: assessment.region,
          risk_score: assessment.riskScore,
          factors: assessment.primaryDrivers,
          confidence_interval: assessment.confidenceInterval,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min cache
        })
    }
    
    return new Response(JSON.stringify(parsedContent), {
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

async function fetchLatestNews(regions: string[]): Promise<any[]> {
  if (!NEWS_API_KEY) {
    // Return mock data if no API key
    return regions.flatMap(region => [
      {
        title: `Political developments in ${region}`,
        description: `Latest updates on the political situation in ${region}`,
        publishedAt: new Date().toISOString(),
        source: { name: "Mock News" }
      }
    ])
  }
  
  try {
    const promises = regions.map(region => 
      fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(region)}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`)
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
        title: `Political developments in ${region}`,
        description: `Latest updates on the political situation in ${region}`,
        publishedAt: new Date().toISOString(),
        source: { name: "Mock News" }
      }
    ])
  }
}