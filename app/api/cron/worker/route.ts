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

