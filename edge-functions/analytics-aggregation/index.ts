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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get resource analytics
    const { data: resourceViews, error: viewsError } = await supabaseClient
      .from('resource_views')
      .select('*')
      .order('last_viewed_at', { ascending: false })
      .limit(1000)

    if (viewsError) throw viewsError

    // Get reading progress
    const { data: readingProgress, error: progressError } = await supabaseClient
      .from('reading_progress')
      .select('*')
      .order('last_read_at', { ascending: false })
      .limit(1000)

    if (progressError) throw progressError

    // Aggregate analytics
    const analytics = {
      totalResourceViews: resourceViews?.length || 0,
      totalReadingProgress: readingProgress?.length || 0,
      popularResources: aggregatePopularResources(resourceViews),
      readingInsights: generateReadingInsights(readingProgress),
      recommendations: generateRecommendations(resourceViews, readingProgress),
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(analytics),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function aggregatePopularResources(views: any[]) {
  const resourceCounts = new Map()
  
  views?.forEach(view => {
    const key = `${view.resource_type}:${view.resource_id}`
    if (!resourceCounts.has(key)) {
      resourceCounts.set(key, {
        type: view.resource_type,
        id: view.resource_id,
        views: 0,
        totalTime: 0
      })
    }
    
    const data = resourceCounts.get(key)
    data.views += view.view_count
    data.totalTime += view.total_view_time_seconds
  })
  
  return Array.from(resourceCounts.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

function generateReadingInsights(progress: any[]) {
  const insights = {
    totalBooks: 0,
    totalReadingTime: 0,
    averageProgress: 0,
    completedBooks: 0,
    mostActiveReader: null as any,
    readingStreak: 0
  }

  if (!progress || progress.length === 0) return insights

  const userProgress = new Map()
  let totalProgress = 0

  progress.forEach(item => {
    insights.totalBooks += 1
    insights.totalReadingTime += item.reading_time_seconds
    totalProgress += item.progress_percentage

    if (item.progress_percentage === 100) {
      insights.completedBooks += 1
    }

    if (!userProgress.has(item.user_id)) {
      userProgress.set(item.user_id, 0)
    }
    userProgress.set(item.user_id, userProgress.get(item.user_id) + 1)
  })

  insights.averageProgress = Math.round(totalProgress / progress.length)

  // Find most active reader
  let maxReads = 0
  for (const [userId, count] of userProgress) {
    if (count > maxReads) {
      maxReads = count
      insights.mostActiveReader = userId
    }
  }

  return insights
}

function generateRecommendations(views: any[], progress: any[]) {
  const recommendations = {
    trending: [] as any[],
    basedOnHistory: [] as any[],
    popular: [] as any[]
  }

  // Simple recommendation logic based on views and progress
  const viewedResources = new Set(views?.map(v => `${v.resource_type}:${v.resource_id}`) || [])
  const readingResources = new Set(progress?.map(p => `book:${p.book_id}`) || [])

  // Generate trending recommendations
  const trending = aggregatePopularResources(views)
  recommendations.trending = trending.slice(0, 5)

  // Generate based on history
  const historyBased = Array.from(viewedResources)
    .filter(id => !readingResources.has(id))
    .slice(0, 5)
  recommendations.basedOnHistory = historyBased

  // Generate popular recommendations
  recommendations.popular = trending.slice(0, 3)

  return recommendations
}
