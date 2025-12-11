import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentDayId, isValidDayId } from '@/lib/dayId';

/**
 * POST /api/admin/finalize-day
 * Protected endpoint to finalize a day and create pending commit
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check (API key or admin token)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dayId } = body;

    const finalDayId = dayId || getCurrentDayId();
    
    if (!isValidDayId(finalDayId)) {
      return NextResponse.json(
        { error: 'Invalid day ID' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Check if already finalized
    const { data: existing } = await supabaseAdmin
      .from('pending_commits')
      .select('*')
      .eq('day_id', finalDayId)
      .eq('type', 'finalize')
      .eq('status', 'done')
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Day already finalized' },
        { status: 400 }
      );
    }

    // Get all best scores for the day, sorted descending
    const { data: bestScores, error: scoresError } = await supabaseAdmin
      .from('best_scores')
      .select('wallet, best_score')
      .eq('day_id', finalDayId)
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
      return NextResponse.json(
        { error: 'Not enough players to finalize (need at least 3)' },
        { status: 400 }
      );
    }

    // Prepare winners and scores
    const winners = bestScores.slice(0, 3).map((s) => s.wallet) as [`0x${string}`, `0x${string}`, `0x${string}`];
    const scores = bestScores.slice(0, 3).map((s) => s.best_score) as [number, number, number];

    // Create pending finalize commit
    const { data: commit, error: commitError } = await supabaseAdmin
      .from('pending_commits')
      .insert({
        day_id: finalDayId,
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

    return NextResponse.json({
      ok: true,
      dayId: finalDayId,
      winners,
      scores,
      commitId: commit.id,
    });
  } catch (error) {
    console.error('Error in finalize-day:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

