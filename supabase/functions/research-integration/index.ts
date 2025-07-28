import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ResearchQuery {
  topics: string[];
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  includeCode: boolean;
  includeDatasets: boolean;
  minCitations?: number;
}

interface ResearchResponse {
  papers: Array<{
    id: string;
    title: string;
    abstract: string;
    authors: string[];
    published: string;
    citations: number;
    codeUrl?: string;
    datasetUrls: string[];
    relevanceScore: number;
    practicalApplications: string[];
    methodologyInsights: string[];
  }>;
  trends: {
    emergingTopics: string[];
    methodologyEvolution: string[];
    performanceMetrics: Record<string, number>;
  };
  recommendations: {
    platformIntegrations: string[];
    curriculumUpdates: string[];
    researchOpportunities: string[];
  };
}

class PapersWithCodeService {
  private baseUrl = 'https://paperswithcode.com/api/v1'
  
  async searchPapers(query: string, timeframe: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/papers/?search=${encodeURIComponent(query)}&ordering=-published`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GameTheoryGeopoliticsPlatform/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Papers API error: ${response.status}`)
    }
    
    const data = await response.json()
    return this.filterByTimeframe(data.results, timeframe)
  }
  
  async getRepositories(paperId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/papers/${paperId}/repositories/`, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    return data.results || []
  }
  
  async getDatasets(paperId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/papers/${paperId}/datasets/`, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    return data.results || []
  }
  
  async getBenchmarks(task: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(task)}/`, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    return data.benchmarks || []
  }
  
  private filterByTimeframe(papers: any[], timeframe: string): any[] {
    const now = new Date()
    let cutoffDate: Date
    
    switch (timeframe) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        return papers
    }
    
    return papers.filter(paper => {
      const publishedDate = new Date(paper.published)
      return publishedDate >= cutoffDate
    })
  }
}

serve(async (req) => {
  const query: ResearchQuery = await req.json()
  const papersService = new PapersWithCodeService()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  try {
    // Search for papers across all specified topics
    const allPapers: any[] = []
    
    for (const topic of query.topics) {
      const topicPapers = await papersService.searchPapers(topic, query.timeframe)
      allPapers.push(...topicPapers)
    }
    
    // Remove duplicates and sort by relevance
    const uniquePapers = Array.from(
      new Map(allPapers.map(paper => [paper.id, paper])).values()
    ).sort((a, b) => (b.citations || 0) - (a.citations || 0))
    
    // Filter by minimum citations if specified
    const filteredPapers = query.minCitations 
      ? uniquePapers.filter(paper => (paper.citations || 0) >= query.minCitations)
      : uniquePapers.slice(0, 20) // Top 20 papers
    
    // Enhance papers with code and dataset information
    const enhancedPapers = await Promise.all(
      filteredPapers.map(async (paper) => {
        const [repositories, datasets] = await Promise.all([
          query.includeCode ? papersService.getRepositories(paper.id) : [],
          query.includeDatasets ? papersService.getDatasets(paper.id) : []
        ])
        
        return {
          id: paper.id,
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors?.map((a: any) => a.name) || [],
          published: paper.published,
          citations: paper.citations || 0,
          codeUrl: repositories[0]?.url,
          datasetUrls: datasets.map((d: any) => d.url),
          relevanceScore: calculateRelevanceScore(paper, query.topics),
          practicalApplications: [], // Will be filled by Gemini analysis
          methodologyInsights: []    // Will be filled by Gemini analysis
        }
      })
    )
    
    // Analyze research trends and insights with Gemini
    const analysisPrompt = `
      Analyze the following recent research papers in game theory and geopolitics:
      
      Papers: ${JSON.stringify(enhancedPapers.slice(0, 10))} // Limit for token efficiency
      Query Topics: ${query.topics.join(', ')}
      Timeframe: ${query.timeframe}
      
      Provide comprehensive analysis including:
      
      1. TREND ANALYSIS:
         - Emerging research topics and methodologies
         - Evolution in theoretical frameworks
         - Performance improvements in predictive models
      
      2. PRACTICAL APPLICATIONS:
         - How each paper's findings can enhance our platform
         - Implementation opportunities for user stories
         - Integration potential with existing features
      
      3. CURRICULUM INTEGRATION:
         - New concepts to add to educational modules
         - Updated examples and case studies
         - Advanced topics for PhD-level content
      
      4. RESEARCH OPPORTUNITIES:
         - Gaps in current research
         - Collaboration potential
         - Platform-specific research directions
      
      Format response as structured JSON matching the expected analysis format.
      Focus on actionable insights for a game theory education platform.
    `
    
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: analysisPrompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3072,
        }
      })
    })
    
    const analysisResult = await geminiResponse.json()
    const analysis = JSON.parse(analysisResult.candidates[0].content.parts[0].text)
    
    // Apply insights to enhance paper descriptions
    for (let i = 0; i < enhancedPapers.length && i < analysis.paperInsights?.length; i++) {
      enhancedPapers[i].practicalApplications = analysis.paperInsights[i]?.applications || []
      enhancedPapers[i].methodologyInsights = analysis.paperInsights[i]?.methodologies || []
    }
    
    // Store research insights in database for future reference
    await supabase
      .from('research_insights')
      .insert({
        query_topics: query.topics,
        timeframe: query.timeframe,
        paper_count: enhancedPapers.length,
        insights: analysis,
        created_at: new Date().toISOString()
      })
    
    // Build response
    const response: ResearchResponse = {
      papers: enhancedPapers,
      trends: {
        emergingTopics: analysis.trends?.emergingTopics || [],
        methodologyEvolution: analysis.trends?.methodologyEvolution || [],
        performanceMetrics: analysis.trends?.performanceMetrics || {}
      },
      recommendations: {
        platformIntegrations: analysis.recommendations?.platformIntegrations || [],
        curriculumUpdates: analysis.recommendations?.curriculumUpdates || [],
        researchOpportunities: analysis.recommendations?.researchOpportunities || []
      }
    }
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Research integration error:', error)
    
    return new Response(JSON.stringify({
      error: 'Research integration failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Helper function (would be part of a class in real implementation)
function calculateRelevanceScore(paper: any, topics: string[]): number {
  let score = 0
  const title = paper.title?.toLowerCase() || ''
  const abstract = paper.abstract?.toLowerCase() || ''
  
  topics.forEach(topic => {
    const topicLower = topic.toLowerCase()
    if (title.includes(topicLower)) score += 10
    if (abstract.includes(topicLower)) score += 5
  })
  
  // Boost score based on citations
  score += Math.min((paper.citations || 0) / 10, 20)
  
  return Math.round(score)
}
