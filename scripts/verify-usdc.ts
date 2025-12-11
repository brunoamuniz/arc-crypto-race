/**
 * Script para verificar o contrato USDC e o valor de aprovação
 */

import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import { arcTestnet } from '../lib/arcChain';

// Official USDC ERC-20 interface address on ARC Testnet
// From: https://docs.arc.network/arc/references/contract-addresses
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000';
const TOURNAMENT_CONTRACT = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '';

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
});

// USDC ABI (minimal)
const USDC_ABI = [
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

async function verifyUSDC() {
  console.log('🔍 Verificando contrato USDC...\n');
  console.log('USDC Address:', USDC_ADDRESS);
  console.log('Tournament Contract:', TOURNAMENT_CONTRACT || 'NOT SET');
  console.log('');

  try {
    // Verificar decimals
    const decimals = await publicClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'decimals',
    });
    console.log('✅ USDC Decimals:', decimals);

    // Verificar symbol
    const symbol = await publicClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'symbol',
    });
    console.log('✅ USDC Symbol:', symbol);

    // Calcular ENTRY_FEE
    const ENTRY_FEE = parseUnits('5', Number(decimals));
    console.log('');
    console.log('💰 Entry Fee Calculation:');
    console.log('   Amount: 5 USDC');
    console.log('   Decimals:', decimals);
    console.log('   Raw value:', ENTRY_FEE.toString());
    console.log('   Formatted:', formatUnits(ENTRY_FEE, Number(decimals)), symbol);
    console.log('');

    if (ENTRY_FEE.toString() !== '5000000') {
      console.error('❌ ERROR: Entry fee should be 5000000 (5 * 10^6)');
      console.error('   Got:', ENTRY_FEE.toString());
    } else {
      console.log('✅ Entry fee calculation is correct!');
    }

  } catch (error: any) {
    console.error('❌ Error verifying USDC contract:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('  1. USDC address is incorrect');
    console.error('  2. Network is not ARC Testnet');
    console.error('  3. RPC endpoint is not accessible');
  }
}

verifyUSDC();

