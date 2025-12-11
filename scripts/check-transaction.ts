/**
 * Script para verificar detalhes de uma transação específica
 */

import 'dotenv/config';
import { createPublicClient, http, decodeFunctionData, formatUnits } from 'viem';
import { arcTestnet } from '../lib/arcChain';

// Get transaction hash from environment variable or command line argument
const TX_HASH = process.env.TX_HASH || process.argv[2] || '';

const TOURNAMENT_ABI = [
  {
    inputs: [{ name: 'dayId', type: 'uint256' }],
    name: 'enterTournament',
    outputs: [],
    stateMutability: 'nonpayable',
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
] as const;

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
});

async function checkTransaction() {
  if (!TX_HASH || TX_HASH === '') {
    console.error('❌ Erro: TX_HASH não fornecido');
    console.log('');
    console.log('💡 Uso:');
    console.log('   TX_HASH=0x... npm run check-transaction');
    console.log('   ou');
    console.log('   npx tsx scripts/check-transaction.ts 0x...');
    console.log('');
    process.exit(1);
  }

  console.log('🔍 Verificando transação...\n');
  console.log('Hash:', TX_HASH);
  console.log('ArcScan:', `https://testnet.arcscan.app/tx/${TX_HASH}`);
  console.log('');

  try {
    // Obter detalhes da transação
    const tx = await publicClient.getTransaction({ hash: TX_HASH as `0x${string}` });
    
    console.log('📋 DETALHES DA TRANSAÇÃO:');
    console.log('   From:', tx.from);
    console.log('   To:', tx.to);
    console.log('   Value:', formatUnits(tx.value, 18), 'ETH');
    console.log('   Status:', 'Pendente (verificar no explorer)');
    console.log('');

    // Tentar decodificar os dados da transação
    if (tx.input && tx.input !== '0x') {
      console.log('📦 DADOS DA TRANSAÇÃO:');
      console.log('   Input Data:', tx.input.substring(0, 100) + '...');
      console.log('');

      // Tentar decodificar como approve do USDC
      try {
        const decodedApprove = decodeFunctionData({
          abi: USDC_ABI,
          data: tx.input,
        });
        console.log('✅ DECODIFICADO COMO: USDC approve');
        console.log('   Function:', decodedApprove.functionName);
        console.log('   Spender:', decodedApprove.args[0]);
        console.log('   Amount:', decodedApprove.args[1]?.toString());
        console.log('   Amount (USDC):', formatUnits(decodedApprove.args[1] as bigint, 6), 'USDC');
        console.log('');
      } catch (e) {
        // Não é approve, tentar enterTournament
        try {
          const decodedEnter = decodeFunctionData({
            abi: TOURNAMENT_ABI,
            data: tx.input,
          });
          console.log('✅ DECODIFICADO COMO: Tournament enterTournament');
          console.log('   Function:', decodedEnter.functionName);
          console.log('   DayId:', decodedEnter.args[0]?.toString());
          console.log('');
        } catch (e2) {
          console.log('⚠️  Não foi possível decodificar os dados da transação');
          console.log('   Pode ser uma transação de transferência simples ou outro tipo');
        }
      }
    }

    // Verificar receipt (se confirmada)
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: TX_HASH as `0x${string}` });
      console.log('✅ TRANSAÇÃO CONFIRMADA:');
      console.log('   Status:', receipt.status === 'success' ? '✅ Sucesso' : '❌ Falhou');
      console.log('   Block Number:', receipt.blockNumber.toString());
      console.log('   Gas Used:', receipt.gasUsed.toString());
      console.log('');

      if (receipt.logs && receipt.logs.length > 0) {
        console.log('📝 LOGS DA TRANSAÇÃO:');
        receipt.logs.forEach((log, index) => {
          console.log(`   Log ${index + 1}:`);
          console.log(`     Address: ${log.address}`);
          console.log(`     Topics: ${log.topics.length}`);
        });
        console.log('');
      }
    } catch (e) {
      console.log('⚠️  Transação ainda não confirmada ou não encontrada');
      console.log('   Verifique no ArcScan se a transação foi incluída em um bloco');
      console.log('');
    }

    // Verificar se é para o contrato Tournament
    const TOURNAMENT_CONTRACT = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS;
    if (TOURNAMENT_CONTRACT && tx.to?.toLowerCase() === TOURNAMENT_CONTRACT.toLowerCase()) {
      console.log('🎯 TRANSAÇÃO PARA CONTRATO TOURNAMENT:');
      console.log('   Contrato:', TOURNAMENT_CONTRACT);
      console.log('   Verifique se a função enterTournament foi chamada corretamente');
      console.log('');
    }

    // Verificar se é para o contrato USDC
    const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000';
    if (tx.to?.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
      console.log('💰 TRANSAÇÃO PARA CONTRATO USDC:');
      console.log('   Contrato:', USDC_ADDRESS);
      console.log('   Provavelmente uma transação de approve');
      console.log('');
    }

  } catch (error: any) {
    console.error('❌ Erro ao verificar transação:', error.message);
    console.log('');
    console.log('💡 Tente verificar manualmente no ArcScan:');
    console.log(`   https://testnet.arcscan.app/tx/${TX_HASH}`);
  }
}

checkTransaction();

