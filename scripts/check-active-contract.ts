/**
 * Script para verificar qual contrato está sendo usado
 * 
 * Uso:
 *   npx tsx scripts/check-active-contract.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env files
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const contract = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '';
const devContract = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS_DEV || '';
const useDev = process.env.NEXT_PUBLIC_USE_DEV_CONTRACT === 'true';
const nodeEnv = process.env.NODE_ENV || 'development';

console.log('\n📋 Active Contract Configuration:\n');
console.log('   Environment:', nodeEnv);
console.log('   Use Dev Contract:', useDev ? '✅ YES' : '❌ NO');
console.log('\n   Production Contract:');
console.log('      Address:', contract || '❌ NOT SET');
console.log('\n   Dev Contract:');
console.log('      Address:', devContract || '❌ NOT SET');
console.log('\n   🎯 Active Contract:');
const activeContract = useDev ? devContract : contract;
if (activeContract) {
  console.log('      Address:', activeContract);
  console.log('      Type:', useDev ? '🧪 TEST/DEV' : '🚀 PRODUCTION');
  console.log('      Block Explorer:', `https://testnet.arcscan.app/address/${activeContract}`);
} else {
  console.log('      ❌ NO CONTRACT CONFIGURED');
  console.log('\n   ⚠️  Configure NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS in .env');
}
console.log('\n');
