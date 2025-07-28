import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') })

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_NEWS_API_KEY'
]

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing)
    return false
  }
  
  console.log('✅ All required environment variables loaded')
  console.log('Supabase URL:', process.env.VITE_SUPABASE_URL)
  console.log('Service role key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0)
  
  return true
}

// Export loaded environment variables
export const env = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  geminiApiKey: process.env.VITE_GEMINI_API_KEY || '',
  newsApiKey: process.env.VITE_NEWS_API_KEY || ''
}
