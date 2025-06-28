import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Declare the supabase variable that will be exported
let supabase: any

// Allow the app to run in development mode without Supabase credentials
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_url' || 
    supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('Supabase credentials not configured. Running in mock mode. Please set up your Supabase project and update the .env file with your credentials.')
  
  // Create a mock client that won't cause errors
  const mockSupabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        }),
        in: () => ({ 
          gt: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => ({ 
          limit: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => ({ 
        select: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
        })
      }),
      upsert: () => ({ 
        select: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
        })
      }),
      update: () => ({ 
        eq: () => ({ 
          select: () => ({ 
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        })
      }),
      delete: () => ({ 
        eq: () => Promise.resolve({ error: null })
      })
    }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {}
    }),
    functions: {
      invoke: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }
  }
  
  supabase = mockSupabase
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Database Types
export interface UserProfile {
  id: string
  role: 'student' | 'analyst' | 'researcher' | 'policymaker'
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LearningProgress {
  id: string
  user_id: string
  module_id: string
  completion_percentage: number
  last_accessed: string
  performance_data: Record<string, any>
}

export interface RiskAssessment {
  id: string
  region: string
  risk_score: number
  factors: Record<string, any>
  confidence_interval: [number, number]
  created_at: string
  expires_at: string
}

export interface ScenarioSimulation {
  id: string
  user_id: string
  scenario_config: Record<string, any>
  results: Record<string, any>
  created_at: string
}

export interface AlertConfiguration {
  id: string
  user_id: string
  alert_type: string
  criteria: Record<string, any>
  notification_settings: Record<string, any>
  is_active: boolean
}

export interface CrisisEvent {
  id: string
  title: string
  region: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'political' | 'military' | 'economic' | 'environmental' | 'social'
  description: string
  confidence: number
  escalation_probability: number
  sources: number
  created_at: string
}

// Authentication helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// User profile helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Initialize user profile on signup
export const initializeUserProfile = async (userId: string, role: string = 'student') => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      role,
      preferences: {}
    })
    .select()
    .single()
  
  return { data, error }
}

// Export the supabase client
export { supabase }