import { supabase } from '../lib/supabase'

export function useSupabaseEdgeFunctions() {
  const invokeFunction = async (functionName: string, payload: any) => {
    try {
      // Get the current session to include auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {}
      })

      if (error) {
        console.error(`Error calling ${functionName}:`, error)
        return { data: null, error: error.message || `Edge function error: ${error}` }
      }

      return { data, error: null }
    } catch (err) {
      console.error(`Error calling ${functionName}:`, err)
      // Return a more user-friendly error message
      return { 
        data: null, 
        error: 'Edge function temporarily unavailable. Using local processing instead.' 
      }
    }
  }

  const getCrisisEvents = async (regions: string[] = []) => {
    return invokeFunction('crisis-monitoring', { 
      action: 'get_events',
      regions 
    })
  }

  const monitorCrises = async (config: any) => {
    return invokeFunction('crisis-monitoring', config)
  }

  const getGameTheoryTutorial = async (level: string, topic: string, userProgress: any) => {
    return invokeFunction('game-theory-tutor', {
      level,
      topic,
      userProgress
    })
  }

  const getRiskAssessment = async (regions: string[], factors: string[] = []) => {
    return invokeFunction('risk-assessment', {
      regions,
      factors
    })
  }

  const runScenarioSimulation = async (config: any) => {
    return invokeFunction('scenario-simulation', config)
  }

  return {
    getCrisisEvents,
    monitorCrises,
    getGameTheoryTutorial,
    getRiskAssessment,
    runScenarioSimulation
  }
}