/**
 * Test Supabase Connection
 * Verifies that Supabase is configured correctly
 */

import { supabase, supabaseAdmin } from '../lib/supabase';

async function testConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  // Test 1: Check if clients are initialized
  if (!supabase) {
    console.error('❌ Supabase client (anon) not initialized');
    console.log('   Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  if (!supabaseAdmin) {
    console.error('❌ Supabase admin client not initialized');
    console.log('   Check SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  console.log('✅ Supabase clients initialized\n');

  // Test 2: Test anon client (read access)
  console.log('📖 Testing anon client (read access)...');
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      console.error('❌ Error reading from scores:', error.message);
      console.log('   Make sure you ran the schema SQL in Supabase');
    } else {
      console.log('✅ Anon client can read from database');
    }
  } catch (error) {
    console.error('❌ Error testing anon client:', error);
  }

  console.log('');

  // Test 3: Test admin client (write access)
  console.log('✍️  Testing admin client (write access)...');
  try {
    const testScore = {
      wallet: '0x0000000000000000000000000000000000000000',
      day_id: 99999999, // Test day ID
      score: 0,
    };

    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert(testScore)
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table "scores" does not exist');
        console.log('   Please run the schema SQL in Supabase SQL Editor');
      } else {
        console.error('❌ Error writing to scores:', error.message);
      }
    } else {
      console.log('✅ Admin client can write to database');
      
      // Clean up test data
      await supabaseAdmin
        .from('scores')
        .delete()
        .eq('id', data.id);
      console.log('   Test data cleaned up');
    }
  } catch (error) {
    console.error('❌ Error testing admin client:', error);
  }

  console.log('');

  // Test 4: Check tables
  console.log('📋 Checking tables...');
  const tables = ['scores', 'best_scores', 'pending_commits', 'commit_logs'];
  
  for (const table of tables) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          console.log(`   ❌ Table "${table}" does not exist`);
        } else {
          console.log(`   ⚠️  Table "${table}" exists but has issues: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Table "${table}" exists`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking "${table}":`, error);
    }
  }

  console.log('\n✅ Connection test completed!');
  console.log('\nNext steps:');
  console.log('1. If tables are missing, run docs/SUPABASE_SCHEMA.sql in Supabase SQL Editor');
  console.log('2. If you need SERVICE_ROLE_KEY, get it from Supabase Settings → API');
}

testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

