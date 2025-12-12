/**
 * Script para adicionar fundos ao pool de prêmios
 * 
 * IMPORTANTE: Este script mostra como adicionar fundos, mas o contrato atual
 * não tem uma função específica para isso. Você tem duas opções:
 * 
 * 1. Criar uma função no contrato (requer novo deploy)
 * 2. Simular entrada no torneio com uma carteira controlada (workaround)
 * 
 * Uso:
 *   npx tsx scripts/add-funds-to-pool.ts <dayId> <amount>
 * 
 * Exemplo:
 *   npx tsx scripts/add-funds-to-pool.ts 20251213 100
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arcTestnet } from '../lib/arcChain';

// Load .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

const TOURNAMENT_CONTRACT = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;
const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000') as `0x${string}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const TOURNAMENT_ABI = [
  {
    inputs: [{ name: 'dayId', type: 'uint256' }],
    name: 'enterTournament',
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

const USDC_ABI = [
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
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

async function addFundsToPool() {
  const dayId = process.argv[2] ? parseInt(process.argv[2], 10) : null;
  const amount = process.argv[3] ? parseFloat(process.argv[3]) : null;

  if (!dayId || !amount) {
    console.error('❌ Uso: npx tsx scripts/add-funds-to-pool.ts <dayId> <amount>');
    console.error('   Exemplo: npx tsx scripts/add-funds-to-pool.ts 20251213 100');
    process.exit(1);
  }

  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY não configurado no .env');
    process.exit(1);
  }

  if (!TOURNAMENT_CONTRACT) {
    console.error('❌ NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS não configurado');
    process.exit(1);
  }

  const account = privateKeyToAccount(`0x${PRIVATE_KEY.replace('0x', '')}` as `0x${string}`);
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
  });
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'),
  });

  console.log('\n💰 Adicionando Fundos ao Pool de Prêmios\n');
  console.log('📋 Configuração:');
  console.log('   Day ID:', dayId);
  console.log('   Amount:', amount, 'USDC');
  console.log('   Contract:', TOURNAMENT_CONTRACT);
  console.log('   Owner:', account.address);
  console.log('');

  try {
    // Check current pool
    const dayInfo = await publicClient.readContract({
      address: TOURNAMENT_CONTRACT,
      abi: TOURNAMENT_ABI,
      functionName: 'getDayInfo',
      args: [BigInt(dayId)],
    });

    const currentPool = formatUnits(dayInfo[0] as bigint, 6);
    console.log('📊 Pool Atual:', currentPool, 'USDC');
    console.log('   Finalized:', dayInfo[1] ? '✅ Sim' : '❌ Não');
    console.log('');

    if (dayInfo[1]) {
      console.error('❌ Este dia já foi finalizado! Não é possível adicionar fundos.');
      process.exit(1);
    }

    // Check USDC balance
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });

    const balanceFormatted = formatUnits(balance as bigint, 6);
    console.log('💵 Saldo USDC:', balanceFormatted, 'USDC');
    console.log('');

    const amountInWei = parseUnits(amount.toString(), 6);
    const entryFee = parseUnits('5', 6);
    const entriesNeeded = Math.ceil(Number(amountInWei) / Number(entryFee));

    console.log('⚠️  LIMITAÇÃO DO CONTRATO ATUAL:');
    console.log('   O contrato não tem uma função para adicionar fundos diretamente.');
    console.log('   A única forma é simular entradas no torneio.');
    console.log('');
    console.log('📊 Para adicionar', amount, 'USDC:');
    console.log('   Seriam necessárias', entriesNeeded, 'entradas de 5 USDC cada');
    console.log('   Custo total:', entriesNeeded * 5, 'USDC');
    console.log('');

    if (balance < amountInWei) {
      console.error('❌ Saldo insuficiente!');
      console.error('   Necessário:', amount, 'USDC');
      console.error('   Disponível:', balanceFormatted, 'USDC');
      process.exit(1);
    }

    console.log('💡 SOLUÇÃO RECOMENDADA:');
    console.log('   1. Adicionar uma função `addFunds(uint256 dayId, uint256 amount)` no contrato');
    console.log('   2. Fazer novo deploy do contrato');
    console.log('   3. Usar a nova função para adicionar fundos');
    console.log('');
    console.log('📝 Função sugerida para o contrato:');
    console.log(`
    function addFunds(uint256 dayId, uint256 amount) external onlyOwner {
        require(!dayInfo[dayId].finalized, "Day already finalized");
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        dayInfo[dayId].totalPool += amount;
        emit FundsAdded(dayId, msg.sender, amount);
    }
    `);
    console.log('');
    console.log('⚠️  Para adicionar fundos agora, você precisaria:');
    console.log('   1. Criar múltiplas carteiras');
    console.log('   2. Fazer múltiplas entradas no torneio');
    console.log('   3. Isso não é prático para grandes quantias');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

addFundsToPool();




