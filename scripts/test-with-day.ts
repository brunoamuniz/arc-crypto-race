/**
 * Script helper para testar com um dayId específico
 * 
 * Uso:
 *   NEXT_PUBLIC_TEST_DAY_ID=20251213 npm run dev
 * 
 * Ou para verificar qual dia usar:
 *   npx tsx scripts/test-with-day.ts
 */

import { getCurrentDayId, parseDayId } from '../lib/dayId';

function getTomorrowDayId(): number {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  
  const year = tomorrow.getUTCFullYear();
  const month = String(tomorrow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getUTCDate()).padStart(2, '0');
  
  return parseInt(`${year}${month}${day}`, 10);
}

console.log('📅 Day IDs para Teste:\n');
console.log('Hoje:', getCurrentDayId(), '-', parseDayId(getCurrentDayId()).toISOString().split('T')[0]);
console.log('Amanhã:', getTomorrowDayId(), '-', parseDayId(getTomorrowDayId()).toISOString().split('T')[0]);
console.log('');
console.log('💡 Para testar com um dayId específico:');
console.log('');
console.log('1. Verifique qual dia está aberto:');
console.log('   npx tsx scripts/check-day-status.ts 20251213');
console.log('');
console.log('2. Configure a variável de ambiente e inicie o servidor:');
console.log('   NEXT_PUBLIC_TEST_DAY_ID=20251213 npm run dev');
console.log('');
console.log('3. Ou exporte antes de iniciar:');
console.log('   export NEXT_PUBLIC_TEST_DAY_ID=20251213');
console.log('   npm run dev');
console.log('');
console.log('⚠️  Lembre-se de remover a variável depois dos testes!');
