export const authConfig = {
  // Service role key for server-side operations
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Anonymous key for client-side operations
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Supabase URL
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  
  // API endpoints
  apiEndpoints: {
    gameTheoryTutor: '/api/game-theory-tutor',
    riskAssessment: '/api/risk-assessment',
    scenarioSimulation: '/api/scenario-simulation',
    crisisMonitoring: '/api/crisis-monitoring',
    health: '/api/health',
    historicalPatterns: '/api/historical-patterns'
  },
  
  // Request headers
  headers: {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
  }
}

export function getServiceHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': authConfig.serviceRoleKey,
    'Authorization': `Bearer ${authConfig.serviceRoleKey}`
  }
}

export function validateEnvironment() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing)
    return false
  }
  
  return true
}
