/**
 * Test Payment and Prize Distribution
 * 
 * This script tests:
 * 1. Tournament entry payment (enterTournament)
 * 2. Prize pool accumulation
 * 3. Prize distribution (finalizeDay)
 * 4. Balance verification before and after
 * 
 * Usage:
 *   npx tsx scripts/test-payment-and-prize-distribution.ts [dayId]
 * 
 * Requirements:
 *   - PRIVATE_KEY in .env (for owner operations)
 *   - NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS in .env
 *   - NEXT_PUBLIC_USDC_ADDRESS in .env
 *   - At least 3 wallets with USDC balance for testing
 */

import 'dotenv/config';
import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arcTestnet } from '../lib/arcChain';
import { getCurrentDayId } from '../lib/dayId';

const TOURNAMENT_CONTRACT = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;
const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000') as `0x${string}`;
const OWNER_PRIVATE_KEY = process.env.PRIVATE_KEY;

// Test wallets (you can provide these as env vars or use the owner wallet multiple times)
const TEST_WALLET_1 = process.env.TEST_WALLET_1_PRIVATE_KEY || OWNER_PRIVATE_KEY;
const TEST_WALLET_2 = process.env.TEST_WALLET_2_PRIVATE_KEY || OWNER_PRIVATE_KEY;
const TEST_WALLET_3 = process.env.TEST_WALLET_3_PRIVATE_KEY || OWNER_PRIVATE_KEY;

const ENTRY_FEE = parseUnits('5', 6); // 5 USDC

const USDC_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const TOURNAMENT_ABI = [
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
      { name: 'winners', type: 'address[3]' },
      { name: 'scores', type: 'uint256[3]' },
    ],
    name: 'finalizeDay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
});

interface WalletAccount {
  account: ReturnType<typeof privateKeyToAccount>;
  walletClient: ReturnType<typeof createWalletClient>;
  address: string;
}

function createWalletAccount(privateKey: string | undefined, name: string): WalletAccount | null {
  if (!privateKey) {
    console.error(`❌ ${name} private key not found`);
    return null;
  }

  try {
    const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}` as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    });

    return { account, walletClient, address: account.address };
  } catch (error: any) {
    console.error(`❌ Error creating ${name} account:`, error.message);
    return null;
  }
}

async function getUSDCBalance(address: string): Promise<bigint> {
  try {
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });
    return balance as bigint;
  } catch (error: any) {
    console.error(`Error getting balance for ${address}:`, error.message);
    return BigInt(0);
  }
}

async function checkAllowance(owner: string, spender: string): Promise<bigint> {
  try {
    const allowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [owner as `0x${string}`, spender as `0x${string}`],
    });
    return allowance as bigint;
  } catch (error: any) {
    console.error(`Error checking allowance:`, error.message);
    return BigInt(0);
  }
}

async function approveUSDC(wallet: WalletAccount, spender: string, amount: bigint): Promise<string | null> {
  try {
    console.log(`   Approving ${formatUnits(amount, 6)} USDC...`);
    const hash = await wallet.walletClient.writeContract({
      account: wallet.account,
      chain: arcTestnet,
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, amount],
    });

    console.log(`   Transaction sent: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log(`   ✅ Approval confirmed`);
      return hash;
    } else {
      console.error(`   ❌ Approval failed`);
      return null;
    }
  } catch (error: any) {
    console.error(`   ❌ Approval error:`, error.message);
    return null;
  }
}

