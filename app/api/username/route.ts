import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/username
 * Create or update username for a wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, username } = body;

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

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('wallet')
      .eq('username', username.toLowerCase())
      .maybeSingle(); // Use maybeSingle to handle not found gracefully

    if (checkError) {
      // If table doesn't exist, allow the insert (it will create the table)
      if (checkError.code === '42P01' || checkError.message?.includes('does not exist')) {
        console.warn('user_profiles table does not exist yet. Will be created on first insert.');
      } else {
        console.error('Error checking username availability:', checkError);
        return NextResponse.json(
          { error: 'Failed to check username availability' },
          { status: 500 }
        );
      }
    }

    if (existingUser && existingUser.wallet.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Insert or update user profile
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        wallet: wallet.toLowerCase(),
        username: username.toLowerCase(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'wallet',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving username:', error);
      return NextResponse.json(
        { error: 'Failed to save username' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      wallet: profile.wallet,
      username: profile.username,
    });
  } catch (error) {
    console.error('Error in /api/username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
