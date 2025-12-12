/**
 * Vercel Cron Job endpoint to automatically finalize previous day and process commits
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/finalize-day",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 * 
 * This runs at midnight UTC every day to:
 * 1. Finalize the previous day (create finalize commit)
 * 2. Process all pending commits (including the one just created)
 * 
 * Note: Combined into single cron job to respect Vercel Hobby plan limit (2 cron jobs per team)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentDayId, isValidDayId } from '@/lib/dayId';
import { runWorker } from '@/scripts/worker';

export const maxDuration = 300; // 5 minutes max execution time

export async function GET(request: NextRequest) {
  try {
    // Vercel automatically adds x-vercel-signature header for cron jobs
    const vercelSignature = request.headers.get('x-vercel-signature');
    
    // If CRON_SECRET is set and this is not a Vercel cron call, verify the secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && !vercelSignature) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Get yesterday's day ID
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayDayId = parseInt(
      `${yesterday.getUTCFullYear()}${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}${String(yesterday.getUTCDate()).padStart(2, '0')}`,
      10
    );

    if (!isValidDayId(yesterdayDayId)) {
      return NextResponse.json(
        { error: 'Invalid day ID' },
        { status: 400 }
      );
    }

    console.log(`🔄 Auto-finalizing day ${yesterdayDayId}...`);

    // Check if already finalized
    const { data: existing } = await supabaseAdmin
      .from('pending_commits')
      .select('*')
      .eq('day_id', yesterdayDayId)
      .eq('type', 'finalize')
      .eq('status', 'done')
      .single();

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: 'Day already finalized',
        dayId: yesterdayDayId,
      });
    }

    // Get all best scores for the day, sorted descending
    const { data: bestScores, error: scoresError } = await supabaseAdmin
      .from('best_scores')
      .select('wallet, best_score')
      .eq('day_id', yesterdayDayId)
      .order('best_score', { ascending: false })
      .limit(3);

    if (scoresError) {
      console.error('Error fetching best scores:', scoresError);
      return NextResponse.json(
        { error: 'Failed to fetch best scores' },
        { status: 500 }
      );
    }

    if (!bestScores || bestScores.length < 3) {
      return NextResponse.json({
        ok: true,
        message: 'Not enough players to finalize (need at least 3)',
        dayId: yesterdayDayId,
        playerCount: bestScores?.length || 0,
      });
    }

    // Prepare winners and scores
    const winners = bestScores.slice(0, 3).map((s) => s.wallet) as [`0x${string}`, `0x${string}`, `0x${string}`];
    const scores = bestScores.slice(0, 3).map((s) => s.best_score) as [number, number, number];

    // Create pending finalize commit
    const { data: commit, error: commitError } = await supabaseAdmin
      .from('pending_commits')
      .insert({
        day_id: yesterdayDayId,
        type: 'finalize',
        payload: {
          winners,
          scores,
        },
        status: 'pending',
      })
      .select()
      .single();

    if (commitError) {
      console.error('Error creating finalize commit:', commitError);
      return NextResponse.json(
        { error: 'Failed to create finalize commit' },
        { status: 500 }
      );
    }

    console.log(`✅ Created finalize commit for day ${yesterdayDayId}`);

    // Immediately process the commit (and any other pending commits)
    // Use Promise.race with timeout to prevent hanging
    console.log('🔄 Processing pending commits (including the one just created)...');
    try {
      const workerPromise = runWorker();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Worker timeout after 4 minutes')), 4 * 60 * 1000);
      });
      
      await Promise.race([workerPromise, timeoutPromise]);
      console.log('✅ Worker completed successfully');
    } catch (workerError) {
      console.error('⚠️ Worker error (commit was created but processing failed):', workerError);
      // Don't fail the entire request - the commit is created and can be processed later
      // Log the error but return success so the cron job doesn't retry unnecessarily
    }

    return NextResponse.json({
      ok: true,
      message: 'Finalize commit created and processed',
      dayId: yesterdayDayId,
      winners,
      scores,
      commitId: commit.id,
    });
  } catch (error) {
    console.error('❌ Error in cron finalize-day:', error);
    return NextResponse.json(
      {
        error: 'Finalize failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

