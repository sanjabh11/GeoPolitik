import { supabase } from '../lib/supabase'

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || ''
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

class DataService {
  private requestCount: number = 0
  private lastRequestTime: number = 0
  private readonly RATE_LIMIT_DELAY = 1000 // 1 second between requests

  private async rateLimitedRequest(requestFn: () => Promise<any>): Promise<any> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest))
    }
    
    this.lastRequestTime = Date.now()
    this.requestCount++
    
    return requestFn()
  }

  async fetchLatestNews(regions: string[], keywords: string[] = []): Promise<any[]> {
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key') {
      console.warn('News API key not found. Using mock news data.')
      return this.getMockNewsData(regions)
    }

    try {
      return await this.rateLimitedRequest(async () => {
        const promises = regions.map(region => {
          const query = `${region} ${keywords.join(' OR ')}`
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)
          
          return fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}&pageSize=5&language=en`, {
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId))
        })
        
        const responses = await Promise.all(promises)
        const results = await Promise.all(responses.map(r => r.json()))
        
        return results.flatMap((response, index) => {
          const articles = response.articles || []
          return articles.slice(0, 5).map((article: any) => ({
            ...article,
            region: regions[index]
          }))
        })
      })
    } catch (error: any) {
      console.error('News API Error:', error)
      return this.getMockNewsData(regions)
    }
  }

  private getMockNewsData(regions: string[]): any[] {
    return regions.flatMap(region => [
      {
        title: `Political tensions rise in ${region}`,
        description: `Diplomatic relations strained as leaders exchange strong statements regarding border disputes in ${region}.`,
        publishedAt: new Date().toISOString(),
        source: { name: "Global News Network" },
        region: region,
        url: `https://example.com/news/${region.toLowerCase().replace(/\s+/g, '-')}-tensions`,
        urlToImage: `https://via.placeholder.com/400x200?text=${region}+News`
      },
      {
        title: `Economic developments in ${region}`,
        description: `New trade agreements and economic policies are reshaping the business landscape in ${region}.`,
        publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        source: { name: "Economic Times" },
        region: region,
        url: `https://example.com/news/${region.toLowerCase().replace(/\s+/g, '-')}-economy`,
        urlToImage: `https://via.placeholder.com/400x200?text=${region}+Economy`
      }
    ])
  }

  async getCachedRiskAssessments(regions: string[]): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .in('region', regions)
        .gt('expires_at', new Date().toISOString())
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Cache fetch error:', error)
      return this.getMockRiskAssessments(regions)
    }
  }

  private getMockRiskAssessments(regions: string[]): any[] {
    return regions.map(region => ({
      region,
      risk_score: Math.floor(Math.random() * 40) + 40, // 40-80 range
      confidence_interval: [
        Math.floor(Math.random() * 40) + 35,
        Math.floor(Math.random() * 40) + 65
      ],
      factors: [
        { factor: "Political Stability", weight: 0.3, trend: "stable" },
        { factor: "Economic Conditions", weight: 0.25, trend: "improving" },
        { factor: "Security Situation", weight: 0.25, trend: "stable" },
        { factor: "International Relations", weight: 0.2, trend: "stable" }
      ],
      created_at: new Date().toISOString()
    }))
  }

  async fetchEconomicIndicators(countries: string[]): Promise<any> {
    try {
      // World Bank API integration for economic indicators
      const promises = countries.map(async country => {
        const countryCode = this.getCountryCode(country)
        if (!countryCode) return null

        const [gdpResponse, inflationResponse, unemploymentResponse] = await Promise.all([
          fetch(`https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1`),
          fetch(`https://api.worldbank.org/v2/country/${countryCode}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1`),
          fetch(`https://api.worldbank.org/v2/country/${countryCode}/indicator/SL.UEM.TOTL.ZS?format=json&per_page=1`)
        ])

        const [gdpData, inflationData, unemploymentData] = await Promise.all([
          gdpResponse.json(),
          inflationResponse.json(),
          unemploymentResponse.json()
        ])

        return {
          country,
          gdp_growth: gdpData[1]?.[0]?.value || Math.random() * 10 - 2,
          inflation: inflationData[1]?.[0]?.value || Math.random() * 8,
          unemployment: unemploymentData[1]?.[0]?.value || Math.random() * 15,
          lastUpdated: new Date().toISOString()
        }
      })

      const indicators = await Promise.all(promises)
      return { indicators: indicators.filter(Boolean) }
    } catch (error) {
      console.error('World Bank API Error:', error)
      // Fallback to mock data if API fails
      return {
        indicators: countries.map(country => ({
          country,
          gdp_growth: Math.random() * 10 - 2,
          inflation: Math.random() * 8,
          unemployment: Math.random() * 15,
          lastUpdated: new Date().toISOString()
        }))
      }
    }
  }

  private getCountryCode(region: string): string {
    const countryMap: { [key: string]: string } = {
      'Eastern Europe': 'EU',
      'South China Sea': 'CHN',
      'Middle East': 'ARB',
      'Central Africa': 'AFR',
      'Korean Peninsula': 'KOR',
      'Latin America': 'LAC',
      'South Asia': 'SAS',
      'Arctic Region': 'WLD'
    }
    return countryMap[region] || 'WLD'
  }

  async fetchSentimentData(regions: string[]): Promise<any> {
    // Mock sentiment analysis
    return regions.map(region => ({
      region,
      sentiment: Math.random() * 2 - 1,
      confidence: Math.random(),
      sources: ['social_media', 'news'],
      lastUpdated: new Date().toISOString()
    }))
  }

  // Learning Progress Methods
  async getUserLearningProgress(userId: string): Promise<{ data: any[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false })
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching learning progress:', error)
      return { data: null, error }
    }
  }

  async saveLearningProgress(
    userId: string,
    moduleId: string,
    progress: any
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          module_name: progress.module_name || progress.title || 'Unknown Module',
          completion_percentage: progress.completionPercentage || 0,
          last_accessed: new Date().toISOString(),
          performance_data: progress
        }, {
          onConflict: 'user_id,module_id'
        })

      if (error) {
        console.error('Error saving learning progress:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in saveLearningProgress:', error);
      throw error;
    }
  }

  // Crisis Event Methods
  async saveCrisisEvent(event: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('crisis_events')
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
      
      if (error) throw error
    } catch (error) {
      console.error('Error saving crisis event:', error)
      throw error
    }
  }

  // Risk Assessment Methods
  async saveRiskAssessment(assessment: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('risk_assessments')
        .insert({
          region: assessment.region,
          risk_score: assessment.riskScore,
          factors: assessment.primaryDrivers,
          confidence_interval: assessment.confidenceInterval,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min cache
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Error saving risk assessment:', error)
      throw error
    }
  }

  // Economic Modeling Methods
  async saveEconomicModel(scenarioId: string, modelData: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('economic_models')
        .insert({
          scenario_id: scenarioId,
          model_type: modelData.model_type || 'economic_impact',
          parameters: modelData.parameters || {},
          results: modelData.results || {},
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error saving economic model:', error)
      throw error
    }
  }

  async getEconomicModels(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('economic_models')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching economic models:', error)
      return []
    }
  }

  // Scenario Simulation Methods
  async getSimulationHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('scenario_simulations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching simulation history:', error)
      return []
    }
  }

  async saveScenarioSimulation(userId: string, config: any, results: any): Promise<string> {
    try {
      const simulationName = config.scenario?.type ? 
        `${config.scenario.type.replace('_', ' ').toUpperCase()} Simulation - ${new Date().toLocaleDateString()}` :
        `Geopolitical Simulation - ${new Date().toLocaleDateString()}`
      
      const scenarioType = config.scenario?.type || 'diplomatic_crisis' // Default fallback
      
      const { data, error } = await supabase
        .from('scenario_simulations')
        .insert({
          user_id: userId,
          name: simulationName,
          scenario_type: scenarioType,
          scenario_config: config,
          results: results,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error saving scenario simulation:', error)
      throw error
    }
  }

  // Advanced Analytics Methods
  async saveNLQuery(userId: string, query: string, response: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('nl_queries')
        .insert({
          user_id: userId,
          query_text: query,
          response_data: response,
          created_at: new Date().toISOString()
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Error saving NL query:', error)
      // Continue even if save fails
    }
  }

  async saveGeneratedReport(userId: string, report: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('generated_reports')
        .insert({
          user_id: userId,
          report_type: report.type,
          title: report.title,
          content: report.sections,
          created_at: new Date().toISOString()
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Error saving generated report:', error)
      // Continue even if save fails
    }
  }

  // Mobile & Offline Methods
  async syncOfflineData(userId: string, offlineData: any): Promise<void> {
    try {
      // In a real implementation, this would sync with Supabase
      console.log('Syncing offline data for user:', userId);
      
      // For now, just update localStorage
      localStorage.setItem('offlineData', JSON.stringify({
        ...offlineData,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error syncing offline data:', error);
      throw error;
    }
  }

  async generateTutorial(level: string, topic: string, userProgress: any): Promise<any> {
    try {
      // Try edge function first
      console.log('Attempting to use edge function...')
      const response = await supabase.functions.invoke('game-theory-tutor', {
        body: { level, topic, userProgress }
      })

      if (response.data && !response.error) {
        console.log('Successfully generated tutorial via edge function')
        return response.data
      }

      if (response.error) {
        console.error('Edge function error:', response.error)
      }
    } catch (error) {
      console.error('Edge function failed:', error)
    }

    // Fallback to mock data
    console.log('Using mock tutorial data as fallback')
    return this.getMockTutorial(level, topic)
  }

  private getMockTutorial(level: string, topic: string): any {
    const tutorials = {
      'basic': {
        concept: topic,
        explanation: `This is a basic tutorial about ${topic}. In game theory, ${topic} refers to strategic interactions between rational decision-makers.`,
        geopoliticalExample: `Consider the relationship between two neighboring countries negotiating trade agreements. ${topic} helps analyze their strategic choices.`,
        interactiveElement: {
          type: 'scenario',
          data: {
            scenario: 'Two countries deciding whether to cooperate or compete',
            choices: ['Cooperate', 'Compete'],
            outcomes: {
              'Cooperate': 'Both countries benefit',
              'Compete': 'One country may benefit more'
            }
          }
        },
        assessmentQuestion: {
          question: `What is the primary focus of ${topic}?`,
          options: ['Individual decision making', 'Strategic interaction', 'Random outcomes', 'Economic growth'],
          correctAnswer: 1
        }
      }
    }

    return tutorials[level] || tutorials.basic
  }
}

export const dataService = new DataService()