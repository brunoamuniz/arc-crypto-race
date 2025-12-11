/**
 * Script para verificar se um endereço entrou no torneio
 */

import 'dotenv/config';
import { createPublicClient, http, formatUnits } from 'viem';
import { arcTestnet } from '../lib/arcChain';

const TOURNAMENT_CONTRACT = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;
// Wallet address can be provided via WALLET_ADDRESS env var or as command line argument
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || process.argv[2] || '0x49b9c6ab4a48a7a021a2760bd0ed45b1a0365b45';

const TOURNAMENT_ABI = [
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
] as const;

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
});

function getCurrentDayId(): number {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return parseInt(`${year}${month}${day}`, 10);
}

async function checkEntry() {
  console.log('🔍 Verificando entrada no torneio...\n');
  console.log('Contrato Tournament:', TOURNAMENT_CONTRACT);
  console.log('Wallet:', WALLET_ADDRESS);
  console.log('');

  if (!TOURNAMENT_CONTRACT || TOURNAMENT_CONTRACT === '0x') {
    console.error('❌ Erro: Contrato Tournament não configurado');
    return;
  }

  const dayId = getCurrentDayId();
  console.log('Day ID:', dayId);
  console.log('');

  try {
    // Verificar se entrou
    const hasEntered = await publicClient.readContract({
      address: TOURNAMENT_CONTRACT,
      abi: TOURNAMENT_ABI,
      functionName: 'hasEntered',
      args: [BigInt(dayId), WALLET_ADDRESS as `0x${string}`],
    });

    console.log('✅ Entrada verificada:');
    console.log(`   Has Entered: ${hasEntered ? '✅ SIM' : '❌ NÃO'}`);
    console.log('');

    // Verificar informações do dia
    const dayInfo = await publicClient.readContract({
      address: TOURNAMENT_CONTRACT,
      abi: TOURNAMENT_ABI,
      functionName: 'getDayInfo',
      args: [BigInt(dayId)],
    });

    console.log('📊 Informações do Dia:');
    console.log(`   Total Pool: ${formatUnits(dayInfo[0] as bigint, 6)} USDC`);
    console.log(`   Finalized: ${dayInfo[1] ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Checkpoints: ${dayInfo[2]}`);
    console.log('');

    // Verificar transações recentes
    console.log('🔗 Ver no ArcScan:');
    console.log(`   Contrato: https://testnet.arcscan.app/address/${TOURNAMENT_CONTRACT}`);
    console.log(`   Wallet: https://testnet.arcscan.app/address/${WALLET_ADDRESS}`);
    console.log('');

    if (!hasEntered) {
      console.log('⚠️  O wallet NÃO entrou no torneio ainda.');
      console.log('   Verifique se a transação de approve e enterTournament foram confirmadas.');
    } else {
      console.log('✅ O wallet entrou no torneio!');
    }

  } catch (error: any) {
    console.error('❌ Erro ao verificar:', error.message);
  }
}

checkEntry();

