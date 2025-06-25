import axios from 'axios'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'
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
  private readonly RATE_LIMIT_DELAY = 2000 // 2 seconds between requests

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
            maxOutputTokens: 2048,
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

  // Specialized methods for different use cases
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

  async generateEconomicImpactAnalysis(scenario: any): Promise<any> {
    const prompt = `
      You are an Economic Impact Modeling AI. Analyze economic impacts of:
      Scenario: ${JSON.stringify(scenario)}
      
      Provide comprehensive analysis:
      1. GDP impact percentages with confidence intervals
      2. Trade volume changes by relationship
      3. Employment effects by sector
      4. Welfare calculations
      5. Fiscal implications
      
      Format as detailed JSON with numerical results.
    `

    const response = await this.generateContent(prompt, { temperature: 0.1 })
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      return {
        gdpImpact: { primary: -2.3, confidence: [-3.1, -1.5] },
        tradeChanges: { bilateral: -15.2, multilateral: -8.7 },
        employmentEffects: { manufacturing: -120000, services: 45000 },
        welfareImpact: { consumer: -2.1, producer: 1.3 },
        fiscalImpact: { revenue: -0.8, expenditure: 1.2 }
      }
    }
  }
}

export const geminiService = new GeminiService()