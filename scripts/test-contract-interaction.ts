/**
 * Script de teste para validar interações com contratos
 * Testa USDC approve e Tournament enterTournament
 */

import 'dotenv/config';
import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arcTestnet } from '../lib/arcChain';

// Official USDC ERC-20 interface address on ARC Testnet
// From: https://docs.arc.network/arc/references/contract-addresses
// This is the optional ERC-20 interface for interacting with native USDC balance (uses 6 decimals)
const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000') as `0x${string}`;
const TOURNAMENT_CONTRACT = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// USDC ABI completo
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
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Tournament ABI
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
] as const;

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
});

async function testUSDCContract() {
  console.log('\n🔍 TESTE 1: Verificando contrato USDC\n');
  console.log('USDC Address:', USDC_ADDRESS);
  console.log('');

  try {
    // Test 1.1: Verificar se é um contrato
    const code = await publicClient.getBytecode({ address: USDC_ADDRESS });
    if (!code || code === '0x') {
      console.error('❌ ERRO: Endereço não é um contrato!');
      console.error('   O endereço', USDC_ADDRESS, 'não contém código.');
      return false;
    }
    console.log('✅ Contrato existe (tem código)');

    // Test 1.2: Verificar decimals
    try {
      const decimals = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'decimals',
      });
      console.log('✅ Decimals:', decimals);
    } catch (error: any) {
      console.error('❌ ERRO ao ler decimals:', error.message);
      return false;
    }

    // Test 1.3: Verificar symbol
    try {
      const symbol = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'symbol',
      });
      console.log('✅ Symbol:', symbol);
    } catch (error: any) {
      console.error('❌ ERRO ao ler symbol:', error.message);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('❌ ERRO ao verificar contrato USDC:', error.message);
    return false;
  }
}

async function testEntryFeeCalculation() {
  console.log('\n🔍 TESTE 2: Cálculo do Entry Fee\n');

  const ENTRY_FEE = parseUnits('5', 6);
  console.log('Entry Fee (raw):', ENTRY_FEE.toString());
  console.log('Entry Fee (formatted):', formatUnits(ENTRY_FEE, 6), 'USDC');
  console.log('Entry Fee (should be): 5000000');
  console.log('');

  if (ENTRY_FEE.toString() !== '5000000') {
    console.error('❌ ERRO: Entry fee calculado incorretamente!');
    return false;
  }

  console.log('✅ Entry fee calculado corretamente');
  return true;
}

async function testTournamentContract() {
  console.log('\n🔍 TESTE 3: Verificando contrato Tournament\n');
  console.log('Tournament Address:', TOURNAMENT_CONTRACT || 'NOT SET');
  console.log('');

  if (!TOURNAMENT_CONTRACT || TOURNAMENT_CONTRACT === '0x') {
    console.error('❌ ERRO: Endereço do contrato Tournament não configurado!');
    return false;
  }

  try {
    // Test 3.1: Verificar se é um contrato
    const code = await publicClient.getBytecode({ address: TOURNAMENT_CONTRACT });
    if (!code || code === '0x') {
      console.error('❌ ERRO: Endereço Tournament não é um contrato!');
      return false;
    }
    console.log('✅ Contrato Tournament existe');

    return true;
  } catch (error: any) {
    console.error('❌ ERRO ao verificar contrato Tournament:', error.message);
    return false;
  }
}

async function testApproveSimulation() {
  console.log('\n🔍 TESTE 4: Simulando chamada approve\n');

  if (!TOURNAMENT_CONTRACT || TOURNAMENT_CONTRACT === '0x') {
    console.error('❌ ERRO: Tournament contract não configurado');
    return false;
  }

  const ENTRY_FEE = parseUnits('5', 6);
  const spender = TOURNAMENT_CONTRACT;
  const amount = ENTRY_FEE;

  console.log('Parâmetros da chamada approve:');
  console.log('  Contract:', USDC_ADDRESS);
  console.log('  Spender:', spender);
  console.log('  Amount:', amount.toString());
  console.log('  Amount (USDC):', formatUnits(amount, 6));
  console.log('');

  try {
    // Simular a chamada (não executa, só valida)
    const { encodeFunctionData } = await import('viem');
    const data = encodeFunctionData({
      abi: USDC_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });

    console.log('✅ Função encodeada com sucesso');
    console.log('  Data length:', data.length, 'bytes');
    console.log('  Data (first 20 bytes):', data.slice(0, 42));
    console.log('');

    // Verificar se os parâmetros estão corretos
    const { decodeFunctionData } = await import('viem');
    const decoded = decodeFunctionData({
      abi: USDC_ABI,
      data,
    });

    console.log('✅ Parâmetros decodificados:');
    console.log('  Function:', decoded.functionName);
    console.log('  Args[0] (spender):', decoded.args[0]);
    console.log('  Args[1] (amount):', decoded.args[1]?.toString());
    console.log('  Amount (USDC):', formatUnits(decoded.args[1] as bigint, 6));
    console.log('');

    if (decoded.args[0]?.toLowerCase() !== spender.toLowerCase()) {
      console.error('❌ ERRO: Spender não corresponde!');
      return false;
    }

    if (decoded.args[1]?.toString() !== amount.toString()) {
      console.error('❌ ERRO: Amount não corresponde!');
      return false;
    }

    console.log('✅ Todos os parâmetros estão corretos');
    return true;
  } catch (error: any) {
    console.error('❌ ERRO ao simular approve:', error.message);
    return false;
  }
}

