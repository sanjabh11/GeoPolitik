-- Enhanced Game Theory Platform Database Schema
-- This migration creates all necessary tables for the comprehensive platform

-- 1. Enhanced Learning Analytics
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    completion_percentage INTEGER DEFAULT 0,
    performance_data JSONB DEFAULT '{}',
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_module_id ON learning_progress(module_id);

-- 2. Computation Results Storage
CREATE TABLE IF NOT EXISTS computation_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    computation_type TEXT NOT NULL, -- 'nash_equilibrium', 'cooperative_game', 'extensive_form'
    parameters JSONB NOT NULL,
    results JSONB NOT NULL,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_computation_results_user_id ON computation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_computation_results_type ON computation_results(computation_type);

-- 3. Interactive Tutorials
CREATE TABLE IF NOT EXISTS interactive_tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    level TEXT NOT NULL, -- 'basic', 'intermediate', 'advanced', 'phd'
    topic TEXT NOT NULL,
    content JSONB NOT NULL,
    game_parameters JSONB,
    gambit_results JSONB,
    assessment_questions JSONB,
    adaptive_recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactive_tutorials_level ON interactive_tutorials(level);
CREATE INDEX IF NOT EXISTS idx_interactive_tutorials_topic ON interactive_tutorials(topic);

-- 4. Research Papers Integration
CREATE TABLE IF NOT EXISTS research_papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id TEXT UNIQUE,
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT[],
    published_date DATE,
    citations INTEGER DEFAULT 0,
    code_url TEXT,
    dataset_urls TEXT[],
    relevance_score FLOAT,
    practical_applications JSONB,
    methodology_insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_papers_published_date ON research_papers(published_date);
CREATE INDEX IF NOT EXISTS idx_research_papers_relevance_score ON research_papers(relevance_score);

-- 5. Research Insights
CREATE TABLE IF NOT EXISTS research_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    query_topics TEXT[] NOT NULL,
    timeframe TEXT NOT NULL,
    paper_count INTEGER,
    insights JSONB NOT NULL,
    trends JSONB,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_insights_topics ON research_insights USING GIN(query_topics);

-- 6. Academic Benchmarks
CREATE TABLE IF NOT EXISTS academic_benchmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    benchmark_name TEXT NOT NULL,
    benchmark_type TEXT NOT NULL,
    score FLOAT NOT NULL,
    source TEXT NOT NULL,
    paper_url TEXT,
    code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_benchmarks_name ON academic_benchmarks(benchmark_name);
CREATE INDEX IF NOT EXISTS idx_academic_benchmarks_type ON academic_benchmarks(benchmark_type);

-- 7. Model Predictions and Actual Events
CREATE TABLE IF NOT EXISTS model_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    predicted_outcome JSONB NOT NULL,
    confidence FLOAT NOT NULL,
    parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_predictions_model_id ON model_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_model_predictions_timestamp ON model_predictions(timestamp);

CREATE TABLE IF NOT EXISTS actual_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_outcome JSONB NOT NULL,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actual_events_type ON actual_events(event_type);
CREATE INDEX IF NOT EXISTS idx_actual_events_timestamp ON actual_events(timestamp);

-- 8. Backtesting Results
CREATE TABLE IF NOT EXISTS backtesting_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id TEXT NOT NULL,
    timeframe_start DATE NOT NULL,
    timeframe_end DATE NOT NULL,
    results JSONB NOT NULL,
    performance_metrics JSONB,
    academic_benchmarks JSONB,
    temporal_analysis JSONB,
    executive_summary JSONB,
    report_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backtesting_results_model_id ON backtesting_results(model_id);
CREATE INDEX IF NOT EXISTS idx_backtesting_results_timeframe ON backtesting_results(timeframe_start, timeframe_end);

-- 9. MARL Simulations
CREATE TABLE IF NOT EXISTS marl_simulations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    simulation_id TEXT UNIQUE NOT NULL,
    scenario JSONB NOT NULL,
    parameters JSONB NOT NULL,
    results JSONB NOT NULL,
    strategic_insights JSONB,
    geopolitical_translation JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marl_simulations_id ON marl_simulations(simulation_id);
CREATE INDEX IF NOT EXISTS idx_marl_simulations_created_at ON marl_simulations(created_at);

