import axios from 'axios'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string
    }>
  }>
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
  }
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

class GeminiService {
  private apiKey: string
  private requestCount: number = 0
  private lastRequestTime: number = 0
  private readonly RATE_LIMIT_DELAY = 1000 // 1 second between requests

  constructor() {
    this.apiKey = GEMINI_API_KEY
    if (!this.apiKey || this.apiKey === 'AIzaSyDmpYnphVeUXH1v4NUyhR47Jx61zIU3GYQ') {
      console.warn('Gemini API key not found or using placeholder. Using mock responses.')
    }
  }

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

  async generateContent(prompt: string, config?: GeminiRequest['generationConfig']): Promise<string> {
    if (!this.apiKey || this.apiKey === 'AIzaSyDmpYnphVeUXH1v4NUyhR47Jx61zIU3GYQ' || USE_MOCK_DATA) {
      console.warn('Using mock response due to missing/invalid API key or development mode.')
      return this.getMockResponse(prompt)
    }

    try {
      return await this.rateLimitedRequest(async () => {
        const request: GeminiRequest = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            ...config
          }
        }

        const response = await axios.post<GeminiResponse>(
          `${GEMINI_API_URL}?key=${this.apiKey}`,
          request,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
          }
        )

        return response.data.candidates[0]?.content?.parts[0]?.text || 'No response generated'
      })
    } catch (error: any) {
      console.error('Gemini API Error:', error.response?.status, error.response?.statusText)
      
      // Handle specific error codes
      if (error.response?.status === 429) {
        console.warn('Rate limit exceeded, using mock response')
      } else if (error.response?.status === 403) {
        console.warn('API key invalid or quota exceeded, using mock response')
      } else if (error.response?.status === 400) {
        console.warn('Bad request to Gemini API, using mock response')
      }
      
      return this.getMockResponse(prompt)
    }
  }

  private getMockResponse(prompt: string): string {
    // Always return valid JSON strings for all prompt types
    if (prompt.includes('game theory')) {
      return JSON.stringify({
        concept: "Nash Equilibrium",
        explanation: "A Nash equilibrium is a solution concept where no player can unilaterally improve their payoff by changing their strategy. It represents a stable state where each player's strategy is optimal given the strategies of other players.",
        geopoliticalExample: "In nuclear deterrence, both superpowers choosing to maintain nuclear arsenals represents a Nash equilibrium. Neither country can unilaterally disarm without becoming vulnerable, even though mutual disarmament might be more efficient.",
        interactiveElement: {
          type: "scenario",
          data: {
            players: ["Country A", "Country B"],
            strategies: ["Cooperate", "Defect"],
            payoffs: [[3, 3], [0, 5], [5, 0], [1, 1]]
          }
        },
        assessmentQuestion: {
          question: "What happens when both players choose their dominant strategy in a Prisoner's Dilemma?",
          options: ["They achieve the optimal outcome", "They reach a suboptimal Nash equilibrium", "No equilibrium is reached", "Multiple equilibria are possible"],
          correctAnswer: 1
        }
      })
    }

    if (prompt.includes('economic impact') || prompt.includes('GDP')) {
      return JSON.stringify({
        gdpImpact: {
          primary: { value: -2.3, confidence: [-3.1, -1.5] },
          secondary: { value: -0.8, confidence: [-1.2, -0.4] },
          total: { value: -3.1, confidence: [-4.3, -1.9] }
        },
        tradeFlows: {
          bilateral: { change: -15.2, volume: 245.7, sectors: ["Manufacturing", "Agriculture", "Services"] },
          multilateral: { change: -8.7, volume: 1247.3, affected_countries: 23 }
        },
        employmentEffects: {
          manufacturing: { jobs: -120000, percentage: -3.2 },
          services: { jobs: 45000, percentage: 1.1 },
          agriculture: { jobs: -15000, percentage: -0.8 },
          net: { jobs: -90000, percentage: -1.2 }
        },
        welfareImpact: {
          consumer: { surplus: -2.1, confidence: [-2.8, -1.4] },
          producer: { surplus: 1.3, confidence: [0.8, 1.8] },
          government: { revenue: -0.8, expenditure: 1.2 }
        },
        fiscalImpact: {
          revenue: { change: -0.8, sources: ["Income Tax", "Corporate Tax", "Trade Duties"] },
          expenditure: { change: 1.2, categories: ["Social Security", "Defense", "Infrastructure"] },
          deficit: { change: 2.0, sustainability: "moderate_concern" }
        },
        timeline: {
          immediate: "0-3 months: Initial market disruption and policy responses",
          short_term: "3-12 months: Economic adjustment and adaptation measures",
          medium_term: "1-3 years: Structural changes and new equilibrium",
          long_term: "3+ years: Full economic integration of changes"
        }
      })
    }

    if (prompt.includes('risk assessment')) {
      return JSON.stringify({
        assessments: [{
          region: "Eastern Europe",
          riskScore: 78,
          confidenceInterval: [72, 84],
          primaryDrivers: [
            { factor: "Military Tensions", weight: 0.35, trend: "increasing" },
            { factor: "Energy Security", weight: 0.28, trend: "stable" },
            { factor: "Economic Sanctions", weight: 0.22, trend: "increasing" },
            { factor: "Diplomatic Relations", weight: 0.15, trend: "decreasing" }
          ],
          scenarios: {
            best: { probability: 0.15, description: "Diplomatic resolution through multilateral negotiations leads to de-escalation and partial sanctions relief." },
            worst: { probability: 0.25, description: "Military escalation with regional impact, triggering broader security crisis and severe economic disruption." },
            mostLikely: { probability: 0.60, description: "Continued tensions with periodic escalations, maintaining economic pressure and limited diplomatic engagement." }
          },
          lastUpdated: new Date().toISOString()
        }]
      })
    }

    if (prompt.includes('simulation')) {
      return JSON.stringify({
        nashEquilibrium: "Mutual Cooperation with Verification",
        stability: 0.73,
        expectedPayoffs: [
          { id: "1", name: "Nation Alpha", payoff: 85.2 },
          { id: "2", name: "Nation Beta", payoff: 78.6 },
          { id: "3", name: "Nation Gamma", payoff: 92.1 }
        ],
        recommendations: [
          "Implement confidence-building measures to maintain cooperation",
          "Establish verification mechanisms to prevent defection",
          "Consider graduated response strategies for commitment problems",
          "Develop communication channels for crisis management",
          "Create economic incentives to reinforce cooperative behavior"
        ]
      })
    }

    if (prompt.includes('crisis')) {
      return JSON.stringify([
        {
          id: crypto.randomUUID(),
          title: 'Border Tension Escalation',
          region: 'Eastern Europe',
          severity: 'high',
          category: 'military',
          description: 'Increased military presence detected along contested borders with troop movements and equipment deployments.',
          confidence: 87,
          escalation_probability: 73,
          sources: 12,
          timestamp: new Date().toISOString(),
          trends: [
            { metric: 'Military Activity', change: 45, direction: 'up' },
            { metric: 'Diplomatic Engagement', change: 28, direction: 'down' },
            { metric: 'Media Coverage', change: 65, direction: 'up' }
          ]
        }
      ])
    }

    if (prompt.includes('natural language')) {
      return JSON.stringify({
        intent: "geopolitical_analysis",
        response: "Based on your query, I've analyzed the current situation. The most likely outcome is continued diplomatic tension with periodic escalations, but falling short of direct military conflict. Economic impacts will be significant but contained to specific sectors.",
        suggestions: [
          "What would happen if sanctions were increased?",
          "How might this affect global energy markets?",
          "What are the historical precedents for this situation?"
        ]
      })
    }

    if (prompt.includes('report')) {
      return JSON.stringify({
        title: "Geopolitical Risk Assessment - Q1 2024",
        executive_summary: "This report provides a comprehensive analysis of current geopolitical risks with a focus on Eastern Europe and the South China Sea. Key findings indicate elevated tensions in both regions with potential for economic disruption.",
        sections: [
          { title: "Key Findings", content: "Analysis reveals increasing military activity in Eastern Europe with a 78% risk score and moderate confidence interval. Trade disruptions are likely in the short term." },
          { title: "Risk Assessment", content: "Primary risk drivers include military tensions (35%), energy security concerns (28%), and economic sanctions (22%). Diplomatic relations show a negative trend." },
          { title: "Recommendations", content: "Implement contingency planning for supply chain disruptions. Monitor diplomatic developments closely. Consider hedging strategies for energy exposure." }
        ]
      })
    }

    if (prompt.includes('timeline')) {
      return JSON.stringify({
        timeline: [
          { date: "Next 30 days", event: "Diplomatic negotiations intensify", probability: 0.8, confidence: 0.7 },
          { date: "1-3 months", event: "Potential economic sanctions implementation", probability: 0.6, confidence: 0.6 },
          { date: "3-6 months", event: "Military posture adjustment", probability: 0.5, confidence: 0.5 },
          { date: "6-12 months", event: "New security arrangement negotiations", probability: 0.4, confidence: 0.4 }
        ],
        critical_points: ["UN Security Council meeting", "Bilateral summit", "Trade agreement deadline", "Military exercises"],
        risk_factors: ["Third-party intervention", "Domestic political changes", "Economic shocks", "Miscalculation"]
      })
    }

    if (prompt.includes('ensemble')) {
      return JSON.stringify({
        ensemble_prediction: { value: 0.65, confidence: [0.58, 0.72] },
        model_weights: {
          "Game Theory Model": 0.35,
          "Statistical Model": 0.25,
          "Machine Learning Model": 0.30,
          "Expert System": 0.10
        },
        uncertainty: 0.14,
        consensus_level: 0.78
      })
    }

    // Default mock response for any other prompt - always return valid JSON
    return JSON.stringify({
      status: "mock_response",
      message: "This is a mock response generated due to API limitations or development mode.",
      data: {
        prompt_type: "general",
        timestamp: new Date().toISOString(),
        content: prompt.substring(0, 100) + "..."
      }
    })
  }

  // Advanced Economic Modeling
  async generateEconomicImpactAnalysis(scenario: any): Promise<any> {
    const prompt = `
      You are an Advanced Economic Impact Modeling AI. Analyze comprehensive economic impacts of:
      Scenario: ${JSON.stringify(scenario)}
      
      Provide detailed analysis including:
      1. GDP impact with confidence intervals (primary, secondary, total effects)
      2. Trade flow changes (bilateral, multilateral with volume data)
      3. Employment effects by sector (manufacturing, services, agriculture)
      4. Welfare calculations (consumer surplus, producer surplus, government)
      5. Fiscal implications (revenue, expenditure, deficit impact)
      6. Timeline analysis (immediate, short-term, medium-term, long-term)
      
      Format as comprehensive JSON with numerical results and confidence intervals.
    `

    const response = await this.generateContent(prompt, { temperature: 0.1 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse economic analysis:', error)
      return JSON.parse(this.getMockResponse(prompt))
    }
  }

  // Natural Language Querying
  async processNaturalLanguageQuery(query: string, context: any = {}): Promise<any> {
    const prompt = `
      You are an Advanced Geopolitical Analysis AI with natural language processing capabilities.
      
      User Query: "${query}"
      Context: ${JSON.stringify(context)}
      
      Analyze the query and provide:
      1. Query intent classification
      2. Relevant data extraction
      3. Analysis methodology
      4. Structured response with visualizations
      5. Follow-up questions or recommendations
      
      Format as JSON with clear sections for each component.
    `

    const response = await this.generateContent(prompt, { temperature: 0.4 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse NL query response:', error)
      return {
        intent: "general_inquiry",
        response: "I understand you're asking about geopolitical analysis. Could you provide more specific details?",
        suggestions: ["Try asking about specific regions", "Request risk assessments", "Ask for scenario analysis"]
      }
    }
  }

  // Automated Report Generation
  async generateAutomatedReport(reportType: string, data: any, timeframe: string): Promise<any> {
    const prompt = `
      You are an Expert Report Generation AI. Create a comprehensive ${reportType} report.
      
      Data: ${JSON.stringify(data)}
      Timeframe: ${timeframe}
      
      Generate a structured report including:
      1. Executive Summary
      2. Key Findings
      3. Risk Analysis
      4. Trend Analysis
      5. Recommendations
      6. Appendices with supporting data
      
      Format as professional report structure with sections, subsections, and data tables.
    `

    const response = await this.generateContent(prompt, { temperature: 0.3 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse report response:', error)
      return {
        title: `${reportType} Report - ${timeframe}`,
        executive_summary: "Comprehensive analysis of current geopolitical situation with key insights and recommendations.",
        sections: [
          { title: "Key Findings", content: "Analysis of primary trends and developments" },
          { title: "Risk Assessment", content: "Evaluation of potential risks and mitigation strategies" },
          { title: "Recommendations", content: "Strategic recommendations based on analysis" }
        ]
      }
    }
  }

  // Predictive Timeline Analysis
  async generatePredictiveTimeline(scenario: any, timeHorizon: string): Promise<any> {
    const prompt = `
      You are a Predictive Timeline Analysis AI. Generate detailed timeline predictions for:
      
      Scenario: ${JSON.stringify(scenario)}
      Time Horizon: ${timeHorizon}
      
      Provide:
      1. Timeline milestones with probability estimates
      2. Critical decision points and trigger events
      3. Alternative pathway analysis
      4. Confidence intervals for each prediction
      5. Risk factors that could alter timeline
      6. Monitoring indicators for early warning
      
      Format as structured timeline with dates, events, probabilities, and confidence levels.
    `

    const response = await this.generateContent(prompt, { temperature: 0.2 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse timeline response:', error)
      return {
        timeline: [
          { date: "Next 30 days", event: "Initial developments", probability: 0.8, confidence: 0.7 },
          { date: "3-6 months", event: "Major milestone", probability: 0.6, confidence: 0.6 },
          { date: "6-12 months", event: "Resolution phase", probability: 0.4, confidence: 0.5 }
        ],
        critical_points: ["Policy decision deadlines", "Economic indicators", "Diplomatic meetings"],
        risk_factors: ["External interventions", "Economic shocks", "Domestic political changes"]
      }
    }
  }

  // Ensemble Prediction Methods
  async generateEnsemblePrediction(models: string[], data: any): Promise<any> {
    const prompt = `
      You are an Ensemble Prediction AI using multiple modeling approaches: ${models.join(', ')}.
      
      Input Data: ${JSON.stringify(data)}
      
      Generate ensemble predictions using:
      1. Weighted averaging of model outputs
      2. Bayesian model averaging
      3. Stacking ensemble methods
      4. Uncertainty quantification
      5. Model confidence scoring
      6. Consensus and disagreement analysis
      
      Provide final ensemble prediction with uncertainty bounds and model contribution weights.
    `

    const response = await this.generateContent(prompt, { temperature: 0.1 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse ensemble response:', error)
      return {
        ensemble_prediction: { value: 0.65, confidence: [0.58, 0.72] },
        model_weights: models.reduce((acc, model, i) => ({ ...acc, [model]: 1/models.length }), {}),
        uncertainty: 0.14,
        consensus_level: 0.78
      }
    }
  }

  // Existing methods with updated API endpoint
  async generateGameTheoryTutorial(level: string, topic: string, userProgress: any): Promise<any> {
    const prompt = `
      You are an expert Game Theory Tutor AI. Generate a tutorial for ${level} level on topic: ${topic}.
      User has completed: ${userProgress.completedModules?.join(', ') || 'none'}
      Current score: ${userProgress.currentScore || 0}
      
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
      }
    `

    const response = await this.generateContent(prompt, { temperature: 0.7 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      return JSON.parse(this.getMockResponse(prompt))
    }
  }

  async generateRiskAssessment(regions: string[], factors: string[] = []): Promise<any> {
    const prompt = `
      You are an Elite Geopolitical Risk Assessment AI. Analyze current risk for regions: ${regions.join(', ')}.
      Consider factors: ${factors.join(', ') || 'all relevant factors'}.
      
      For each region, provide:
      1. Risk score (0-100) with confidence interval
      2. Primary risk drivers with weights and trends
      3. Best/worst/most likely scenarios with probabilities
      4. Specific recommendations
      
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

    const response = await this.generateContent(prompt, { temperature: 0.3 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      return JSON.parse(this.getMockResponse(prompt))
    }
  }

  async runScenarioSimulation(config: any): Promise<any> {
    const prompt = `
      You are a Strategic Scenario Simulation AI. Simulate this scenario:
      Type: ${config.scenario?.type}
      Actors: ${JSON.stringify(config.actors)}
      Parameters: ${JSON.stringify(config.scenario?.parameters)}
      
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

    const response = await this.generateContent(prompt, { temperature: 0.2 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      return JSON.parse(this.getMockResponse(prompt))
    }
  }

  async analyzeCrisisEvents(newsData: any[]): Promise<any> {
    const prompt = `
      You are an Advanced Crisis Monitoring AI. Analyze these news events for crisis potential:
      ${JSON.stringify(newsData)}
      
      For each significant event, provide:
      1. Severity level (low, medium, high, critical)
      2. Event type classification
      3. Affected regions
      4. Escalation potential (0-100)
      5. Timeline urgency
      
      Only return events with severity >= medium.
      Format as JSON array of crisis events with id, title, region, severity, category, description, confidence, escalation_probability, and sources fields.
    `

    const response = await this.generateContent(prompt, { temperature: 0.4 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      return JSON.parse(this.getMockResponse(prompt))
    }
  }
}

export const geminiService = new GeminiService()