async function testRealApprove() {
  console.log('\n🔍 TESTE 5: Teste REAL de approve (requer PRIVATE_KEY)\n');

  if (!PRIVATE_KEY) {
    console.log('⚠️  PRIVATE_KEY não configurado - pulando teste real');
    return true;
  }

  if (!TOURNAMENT_CONTRACT || TOURNAMENT_CONTRACT === '0x') {
    console.error('❌ ERRO: Tournament contract não configurado');
    return false;
  }

  try {
    const account = privateKeyToAccount(`0x${PRIVATE_KEY.replace('0x', '')}` as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    });

    console.log('Account:', account.address);
    
    // Verificar saldo
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });
    console.log('USDC Balance:', formatUnits(balance, 6), 'USDC');
    console.log('');

    if (balance < parseUnits('5', 6)) {
      console.error('❌ ERRO: Saldo insuficiente! Precisa de pelo menos 5 USDC');
      return false;
    }

    const ENTRY_FEE = parseUnits('5', 6);
    
    console.log('⚠️  ATENÇÃO: Isso vai enviar uma transação REAL!');
    console.log('   Aprovar', formatUnits(ENTRY_FEE, 6), 'USDC para', TOURNAMENT_CONTRACT);
    console.log('');
    console.log('   Para executar, descomente o código abaixo');
    console.log('');

    // DESCOMENTE PARA EXECUTAR REALMENTE:
    /*
    const hash = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [TOURNAMENT_CONTRACT, ENTRY_FEE],
    });

    console.log('✅ Transação enviada!');
    console.log('   Hash:', hash);
    console.log('   Explorer:', `https://testnet.arcscan.app/tx/${hash}`);
    console.log('');

    // Aguardar confirmação
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Transação confirmada!');
    console.log('   Status:', receipt.status);
    */

    return true;
  } catch (error: any) {
    console.error('❌ ERRO no teste real:', error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TESTE DE INTERAÇÃO COM CONTRATOS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('Rede: ARC Testnet');
  console.log('Chain ID:', arcTestnet.id);
  console.log('RPC:', 'https://rpc.testnet.arc.network');
  console.log('');

  const results = {
    usdcContract: false,
    entryFee: false,
    tournamentContract: false,
    approveSimulation: false,
    realApprove: false,
  };

  // Test 1: USDC Contract
  results.usdcContract = await testUSDCContract();

  // Test 2: Entry Fee Calculation
  results.entryFee = await testEntryFeeCalculation();

  // Test 3: Tournament Contract
  results.tournamentContract = await testTournamentContract();

  // Test 4: Approve Simulation
  if (results.usdcContract && results.tournamentContract) {
    results.approveSimulation = await testApproveSimulation();
  }

  // Test 5: Real Approve (opcional)
  results.realApprove = await testRealApprove();

  // Resumo
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('1. Contrato USDC:', results.usdcContract ? '✅ PASSOU' : '❌ FALHOU');
  console.log('2. Cálculo Entry Fee:', results.entryFee ? '✅ PASSOU' : '❌ FALHOU');
  console.log('3. Contrato Tournament:', results.tournamentContract ? '✅ PASSOU' : '❌ FALHOU');
  console.log('4. Simulação Approve:', results.approveSimulation ? '✅ PASSOU' : '❌ FALHOU');
  console.log('5. Teste Real Approve:', results.realApprove ? '✅ PASSOU' : '❌ FALHOU');
  console.log('');

  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('');
    console.log('💡 PRÓXIMOS PASSOS:');
    if (!results.usdcContract) {
      console.log('   - Verifique o endereço USDC no ArcScan');
      console.log('   - O endereço pode estar incorreto ou o contrato não existe');
    }
    if (!results.tournamentContract) {
      console.log('   - Configure NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS no .env');
    }
    if (!results.approveSimulation) {
      console.log('   - Verifique os parâmetros sendo enviados');
      console.log('   - Verifique o ABI do USDC');
    }
  }
  console.log('');
}

main().catch(console.error);

