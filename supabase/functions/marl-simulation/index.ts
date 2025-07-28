import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface MARLSimulationRequest {
  scenario: {
    name: string;
    description: string;
    actors: Array<{
      id: string;
      name: string;
      type: 'state' | 'non-state' | 'corporation' | 'individual';
      objectives: string[];
      constraints: string[];
      initialResources: Record<string, number>;
    }>;
    environment: {
      globalFactors: Record<string, number>;
      regionalTensions: Record<string, number>;
      economicConditions: Record<string, number>;
      timeHorizon: number;
    };
  };
  simulationParameters: {
    numAgents: number;
    learningAlgorithm: 'Q-learning' | 'Policy-Gradient' | 'Actor-Critic' | 'MADDPG';
    explorationStrategy: 'epsilon-greedy' | 'boltzmann' | 'ucb';
    episodes: number;
    maxStepsPerEpisode: number;
    rewardStructure: Record<string, number>;
  };
  analysisFocus: {
    coalitionAnalysis: boolean;
    stabilityAssessment: boolean;
    strategicInsights: boolean;
    policyRecommendations: boolean;
  };
}

interface MARLSimulationResponse {
  simulationId: string;
  scenario: MARLSimulationRequest['scenario'];
  results: {
    learningCurves: Array<{
      agentId: string;
      rewards: number[];
      strategies: string[];
      convergence: {
        episode: number;
        stability: number;
      };
    }>;
    finalStrategies: Record<string, any>;
    coalitionDynamics: Array<{
      coalitionId: string;
      members: string[];
      stability: number;
      formationTime: number;
      dissolutionTime?: number;
    }>;
    equilibriumAnalysis: {
      nashEquilibria: Array<{
        strategies: Record<string, any>;
        payoffs: Record<string, number>;
        stability: number;
      }>;
      evolutionaryStableStrategies: Array<{
        strategy: any;
        invasionResistance: number;
        populationDynamics: number[];
      }>;
    };
  };
  strategicInsights: {
    keyFindings: string[];
    actorBehaviorPatterns: Record<string, string[]>;
    coalitionStabilityFactors: string[];
    policyRecommendations: string[];
    riskAssessment: {
      immediate: string[];
      mediumTerm: string[];
      longTerm: string[];
    };
  };
  geopoliticalTranslation: {
    scenarioMapping: Record<string, string>;
    strategicImplications: string[];
    realWorldApplications: string[];
    diplomaticRecommendations: string[];
  };
}

