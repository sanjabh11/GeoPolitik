-- Resource Integration MVP - DB schema
-- Adds books, videos, and user_resource_progress tables

-- Books table (metadata only)
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL, -- Google Books ID or custom ID
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    description TEXT,
    open_access_url TEXT,
    preview_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table (metadata only)
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL, -- YouTube video ID
    title TEXT NOT NULL,
    channel TEXT NOT NULL,
    description TEXT,
    embed_url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User resource progress tracking
CREATE TABLE IF NOT EXISTS user_resource_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('book', 'video')),
    resource_id UUID NOT NULL,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_type, resource_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_external_id ON books(external_id);
CREATE INDEX IF NOT EXISTS idx_videos_external_id ON videos(external_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_resource_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_resource ON user_resource_progress(resource_type, resource_id);

-- RLS policies
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resource_progress ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access" ON books FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access" ON videos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own progress" ON user_resource_progress 
    FOR ALL USING (auth.uid() = user_id);
