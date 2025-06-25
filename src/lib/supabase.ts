import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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