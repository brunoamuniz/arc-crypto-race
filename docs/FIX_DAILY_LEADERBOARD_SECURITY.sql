-- Fix: Remove SECURITY DEFINER from daily_leaderboard view
-- This ensures the view runs with the permissions of the querying user, not the creator

-- Drop the existing view
DROP VIEW IF EXISTS daily_leaderboard;

-- Recreate the view explicitly without SECURITY DEFINER
-- SECURITY INVOKER is the default, but we're being explicit for clarity
CREATE VIEW daily_leaderboard 
WITH (security_invoker=true) AS
SELECT 
    bs.wallet,
    bs.day_id,
    bs.best_score,
    bs.updated_at,
    ROW_NUMBER() OVER (PARTITION BY bs.day_id ORDER BY bs.best_score DESC) as rank
FROM best_scores bs
ORDER BY bs.day_id DESC, bs.best_score DESC;

-- Grant public read access to the view
-- Since best_scores has public read policy, the view will inherit that
GRANT SELECT ON daily_leaderboard TO anon, authenticated;

-- Note: The view doesn't need its own RLS policies because:
-- 1. It only reads from best_scores
-- 2. best_scores already has RLS enabled with public read access
-- 3. SECURITY INVOKER ensures queries use the caller's permissions
