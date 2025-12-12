/**
 * Script to check if the daily prize pool was reset and if prizes were distributed
 */

import { createPublicClient, http, formatUnits } from 'viem';
import { arcTestnet } from '../lib/arcChain';
import { getCurrentDayId, getDayId, parseDayId } from '../lib/dayId';

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

async function main() {
  console.log('\n🔍 Checking Prize Pool Status\n');
  console.log('='.repeat(60));
  
  if (!TOURNAMENT_CONTRACT) {
    console.error('❌ TOURNAMENT_CONTRACT_ADDRESS not set in environment');
    process.exit(1);
  }

  console.log(`Contract Address: ${TOURNAMENT_CONTRACT}`);
  console.log(`RPC URL: ${RPC_URL}`);
  console.log('');

  // Get current day
  const currentDayId = getCurrentDayId();
  const currentDate = parseDayId(currentDayId);
  
  // Get previous day
  const previousDate = new Date(currentDate);
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);
  const previousDayId = getDayId(previousDate);

  console.log(`📅 Current Day: ${currentDayId} (${currentDate.toISOString().split('T')[0]})`);
  console.log(`📅 Previous Day: ${previousDayId} (${previousDate.toISOString().split('T')[0]})`);
  console.log('');

  // Check previous day
  console.log('📊 PREVIOUS DAY STATUS');
  console.log('-'.repeat(60));
  const previousDayInfo = await getDayInfo(previousDayId);
  
  if (!previousDayInfo) {
    console.log('❌ Could not fetch previous day info');
  } else {
    console.log(`Total Pool: ${formatUnits(previousDayInfo.totalPool, 6)} USDC`);
    console.log(`Finalized: ${previousDayInfo.finalized ? '✅ YES' : '❌ NO'}`);
    console.log(`Checkpoints: ${previousDayInfo.checkpointCount}`);
    
    if (previousDayInfo.finalized) {
      console.log('\n🏆 WINNERS:');
      const winners = previousDayInfo.winners;
      const scores = previousDayInfo.winnerScores;
      
      if (winners[0] !== '0x0000000000000000000000000000000000000000') {
        console.log(`  1st Place: ${winners[0]} (Score: ${scores[0].toLocaleString()})`);
      }
      if (winners[1] !== '0x0000000000000000000000000000000000000000') {
        console.log(`  2nd Place: ${winners[1]} (Score: ${scores[1].toLocaleString()})`);
      }
      if (winners[2] !== '0x0000000000000000000000000000000000000000') {
        console.log(`  3rd Place: ${winners[2]} (Score: ${scores[2].toLocaleString()})`);
      }
      
      // Calculate prizes
      const siteFee = (previousDayInfo.totalPool * BigInt(1000)) / BigInt(10000); // 10%
      const prizePool = previousDayInfo.totalPool - siteFee;
      const firstPrize = (prizePool * BigInt(6000)) / BigInt(10000); // 60%
      const secondPrize = (prizePool * BigInt(2500)) / BigInt(10000); // 25%
      const thirdPrize = (prizePool * BigInt(1500)) / BigInt(10000); // 15%
      
      console.log('\n💰 PRIZE DISTRIBUTION:');
      console.log(`  Total Pool: ${formatUnits(previousDayInfo.totalPool, 6)} USDC`);
      console.log(`  Site Fee (10%): ${formatUnits(siteFee, 6)} USDC`);
      console.log(`  Prize Pool: ${formatUnits(prizePool, 6)} USDC`);
      console.log(`  1st Place Prize: ${formatUnits(firstPrize, 6)} USDC`);
      console.log(`  2nd Place Prize: ${formatUnits(secondPrize, 6)} USDC`);
      console.log(`  3rd Place Prize: ${formatUnits(thirdPrize, 6)} USDC`);
      
      console.log('\n✅ Previous day was finalized - prizes should have been distributed!');
    } else {
      console.log('\n⚠️  Previous day was NOT finalized - prizes have NOT been distributed!');
      if (previousDayInfo.totalPool > 0) {
        console.log(`   Pool still has ${formatUnits(previousDayInfo.totalPool, 6)} USDC that needs to be distributed.`);
      }
    }
  }

  console.log('\n📊 CURRENT DAY STATUS');
  console.log('-'.repeat(60));
  const currentDayInfo = await getDayInfo(currentDayId);
  
  if (!currentDayInfo) {
    console.log('❌ Could not fetch current day info');
  } else {
    console.log(`Total Pool: ${formatUnits(currentDayInfo.totalPool, 6)} USDC`);
    console.log(`Finalized: ${currentDayInfo.finalized ? '✅ YES' : '❌ NO'}`);
    console.log(`Checkpoints: ${currentDayInfo.checkpointCount}`);
    
    if (currentDayInfo.totalPool === BigInt(0)) {
      console.log('\n✅ Current day pool is empty - new day has started!');
    } else {
      console.log(`\n💰 Current day pool: ${formatUnits(currentDayInfo.totalPool, 6)} USDC`);
      const entries = Number(currentDayInfo.totalPool) / (5 * 1e6);
      console.log(`   Estimated entries: ${Math.floor(entries)}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 SUMMARY:');
  
  if (previousDayInfo?.finalized) {
    console.log('✅ Previous day was finalized - prizes should have been sent to winners');
  } else if (previousDayInfo && previousDayInfo.totalPool > 0) {
    console.log('⚠️  Previous day was NOT finalized but has a pool - prizes need to be distributed!');
  } else {
    console.log('ℹ️  Previous day had no entries or was already finalized');
  }
  
  if (currentDayInfo && currentDayInfo.totalPool === BigInt(0)) {
    console.log('✅ Current day pool is empty - new tournament has started');
  } else if (currentDayInfo && currentDayInfo.totalPool > 0) {
    console.log(`💰 Current day has ${formatUnits(currentDayInfo.totalPool, 6)} USDC in the pool`);
  }
  
  console.log('\n');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

