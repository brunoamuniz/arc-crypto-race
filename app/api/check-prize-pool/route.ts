import { NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { arcTestnet } from '@/lib/arcChain';
import { getCurrentDayId, getDayId, parseDayId } from '@/lib/dayId';

const TOURNAMENT_ABI = [
  {
    inputs: [{ name: 'dayId', type: 'uint256' }],
    name: 'getDayInfo',
    outputs: [
      { name: 'totalPool', type: 'uint256' },
      { name: 'finalized', type: 'bool' },
      { name: 'checkpointCount', type: 'uint256' },
      { name: 'winners', type: 'address[3]' },
      { name: 'winnerScores', type: 'uint256[3]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const TOURNAMENT_CONTRACT = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network';

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(RPC_URL),
});

async function getDayInfo(dayId: number) {
  try {
    const result = await publicClient.readContract({
      address: TOURNAMENT_CONTRACT,
      abi: TOURNAMENT_ABI,
      functionName: 'getDayInfo',
      args: [BigInt(dayId)],
    });

    return {
      totalPool: result[0] as bigint,
      finalized: result[1] as boolean,
      checkpointCount: Number(result[2]),
      winners: result[3] as readonly `0x${string}`[],
      winnerScores: (result[4] as readonly bigint[]).map((s) => Number(s)),
    };
  } catch (error) {
    console.error(`Error getting day info for ${dayId}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    if (!TOURNAMENT_CONTRACT) {
      return NextResponse.json(
        { error: 'TOURNAMENT_CONTRACT_ADDRESS not set' },
        { status: 500 }
      );
    }

    // Get current day
    const currentDayId = getCurrentDayId();
    const currentDate = parseDayId(currentDayId);
    
    // Get previous day
    const previousDate = new Date(currentDate);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    const previousDayId = getDayId(previousDate);

    // Check previous day
    const previousDayInfo = await getDayInfo(previousDayId);
    
    // Check current day
    const currentDayInfo = await getDayInfo(currentDayId);

    // Calculate prizes for previous day if finalized
    let prizeDistribution = null;
    if (previousDayInfo?.finalized && previousDayInfo.totalPool > 0) {
      const siteFee = (previousDayInfo.totalPool * BigInt(1000)) / BigInt(10000); // 10%
      const prizePool = previousDayInfo.totalPool - siteFee;
      const firstPrize = (prizePool * BigInt(6000)) / BigInt(10000); // 60%
      const secondPrize = (prizePool * BigInt(2500)) / BigInt(10000); // 25%
      const thirdPrize = (prizePool * BigInt(1500)) / BigInt(10000); // 15%
      
      prizeDistribution = {
        totalPool: formatUnits(previousDayInfo.totalPool, 6),
        siteFee: formatUnits(siteFee, 6),
        prizePool: formatUnits(prizePool, 6),
        firstPrize: formatUnits(firstPrize, 6),
        secondPrize: formatUnits(secondPrize, 6),
        thirdPrize: formatUnits(thirdPrize, 6),
      };
    }

    return NextResponse.json({
      contract: TOURNAMENT_CONTRACT,
      currentDay: {
        dayId: currentDayId,
        date: currentDate.toISOString().split('T')[0],
        totalPool: currentDayInfo ? formatUnits(currentDayInfo.totalPool, 6) : '0',
        finalized: currentDayInfo?.finalized || false,
        checkpointCount: currentDayInfo?.checkpointCount || 0,
        entries: currentDayInfo && currentDayInfo.totalPool > 0 
          ? Math.floor(Number(currentDayInfo.totalPool) / (5 * 1e6))
          : 0,
      },
      previousDay: {
        dayId: previousDayId,
        date: previousDate.toISOString().split('T')[0],
        totalPool: previousDayInfo ? formatUnits(previousDayInfo.totalPool, 6) : '0',
        finalized: previousDayInfo?.finalized || false,
        checkpointCount: previousDayInfo?.checkpointCount || 0,
        winners: previousDayInfo?.winners.map((w, i) => ({
          address: w,
          score: previousDayInfo.winnerScores[i],
          rank: i + 1,
        })) || [],
        prizeDistribution,
      },
      summary: {
        previousDayFinalized: previousDayInfo?.finalized || false,
        prizesDistributed: previousDayInfo?.finalized || false,
        currentDayReset: currentDayInfo?.totalPool === BigInt(0),
        currentDayHasEntries: currentDayInfo ? currentDayInfo.totalPool > 0 : false,
      },
    });
  } catch (error: any) {
    console.error('Error checking prize pool:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

