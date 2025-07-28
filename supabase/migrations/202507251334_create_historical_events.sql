-- Create historical events table for pattern analysis
CREATE TABLE IF NOT EXISTS historical_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  region TEXT NOT NULL,
  conflict_type TEXT NOT NULL,
  severity_score INTEGER CHECK (severity_score >= 0 AND severity_score <= 100),
  trigger_event TEXT,
  escalation_level TEXT CHECK (escalation_level IN ('low', 'medium', 'high', 'critical')),
  participants TEXT[],
  outcome TEXT,
  data_sources TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_historical_events_region ON historical_events(region);
CREATE INDEX IF NOT EXISTS idx_historical_events_date ON historical_events(date);
CREATE INDEX IF NOT EXISTS idx_historical_events_conflict_type ON historical_events(conflict_type);
CREATE INDEX IF NOT EXISTS idx_historical_events_severity ON historical_events(severity_score);

-- Enable RLS
ALTER TABLE historical_events ENABLE ROW LEVEL SECURITY;

-- Public read access for authenticated users
CREATE POLICY "Public read access for authenticated users" ON historical_events
  FOR SELECT TO authenticated USING (true);

-- Insert sample historical events
INSERT INTO historical_events (title, description, date, region, conflict_type, severity_score, trigger_event, escalation_level, participants, outcome) VALUES
  ('Cuban Missile Crisis', '13-day confrontation between US and Soviet Union over Soviet ballistic missiles in Cuba', '1962-10-14', 'Caribbean', 'nuclear_standoff', 95, 'missile_discovery', 'critical', ARRAY['United States', 'Soviet Union', 'Cuba'], 'peaceful_resolution'),
  ('Berlin Wall Construction', 'East Germany begins construction of Berlin Wall dividing East and West Berlin', '1961-08-13', 'Europe', 'territorial_dispute', 80, 'refugee_crisis', 'high', ARRAY['East Germany', 'West Germany', 'Soviet Union', 'United States'], 'wall_constructed'),
  ('Korean War', 'Conflict between North and South Korea with international involvement', '1950-06-25', 'Asia', 'civil_war', 85, 'border_incursion', 'high', ARRAY['North Korea', 'South Korea', 'United States', 'China', 'Soviet Union'], 'armistice_signed'),
  ('Suez Crisis', 'International crisis following Egypt''s nationalization of Suez Canal', '1956-10-29', 'Middle East', 'territorial_dispute', 75, 'canal_nationalization', 'high', ARRAY['Egypt', 'United Kingdom', 'France', 'Israel'], 'withdrawal_of_forces'),
  ('Vietnam War', 'Prolonged conflict between North and South Vietnam with US involvement', '1955-11-01', 'Asia', 'civil_war', 90, 'communist_insurgency', 'critical', ARRAY['North Vietnam', 'South Vietnam', 'United States', 'Soviet Union', 'China'], 'communist_victory');
