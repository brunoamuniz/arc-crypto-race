/**
 * Script to check pending commits and their status
 * Helps identify why prizes weren't distributed
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPendingCommits() {
  console.log('\n🔍 Checking Pending Commits\n');
  console.log('='.repeat(60));
  
  // Get all pending commits
  const { data: pendingCommits, error: pendingError } = await supabase
    .from('pending_commits')
    .select('*')
    .in('status', ['pending', 'processing', 'error'])
    .order('created_at', { ascending: false });
  
  if (pendingError) {
    console.error('❌ Error fetching pending commits:', pendingError);
    return;
  }
  
  if (!pendingCommits || pendingCommits.length === 0) {
    console.log('✅ No pending commits found');
  } else {
    console.log(`\n📋 Found ${pendingCommits.length} pending/processing/error commits:\n`);
    
    for (const commit of pendingCommits) {
      console.log(`Day ID: ${commit.day_id}`);
      console.log(`Type: ${commit.type}`);
      console.log(`Status: ${commit.status}`);
      console.log(`Created: ${commit.created_at}`);
      
      if (commit.status === 'error') {
        console.log(`❌ Error: ${commit.error_message || 'Unknown error'}`);
      }
      
      if (commit.type === 'finalize') {
        const { winners, scores } = commit.payload as any;
        console.log(`Winners:`);
        winners?.forEach((w: string, i: number) => {
          console.log(`  ${i + 1}. ${w} (Score: ${scores?.[i] || 'N/A'})`);
        });
      }
      
      console.log('-'.repeat(60));
    }
  }
  
  // Get all finalize commits for yesterday
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayDayId = parseInt(
    `${yesterday.getUTCFullYear()}${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}${String(yesterday.getUTCDate()).padStart(2, '0')}`,
    10
  );
  
  console.log(`\n📅 Checking Finalize Commits for Day ${yesterdayDayId} (Yesterday)\n`);
  
  const { data: yesterdayCommits, error: yesterdayError } = await supabase
    .from('pending_commits')
    .select('*')
    .eq('day_id', yesterdayDayId)
    .eq('type', 'finalize')
    .order('created_at', { ascending: false });
  
  if (yesterdayError) {
    console.error('❌ Error fetching yesterday commits:', yesterdayError);
    return;
  }
  
  if (!yesterdayCommits || yesterdayCommits.length === 0) {
    console.log(`⚠️  No finalize commits found for day ${yesterdayDayId}`);
    console.log('   This means the API /api/admin/finalize-day was never called!');
  } else {
    console.log(`Found ${yesterdayCommits.length} finalize commit(s):\n`);
    
    for (const commit of yesterdayCommits) {
      console.log(`Status: ${commit.status}`);
      console.log(`Created: ${commit.created_at}`);
      console.log(`Processed: ${commit.processed_at || 'Not processed'}`);
      
      if (commit.status === 'error') {
        console.log(`❌ Error: ${commit.error_message || 'Unknown error'}`);
      } else if (commit.status === 'done') {
        console.log('✅ Commit was processed successfully');
      } else {
        console.log(`⏳ Commit is still ${commit.status} - needs processing`);
      }
      
      console.log('-'.repeat(60));
    }
  }
  
  // Check commit logs
  console.log(`\n📜 Checking Commit Logs for Day ${yesterdayDayId}\n`);
  
  const { data: logs, error: logsError } = await supabase
    .from('commit_logs')
    .select('*')
    .eq('day_id', yesterdayDayId)
    .eq('type', 'finalize')
    .order('created_at', { ascending: false });
  
  if (logsError) {
    console.error('❌ Error fetching logs:', logsError);
    return;
  }
  
  if (!logs || logs.length === 0) {
    console.log(`⚠️  No finalize logs found for day ${yesterdayDayId}`);
    console.log('   This means finalizeDay() was never called on the contract!');
  } else {
    console.log(`Found ${logs.length} finalize log(s):\n`);
    
    for (const log of logs) {
      console.log(`TX Hash: ${log.tx_hash}`);
      console.log(`Created: ${log.created_at}`);
      console.log(`Explorer: https://testnet.arcscan.app/tx/${log.tx_hash}`);
      console.log('-'.repeat(60));
    }
  }
  
  console.log('\n📊 SUMMARY\n');
  console.log('='.repeat(60));
  
  if (pendingCommits && pendingCommits.length > 0) {
    console.log(`⚠️  There are ${pendingCommits.length} commits waiting to be processed`);
    console.log('   Action: Run the worker to process them');
    console.log('   Command: npm run worker');
  } else {
    console.log('✅ No pending commits');
  }
  
  if (!yesterdayCommits || yesterdayCommits.length === 0) {
    console.log(`⚠️  Day ${yesterdayDayId} was never finalized via API`);
    console.log('   Action: Call POST /api/admin/finalize-day');
  } else if (yesterdayCommits.some(c => c.status !== 'done')) {
    console.log(`⚠️  Day ${yesterdayDayId} has commits that weren't processed`);
    console.log('   Action: Run the worker to process them');
  } else if (!logs || logs.length === 0) {
    console.log(`⚠️  Day ${yesterdayDayId} commits were created but never sent to blockchain`);
    console.log('   Action: Run the worker to send transactions');
  } else {
    console.log(`✅ Day ${yesterdayDayId} appears to have been finalized`);
  }
  
  console.log('\n');
}

checkPendingCommits().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
