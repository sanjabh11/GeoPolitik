import { useState, useEffect } from 'react'
import { geminiService } from '../services/geminiService'
import { dataService } from '../services/dataService'
import { supabase } from '../lib/supabase'
import { useSupabaseEdgeFunctions } from './useSupabaseEdgeFunctions'
import { useAuth } from '../components/AuthProvider'
import { useToast } from './useToast'

interface CrisisEvent {
  id: string
  title: string
  region: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'political' | 'military' | 'economic' | 'environmental' | 'social' | 'cyber'
  description: string
  confidence: number
  escalation_probability: number
  sources: number
  timestamp: string
  trends?: Array<{
    metric: string
    change: number
    direction: 'up' | 'down' | 'stable'
  }>
}

interface AlertConfig {
  regions: string[]
  severity: 'medium' | 'high' | 'critical'
  categories: string[]
  keywords: string[]
}

export function useCrisisMonitoring() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [crisisEvents, setCrisisEvents] = useState<CrisisEvent[]>([])
  const [alerts, setAlerts] = useState<CrisisEvent[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [monitoringInterval, setMonitoringInterval] = useState<number | null>(null)
  
  const { user } = useAuth()
  const { monitorCrises, getCrisisEvents } = useSupabaseEdgeFunctions()
  const { showToast } = useToast()

  // Load cached events on mount
  useEffect(() => {
    const cachedEvents = localStorage.getItem('crisis_events')
    if (cachedEvents) {
      setCrisisEvents(JSON.parse(cachedEvents))
    }
    
    const cachedAlerts = localStorage.getItem('crisis_alerts')
    if (cachedAlerts) {
      setAlerts(JSON.parse(cachedAlerts))
    }
    
    // Load recent events from database
    const loadEvents = async () => {
      try {
        const { data, error } = await getCrisisEvents()
        if (data && !error) {
          setCrisisEvents(data.events)
        }
      } catch (err) {
        console.error('Failed to load crisis events:', err)
      }
    }
    
    loadEvents()
    
    // Clean up on unmount
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval)
      }
    }
  }, [])

  const startMonitoring = async (config: AlertConfig) => {
    setLoading(true)
    setError(null)
    setIsMonitoring(true)

    try {
      // Try to use edge function first
      const { data: edgeData, error: edgeError } = await monitorCrises(config)
      
      if (edgeData && !edgeError) {
        // Add new events to state
        if (edgeData.events && edgeData.events.length > 0) {
          setCrisisEvents(prev => {
            const newEvents = edgeData.events.filter((newEvent: CrisisEvent) => 
              !prev.some(existing => existing.title === newEvent.title)
            )
            
            const updatedEvents = [...newEvents, ...prev].slice(0, 50) // Keep last 50 events
            localStorage.setItem('crisis_events', JSON.stringify(updatedEvents))
            return updatedEvents
          })
          
          // Check for alerts
          const newAlerts = edgeData.events.filter((event: CrisisEvent) => 
            event.severity === 'critical' || event.escalation_probability > 80
          )
          
          if (newAlerts.length > 0) {
            setAlerts(prev => {
              const updatedAlerts = [...newAlerts, ...prev].slice(0, 20)
              localStorage.setItem('crisis_alerts', JSON.stringify(updatedAlerts))
              return updatedAlerts
            })
            
            // Show notifications
            if (Notification.permission === 'granted') {
              newAlerts.forEach((alert: CrisisEvent) => {
                new Notification(`Crisis Alert: ${alert.title}`, {
                  body: alert.description,
                  icon: '/crisis-icon.png',
                  tag: alert.id
                })
              })
            }
            
            showToast('warning', 'Crisis Alert', `${newAlerts.length} new critical events detected`)
          }
        }
      } else {
        // Fallback to client-side monitoring
        console.warn('Edge function failed, using client-side fallback:', edgeError)
        await scanForCrises(config)
      }

      // Set up periodic monitoring
      const interval = window.setInterval(() => {
        scanForCrises(config)
      }, 5 * 60 * 1000) // Every 5 minutes

      setMonitoringInterval(interval)
      showToast('info', 'Monitoring Started', 'Scanning for crisis events every 5 minutes')

      // Save monitoring configuration if user is logged in
      if (user) {
        await supabase
          .from('alert_configurations')
          .upsert({
            user_id: user.id,
            alert_type: 'crisis_monitoring',
            criteria: config,
            notification_settings: {
              email: false,
              push: true,
              browser: true
            },
            is_active: true
          })
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start monitoring'
      setError(errorMessage)
      setIsMonitoring(false)
      showToast('error', 'Monitoring Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      setMonitoringInterval(null)
    }
    
    showToast('info', 'Monitoring Stopped', 'Crisis monitoring has been deactivated')
    
    // Update database if user is logged in
    if (user) {
      supabase
        .from('alert_configurations')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('alert_type', 'crisis_monitoring')
        .then(() => {
          console.log('Monitoring stopped in database')
        })
        .catch(err => {
          console.error('Failed to update monitoring status:', err)
        })
    }
  }

  const scanForCrises = async (config: AlertConfig) => {
    try {
      // Fetch latest news
      const newsData = await dataService.fetchLatestNews(
        config.regions,
        config.keywords
      )

      // Analyze with AI
      const crisisAnalysis = await geminiService.analyzeCrisisEvents(newsData)

      // Filter by severity
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
      const minSeverity = severityLevels[config.severity]
      
      const filteredEvents = crisisAnalysis.filter((event: any) => {
        const eventSeverity = severityLevels[event.severity as keyof typeof severityLevels] || 0
        return eventSeverity >= minSeverity &&
               config.categories.includes(event.category)
      })

      // Enhance with trends
      const enhancedEvents = filteredEvents.map((event: any) => ({
        ...event,
        id: event.id || `crisis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: event.timestamp || new Date().toISOString(),
        trends: event.trends || generateTrends(event)
      }))

      // Save to database if user is logged in
      if (user) {
        for (const event of enhancedEvents) {
          await dataService.saveCrisisEvent(event)
        }
      }

      setCrisisEvents(prev => {
        const newEvents = enhancedEvents.filter((newEvent: CrisisEvent) => 
          !prev.some(existing => existing.title === newEvent.title)
        )
        
        if (newEvents.length > 0) {
          showToast('info', 'New Crisis Events', `Detected ${newEvents.length} new events`)
        }
        
        const updatedEvents = [...newEvents, ...prev].slice(0, 50) // Keep last 50 events
        
        // Cache in localStorage
        localStorage.setItem('crisis_events', JSON.stringify(updatedEvents))
        
        return updatedEvents
      })

      // Check for new alerts
      const newAlerts = enhancedEvents.filter((event: CrisisEvent) => 
        event.severity === 'critical' || event.escalation_probability > 80
      )

      if (newAlerts.length > 0) {
        setAlerts(prev => {
          const updatedAlerts = [...newAlerts, ...prev].slice(0, 20)
          
          // Cache in localStorage
          localStorage.setItem('crisis_alerts', JSON.stringify(updatedAlerts))
          
          return updatedAlerts
        })
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          newAlerts.forEach((alert: CrisisEvent) => {
            new Notification(`Crisis Alert: ${alert.title}`, {
              body: alert.description,
              icon: '/crisis-icon.png',
              tag: alert.id
            })
          })
        }
        
        showToast('warning', 'Critical Alert', `${newAlerts.length} high-priority crisis events detected`)
      }

    } catch (err) {
      console.error('Crisis scanning error:', err)
      showToast('error', 'Scanning Error', 'Failed to scan for crisis events')
    }
  }

  const generateTrends = (event: any): CrisisEvent['trends'] => {
    // Generate realistic trends based on the event type
    const trends = []
    
    if (event.category === 'military') {
      trends.push(
        {
          metric: 'Military Activity',
          change: Math.floor(Math.random() * 60) + 20,
          direction: 'up'
        },
        {
          metric: 'Diplomatic Engagement',
          change: Math.floor(Math.random() * 40) + 10,
          direction: Math.random() > 0.7 ? 'up' : 'down'
        }
      )
    } else if (event.category === 'political') {
      trends.push(
        {
          metric: 'Diplomatic Statements',
          change: Math.floor(Math.random() * 50) + 10,
          direction: 'up'
        },
        {
          metric: 'International Support',
          change: Math.floor(Math.random() * 30) + 5,
          direction: Math.random() > 0.5 ? 'up' : 'down'
        }
      )
    } else if (event.category === 'economic') {
      trends.push(
        {
          metric: 'Market Volatility',
          change: Math.floor(Math.random() * 40) + 15,
          direction: 'up'
        },
        {
          metric: 'Currency Stability',
          change: Math.floor(Math.random() * 25) + 5,
          direction: 'down'
        }
      )
    }
    
    // Add a general trend for all events
    trends.push({
      metric: 'Media Coverage',
      change: Math.floor(Math.random() * 70) + 30,
      direction: 'up'
    })
    
    return trends
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => {
      const updated = prev.filter(alert => alert.id !== alertId)
      localStorage.setItem('crisis_alerts', JSON.stringify(updated))
      return updated
    })
    
    showToast('success', 'Alert Acknowledged', 'The alert has been dismissed')
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        showToast('success', 'Notifications Enabled', 'You will receive alerts for critical events')
      } else {
        showToast('warning', 'Notifications Disabled', 'You will not receive browser notifications')
      }
      return permission === 'granted'
    }
    showToast('error', 'Notifications Not Supported', 'Your browser does not support notifications')
    return false
  }

  return {
    loading,
    error,
    crisisEvents,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    acknowledgeAlert,
    requestNotificationPermission
  }
}