CREATE TABLE IF NOT EXISTS agent_learning_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    simulation_id TEXT REFERENCES marl_simulations(simulation_id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    rewards FLOAT[] NOT NULL,
    strategies JSONB,
    convergence_episode INTEGER,
    convergence_stability FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_learning_simulation_id ON agent_learning_data(simulation_id);
CREATE INDEX IF NOT EXISTS idx_agent_learning_agent_id ON agent_learning_data(agent_id);

-- 10. Research Contributions
CREATE TABLE IF NOT EXISTS research_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    tags TEXT[],
    references TEXT[],
    quality_indicators JSONB,
    status TEXT DEFAULT 'submitted',
    review_stage INTEGER DEFAULT 1,
    version INTEGER DEFAULT 1,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_contributions_author_id ON research_contributions(author_id);
CREATE INDEX IF NOT EXISTS idx_research_contributions_status ON research_contributions(status);
CREATE INDEX IF NOT EXISTS idx_research_contributions_type ON research_contributions(type);
CREATE INDEX IF NOT EXISTS idx_research_contributions_tags ON research_contributions USING GIN(tags);

-- 11. Peer Reviews
CREATE TABLE IF NOT EXISTS peer_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contribution_id UUID REFERENCES research_contributions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    review_stage INTEGER NOT NULL,
    scores JSONB NOT NULL,
    comments JSONB NOT NULL,
    recommendation TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peer_reviews_contribution_id ON peer_reviews(contribution_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer_id ON peer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_review_stage ON peer_reviews(review_stage);

-- 12. Collaboration Projects
CREATE TABLE IF NOT EXISTS collaboration_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT UNIQUE NOT NULL,
    initiator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_ids UUID[] NOT NULL,
    project_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    timeline JSONB NOT NULL,
    resource_requirements JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collaboration_projects_initiator_id ON collaboration_projects(initiator_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_projects_status ON collaboration_projects(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_projects_type ON collaboration_projects(project_type);

-- 13. Collaboration Invitations
CREATE TABLE IF NOT EXISTS collaboration_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT REFERENCES collaboration_projects(project_id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    invitation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_date TIMESTAMP WITH TIME ZONE,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_project_id ON collaboration_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_user_id ON collaboration_invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_status ON collaboration_invitations(status);

-- 14. Peer Review Assignments
CREATE TABLE IF NOT EXISTS peer_review_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contribution_id UUID REFERENCES research_contributions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peer_review_assignments_contribution_id ON peer_review_assignments(contribution_id);
CREATE INDEX IF NOT EXISTS idx_peer_review_assignments_reviewer_id ON peer_review_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_peer_review_assignments_status ON peer_review_assignments(status);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Can be 'all_users' or specific user_id
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL,
    action_required BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 16. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_types TEXT[] DEFAULT ARRAY['research', 'collaboration', 'validation', 'system'],
    frequency TEXT DEFAULT 'immediate',
    channels JSONB DEFAULT '{"email": true, "inApp": true, "push": false}',
    priority_threshold TEXT DEFAULT 'medium',
    quiet_hours JSONB DEFAULT '{"start": "22:00", "end": "08:00"}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 17. System Metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);

-- 18. Validation Queue
CREATE TABLE IF NOT EXISTS validation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    validation_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_validation_queue_status ON validation_queue(status);
CREATE INDEX IF NOT EXISTS idx_validation_queue_priority ON validation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_validation_queue_assigned_to ON validation_queue(assigned_to);

-- 19. Dataset Explorer
CREATE TABLE IF NOT EXISTS dataset_explorer (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    tags TEXT[],
    metadata JSONB NOT NULL,
    file_url TEXT,
    size_bytes BIGINT,
    format TEXT,
    license TEXT,
    uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dataset_explorer_category ON dataset_explorer(category);
CREATE INDEX IF NOT EXISTS idx_dataset_explorer_tags ON dataset_explorer USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_dataset_explorer_uploader ON dataset_explorer(uploader_id);

-- 20. User Dataset Interactions
CREATE TABLE IF NOT EXISTS user_dataset_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES dataset_explorer(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'view', 'download', 'favorite', 'contribute'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_dataset_interactions_user_id ON user_dataset_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dataset_interactions_dataset_id ON user_dataset_interactions(dataset_id);
CREATE INDEX IF NOT EXISTS idx_user_dataset_interactions_type ON user_dataset_interactions(interaction_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dataset_interactions_unique ON user_dataset_interactions(user_id, dataset_id, interaction_type);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE computation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactive_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE actual_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtesting_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE marl_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_explorer ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dataset_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own learning progress" ON learning_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress" ON learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own computation results" ON computation_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own computation results" ON computation_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Research contributions are visible to all" ON research_contributions
    FOR SELECT USING (true);

CREATE POLICY "Users can create own research contributions" ON research_contributions
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own research contributions" ON research_contributions
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Peer reviews are visible to all" ON peer_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create own peer reviews" ON peer_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Collaboration projects are visible to participants" ON collaboration_projects
    FOR SELECT USING (
        auth.uid() = initiator_id OR 
        auth.uid() = ANY(target_user_ids)
    );

CREATE POLICY "Users can create collaboration projects" ON collaboration_projects
    FOR INSERT WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Notifications are visible to recipients" ON notifications
    FOR SELECT USING (
        user_id = 'all_users' OR 
        user_id = auth.uid()
    );

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_computation_results_updated_at BEFORE UPDATE ON computation_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactive_tutorials_updated_at BEFORE UPDATE ON interactive_tutorials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_papers_updated_at BEFORE UPDATE ON research_papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_insights_updated_at BEFORE UPDATE ON research_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_contributions_updated_at BEFORE UPDATE ON research_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_projects_updated_at BEFORE UPDATE ON collaboration_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dataset_explorer_updated_at BEFORE UPDATE ON dataset_explorer
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
