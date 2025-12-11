import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/me
 * Get current user profile (username) by wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate wallet format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Get user profile
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('wallet, username, created_at, updated_at')
      .eq('wallet', wallet.toLowerCase())
      .maybeSingle(); // Use maybeSingle instead of single to handle not found gracefully

    if (error) {
      // If table doesn't exist, return no username (graceful degradation)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('user_profiles table does not exist yet. Please run the migration.');
        return NextResponse.json({
          ok: true,
          wallet: wallet.toLowerCase(),
          username: null,
          hasUsername: false,
        });
      }
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      wallet: wallet.toLowerCase(),
      username: profile?.username || null,
      hasUsername: !!profile?.username,
    });
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
