/**
 * Smart Contract Interaction Utilities
 */

import { createPublicClient, createWalletClient, http, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arcTestnet } from './arcChain';

// Contract ABI (simplified, will be generated from compilation)
export const TOURNAMENT_ABI = [
  {
    inputs: [{ name: 'dayId', type: 'uint256' }],
    name: 'enterTournament',
    outputs: [],
    stateMutability: 'nonpayable',
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
  {
    inputs: [
      { name: 'dayId', type: 'uint256' },
      { name: 'leaderboardHash', type: 'bytes32' },
    ],
    name: 'commitCheckpoint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'dayId', type: 'uint256' },
      { name: 'winners', type: 'address[3]' },
      { name: 'scores', type: 'uint256[3]' },
    ],
    name: 'finalizeDay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
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

// Contract address (will be set after deployment)
const TOURNAMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '';

// Public client for read operations
export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
});

// Wallet client for write operations (uses private key from env)
let walletClient: ReturnType<typeof createWalletClient> | null = null;
let walletAccount: ReturnType<typeof privateKeyToAccount> | null = null;

if (process.env.PRIVATE_KEY) {
  walletAccount = privateKeyToAccount(`0x${process.env.PRIVATE_KEY.replace('0x', '')}` as `0x${string}`);
  walletClient = createWalletClient({
    account: walletAccount,
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
  });
}

/**
 * Check if a wallet has entered the tournament for a day
 */
export async function hasEntered(dayId: number, wallet: string): Promise<boolean> {
  if (!TOURNAMENT_CONTRACT_ADDRESS) {
    console.warn('Tournament contract address not set');
    return false;
  }

  try {
    const result = await publicClient.readContract({
      address: TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: TOURNAMENT_ABI,
      functionName: 'hasEntered',
      args: [BigInt(dayId), wallet as `0x${string}`],
    });

    return result as boolean;
  } catch (error) {
    console.error('Error checking hasEntered:', error);
    return false;
  }
}

/**
 * Get day info from contract
 */
export async function getDayInfo(dayId: number) {
  if (!TOURNAMENT_CONTRACT_ADDRESS) {
    return null;
  }

  try {
    const result = await publicClient.readContract({
      address: TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: TOURNAMENT_ABI,
      functionName: 'getDayInfo',
      args: [BigInt(dayId)],
    });

    return {
      totalPool: formatUnits(result[0] as bigint, 6), // USDC has 6 decimals
      finalized: result[1] as boolean,
      checkpointCount: Number(result[2]),
      winners: [...(result[3] as readonly string[])] as string[],
      winnerScores: (result[4] as readonly bigint[]).map((s: bigint) => Number(s)),
    };
  } catch (error) {
    console.error('Error getting day info:', error);
    return null;
  }
}

/**
 * Commit a checkpoint (owner only)
 */
export async function commitCheckpoint(dayId: number, leaderboardHash: `0x${string}`): Promise<string | null> {
  if (!walletClient || !walletAccount || !TOURNAMENT_CONTRACT_ADDRESS) {
    throw new Error('Wallet client or contract address not configured');
  }

  try {
    const hash = await walletClient.writeContract({
      account: walletAccount,
      chain: arcTestnet,
      address: TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: TOURNAMENT_ABI,
      functionName: 'commitCheckpoint',
      args: [BigInt(dayId), leaderboardHash],
    });

    return hash;
  } catch (error) {
    console.error('Error committing checkpoint:', error);
    throw error;
  }
}

/**
 * Finalize a day (owner only)
 */
export async function finalizeDay(
  dayId: number,
  winners: [`0x${string}`, `0x${string}`, `0x${string}`],
  scores: [number, number, number]
): Promise<string | null> {
  if (!walletClient || !walletAccount || !TOURNAMENT_CONTRACT_ADDRESS) {
    throw new Error('Wallet client or contract address not configured');
  }

  try {
    const hash = await walletClient.writeContract({
      account: walletAccount,
      chain: arcTestnet,
      address: TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: TOURNAMENT_ABI,
      functionName: 'finalizeDay',
      args: [
        BigInt(dayId),
        winners,
        scores.map((s) => BigInt(s)) as [bigint, bigint, bigint],
      ],
    });

    return hash;
  } catch (error) {
    console.error('Error finalizing day:', error);
    throw error;
  }
}

