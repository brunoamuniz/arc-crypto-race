import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/username/check
 * Check if a username is available
 */
export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Check if username exists
    const { data: existing, error } = await supabaseAdmin
      .from('user_profiles')
      .select('wallet')
      .eq('username', username.toLowerCase())
      .maybeSingle(); // Use maybeSingle to handle not found gracefully

    if (error) {
      // If table doesn't exist, consider username available (graceful degradation)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('user_profiles table does not exist yet. Username considered available.');
        return NextResponse.json({
          available: true,
          username: username.toLowerCase(),
        });
      }
      console.error('Error checking username:', error);
      return NextResponse.json(
        { error: 'Failed to check username' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      available: !existing,
      username: username.toLowerCase(),
    });
  } catch (error) {
    console.error('Error in /api/username/check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
