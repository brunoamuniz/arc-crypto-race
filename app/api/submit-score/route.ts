import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentDayId, isValidDayId } from '@/lib/dayId';
import { createHash } from 'crypto';

/**
 * POST /api/submit-score
 * Submit a game score
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, dayId, score } = body;

    // Validation
    if (!wallet || typeof wallet !== 'string') {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet format' },
        { status: 400 }
      );
    }

    const finalDayId = dayId || getCurrentDayId();
    
    if (!isValidDayId(finalDayId)) {
      return NextResponse.json(
        { error: 'Invalid day ID' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      );
    }

    // TODO: Check via contract if user has entered (read-only call)
    // For now, we'll trust the frontend check
    // const hasEntered = await checkHasEntered(finalDayId, wallet);
    // if (!hasEntered) {
    //   return NextResponse.json(
    //     { error: 'User has not entered tournament for this day' },
    //     { status: 403 }
    //   );
    // }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Insert score
    const { data: scoreData, error: scoreError } = await supabaseAdmin
      .from('scores')
      .insert({
        wallet: wallet.toLowerCase(),
        day_id: finalDayId,
        score: Math.floor(score),
      })
      .select()
      .single();

    if (scoreError) {
      console.error('Error inserting score:', scoreError);
      return NextResponse.json(
        { error: 'Failed to save score' },
        { status: 500 }
      );
    }

    // Get current best scores for the day to compute leaderboard hash
    const { data: bestScores } = await supabaseAdmin
      .from('best_scores')
      .select('wallet, best_score')
      .eq('day_id', finalDayId)
      .order('best_score', { ascending: false });

    // Create pending checkpoint commit
    // The worker will compute the hash and send to blockchain
    const { error: commitError } = await supabaseAdmin
      .from('pending_commits')
      .insert({
        day_id: finalDayId,
        type: 'checkpoint',
        payload: {
          // Worker will compute hash from best_scores
          note: 'Leaderboard hash will be computed by worker',
        },
        status: 'pending',
      });

    if (commitError) {
      console.error('Error creating pending commit:', commitError);
      // Don't fail the request if commit creation fails
    }

    return NextResponse.json({ ok: true, score: scoreData });
  } catch (error) {
    console.error('Error in submit-score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

