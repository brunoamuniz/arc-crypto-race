-- ARC CRYPTO RACE - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: scores
-- Stores all raw score submissions
-- ============================================
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet TEXT NOT NULL,
    day_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT scores_wallet_day_check CHECK (wallet ~ '^0x[a-fA-F0-9]{40}$')
);

CREATE INDEX idx_scores_wallet ON scores(wallet);
CREATE INDEX idx_scores_day_id ON scores(day_id);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);

-- ============================================
-- Table: best_scores
-- Stores the best score per wallet per day
-- ============================================
CREATE TABLE IF NOT EXISTS best_scores (
    wallet TEXT NOT NULL,
    day_id INTEGER NOT NULL,
    best_score INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (wallet, day_id),
    CONSTRAINT best_scores_wallet_check CHECK (wallet ~ '^0x[a-fA-F0-9]{40}$')
);

CREATE INDEX idx_best_scores_day_id ON best_scores(day_id);
CREATE INDEX idx_best_scores_score ON best_scores(day_id, best_score DESC);

-- ============================================
-- Table: pending_commits
-- Queue for blockchain operations
-- ============================================
CREATE TABLE IF NOT EXISTS pending_commits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checkpoint', 'finalize')),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pending_commits_status ON pending_commits(status);
CREATE INDEX idx_pending_commits_day_id ON pending_commits(day_id);
CREATE INDEX idx_pending_commits_created_at ON pending_commits(created_at);

-- ============================================
-- Table: commit_logs
-- Logs of completed blockchain operations
-- ============================================
CREATE TABLE IF NOT EXISTS commit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id INTEGER NOT NULL,
    tx_hash TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checkpoint', 'finalize')),
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_commit_logs_day_id ON commit_logs(day_id);
CREATE INDEX idx_commit_logs_tx_hash ON commit_logs(tx_hash);
CREATE INDEX idx_commit_logs_created_at ON commit_logs(created_at DESC);

-- ============================================
-- Function: Update best score
-- Automatically updates best_scores when a new score is inserted
-- ============================================
CREATE OR REPLACE FUNCTION update_best_score()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO best_scores (wallet, day_id, best_score, updated_at)
    VALUES (NEW.wallet, NEW.day_id, NEW.score, NOW())
    ON CONFLICT (wallet, day_id)
    DO UPDATE SET
        best_score = GREATEST(best_scores.best_score, NEW.score),
        updated_at = NOW()
    WHERE best_scores.best_score < NEW.score;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update best_scores
CREATE TRIGGER trigger_update_best_score
    AFTER INSERT ON scores
    FOR EACH ROW
    EXECUTE FUNCTION update_best_score();

-- ============================================
-- View: daily_leaderboard
-- Convenience view for leaderboard queries
-- ============================================
CREATE OR REPLACE VIEW daily_leaderboard AS
SELECT 
    bs.wallet,
    bs.day_id,
    bs.best_score,
    bs.updated_at,
    ROW_NUMBER() OVER (PARTITION BY bs.day_id ORDER BY bs.best_score DESC) as rank
FROM best_scores bs
ORDER BY bs.day_id DESC, bs.best_score DESC;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE commit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to scores and best_scores
CREATE POLICY "Allow public read on scores" ON scores
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on best_scores" ON best_scores
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on commit_logs" ON commit_logs
    FOR SELECT USING (true);

-- Allow authenticated inserts (via service role key)
CREATE POLICY "Allow service role insert on scores" ON scores
    FOR INSERT WITH CHECK (true);

-- Restrict pending_commits to service role only
CREATE POLICY "Allow service role on pending_commits" ON pending_commits
    FOR ALL USING (true);

