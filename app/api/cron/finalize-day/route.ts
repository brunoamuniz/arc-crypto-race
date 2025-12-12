/**
 * Vercel Cron Job endpoint to automatically finalize previous day
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/finalize-day",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 * 
 * This runs at midnight UTC every day to finalize the previous day
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentDayId, isValidDayId } from '@/lib/dayId';

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

    return NextResponse.json({
      ok: true,
      message: 'Finalize commit created successfully',
      dayId: yesterdayDayId,
      winners,
      scores,
      commitId: commit.id,
      note: 'Worker will process this commit in the next run',
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

