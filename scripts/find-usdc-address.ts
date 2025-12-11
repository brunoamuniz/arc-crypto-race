/**
 * Script para encontrar o endereço USDC correto no ARC Testnet
 * Busca por transações USDC recentes no explorer
 */

import { createPublicClient, http } from 'viem';
import { arcTestnet } from '../lib/arcChain';

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
});

// ABI mínimo para verificar se é USDC
const ERC20_ABI = [
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
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
] as const;

// Endereços conhecidos para testar
const KNOWN_ADDRESSES = [
  '0x3600000000000000000000000000000000000000', // Endereço oficial (from docs.arc.network)
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Endereço antigo (incorreto)
];

async function checkAddress(address: string): Promise<boolean> {
  try {
    // Verificar se tem código
    const code = await publicClient.getBytecode({ address: address as `0x${string}` });
    if (!code || code === '0x') {
      return false;
    }

    // Verificar symbol
    try {
      const symbol = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
      });
      
      const decimals = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      });

      if (symbol === 'USDC' && decimals === 6) {
        console.log('✅ ENCONTRADO!');
        console.log('   Address:', address);
        console.log('   Symbol:', symbol);
        console.log('   Decimals:', decimals);
        return true;
      }
    } catch (error) {
      // Não é um contrato ERC20 válido
      return false;
    }

    return false;
  } catch (error) {
    return false;
  }
}

async function findUSDCAddress() {
  console.log('🔍 Buscando endereço USDC no ARC Testnet...\n');
  console.log('⚠️  NOTA: No ARC Testnet, USDC pode ser o token nativo.');
  console.log('   Se for token nativo, não há contrato ERC20 separado.\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Testar endereços conhecidos
  console.log('Testando endereços conhecidos...\n');
  for (const addr of KNOWN_ADDRESSES) {
    if (addr === '0x0000000000000000000000000000000000000000') continue;
    
    console.log(`Testando: ${addr}`);
    const isValid = await checkAddress(addr);
    if (isValid) {
      console.log('\n✅ USDC encontrado neste endereço!');
      return;
    }
    console.log('   ❌ Não é USDC válido\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('❌ Não foi possível encontrar o endereço USDC automaticamente.\n');
  console.log('💡 PRÓXIMOS PASSOS:\n');
  console.log('   1. Acesse: https://testnet.arcscan.app');
  console.log('   2. Procure por transações USDC recentes');
  console.log('   3. Verifique o endereço do contrato usado');
  console.log('   4. Ou consulte: https://docs.arc.network\n');
  console.log('💡 ALTERNATIVA: Se USDC é token nativo no ARC:');
  console.log('   - Não precisamos de contrato ERC20');
  console.log('   - Podemos enviar USDC diretamente como valor da transação');
  console.log('   - O contrato Tournament precisaria ser modificado\n');
}

findUSDCAddress().catch(console.error);

