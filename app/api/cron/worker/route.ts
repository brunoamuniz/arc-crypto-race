/**
 * Vercel Cron Job endpoint to process pending commits
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/worker",
 *     "schedule": "*/10 * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { runWorker } from '@/scripts/worker';

export const maxDuration = 300; // 5 minutes max execution time

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel adds this header automatically)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // For Vercel Cron, the header is automatically set, but we can still check
      // Vercel sets: x-vercel-signature header
      const vercelSignature = request.headers.get('x-vercel-signature');
      if (!vercelSignature && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('🔄 Running worker via cron job...');
    
    // Run worker
    await runWorker();
    
    return NextResponse.json({
      ok: true,
      message: 'Worker completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error in cron worker:', error);
    return NextResponse.json(
      {
        error: 'Worker failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