async function enterTournament(wallet: WalletAccount, dayId: number): Promise<string | null> {
  try {
    console.log(`   Entering tournament for day ${dayId}...`);
    const hash = await wallet.walletClient.writeContract({
      account: wallet.account,
      chain: arcTestnet,
      address: TOURNAMENT_CONTRACT,
      abi: TOURNAMENT_ABI,
      functionName: 'enterTournament',
      args: [BigInt(dayId)],
    });

    console.log(`   Transaction sent: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log(`   ✅ Entry confirmed`);
      return hash;
    } else {
      console.error(`   ❌ Entry failed`);
      return null;
    }
  } catch (error: any) {
    // Check if error is "Already entered today"
    if (error.message && error.message.includes('Already entered')) {
      console.log(`   ⚠️  Already entered, skipping`);
      return 'skipped'; // Return special value to indicate skip
    }
    console.error(`   ❌ Entry error:`, error.message);
    return null;
  }
}

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
      winners: result[3] as readonly string[],
      winnerScores: result[4] as readonly bigint[],
    };
  } catch (error: any) {
    console.error('Error getting day info:', error.message);
    return null;
  }
}

async function finalizeDay(wallet: WalletAccount, dayId: number, winners: string[], scores: number[]): Promise<string | null> {
  try {
    console.log(`   Finalizing day ${dayId}...`);
    const hash = await wallet.walletClient.writeContract({
      account: wallet.account,
      chain: arcTestnet,
      address: TOURNAMENT_CONTRACT,
      abi: TOURNAMENT_ABI,
      functionName: 'finalizeDay',
      args: [
        BigInt(dayId),
        winners as [`0x${string}`, `0x${string}`, `0x${string}`],
        scores.map(s => BigInt(s)) as [bigint, bigint, bigint],
      ],
    });

    console.log(`   Transaction sent: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log(`   ✅ Finalization confirmed`);
      return hash;
    } else {
      console.error(`   ❌ Finalization failed`);
      return null;
    }
  } catch (error: any) {
    console.error(`   ❌ Finalization error:`, error.message);
    return null;
  }
}

