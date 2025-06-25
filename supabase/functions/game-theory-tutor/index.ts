import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || ""
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"

interface TutorialRequest {
  level: 'basic' | 'intermediate' | 'advanced'
  topic: string
  userProgress: {
    completedModules: string[]
    currentScore: number
  }
}

interface TutorialResponse {
  concept: string
  explanation: string
  geopoliticalExample: string
  interactiveElement: {
    type: 'scenario' | 'calculation' | 'game_tree'
    data: any
  }
  assessmentQuestion: {
    question: string
    options: string[]
    correctAnswer: number
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
    const { level, topic, userProgress } = await req.json() as TutorialRequest
    
    // Get user's learning history
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
    
    // Generate personalized tutorial with Gemini
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a game theory tutorial for ${level} level on topic: ${topic}. 
            User has completed: ${userProgress.completedModules.join(", ")}
            Current score: ${userProgress.currentScore}
            
            Provide:
            1. Clear concept explanation with mathematical foundation
            2. Real geopolitical example with specific countries/situations
            3. Interactive element (scenario, calculation, or game tree)
            4. Assessment question with multiple choice options
            
            Format as JSON matching this structure:
            {
              "concept": "string",
              "explanation": "string",
              "geopoliticalExample": "string",
              "interactiveElement": {
                "type": "scenario|calculation|game_tree",
                "data": {}
              },
              "assessmentQuestion": {
                "question": "string",
                "options": ["string"],
                "correctAnswer": number
              }
            }`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })
    
    const geminiData = await geminiResponse.json()
    const tutorialContent = geminiData.candidates[0].content.parts[0].text
    
    // Parse the JSON response
    let parsedContent: TutorialResponse
    try {
      parsedContent = JSON.parse(tutorialContent)
    } catch (error) {
      console.error("Failed to parse Gemini response:", error)
      throw new Error("Invalid response format from AI service")
    }
    
    // Store progress in Supabase if user is authenticated
    if (userId !== "anonymous") {
      await supabase
        .from("learning_progress")
        .upsert({
          user_id: userId,
          module_id: `${level}_${topic}`,
          last_accessed: new Date().toISOString(),
          performance_data: { 
            userProgress,
            topic,
            level
          }
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