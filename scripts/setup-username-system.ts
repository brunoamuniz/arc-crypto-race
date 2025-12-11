/**
 * Setup script for username system
 * This will guide you through setting up the user_profiles table
 */

import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

const MIGRATION_SQL = `
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
`;

async function setupUsernameSystem() {
  console.log('🚀 Setting up Username System...\n');

  if (!supabaseAdmin) {
    console.error('❌ Supabase admin client not configured');
    console.log('\n💡 Make sure you have:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL in .env');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY in .env\n');
    process.exit(1);
  }

  console.log('📋 Step 1: Checking if user_profiles table exists...\n');

  try {
    // Try to query the table
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('wallet')
      .limit(1);

    if (!error) {
      console.log('✅ user_profiles table already exists!');
      console.log('✅ Username system is ready to use!\n');
      return;
    }

    if (error && error.message?.includes('does not exist')) {
      console.log('⚠️  user_profiles table does not exist yet');
      console.log('\n📋 Step 2: You need to create the table manually\n');
      console.log('Please run this SQL in your Supabase SQL Editor:\n');
      console.log('─'.repeat(70));
      console.log(MIGRATION_SQL);
      console.log('─'.repeat(70));
      console.log('\n💡 How to run:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Go to SQL Editor');
      console.log('   4. Paste the SQL above');
      console.log('   5. Click "Run"\n');
      console.log('📝 Or use the script: ./scripts/open-supabase-sql-editor.sh\n');
      process.exit(0);
    } else {
      throw error;
    }
  } catch (error: any) {
    console.error('❌ Error checking table:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n');
    console.log('─'.repeat(70));
    console.log(MIGRATION_SQL);
    console.log('─'.repeat(70) + '\n');
    process.exit(1);
  }
}

setupUsernameSystem();
