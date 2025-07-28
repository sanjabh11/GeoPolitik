import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitStore: RateLimitStore = {}

const rateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000, // Enterprise tier
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const userAgent = req.headers.get('user-agent') || ''
  
  return `${forwarded || realIp || 'unknown'}-${userAgent.slice(0, 20)}`
}

function checkRateLimit(clientId: string): {
  allowed: boolean
  resetTime: number
  remaining: number
} {
  const now = Date.now()
  const clientLimit = rateLimitStore[clientId]

  if (!clientLimit || now > clientLimit.resetTime) {
    rateLimitStore[clientId] = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
    }
  }

  const clientData = rateLimitStore[clientId]
  const remaining = Math.max(0, rateLimitConfig.maxRequests - clientData.count)

  return {
    allowed: remaining > 0,
    resetTime: clientData.resetTime,
    remaining,
  }
}

function incrementCounter(clientId: string): void {
  if (rateLimitStore[clientId]) {
    rateLimitStore[clientId].count++
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(clientId)

    // Add rate limit headers
    const headers = new Headers(corsHeaders)
    headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString())
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers,
        }
      )
    }

    // Log request for analytics
    const url = new URL(req.url)
    const endpoint = url.pathname
    const method = req.method

    console.log(`API Request: ${method} ${endpoint} from ${clientId}`)

    // Process the actual request
    const response = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    })

    // Increment counter if not a successful cached response
    if (response.status >= 200 && response.status < 300) {
      incrementCounter(clientId)
    }

    // Add rate limit headers to response
    const responseHeaders = new Headers(response.headers)
    Object.entries(headers).forEach(([key, value]) => {
      responseHeaders.set(key, value)
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })

  } catch (error) {
    console.error('API Rate Limit Error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