class MARLService {
  async runSimulation(request: MARLSimulationRequest): Promise<any> {
    // Call Python MARL service
    const response = await fetch(`${Deno.env.get('PYTHON_MARL_SERVICE_URL')}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      throw new Error(`MARL simulation failed: ${response.status}`)
    }
    
    return await response.json()
  }

  async analyzeResults(rawResults: any): Promise<any> {
    // Enhanced analysis with strategic insights
    const analysis = {
      ...rawResults,
      strategicInsights: await this.generateStrategicInsights(rawResults),
      geopoliticalTranslation: await this.generateGeopoliticalTranslation(rawResults)
    }
    
    return analysis
  }

  private async generateStrategicInsights(results: any): Promise<any> {
    const insightsPrompt = `
      Analyze the following Multi-Agent Reinforcement Learning simulation results:
      
      Learning Curves: ${JSON.stringify(results.learningCurves)}
      Coalition Dynamics: ${JSON.stringify(results.coalitionDynamics)}
      Equilibrium Analysis: ${JSON.stringify(results.equilibriumAnalysis)}
      
      Provide comprehensive strategic insights including:
      
      1. KEY FINDINGS:
         - Most significant behavioral patterns observed
         - Critical turning points in agent strategies
         - Stability analysis of coalition formations
         - Evolution of strategic thinking over time
      
      2. ACTOR BEHAVIOR PATTERNS:
         - Individual agent behavioral characteristics
         - Inter-agent relationship dynamics
         - Response patterns to environmental changes
         - Strategic adaptation mechanisms
      
      3. COALITION STABILITY FACTORS:
         - Key factors that maintain coalition stability
         - Conditions that lead to coalition dissolution
         - Long-term sustainability of cooperative arrangements
         - Power dynamics within coalitions
      
      4. POLICY RECOMMENDATIONS:
         - Specific diplomatic strategies based on simulation insights
         - Negotiation approaches for different actor types
         - Long-term strategic planning recommendations
         - Risk mitigation strategies
      
      5. RISK ASSESSMENT:
         - Immediate risks (next 6 months)
         - Medium-term risks (6-24 months)
         - Long-term risks (2-5 years)
         - Contingency planning recommendations
      
      Format as structured JSON with actionable insights for geopolitical applications.
    `
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: insightsPrompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    const result = await response.json()
    return JSON.parse(result.candidates[0].content.parts[0].text)
  }

  private async generateGeopoliticalTranslation(results: any): Promise<any> {
    const translationPrompt = `
      Translate the following MARL simulation results into real-world geopolitical insights:
      
      Scenario: ${JSON.stringify(results.scenario)}
      Final Strategies: ${JSON.stringify(results.finalStrategies)}
      Coalition Dynamics: ${JSON.stringify(results.coalitionDynamics)}
      
      Provide comprehensive geopolitical translation including:
      
      1. SCENARIO MAPPING:
         - Map simulation actors to real-world geopolitical entities
         - Identify corresponding real-world scenarios and conflicts
         - Translate strategic behaviors into diplomatic actions
         - Connect simulation outcomes to historical precedents
      
      2. STRATEGIC IMPLICATIONS:
         - Real-world strategic implications of simulation findings
         - How observed behaviors manifest in actual geopolitical situations
         - Long-term consequences of different strategic approaches
         - Regional stability implications
      
      3. REAL WORLD APPLICATIONS:
         - Specific diplomatic strategies for current conflicts
         - Negotiation frameworks based on simulation insights
         - Policy recommendations for international relations
         - Risk assessment for current geopolitical situations
      
      4. DIPLOMATIC RECOMMENDATIONS:
         - Concrete diplomatic strategies based on simulation results
         - Multi-lateral negotiation approaches
         - Long-term strategic planning recommendations
         - Crisis management protocols
      
      Focus on actionable insights for 2024-2025 geopolitical landscape.
    `
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: translationPrompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    const result = await response.json()
    return JSON.parse(result.candidates[0].content.parts[0].text)
  }
}

serve(async (req) => {
  const request: MARLSimulationRequest = await req.json()
  const marlService = new MARLService()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  try {
    // Generate unique simulation ID
    const simulationId = `marl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Run the actual MARL simulation
    const rawResults = await marlService.runSimulation(request)
    
    // Enhance results with strategic insights
    const enhancedResults = await marlService.analyzeResults(rawResults)
    
    // Build comprehensive response
    const response: MARLSimulationResponse = {
      simulationId,
      scenario: request.scenario,
      results: enhancedResults.results,
      strategicInsights: enhancedResults.strategicInsights,
      geopoliticalTranslation: enhancedResults.geopoliticalTranslation
    }

    // Store simulation results in database
    await supabase
      .from('marl_simulations')
      .insert({
        simulation_id: simulationId,
        scenario: request.scenario,
        parameters: request.simulationParameters,
        results: response.results,
        strategic_insights: enhancedResults.strategicInsights,
        geopolitical_translation: enhancedResults.geopoliticalTranslation,
        created_at: new Date().toISOString()
      })

    // Store individual agent learning data
    if (response.results.learningCurves) {
      for (const agentData of response.results.learningCurves) {
        await supabase
          .from('agent_learning_data')
          .insert({
            simulation_id: simulationId,
            agent_id: agentData.agentId,
            rewards: agentData.rewards,
            strategies: agentData.strategies,
            convergence_episode: agentData.convergence?.episode,
            convergence_stability: agentData.convergence?.stability
          })
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('MARL simulation error:', error)
    
    return new Response(JSON.stringify({
      error: 'MARL simulation failed',
      message: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
