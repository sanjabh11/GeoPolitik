-- Fix user profiles RLS policies to allow user creation

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create comprehensive RLS policies for user_profiles
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Fix alert_configurations table to reference user_profiles properly
-- First, let's check if the foreign key constraint exists and drop it if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'alert_configurations_user_id_fkey' 
        AND table_name = 'alert_configurations'
    ) THEN
        ALTER TABLE alert_configurations DROP CONSTRAINT alert_configurations_user_id_fkey;
    END IF;
END $$;

-- Add the correct foreign key constraint
ALTER TABLE alert_configurations 
ADD CONSTRAINT alert_configurations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for alert_configurations
DROP POLICY IF EXISTS "Users can read own alerts" ON alert_configurations;
DROP POLICY IF EXISTS "Users can insert own alerts" ON alert_configurations;
DROP POLICY IF EXISTS "Users can update own alerts" ON alert_configurations;

CREATE POLICY "Users can manage their own alert configurations" ON alert_configurations
    FOR ALL USING (auth.uid() = user_id);

-- Ensure other tables have proper RLS policies
-- Learning progress
DROP POLICY IF EXISTS "Users can read own progress" ON learning_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON learning_progress;

CREATE POLICY "Users can manage their own learning progress" ON learning_progress
    FOR ALL USING (auth.uid() = user_id);

-- Scenario simulations  
DROP POLICY IF EXISTS "Users can read own simulations" ON scenario_simulations;
DROP POLICY IF EXISTS "Users can insert own simulations" ON scenario_simulations;

CREATE POLICY "Users can manage their own scenario simulations" ON scenario_simulations
    FOR ALL USING (auth.uid() = user_id);

-- Crisis events (public read access)
DROP POLICY IF EXISTS "Public read access for crisis events" ON crisis_events;

CREATE POLICY "Anyone can read crisis events" ON crisis_events
    FOR SELECT TO authenticated USING (true);

-- Risk assessments (public read access)
DROP POLICY IF EXISTS "Public read access" ON risk_assessments;

CREATE POLICY "Anyone can read risk assessments" ON risk_assessments
    FOR SELECT TO authenticated USING (true);

-- Add cache_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS cache_entries (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for cache expiration cleanup
CREATE INDEX IF NOT EXISTS idx_cache_entries_expires_at ON cache_entries(expires_at);

-- RLS for cache (public read access for authenticated users)
ALTER TABLE cache_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cache" ON cache_entries
    FOR SELECT TO authenticated USING (true);