import { useState, useEffect } from 'react'
import { geminiService } from '../services/geminiService'
import { dataService } from '../services/dataService'
import { supabase } from '../lib/supabase'
import { useSupabaseEdgeFunctions } from './useSupabaseEdgeFunctions'
import { useAuth } from '../components/AuthProvider'
import { useToast } from './useToast'

interface RiskAssessment {
  region: string
  riskScore: number
  confidenceInterval: [number, number]
  primaryDrivers: Array<{
    factor: string
    weight: number
    trend: 'increasing' | 'stable' | 'decreasing'
  }>
  scenarios: {
    best: { probability: number; description: string }
    worst: { probability: number; description: string }
    mostLikely: { probability: number; description: string }
  }
  lastUpdated: string
}

export function useRiskAssessment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assessments, setAssessments] = useState<RiskAssessment[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  
  const { user } = useAuth()
  const { getRiskAssessment } = useSupabaseEdgeFunctions()
  const { showToast } = useToast()

  // Clean up subscription on unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [subscription])

  const generateRiskAssessment = async (regions: string[], factors: string[] = []) => {
    setLoading(true)
    setError(null)

    try {
      // Disable cache - always use live compute for fresh data
      // Cache check removed to ensure real-time analysis
      console.log('Using live compute for risk assessment - cache disabled')

      // Try to use edge function first
      const { data: edgeData, error: edgeError } = await getRiskAssessment(regions, factors)
      
      let riskData
      if (edgeData && !edgeError) {
        riskData = edgeData
      } else {
        // Fallback to client-side generation
        console.warn('Edge function failed, using client-side fallback:', edgeError)
        
        // Fetch latest news and economic data
        const [newsData, economicData] = await Promise.all([
          dataService.fetchLatestNews(regions, ['politics', 'military', 'economy']),
          dataService.fetchEconomicIndicators(regions)
        ])

        // Generate AI-powered risk assessment
        riskData = await geminiService.generateRiskAssessment(regions, factors)
      }
      
      // Defensive: ensure riskData and riskData.assessments are valid arrays
      const assessmentsArray = Array.isArray(riskData?.assessments)
        ? riskData.assessments
        : [];

      const enhancedAssessments = assessmentsArray.map((assessment: any) => ({
        ...assessment,
        lastUpdated: new Date().toISOString()
      }))

      setAssessments(enhancedAssessments)
      setLastUpdate(new Date())
      showToast('success', 'Risk Assessment Complete', `Analyzed ${regions.length} regions`)

      // Save to database
      for (const assessment of enhancedAssessments) {
        await dataService.saveRiskAssessment(assessment)
      }

      // Real-time subscriptions disabled due to persistent WebSocket connection failures
      // App will rely on manual refresh or polling instead
      // This prevents console errors and ensures stability
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate risk assessment'
      setError(errorMessage)
      showToast('error', 'Risk Assessment Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRiskUpdate = (newRisk: any) => {
    setAssessments(prev => {
      // Find if we already have this region
      const index = prev.findIndex(a => a.region === newRisk.region)
      
      if (index >= 0) {
        // Update existing assessment
        const updated = [...prev]
        updated[index] = {
          region: newRisk.region,
          riskScore: newRisk.risk_score,
          confidenceInterval: newRisk.confidence_interval,
          primaryDrivers: newRisk.factors,
          scenarios: prev[index].scenarios, // Keep existing scenarios
          lastUpdated: newRisk.created_at
        }
        return updated
      } else {
        // Add new assessment
        return [...prev, {
          region: newRisk.region,
          riskScore: newRisk.risk_score,
          confidenceInterval: newRisk.confidence_interval,
          primaryDrivers: newRisk.factors,
          scenarios: {
            best: { probability: 0.2, description: 'Diplomatic resolution' },
            worst: { probability: 0.3, description: 'Escalation scenario' },
            mostLikely: { probability: 0.5, description: 'Status quo continuation' }
          },
          lastUpdated: newRisk.created_at
        }]
      }
    })
    
    setLastUpdate(new Date())
    showToast('info', 'Risk Update', `New data for ${newRisk.region}`)
  }

  const refreshAssessment = async (region: string) => {
    setLoading(true)
    try {
      // Generate new assessment just for this region
      const { data: edgeData, error: edgeError } = await getRiskAssessment([region])
      
      let riskData
      if (edgeData && !edgeError) {
        riskData = edgeData
      } else {
        // Fallback to client-side generation
        riskData = await geminiService.generateRiskAssessment([region])
      }
      
      if (riskData.assessments && riskData.assessments.length > 0) {
        const newAssessment = {
          ...riskData.assessments[0],
          lastUpdated: new Date().toISOString()
        }
        
        // Save to database
        await dataService.saveRiskAssessment(newAssessment)
        
        // Update state
        setAssessments(prev => {
          const index = prev.findIndex(a => a.region === region)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = newAssessment
            return updated
          }
          return [...prev, newAssessment]
        })
        
        setLastUpdate(new Date())
        showToast('success', 'Region Refreshed', `Updated data for ${region}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh assessment'
      setError(errorMessage)
      showToast('error', 'Refresh Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToUpdates = (callback: (assessment: RiskAssessment) => void) => {
    // Set up real-time subscription
    const sub = supabase
      .channel('risk_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'risk_assessments'
      }, (payload) => {
        const newAssessment = {
          region: payload.new.region,
          riskScore: payload.new.risk_score,
          confidenceInterval: payload.new.confidence_interval,
          primaryDrivers: payload.new.factors,
          scenarios: {
            best: { probability: 0.2, description: 'Diplomatic resolution' },
            worst: { probability: 0.3, description: 'Escalation scenario' },
            mostLikely: { probability: 0.5, description: 'Status quo continuation' }
          },
          lastUpdated: payload.new.created_at
        }
        
        callback(newAssessment)
      })
      .subscribe()
    
    setSubscription(sub)
    
    // Return unsubscribe function
    return () => {
      sub.unsubscribe()
      setSubscription(null)
    }
  }

  return {
    loading,
    error,
    assessments,
    lastUpdate,
    generateRiskAssessment,
    refreshAssessment,
    subscribeToUpdates
  }
}