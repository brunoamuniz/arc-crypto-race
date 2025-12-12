/**
 * Script to approve USDC for the tournament contract
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arcTestnet } from '../lib/arcChain';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOURNAMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000';

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY not found in environment variables');
  process.exit(1);
}

if (!TOURNAMENT_CONTRACT_ADDRESS) {
  console.error('❌ NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS not found in environment variables');
  process.exit(1);
}

// TypeScript: After checks above, these are guaranteed to be defined
const privateKey: string = PRIVATE_KEY;
const tournamentContractAddress: string = TOURNAMENT_CONTRACT_ADDRESS;

// USDC ABI (ERC20 approve function)
const USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

async function approveUSDC(amount: number) {
  console.log(`\n🔐 Approving ${amount} USDC for tournament contract\n`);
  console.log('='.repeat(60));

  const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}` as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
  });

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
  });

  console.log(`Owner Address: ${account.address}`);
  console.log(`Contract Address: ${tournamentContractAddress}`);
  console.log(`USDC Address: ${USDC_ADDRESS}`);
  console.log('');

  // Check balance
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });

  const balanceFormatted = formatUnits(balance, 6);
  console.log(`📊 Balance: ${balanceFormatted} USDC`);

  const amountInWei = parseUnits(amount.toString(), 6);
  if (balance < amountInWei) {
    console.error(`❌ Insufficient balance! Need ${amount} USDC, but only have ${balanceFormatted} USDC`);
    process.exit(1);
  }

  // Approve
  console.log(`\n🚀 Approving ${amount} USDC...`);
  try {
    const hash = await walletClient.writeContract({
      account,
      chain: arcTestnet,
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [tournamentContractAddress as `0x${string}`, amountInWei],
    });

    console.log(`\n✅ Approval transaction sent!`);
    console.log(`   Transaction Hash: ${hash}`);
    console.log(`   Explorer: https://testnet.arcscan.app/tx/${hash}`);
    console.log(`\n⏳ Waiting for confirmation...`);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: hash as `0x${string}`,
    });

    if (receipt.status === 'success') {
      console.log(`\n✅ USDC approved successfully!`);
      console.log(`   Block Number: ${receipt.blockNumber}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`\n💰 You can now add funds to the prize pool!`);
    } else {
      console.error(`\n❌ Approval transaction failed!`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error approving USDC:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

// Get amount from command line or use 500
const amountArg = process.argv[2];
const amount = amountArg ? parseFloat(amountArg) : 500;

if (isNaN(amount) || amount <= 0) {
  console.error('❌ Invalid amount. Must be a positive number');
  process.exit(1);
}

approveUSDC(amount).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
