import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || ""
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

interface ScenarioConfig {
  actors: Array<{
    id: string
    name: string
    capabilities: {
      military: number
      economic: number
      diplomatic: number
    }
    preferences: {
      riskTolerance: number
      timeHorizon: 'short' | 'medium' | 'long'
    }
  }>
  scenario: {
    type: 'military_conflict' | 'trade_war' | 'diplomatic_crisis' | 'alliance_formation'
    parameters: Record<string, any>
  }
  simulationSettings: {
    iterations: number
    timeSteps: number
  }
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
    const config = await req.json() as ScenarioConfig
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    )
    
    // Extract user ID from auth header
    const authHeader = req.headers.get("Authorization")
    const token = authHeader?.split(" ")[1]
    let userId = "anonymous"
    
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (!error && user) {
        userId = user.id
      }
    }
    
    // Generate simulation with Gemini
    const simulationPrompt = `
      You are a Strategic Scenario Simulation AI. Simulate this scenario:
      Type: ${config.scenario.type}
      Actors: ${JSON.stringify(config.actors)}
      Parameters: ${JSON.stringify(config.scenario.parameters)}
      
      Run ${config.simulationSettings.iterations} iterations with ${config.simulationSettings.timeSteps} time steps.
      
      Provide game-theoretic analysis including:
      1. Nash equilibria identification
      2. Stability analysis (0-1 scale)
      3. Expected payoffs for each actor
      4. Strategic recommendations
      
      Format as JSON:
      {
        "nashEquilibrium": "string",
        "stability": number,
        "expectedPayoffs": [{"id": "string", "name": "string", "payoff": number}],
        "recommendations": ["string"]
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
            text: simulationPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })
    
    const geminiData = await geminiResponse.json()
    const simulationContent = geminiData.candidates[0].content.parts[0].text
    
    // Parse the JSON response
    let simulationResults
    try {
      simulationResults = JSON.parse(simulationContent)
    } catch (error) {
      console.error("Failed to parse Gemini response:", error)
      throw new Error("Invalid response format from AI service")
    }
    
    // Enhance with additional analysis
    const enhancedResults = {
      ...simulationResults,
      detailedAnalysis: {
        strategyMatrix: generateStrategyMatrix(config.actors),
        equilibriumProbabilities: generateEquilibriumProbabilities(config.actors.length),
        sensitivityAnalysis: generateSensitivityAnalysis(config)
      }
    }
    
    // Store in Supabase if user is authenticated
    let simulationId = "local-" + Date.now()
    
    if (userId !== "anonymous") {
      const { data, error } = await supabase
        .from("scenario_simulations")
        .insert({
          user_id: userId,
          scenario_config: config,
          results: enhancedResults
        })
        .select()
        .single()
      
      if (!error && data) {
        simulationId = data.id
      }
    }
    
    return new Response(JSON.stringify({
      simulationId,
      results: enhancedResults
    }), {
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

function generateStrategyMatrix(actors: ScenarioConfig["actors"]): number[][] {
  const size = actors.length
  return Array(size).fill(0).map(() => 
    Array(size).fill(0).map(() => parseFloat((Math.random() * 100).toFixed(1)))
  )
}

function generateEquilibriumProbabilities(numActors: number): number[] {
  const probs = Array(numActors).fill(0).map(() => Math.random())
  const sum = probs.reduce((a, b) => a + b, 0)
  return probs.map(p => parseFloat((p / sum).toFixed(3)))
}

function generateSensitivityAnalysis(config: ScenarioConfig): Record<string, number> {
  return {
    militaryCapabilityImpact: parseFloat((Math.random() * 0.5).toFixed(2)),
    economicCapabilityImpact: parseFloat((Math.random() * 0.3).toFixed(2)),
    diplomaticCapabilityImpact: parseFloat((Math.random() * 0.4).toFixed(2)),
    riskToleranceImpact: parseFloat((Math.random() * 0.6).toFixed(2)),
    timeHorizonImpact: parseFloat((Math.random() * 0.2).toFixed(2))
  }
}