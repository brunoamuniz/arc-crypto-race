/**
 * Script to add funds to the prize pool for a specific day
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { getCurrentDayId } from '../lib/dayId';
import { addFundsToPool } from '../lib/contract';
import { createPublicClient, http, formatUnits } from 'viem';
import { arcTestnet } from '../lib/arcChain';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const TOURNAMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS;
const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000';

if (!TOURNAMENT_CONTRACT_ADDRESS) {
  console.error('❌ NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS not found in environment variables');
  process.exit(1);
}

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
});

// USDC ABI (simplified - only what we need)
const USDC_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
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

async function checkOwnerBalance(ownerAddress: string) {
  try {
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [ownerAddress as `0x${string}`],
    });

    return balance;
  } catch (error) {
    console.error('Error checking balance:', error);
    return null;
  }
}

async function checkAllowance(ownerAddress: string, spenderAddress: string) {
  try {
    const allowance = await publicClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`],
    });

    return allowance;
  } catch (error) {
    console.error('Error checking allowance:', error);
    return null;
  }
}

async function addFunds(dayId: number, amount: number) {
  console.log(`\n💰 Adding ${amount} USDC to prize pool for day ${dayId}\n`);
  console.log('='.repeat(60));

  // Get owner address from PRIVATE_KEY
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found in environment variables');
    process.exit(1);
  }

  // Import here to avoid issues if not available
  const { privateKeyToAccount } = await import('viem/accounts');
  const ownerAccount = privateKeyToAccount(`0x${privateKey.replace('0x', '')}` as `0x${string}`);
  const ownerAddress = ownerAccount.address;

  console.log(`Owner Address: ${ownerAddress}`);
  console.log(`Contract Address: ${TOURNAMENT_CONTRACT_ADDRESS}`);
  console.log(`USDC Address: ${USDC_ADDRESS}`);
  console.log('');

  // Check owner balance
  console.log('📊 Checking owner balance...');
  const balance = await checkOwnerBalance(ownerAddress);
  if (balance === null) {
    console.error('❌ Failed to check balance');
    process.exit(1);
  }

  const balanceFormatted = formatUnits(balance, 6);
  console.log(`   Balance: ${balanceFormatted} USDC`);

  const amountInWei = BigInt(amount * 1e6); // USDC has 6 decimals
  if (balance < amountInWei) {
    console.error(`❌ Insufficient balance! Need ${amount} USDC, but only have ${balanceFormatted} USDC`);
    process.exit(1);
  }

  // Check allowance
  console.log('\n🔐 Checking allowance...');
  const allowance = await checkAllowance(ownerAddress, TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`);
  if (allowance === null) {
    console.error('❌ Failed to check allowance');
    process.exit(1);
  }

  const allowanceFormatted = formatUnits(allowance, 6);
  console.log(`   Current Allowance: ${allowanceFormatted} USDC`);

  if (allowance < amountInWei) {
    console.log(`\n⚠️  Allowance insufficient! Need to approve ${amount} USDC first.`);
    console.log('   You need to approve USDC before adding funds.');
    console.log(`   Required allowance: ${amount} USDC`);
    console.log(`   Current allowance: ${allowanceFormatted} USDC`);
    console.log('\n   To approve, you can use MetaMask or another wallet to call:');
    console.log(`   approve(${TOURNAMENT_CONTRACT_ADDRESS}, ${amount * 1e6})`);
    process.exit(1);
  }

  console.log(`\n✅ Allowance sufficient (${allowanceFormatted} USDC >= ${amount} USDC)`);

  // Add funds
  console.log(`\n🚀 Adding ${amount} USDC to prize pool...`);
  try {
    // Create wallet client directly
    const { createWalletClient, http, parseUnits } = await import('viem');
    const { privateKeyToAccount } = await import('viem/accounts');
    const { arcTestnet } = await import('../lib/arcChain');
    const { TOURNAMENT_ABI } = await import('../lib/contract');

    const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}` as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
    });

    const amountInWei = parseUnits(amount.toString(), 6);
    
    const txHash = await walletClient.writeContract({
      account,
      chain: arcTestnet,
      address: TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: TOURNAMENT_ABI,
      functionName: 'addFundsToPool',
      args: [BigInt(dayId), amountInWei],
    });
    
    if (!txHash) {
      console.error('❌ Failed to add funds');
      process.exit(1);
    }

    console.log(`\n✅ Transaction sent successfully!`);
    console.log(`   Transaction Hash: ${txHash}`);
    console.log(`   Explorer: https://testnet.arcscan.app/tx/${txHash}`);
    console.log(`\n⏳ Waiting for confirmation...`);

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (receipt.status === 'success') {
      console.log(`\n✅ Funds added successfully!`);
      console.log(`   Block Number: ${receipt.blockNumber}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    } else {
      console.error(`\n❌ Transaction failed!`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error adding funds:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

// Get day ID from command line or use current day
const dayIdArg = process.argv[2];
const amountArg = process.argv[3];

const dayId = dayIdArg ? parseInt(dayIdArg, 10) : getCurrentDayId();
const amount = amountArg ? parseFloat(amountArg) : 500;

if (isNaN(dayId)) {
  console.error('❌ Invalid day ID');
  process.exit(1);
}

if (isNaN(amount) || amount <= 0) {
  console.error('❌ Invalid amount. Must be a positive number');
  process.exit(1);
}

addFunds(dayId, amount).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
