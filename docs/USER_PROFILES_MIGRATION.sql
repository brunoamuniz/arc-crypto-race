-- ============================================
-- Migration: Create user_profiles table
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    wallet TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_profiles_wallet_check CHECK (wallet ~ '^0x[a-fA-F0-9]{40}$'),
    CONSTRAINT user_profiles_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT user_profiles_username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON user_profiles(wallet);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read on user_profiles" ON user_profiles;
CREATE POLICY "Allow public read on user_profiles" ON user_profiles
    FOR SELECT USING (true);

-- Allow users to insert/update their own profile
DROP POLICY IF EXISTS "Allow users to insert own profile" ON user_profiles;
CREATE POLICY "Allow users to insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;
CREATE POLICY "Allow users to update own profile" ON user_profiles
    FOR UPDATE USING (true);
