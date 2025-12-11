/**
 * Worker Script
 * Processes pending_commits queue and sends transactions to blockchain
 * 
 * Run this as a cron job or long-running process:
 * - Every 10 minutes: process checkpoints
 * - At midnight UTC: process finalize commits
 */

import { supabaseAdmin } from '../lib/supabase';
import { commitCheckpoint, finalizeDay } from '../lib/contract';
import { createHash } from 'crypto';
import type { PendingCommit, BestScore } from '../lib/supabase';

/**
 * Compute leaderboard hash from best scores
 */
function computeLeaderboardHash(bestScores: BestScore[]): `0x${string}` {
  // Sort by score descending
  const sorted = [...bestScores].sort((a, b) => b.best_score - a.best_score);
  
  // Create JSON string
  const json = JSON.stringify(
    sorted.map((s) => ({
      wallet: s.wallet.toLowerCase(),
      score: s.best_score,
    }))
  );
  
  // Compute keccak256 hash
  const hash = createHash('sha256').update(json).digest('hex');
  
  return `0x${hash}` as `0x${string}`;
}

/**
 * Process pending checkpoint commits
 */
async function processCheckpoints() {
  console.log('Processing checkpoint commits...');

  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return;
  }

  // Get pending checkpoint commits
  const { data: commits, error } = await supabaseAdmin
    .from('pending_commits')
    .select('*')
    .eq('type', 'checkpoint')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10); // Process up to 10 at a time

  if (error) {
    console.error('Error fetching checkpoint commits:', error);
    return;
  }

  if (!commits || commits.length === 0) {
    console.log('No pending checkpoint commits');
    return;
  }

  for (const commit of commits as PendingCommit[]) {
    try {
      // Mark as processing
      await supabaseAdmin
        .from('pending_commits')
        .update({ status: 'processing' })
        .eq('id', commit.id);

      // Get best scores for the day
      const { data: bestScores } = await supabaseAdmin
        .from('best_scores')
        .select('wallet, best_score, day_id, updated_at')
        .eq('day_id', commit.day_id)
        .order('best_score', { ascending: false });

      if (!bestScores || bestScores.length === 0) {
        // No scores yet, skip
        await supabaseAdmin
          .from('pending_commits')
          .update({ status: 'done', processed_at: new Date().toISOString() })
          .eq('id', commit.id);
        continue;
      }

      // Compute leaderboard hash
      const leaderboardHash = computeLeaderboardHash(bestScores as BestScore[]);

      // Send transaction to blockchain
      const txHash = await commitCheckpoint(commit.day_id, leaderboardHash);

      // Log transaction
      await supabaseAdmin.from('commit_logs').insert({
        day_id: commit.day_id,
        tx_hash: txHash,
        type: 'checkpoint',
        payload: {
          leaderboardHash,
          bestScoresCount: bestScores.length,
        },
      });

      // Mark as done
      await supabaseAdmin
        .from('pending_commits')
        .update({
          status: 'done',
          processed_at: new Date().toISOString(),
        })
        .eq('id', commit.id);

      console.log(`✓ Checkpoint committed for day ${commit.day_id}: ${txHash}`);
    } catch (error) {
      console.error(`Error processing checkpoint ${commit.id}:`, error);
      
      // Mark as error
      await supabaseAdmin
        .from('pending_commits')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', commit.id);
    }
  }
}

/**
 * Process pending finalize commits
 */
async function processFinalize() {
  console.log('Processing finalize commits...');

  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return;
  }

  // Get pending finalize commits
  const { data: commits, error } = await supabaseAdmin
    .from('pending_commits')
    .select('*')
    .eq('type', 'finalize')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(5); // Process up to 5 at a time

  if (error) {
    console.error('Error fetching finalize commits:', error);
    return;
  }

  if (!commits || commits.length === 0) {
    console.log('No pending finalize commits');
    return;
  }

  for (const commit of commits as PendingCommit[]) {
    try {
      // Mark as processing
      await supabaseAdmin
        .from('pending_commits')
        .update({ status: 'processing' })
        .eq('id', commit.id);

      const { winners, scores } = commit.payload as {
        winners: string[];
        scores: number[];
      };

      // Send transaction to blockchain
      const txHash = await finalizeDay(
        commit.day_id,
        winners as [`0x${string}`, `0x${string}`, `0x${string}`],
        scores as [number, number, number]
      );

      // Log transaction
      await supabaseAdmin.from('commit_logs').insert({
        day_id: commit.day_id,
        tx_hash: txHash,
        type: 'finalize',
        payload: {
          winners,
          scores,
        },
      });

      // Mark as done
      await supabaseAdmin
        .from('pending_commits')
        .update({
          status: 'done',
          processed_at: new Date().toISOString(),
        })
        .eq('id', commit.id);

      console.log(`✓ Day ${commit.day_id} finalized: ${txHash}`);
    } catch (error) {
      console.error(`Error processing finalize ${commit.id}:`, error);
      
      // Mark as error
      await supabaseAdmin
        .from('pending_commits')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', commit.id);
    }
  }
}

/**
 * Main worker function
 */
async function runWorker() {
  console.log('Starting worker...');
  
  try {
    // Process checkpoints
    await processCheckpoints();
    
    // Process finalize commits
    await processFinalize();
    
    console.log('Worker completed');
  } catch (error) {
    console.error('Worker error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runWorker()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { runWorker, processCheckpoints, processFinalize };