async function testPaymentAndDistribution() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TEST: Payment and Prize Distribution');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Validate configuration
  if (!TOURNAMENT_CONTRACT || TOURNAMENT_CONTRACT === '0x') {
    console.error('❌ NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS not configured');
    return;
  }

  if (!OWNER_PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not configured (needed for finalize)');
    return;
  }

  // Get day ID
  const dayId = process.argv[2] ? parseInt(process.argv[2]) : getCurrentDayId();
  console.log(`Day ID: ${dayId}`);
  console.log('');

  // Create wallet accounts
  const ownerWallet = createWalletAccount(OWNER_PRIVATE_KEY, 'Owner');
  if (!ownerWallet) return;

  const wallet1 = createWalletAccount(TEST_WALLET_1, 'Wallet 1');
  const wallet2 = createWalletAccount(TEST_WALLET_2, 'Wallet 2');
  const wallet3 = createWalletAccount(TEST_WALLET_3, 'Wallet 3');

  if (!wallet1 || !wallet2 || !wallet3) {
    console.error('❌ Test wallets not configured');
    console.log('   Set TEST_WALLET_1_PRIVATE_KEY, TEST_WALLET_2_PRIVATE_KEY, TEST_WALLET_3_PRIVATE_KEY');
    console.log('   Or use the same PRIVATE_KEY for all (for testing with one wallet)');
    return;
  }

  // Verify owner
  const contractOwner = await publicClient.readContract({
    address: TOURNAMENT_CONTRACT,
    abi: TOURNAMENT_ABI,
    functionName: 'owner',
  });

  if (contractOwner.toLowerCase() !== ownerWallet.address.toLowerCase()) {
    console.error(`❌ Owner mismatch!`);
    console.error(`   Contract owner: ${contractOwner}`);
    console.error(`   Your address: ${ownerWallet.address}`);
    return;
  }

  console.log('✅ Contract owner verified');
  console.log('');

  // ============================================
  // PHASE 1: Check Initial State
  // ============================================
  console.log('📊 PHASE 1: Initial State');
  console.log('───────────────────────────────────────────────────────────');

  const initialDayInfo = await getDayInfo(dayId);
  if (!initialDayInfo) {
    console.error('❌ Failed to get day info');
    return;
  }

  console.log(`Day ${dayId} Info:`);
  console.log(`  Total Pool: ${formatUnits(initialDayInfo.totalPool, 6)} USDC`);
  console.log(`  Finalized: ${initialDayInfo.finalized}`);
  console.log(`  Checkpoints: ${initialDayInfo.checkpointCount}`);
  console.log('');

  if (initialDayInfo.finalized) {
    console.error(`❌ Day ${dayId} is already finalized!`);
    console.log('   Use a different day ID or wait for tomorrow');
    console.log('   Example: npx tsx scripts/test-payment-and-prize-distribution.ts 20251212');
    return;
  }

  // Check if we have enough entries (need at least 3 for prize distribution)
  const currentEntries = initialDayInfo.totalPool / ENTRY_FEE;
  console.log(`  Current entries in pool: ${currentEntries}`);
  
  if (currentEntries < 3) {
    console.log(`  ⚠️  Need at least 3 entries for prize distribution test`);
    console.log(`  Current: ${currentEntries}, Need: ${3 - Number(currentEntries)} more`);
  }

  // Get initial balances
  const initialBalances = {
    contract: await getUSDCBalance(TOURNAMENT_CONTRACT),
    wallet1: await getUSDCBalance(wallet1.address),
    wallet2: await getUSDCBalance(wallet2.address),
    wallet3: await getUSDCBalance(wallet3.address),
    owner: await getUSDCBalance(ownerWallet.address),
  };

  console.log('Initial Balances:');
  console.log(`  Contract: ${formatUnits(initialBalances.contract, 6)} USDC`);
  console.log(`  Wallet 1: ${formatUnits(initialBalances.wallet1, 6)} USDC`);
  console.log(`  Wallet 2: ${formatUnits(initialBalances.wallet2, 6)} USDC`);
  console.log(`  Wallet 3: ${formatUnits(initialBalances.wallet3, 6)} USDC`);
  console.log(`  Owner: ${formatUnits(initialBalances.owner, 6)} USDC`);
  console.log('');

  // Check if wallets have enough balance
  if (initialBalances.wallet1 < ENTRY_FEE) {
    console.error(`❌ Wallet 1 has insufficient balance (needs ${formatUnits(ENTRY_FEE, 6)} USDC)`);
    return;
  }
  if (initialBalances.wallet2 < ENTRY_FEE) {
    console.error(`❌ Wallet 2 has insufficient balance (needs ${formatUnits(ENTRY_FEE, 6)} USDC)`);
    return;
  }
  if (initialBalances.wallet3 < ENTRY_FEE) {
    console.error(`❌ Wallet 3 has insufficient balance (needs ${formatUnits(ENTRY_FEE, 6)} USDC)`);
    return;
  }

  // ============================================
  // PHASE 2: Tournament Entries
  // ============================================
  console.log('💰 PHASE 2: Tournament Entries');
  console.log('───────────────────────────────────────────────────────────');

  // Check if already entered
  const hasEntered1 = await publicClient.readContract({
    address: TOURNAMENT_CONTRACT,
    abi: TOURNAMENT_ABI,
    functionName: 'hasEntered',
    args: [BigInt(dayId), wallet1.address as `0x${string}`],
  });

  const hasEntered2 = await publicClient.readContract({
    address: TOURNAMENT_CONTRACT,
    abi: TOURNAMENT_ABI,
    functionName: 'hasEntered',
    args: [BigInt(dayId), wallet2.address as `0x${string}`],
  });

  const hasEntered3 = await publicClient.readContract({
    address: TOURNAMENT_CONTRACT,
    abi: TOURNAMENT_ABI,
    functionName: 'hasEntered',
    args: [BigInt(dayId), wallet3.address as `0x${string}`],
  });

  // Declare entry hashes outside blocks
  let entryHash1: string | null = null;
  let entryHash2: string | null = null;
  let entryHash3: string | null = null;

  // Entry 1
  console.log(`\n1️⃣  Wallet 1 Entry (${wallet1.address.slice(0, 10)}...):`);
  if (hasEntered1) {
    console.log('   ⚠️  Already entered, skipping');
    entryHash1 = 'skipped';
  } else {
    const allowance1 = await checkAllowance(wallet1.address, TOURNAMENT_CONTRACT);
    if (allowance1 < ENTRY_FEE) {
      const approveHash1 = await approveUSDC(wallet1, TOURNAMENT_CONTRACT, ENTRY_FEE);
      if (!approveHash1) {
        console.error('   ❌ Failed to approve');
        return;
      }
    } else {
      console.log('   ✅ Already has sufficient allowance');
    }
    entryHash1 = await enterTournament(wallet1, dayId);
    if (!entryHash1 || entryHash1 === 'skipped') {
      if (entryHash1 === 'skipped') {
        // Already entered, continue
      } else {
        console.error('   ❌ Failed to enter');
        return;
      }
    }
  }

  // Entry 2
  console.log(`\n2️⃣  Wallet 2 Entry (${wallet2.address.slice(0, 10)}...):`);
  if (hasEntered2) {
    console.log('   ⚠️  Already entered, skipping');
    entryHash2 = 'skipped';
  } else {
    const allowance2 = await checkAllowance(wallet2.address, TOURNAMENT_CONTRACT);
    if (allowance2 < ENTRY_FEE) {
      const approveHash2 = await approveUSDC(wallet2, TOURNAMENT_CONTRACT, ENTRY_FEE);
      if (!approveHash2) {
        console.error('   ❌ Failed to approve');
        return;
      }
    } else {
      console.log('   ✅ Already has sufficient allowance');
    }
    entryHash2 = await enterTournament(wallet2, dayId);
    if (!entryHash2 || entryHash2 === 'skipped') {
      if (entryHash2 === 'skipped') {
        // Already entered, continue
      } else {
        console.error('   ❌ Failed to enter');
        return;
      }
    }
  }

  // Entry 3
  console.log(`\n3️⃣  Wallet 3 Entry (${wallet3.address.slice(0, 10)}...):`);
  if (hasEntered3) {
    console.log('   ⚠️  Already entered, skipping');
    entryHash3 = 'skipped';
  } else {
    const allowance3 = await checkAllowance(wallet3.address, TOURNAMENT_CONTRACT);
    if (allowance3 < ENTRY_FEE) {
      const approveHash3 = await approveUSDC(wallet3, TOURNAMENT_CONTRACT, ENTRY_FEE);
      if (!approveHash3) {
        console.error('   ❌ Failed to approve');
        return;
      }
    } else {
      console.log('   ✅ Already has sufficient allowance');
    }
    entryHash3 = await enterTournament(wallet3, dayId);
    if (!entryHash3 || entryHash3 === 'skipped') {
      if (entryHash3 === 'skipped') {
        // Already entered, continue
      } else {
        console.error('   ❌ Failed to enter');
        return;
      }
    }
  }

  // Verify pool increased
  console.log('\n📊 Verifying pool increase...');
  const afterEntryDayInfo = await getDayInfo(dayId);
  if (!afterEntryDayInfo) {
    console.error('❌ Failed to get day info after entries');
    return;
  }

  // Count how many new entries were made
  const newEntries = [
    !hasEntered1 && entryHash1 && entryHash1 !== 'skipped' ? 1 : 0,
    !hasEntered2 && entryHash2 && entryHash2 !== 'skipped' ? 1 : 0,
    !hasEntered3 && entryHash3 && entryHash3 !== 'skipped' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const expectedPool = initialDayInfo.totalPool + (ENTRY_FEE * BigInt(newEntries));
  console.log(`  New entries made: ${newEntries}`);
  console.log(`  Expected pool: ${formatUnits(expectedPool, 6)} USDC`);
  console.log(`  Actual pool: ${formatUnits(afterEntryDayInfo.totalPool, 6)} USDC`);

  if (afterEntryDayInfo.totalPool >= expectedPool) {
    console.log('  ✅ Pool increased correctly');
  } else {
    console.log(`  ⚠️  Pool increase: ${formatUnits(afterEntryDayInfo.totalPool - initialDayInfo.totalPool, 6)} USDC (expected ${formatUnits(ENTRY_FEE * BigInt(newEntries), 6)} USDC)`);
  }

  const contractBalanceAfter = await getUSDCBalance(TOURNAMENT_CONTRACT);
  console.log(`  Contract balance: ${formatUnits(contractBalanceAfter, 6)} USDC`);
  console.log('');

  // ============================================
  // PHASE 3: Prize Distribution
  // ============================================
  console.log('🏆 PHASE 3: Prize Distribution');
  console.log('───────────────────────────────────────────────────────────');

  // Calculate expected prizes
  const totalPool = afterEntryDayInfo.totalPool;
  const siteFee = (totalPool * BigInt(1000)) / BigInt(10000); // 10%
  const prizePool = totalPool - siteFee;
  const firstPrize = (prizePool * BigInt(6000)) / BigInt(10000); // 60%
  const secondPrize = (prizePool * BigInt(2500)) / BigInt(10000); // 25%
  const thirdPrize = (prizePool * BigInt(1500)) / BigInt(10000); // 15%

  console.log('Prize Calculation:');
  console.log(`  Total Pool: ${formatUnits(totalPool, 6)} USDC`);
  console.log(`  Site Fee (10%): ${formatUnits(siteFee, 6)} USDC`);
  console.log(`  Prize Pool: ${formatUnits(prizePool, 6)} USDC`);
  console.log(`  1st Place (60%): ${formatUnits(firstPrize, 6)} USDC`);
  console.log(`  2nd Place (25%): ${formatUnits(secondPrize, 6)} USDC`);
  console.log(`  3rd Place (15%): ${formatUnits(thirdPrize, 6)} USDC`);
  console.log('');

  // Get balances before finalization
  const balancesBeforeFinalize = {
    wallet1: await getUSDCBalance(wallet1.address),
    wallet2: await getUSDCBalance(wallet2.address),
    wallet3: await getUSDCBalance(wallet3.address),
    owner: await getUSDCBalance(ownerWallet.address),
    contract: await getUSDCBalance(TOURNAMENT_CONTRACT),
  };

  // Finalize with winners (wallet1 = 1st, wallet2 = 2nd, wallet3 = 3rd)
  const winners = [wallet1.address, wallet2.address, wallet3.address];
  const scores = [10000, 8000, 6000]; // Mock scores

  console.log('Finalizing with winners:');
  console.log(`  1st: ${winners[0]} (score: ${scores[0]})`);
  console.log(`  2nd: ${winners[1]} (score: ${scores[1]})`);
  console.log(`  3rd: ${winners[2]} (score: ${scores[2]})`);
  console.log('');

  const finalizeHash = await finalizeDay(ownerWallet, dayId, winners, scores);
  if (!finalizeHash) {
    console.error('❌ Failed to finalize');
    return;
  }

  console.log(`\n✅ Finalization transaction: ${finalizeHash}`);
  console.log(`   Explorer: https://testnet.arcscan.app/tx/${finalizeHash}`);
  console.log('');

  // ============================================
  // PHASE 4: Verify Distribution
  // ============================================
  console.log('✅ PHASE 4: Verifying Distribution');
  console.log('───────────────────────────────────────────────────────────');

  // Wait a bit for transaction to be fully processed
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get balances after finalization
  const balancesAfterFinalize = {
    wallet1: await getUSDCBalance(wallet1.address),
    wallet2: await getUSDCBalance(wallet2.address),
    wallet3: await getUSDCBalance(wallet3.address),
    owner: await getUSDCBalance(ownerWallet.address),
    contract: await getUSDCBalance(TOURNAMENT_CONTRACT),
  };

  // Check if all wallets are the same (testing with single wallet)
  const allWalletsSame = wallet1.address.toLowerCase() === wallet2.address.toLowerCase() &&
                         wallet2.address.toLowerCase() === wallet3.address.toLowerCase();
  
  if (allWalletsSame) {
    console.log('⚠️  NOTE: All test wallets are the same address.');
    console.log('   All prizes will be sent to the same wallet.');
    console.log('   For proper testing, use different wallets via TEST_WALLET_1_PRIVATE_KEY, etc.\n');
  }

  console.log('Balance Changes:');
  console.log(`  Wallet 1 (1st):`);
  console.log(`    Before: ${formatUnits(balancesBeforeFinalize.wallet1, 6)} USDC`);
  console.log(`    After: ${formatUnits(balancesAfterFinalize.wallet1, 6)} USDC`);
  const change1 = balancesAfterFinalize.wallet1 - balancesBeforeFinalize.wallet1;
  console.log(`    Change: ${change1 >= 0 ? '+' : ''}${formatUnits(change1, 6)} USDC`);
  console.log(`    Expected: +${formatUnits(firstPrize, 6)} USDC`);
  
  if (allWalletsSame) {
    // If all wallets are same, check if total received matches sum of all prizes
    const totalExpected = firstPrize + secondPrize + thirdPrize + siteFee;
    if (change1 >= totalExpected - BigInt(5000) && change1 <= totalExpected + BigInt(5000)) {
      console.log(`    ✅ Received all prizes (${formatUnits(totalExpected, 6)} USDC total - all wallets same)`);
    } else {
      console.log(`    ⚠️  Received ${formatUnits(change1, 6)} USDC (expected ${formatUnits(totalExpected, 6)} USDC total)`);
    }
  } else if (change1 >= firstPrize - BigInt(1000) && change1 <= firstPrize + BigInt(1000)) {
    console.log(`    ✅ Prize received correctly`);
  } else {
    console.log(`    ❌ Prize amount mismatch!`);
  }

  console.log(`\n  Wallet 2 (2nd):`);
  console.log(`    Before: ${formatUnits(balancesBeforeFinalize.wallet2, 6)} USDC`);
  console.log(`    After: ${formatUnits(balancesAfterFinalize.wallet2, 6)} USDC`);
  const change2 = balancesAfterFinalize.wallet2 - balancesBeforeFinalize.wallet2;
  console.log(`    Change: ${change2 >= 0 ? '+' : ''}${formatUnits(change2, 6)} USDC`);
  console.log(`    Expected: +${formatUnits(secondPrize, 6)} USDC`);
  
  if (allWalletsSame) {
    console.log(`    ℹ️  Same wallet as Wallet 1 (all prizes combined)`);
  } else if (change2 >= secondPrize - BigInt(1000) && change2 <= secondPrize + BigInt(1000)) {
    console.log(`    ✅ Prize received correctly`);
  } else {
    console.log(`    ❌ Prize amount mismatch!`);
  }

  console.log(`\n  Wallet 3 (3rd):`);
  console.log(`    Before: ${formatUnits(balancesBeforeFinalize.wallet3, 6)} USDC`);
  console.log(`    After: ${formatUnits(balancesAfterFinalize.wallet3, 6)} USDC`);
  const change3 = balancesAfterFinalize.wallet3 - balancesBeforeFinalize.wallet3;
  console.log(`    Change: ${change3 >= 0 ? '+' : ''}${formatUnits(change3, 6)} USDC`);
  console.log(`    Expected: +${formatUnits(thirdPrize, 6)} USDC`);
  
  if (allWalletsSame) {
    console.log(`    ℹ️  Same wallet as Wallet 1 (all prizes combined)`);
  } else if (change3 >= thirdPrize - BigInt(1000) && change3 <= thirdPrize + BigInt(1000)) {
    console.log(`    ✅ Prize received correctly`);
  } else {
    console.log(`    ❌ Prize amount mismatch!`);
  }

  console.log(`\n  Owner (Site Fee):`);
  console.log(`    Before: ${formatUnits(balancesBeforeFinalize.owner, 6)} USDC`);
  console.log(`    After: ${formatUnits(balancesAfterFinalize.owner, 6)} USDC`);
  const ownerChange = balancesAfterFinalize.owner - balancesBeforeFinalize.owner;
  console.log(`    Change: ${ownerChange >= 0 ? '+' : ''}${formatUnits(ownerChange, 6)} USDC`);
  console.log(`    Expected: +${formatUnits(siteFee, 6)} USDC`);
  
  if (allWalletsSame && ownerWallet.address.toLowerCase() === wallet1.address.toLowerCase()) {
    console.log(`    ℹ️  Same wallet as winners (site fee included in total)`);
  } else if (ownerChange >= siteFee - BigInt(1000) && ownerChange <= siteFee + BigInt(1000)) {
    console.log(`    ✅ Site fee received correctly`);
  } else {
    console.log(`    ❌ Site fee amount mismatch!`);
  }

  console.log(`\n  Contract:`);
  console.log(`    Before: ${formatUnits(balancesBeforeFinalize.contract, 6)} USDC`);
  console.log(`    After: ${formatUnits(balancesAfterFinalize.contract, 6)} USDC`);
  const contractChange = balancesAfterFinalize.contract - balancesBeforeFinalize.contract;
  console.log(`    Change: ${formatUnits(contractChange, 6)} USDC`);
  console.log(`    Expected: -${formatUnits(totalPool, 6)} USDC (all distributed)`);
  if (contractChange <= BigInt(1000)) { // Should be near zero
    console.log(`    ✅ Contract balance cleared`);
  } else {
    console.log(`    ❌ Contract still has balance!`);
  }

  // Verify finalization status
  const finalDayInfo = await getDayInfo(dayId);
  if (finalDayInfo) {
    console.log(`\n📊 Final Day Info:`);
    console.log(`  Finalized: ${finalDayInfo.finalized}`);
    console.log(`  Winners: ${finalDayInfo.winners.join(', ')}`);
    console.log(`  Scores: ${finalDayInfo.winnerScores.map(s => s.toString()).join(', ')}`);
    
    if (finalDayInfo.finalized) {
      console.log(`  ✅ Day successfully finalized`);
    } else {
      console.log(`  ❌ Day not marked as finalized!`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
}

testPaymentAndDistribution().catch(console.error);
