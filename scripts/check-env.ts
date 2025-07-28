#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join } from 'path';

const requiredEnvVars = [
  'VITE_GEMINI_API_KEY',
  'VITE_NEWS_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const forbiddenEnvVars = [
  'VITE_USE_MOCK_DATA'
];

function checkEnv() {
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf8');
  
  const envVars = new Map();
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars.set(key.trim(), value.trim());
    }
  });

  // Check required vars are present and not placeholder
  const missing = requiredEnvVars.filter(key => {
    const val = envVars.get(key);
    return !val || val === '' || val.includes('your_') || val.includes('placeholder');
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }

  // Check forbidden vars are false or absent
  const mockFlag = envVars.get('VITE_USE_MOCK_DATA');
  if (mockFlag === 'true') {
    console.error('❌ VITE_USE_MOCK_DATA must be false for production');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
}

// ES module entry point
checkEnv();
