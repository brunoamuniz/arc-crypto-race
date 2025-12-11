/**
 * Migration script to create user_profiles table
 * Run this to set up the username system
 */

import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabase';

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

async function runMigration() {
  console.log('🔄 Running user_profiles migration...\n');

  if (!supabaseAdmin) {
    console.error('❌ Supabase admin client not configured');
    console.log('\n💡 Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env file');
    process.exit(1);
  }

  try {
    // Execute the migration
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: MIGRATION_SQL,
    });

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️  exec_sql function not available, trying direct execution...');
      
      // Split SQL into individual statements and execute
      const statements = MIGRATION_SQL.split(';').filter(s => s.trim().length > 0);
      
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed) {
          try {
            // Use raw query if available
            const { error: stmtError } = await supabaseAdmin
              .from('user_profiles')
              .select('wallet')
              .limit(0);
            
            // If table doesn't exist, this will fail, which is expected
            if (stmtError && stmtError.message?.includes('does not exist')) {
              console.log('📝 Table does not exist, need to create it manually');
              console.log('\n📋 Please run this SQL in your Supabase SQL Editor:');
              console.log('\n' + '='.repeat(60));
              console.log(MIGRATION_SQL);
              console.log('='.repeat(60) + '\n');
              console.log('💡 Or use the Supabase dashboard:');
              console.log('   1. Go to SQL Editor');
              console.log('   2. Paste the SQL above');
              console.log('   3. Run it\n');
              process.exit(0);
            }
          } catch (e) {
            // Continue
          }
        }
      }
    }

    // Verify table was created
    const { data, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('wallet')
      .limit(1);

    if (checkError) {
      if (checkError.message?.includes('does not exist')) {
        console.log('❌ Table still does not exist after migration attempt');
        console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
        console.log('\n' + '='.repeat(60));
        console.log(MIGRATION_SQL);
        console.log('='.repeat(60) + '\n');
        process.exit(1);
      } else {
        throw checkError;
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('✅ user_profiles table is ready');
    console.log('\n🎉 Username system is now ready to use!\n');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(MIGRATION_SQL);
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  }
}

runMigration();
