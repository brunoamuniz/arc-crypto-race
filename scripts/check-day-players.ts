/**
 * Script to check if a day has enough players to finalize
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

async function checkDayPlayers(dayId: number) {
  console.log(`\n🔍 Checking players for day ${dayId}\n`);
  console.log('='.repeat(60));
  
  // Get all best scores for the day
  const { data: bestScores, error } = await supabase
    .from('best_scores')
    .select('wallet, best_score, day_id')
    .eq('day_id', dayId)
    .order('best_score', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching scores:', error);
    return;
  }
  
  if (!bestScores || bestScores.length === 0) {
    console.log(`⚠️  No players found for day ${dayId}`);
    return;
  }
  
  console.log(`\n📊 Found ${bestScores.length} player(s):\n`);
  
  bestScores.forEach((score, index) => {
    console.log(`${index + 1}. ${score.wallet}`);
    console.log(`   Score: ${score.best_score.toLocaleString()}`);
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (bestScores.length < 3) {
    console.log(`\n⚠️  Not enough players to finalize (need at least 3, found ${bestScores.length})`);
    console.log('   Cannot finalize this day.');
  } else {
    console.log(`\n✅ Enough players to finalize (${bestScores.length} players)`);
    console.log('   Top 3 winners would be:');
    bestScores.slice(0, 3).forEach((score, index) => {
      console.log(`   ${index + 1}. ${score.wallet} (Score: ${score.best_score.toLocaleString()})`);
    });
    console.log('\n   You can now call: POST /api/admin/finalize-day');
  }
  
  console.log('\n');
}

// Get day ID from command line or use yesterday
const dayIdArg = process.argv[2];
const dayId = dayIdArg ? parseInt(dayIdArg, 10) : (() => {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return parseInt(
    `${yesterday.getUTCFullYear()}${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}${String(yesterday.getUTCDate()).padStart(2, '0')}`,
    10
  );
})();

checkDayPlayers(dayId).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

