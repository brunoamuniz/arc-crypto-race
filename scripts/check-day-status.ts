/**
 * Script para verificar o status de um dia do torneio
 * Útil para verificar se um dia foi finalizado e permitir testes
 */

import 'dotenv/config';
import { createPublicClient, http, formatUnits } from 'viem';
import { arcTestnet } from '../lib/arcChain';
import { getCurrentDayId, parseDayId, isValidDayId } from '../lib/dayId';

const TOURNAMENT_CONTRACT = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;

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
  {
    inputs: [
      { name: 'dayId', type: 'uint256' },
      { name: 'wallet', type: 'address' },
    ],
    name: 'hasEntered',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
});

async function checkDayStatus(dayId?: number) {
  const targetDayId = dayId || getCurrentDayId();
  
  if (!isValidDayId(targetDayId)) {
    console.error('❌ Invalid day ID:', targetDayId);
    process.exit(1);
  }

  if (!TOURNAMENT_CONTRACT || TOURNAMENT_CONTRACT === '0x') {
    console.error('❌ Tournament contract address not configured');
    process.exit(1);
  }

  console.log('🔍 Checking tournament day status...\n');
  console.log('📅 Day ID:', targetDayId);
  console.log('📆 Date:', parseDayId(targetDayId).toISOString().split('T')[0]);
  console.log('📋 Contract:', TOURNAMENT_CONTRACT);
  console.log('');

  try {
    const dayInfo = await publicClient.readContract({
      address: TOURNAMENT_CONTRACT,
      abi: TOURNAMENT_ABI,
      functionName: 'getDayInfo',
      args: [BigInt(targetDayId)],
    });

    const [totalPool, finalized, checkpointCount, winners, winnerScores] = dayInfo;

    console.log('📊 DAY STATUS:');
    console.log('   Total Pool:', formatUnits(totalPool as bigint, 6), 'USDC');
    console.log('   Finalized:', finalized ? '✅ YES (Tournament closed)' : '❌ NO (Tournament open)');
    console.log('   Checkpoints:', checkpointCount.toString());
    console.log('');

    if (finalized) {
      console.log('🏆 WINNERS:');
      const winnersArray = winners as readonly string[];
      const scoresArray = winnerScores as readonly bigint[];
      
      if (winnersArray[0] !== '0x0000000000000000000000000000000000000000') {
        console.log('   1st Place:', winnersArray[0]);
        console.log('      Score:', scoresArray[0].toString());
      }
      if (winnersArray[1] !== '0x0000000000000000000000000000000000000000') {
        console.log('   2nd Place:', winnersArray[1]);
        console.log('      Score:', scoresArray[1].toString());
      }
      if (winnersArray[2] !== '0x0000000000000000000000000000000000000000') {
        console.log('   3rd Place:', winnersArray[2]);
        console.log('      Score:', scoresArray[2].toString());
      }
      console.log('');
      console.log('⚠️  This day is FINALIZED. New entries are not allowed.');
      console.log('💡 To test, you can:');
      console.log('   1. Wait for tomorrow (new dayId)');
      console.log('   2. Test with a future dayId (e.g., tomorrow)');
      console.log('   3. Check if there are any entries for this day');
    } else {
      console.log('✅ Tournament is OPEN for this day');
      console.log('   Users can enter and play!');
    }

    // Check current day vs target day
    const currentDayId = getCurrentDayId();
    if (targetDayId < currentDayId) {
      console.log('');
      console.log('📌 Note: This is a past day');
    } else if (targetDayId > currentDayId) {
      console.log('');
      console.log('📌 Note: This is a future day (good for testing!)');
    }

    console.log('');
    console.log('🔗 ArcScan:', `https://testnet.arcscan.app/address/${TOURNAMENT_CONTRACT}`);

  } catch (error: any) {
    console.error('❌ Error checking day status:', error.message);
    
    if (error.message?.includes('execution reverted')) {
      console.log('');
      console.log('💡 This might mean:');
      console.log('   - The day has no entries yet');
      console.log('   - The contract might not have been initialized for this day');
      console.log('   - Try checking the current day or a day with entries');
    }
    
    process.exit(1);
  }
}

// Get dayId from command line argument or use current day
const dayIdArg = process.argv[2];
const dayId = dayIdArg ? parseInt(dayIdArg, 10) : undefined;

checkDayStatus(dayId).catch(console.error);
