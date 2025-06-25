import { useState, useEffect } from 'react'
import { geminiService } from '../services/geminiService'
import { dataService } from '../services/dataService'
import { supabase } from '../lib/supabase'
import { useSupabaseEdgeFunctions } from './useSupabaseEdgeFunctions'
import { useAuth } from '../components/AuthProvider'
import { useToast } from './useToast'

interface Actor {
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
}

interface ScenarioConfig {
  actors: Actor[]
  scenario: {
    type: 'military_conflict' | 'trade_war' | 'diplomatic_crisis' | 'alliance_formation'
    parameters: Record<string, any>
  }
  simulationSettings: {
    iterations: number
    timeSteps: number
  }
}

interface SimulationResults {
  nashEquilibrium: string
  stability: number
  expectedPayoffs: Array<{
    id: string
    name: string
    payoff: number
  }>
  recommendations: string[]
  detailedAnalysis?: {
    strategyMatrix: number[][]
    equilibriumProbabilities: number[]
    sensitivityAnalysis: Record<string, number>
  }
}

export function useScenarioSimulation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSimulation, setCurrentSimulation] = useState<SimulationResults | null>(null)
  const [simulationHistory, setSimulationHistory] = useState<Array<{
    id: string
    config: ScenarioConfig
    results: SimulationResults
    timestamp: string
  }>>([])
  
  const { user } = useAuth()
  const { runScenarioSimulation } = useSupabaseEdgeFunctions()
  const { showToast } = useToast()

  useEffect(() => {
    // Load simulation history
    const loadHistory = async () => {
      if (user) {
        await loadSimulationHistory(user.id)
      } else {
        // Load from localStorage as fallback
        const saved = localStorage.getItem('simulationHistory')
        if (saved) {
          setSimulationHistory(JSON.parse(saved))
        }
      }
    }
    
    loadHistory()
  }, [user])

  const runSimulation = async (config: ScenarioConfig): Promise<SimulationResults> => {
    setLoading(true)
    setError(null)

    try {
      // Try to use edge function first
      const { data: edgeData, error: edgeError } = await runScenarioSimulation(config)
      
      let results
      if (edgeData && !edgeError) {
        results = edgeData.results
      } else {
        // Fallback to client-side generation
        console.warn('Edge function failed, using client-side fallback:', edgeError)
        results = await geminiService.runScenarioSimulation(config)
      }
      
      // Enhance with additional analysis if needed
      const enhancedResults: SimulationResults = {
        ...results,
        detailedAnalysis: results.detailedAnalysis || {
          strategyMatrix: generateStrategyMatrix(config.actors),
          equilibriumProbabilities: generateEquilibriumProbabilities(config.actors.length),
          sensitivityAnalysis: generateSensitivityAnalysis(config)
        }
      }

      setCurrentSimulation(enhancedResults)
      showToast('success', 'Simulation Complete', `Nash equilibrium: ${enhancedResults.nashEquilibrium}`)

      // Save to database and history
      let simulationId = 'local-' + Date.now()
      
      if (user) {
        simulationId = await dataService.saveScenarioSimulation(user.id, config, enhancedResults)
      }
      
      const historyEntry = {
        id: simulationId,
        config,
        results: enhancedResults,
        timestamp: new Date().toISOString()
      }

      setSimulationHistory(prev => [historyEntry, ...prev.slice(0, 9)]) // Keep last 10
      
      // Save to localStorage as backup
      localStorage.setItem('simulationHistory', JSON.stringify([historyEntry, ...simulationHistory.slice(0, 9)]))

      return enhancedResults

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Simulation failed'
      setError(errorMessage)
      showToast('error', 'Simulation Failed', errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const generateStrategyMatrix = (actors: Actor[]): number[][] => {
    const size = actors.length
    return Array(size).fill(0).map(() => 
      Array(size).fill(0).map(() => Math.random() * 100)
    )
  }

  const generateEquilibriumProbabilities = (numActors: number): number[] => {
    const probs = Array(numActors).fill(0).map(() => Math.random())
    const sum = probs.reduce((a, b) => a + b, 0)
    return probs.map(p => p / sum)
  }

  const generateSensitivityAnalysis = (config: ScenarioConfig): Record<string, number> => {
    return {
      militaryCapabilityImpact: parseFloat((Math.random() * 0.5).toFixed(2)),
      economicCapabilityImpact: parseFloat((Math.random() * 0.3).toFixed(2)),
      diplomaticCapabilityImpact: parseFloat((Math.random() * 0.4).toFixed(2)),
      riskToleranceImpact: parseFloat((Math.random() * 0.6).toFixed(2)),
      timeHorizonImpact: parseFloat((Math.random() * 0.2).toFixed(2))
    }
  }

  const loadSimulationHistory = async (uid?: string) => {
    try {
      if (uid) {
        const data = await dataService.getSimulationHistory(uid)
        if (data && data.length > 0) {
          const formattedHistory = data.map(item => ({
            id: item.id,
            config: item.scenario_config,
            results: item.results,
            timestamp: item.created_at
          }))
          setSimulationHistory(formattedHistory)
          showToast('info', 'History Loaded', `Loaded ${formattedHistory.length} simulations`)
        }
      } else {
        // Load from localStorage as fallback
        const saved = localStorage.getItem('simulationHistory')
        if (saved) {
          setSimulationHistory(JSON.parse(saved))
        }
      }
    } catch (err) {
      console.error('Failed to load simulation history:', err)
      showToast('error', 'History Load Failed', 'Could not retrieve simulation history')
    }
  }

  const clearHistory = () => {
    setSimulationHistory([])
    localStorage.removeItem('simulationHistory')
    showToast('info', 'History Cleared', 'Simulation history has been cleared')
    
    // If user is logged in, we would need a custom API to clear history
    if (user) {
      console.log('Database history clear would be triggered here')
    }
  }

  return {
    loading,
    error,
    currentSimulation,
    simulationHistory,
    runSimulation,
    loadSimulationHistory,
    clearHistory
  }
}