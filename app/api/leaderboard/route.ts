import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentDayId, isValidDayId } from '@/lib/dayId';

/**
 * GET /api/leaderboard?dayId=20251211
 * Get leaderboard for a specific day
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dayIdParam = searchParams.get('dayId');
    
    const dayId = dayIdParam 
      ? parseInt(dayIdParam, 10) 
      : getCurrentDayId();

    if (!isValidDayId(dayId)) {
      return NextResponse.json(
        { error: 'Invalid day ID' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Get best scores for the day (off-chain)
    const { data: bestScores, error } = await supabase
      .from('best_scores')
      .select('wallet, best_score, updated_at')
      .eq('day_id', dayId)
      .order('best_score', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Get usernames for all wallets in the leaderboard
    const wallets = (bestScores || []).map((entry: any) => entry.wallet);
    let usernamesMap: Record<string, string | null> = {};

    if (wallets.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('wallet, username')
        .in('wallet', wallets);

      if (profiles) {
        profiles.forEach((profile: any) => {
          usernamesMap[profile.wallet.toLowerCase()] = profile.username;
        });
      }
    }

    // Combine leaderboard with usernames
    const leaderboardWithUsernames = (bestScores || []).map((entry: any) => ({
      wallet: entry.wallet,
      best_score: entry.best_score,
      updated_at: entry.updated_at,
      username: usernamesMap[entry.wallet.toLowerCase()] || null,
    }));

    // Get commit logs for checkpoints (transparency)
    const { data: checkpoints } = await supabase
      .from('commit_logs')
      .select('tx_hash, created_at')
      .eq('day_id', dayId)
      .eq('type', 'checkpoint')
      .order('created_at', { ascending: false });

    // TODO: Get on-chain winners from contract
    // const onChainWinners = await getOnChainWinners(dayId);

    return NextResponse.json({
      dayId,
      leaderboard: leaderboardWithUsernames,
      checkpoints: checkpoints || [],
      // onChainWinners: onChainWinners || null,
    });
  } catch (error) {
    console.error('Error in leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

