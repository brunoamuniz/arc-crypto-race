/**
 * Quick script to check pool in new contract
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createPublicClient, http, formatUnits } from 'viem';
import { arcTestnet } from '../lib/arcChain';
import { getCurrentDayId } from '../lib/dayId';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const NEW_CONTRACT = '0x4b6DBD9195F388C180830f3f0df8C8E8AC907B67' as `0x${string}`;

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

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
});

async function checkPool() {
  const dayId = getCurrentDayId();
  console.log(`\n📊 Checking pool for day ${dayId} in NEW contract\n`);
  console.log(`Contract: ${NEW_CONTRACT}\n`);
  
  try {
    const result = await publicClient.readContract({
      address: NEW_CONTRACT,
      abi: TOURNAMENT_ABI,
      functionName: 'getDayInfo',
      args: [BigInt(dayId)],
    });

    const totalPool = formatUnits(result[0] as bigint, 6);
    console.log(`✅ Pool: ${totalPool} USDC`);
    console.log(`   Finalized: ${result[1]}`);
    console.log(`   Entries: ${Math.floor(parseFloat(totalPool) / 5)}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPool();
