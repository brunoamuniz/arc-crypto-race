/**
 * Script to finalize a day: call API and process with worker
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!ADMIN_API_KEY) {
  console.error('❌ ADMIN_API_KEY not found in environment variables');
  process.exit(1);
}

async function finalizeDay(dayId: number) {
  console.log(`\n🎯 Finalizing day ${dayId}\n`);
  console.log('='.repeat(60));
  
  try {
    // Step 1: Call API to create finalize commit
    console.log('📞 Step 1: Calling API to create finalize commit...\n');
    
    const response = await fetch(`${API_URL}/api/admin/finalize-day`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dayId }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ API Error: ${data.error || 'Unknown error'}`);
      if (data.error?.includes('already finalized')) {
        console.log('   Day is already finalized. Checking if prizes were distributed...');
      } else if (data.error?.includes('Not enough players')) {
        console.log('   Not enough players to finalize (need at least 3)');
      }
      return;
    }
    
    console.log('✅ Finalize commit created successfully!');
    console.log(`   Day ID: ${data.dayId}`);
    console.log(`   Commit ID: ${data.commitId}`);
    console.log(`   Winners:`);
    data.winners.forEach((w: string, i: number) => {
      console.log(`     ${i + 1}. ${w} (Score: ${data.scores[i].toLocaleString()})`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n⚙️  Step 2: Processing commit with worker...\n');
    
    // Step 2: Import and run worker
    const { processFinalize } = await import('../scripts/worker');
    await processFinalize();
    
    console.log('\n✅ Finalization process completed!');
    console.log('   Check the commit logs to verify the transaction was sent.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
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

if (isNaN(dayId)) {
  console.error('❌ Invalid day ID');
  process.exit(1);
}

finalizeDay(dayId).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

