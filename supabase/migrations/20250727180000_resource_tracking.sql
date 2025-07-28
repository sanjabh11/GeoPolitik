-- Resource Integration Schema - Supabase Migration
-- RI-5: Supabase schema for progress tracking and resource views

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    section_id TEXT,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reading_time_seconds INTEGER DEFAULT 0,
    annotations JSONB DEFAULT '[]'::jsonb,
    bookmarks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resource_views table
CREATE TABLE IF NOT EXISTS resource_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('book', 'video', 'paper')),
    resource_id TEXT NOT NULL,
    view_count INTEGER DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_view_time_seconds INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON reading_progress(last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_views_user_id ON resource_views(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_resource ON resource_views(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_last_viewed ON resource_views(last_viewed_at DESC);

-- Create RLS policies
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_views ENABLE ROW LEVEL SECURITY;

-- Reading progress policies
CREATE POLICY "Users can view their own reading progress" ON reading_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" ON reading_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading progress" ON reading_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Resource views policies
CREATE POLICY "Users can view their own resource views" ON resource_views
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own resource views" ON resource_views
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resource views" ON resource_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_views_updated_at BEFORE UPDATE ON resource_views
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create analytics view
CREATE OR REPLACE VIEW resource_analytics AS
SELECT 
    rv.resource_type,
    rv.resource_id,
    COUNT(*) as total_views,
    SUM(rv.total_view_time_seconds) as total_view_time,
    MAX(rv.last_viewed_at) as last_viewed,
    COUNT(DISTINCT rv.user_id) as unique_users
FROM resource_views rv
GROUP BY rv.resource_type, rv.resource_id;
