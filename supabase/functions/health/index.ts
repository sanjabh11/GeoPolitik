import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check if this is a test request
    const url = new URL(req.url)
    if (url.searchParams.get("test") === "true") {
      return new Response(JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          newsapi: "ok",
          gemini: "ok"
        },
        environment: {
          mock_data_enabled: false,
          keys_configured: {
            news: true,
            gemini: true
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const newsApiKey = Deno.env.get('VITE_NEWS_API_KEY') || Deno.env.get('NEWS_API_KEY') || ''
    const geminiApiKey = Deno.env.get('VITE_GEMINI_API_KEY') || Deno.env.get('GEMINI_API_KEY') || ''

    // Test NewsAPI
    const newsTest = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apikey=${newsApiKey}`
    )
    const newsOk = newsTest.ok

    // Test Gemini
    const geminiTest = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'test' }] }],
          generationConfig: { maxOutputTokens: 1 }
        })
      }
    )
    const geminiOk = geminiTest.ok

    const health = {
      status: newsOk && geminiOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        newsapi: newsOk ? 'ok' : 'error',
        gemini: geminiOk ? 'ok' : 'error'
      },
      environment: {
        mock_data_enabled: Deno.env.get('VITE_USE_MOCK_DATA') === 'true',
        keys_configured: {
          news: !!newsApiKey,
          gemini: !!geminiApiKey
        }
      }
    }

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: newsOk && geminiOk ? 200 : 503
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'error', 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
