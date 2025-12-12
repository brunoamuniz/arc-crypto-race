# 📋 Plano de Melhorias do Contrato - ARC CRYPTO RACE

## 🎯 Objetivos

1. **Adicionar função para owner depositar fundos no prize pool**
2. **Investigar e corrigir problema de distribuição de prêmios**

---

## 🔍 Análise do Problema Atual

### Status do Dia Anterior (2025-12-11) - VERIFICADO
- **Pool**: 35 USDC (7 entradas)
- **Status**: `finalized: false`
- **Prêmios**: NÃO distribuídos
- **Ganhadores**: Não definidos (endereços zero)
- **Commits de Finalização**: ❌ NENHUM encontrado
- **Logs de Finalização**: ❌ NENHUM encontrado
- **Checkpoints Pendentes**: 27 (mas não são de finalização)

### 🔴 Problema Identificado
**A API `/api/admin/finalize-day` NUNCA foi chamada para o dia 20251211!**

Isso significa:
1. O admin não finalizou o dia via API
2. Sem commit de finalização, o worker não tem nada para processar
3. Sem worker processando, o contrato nunca recebe a chamada `finalizeDay()`
4. Sem `finalizeDay()` sendo chamado, os prêmios nunca são distribuídos

### Como Funciona a Distribuição Atual

#### Fluxo Completo:
```
1. Admin chama API: POST /api/admin/finalize-day
   ↓
2. API cria registro em `pending_commits` (status: 'pending')
   ↓
3. Worker (scripts/worker.ts) processa commits pendentes
   ↓
4. Worker chama finalizeDay() no contrato
   ↓
5. Contrato distribui prêmios automaticamente na blockchain
```

#### Problema Identificado:
- O **worker precisa estar rodando** para processar os commits pendentes
- Se o worker não estiver ativo, os prêmios nunca serão distribuídos
- O contrato só distribui quando `finalizeDay()` é chamado

### Quem Deve Distribuir os Prêmios?

**Resposta**: O processo é **híbrido** em 3 etapas:

1. **Admin/Backend (API)**: 
   - Chama `POST /api/admin/finalize-day`
   - Identifica os top 3 ganhadores do Supabase
   - Cria registro em `pending_commits` (status: 'pending')
   - **Status atual**: ❌ NUNCA foi chamado para dia 20251211

2. **Worker (Backend Script)**:
   - Roda `scripts/worker.ts` (pode ser cron job ou manual)
   - Busca commits pendentes no Supabase
   - Chama `finalizeDay()` no contrato via blockchain
   - **Status atual**: ⚠️ Não está rodando (ou não há commits para processar)

3. **Blockchain (Smart Contract)**:
   - Recebe chamada `finalizeDay()` do worker
   - Calcula prêmios (60%/25%/15%)
   - Transfere USDC automaticamente para ganhadores
   - Marca dia como finalizado
   - **Status atual**: ⏳ Aguardando chamada do worker

**Problema Identificado**: 
- ❌ Etapa 1 nunca aconteceu (API não foi chamada)
- ⚠️ Etapa 2 não pode acontecer sem etapa 1
- ⏳ Etapa 3 não pode acontecer sem etapa 2

---

## 📝 Plano de Implementação

### 1. Adicionar Função `addFundsToPool`

#### 1.1 Modificação do Contrato

**Arquivo**: `contracts/src/Tournament.sol`

**Nova Função**:
```solidity
/**
 * @dev Add funds to a day's prize pool (owner only)
 * @param dayId The day identifier
 * @param amount Amount of USDC to add (in 6 decimals)
 */
function addFundsToPool(uint256 dayId, uint256 amount) external onlyOwner {
    require(amount > 0, "Amount must be greater than zero");
    require(!dayInfo[dayId].finalized, "Day already finalized");
    
    // Transfer USDC from owner to contract
    require(
        usdc.transferFrom(owner(), address(this), amount),
        "USDC transfer failed"
    );
    
    // Add to pool
    dayInfo[dayId].totalPool += amount;
    
    emit FundsAdded(dayId, amount, dayInfo[dayId].totalPool);
}
```

**Novo Event**:
```solidity
event FundsAdded(uint256 indexed dayId, uint256 amount, uint256 newTotalPool);
```

#### 1.2 Atualizar ABI no Frontend

**Arquivo**: `lib/contract.ts`

Adicionar ao `TOURNAMENT_ABI`:
```typescript
{
  inputs: [
    { name: 'dayId', type: 'uint256' },
    { name: 'amount', type: 'uint256' }
  ],
  name: 'addFundsToPool',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}
```

#### 1.3 Criar Função Helper

**Arquivo**: `lib/contract.ts`

```typescript
export async function addFundsToPool(
  dayId: number,
  amount: number // Amount in USDC (will be converted to 6 decimals)
): Promise<string | null> {
  if (!walletClient || !walletAccount || !TOURNAMENT_CONTRACT_ADDRESS) {
    throw new Error('Wallet client or contract address not configured');
  }

  try {
    const amountInWei = parseUnits(amount.toString(), 6); // USDC has 6 decimals
    
    const hash = await walletClient.writeContract({
      account: walletAccount,
      chain: arcTestnet,
      address: TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`,
      abi: TOURNAMENT_ABI,
      functionName: 'addFundsToPool',
      args: [BigInt(dayId), amountInWei],
    });

    return hash;
  } catch (error) {
    console.error('Error adding funds to pool:', error);
    throw error;
  }
}
```

#### 1.4 Criar API Endpoint (Opcional)

**Arquivo**: `app/api/admin/add-funds/route.ts`

Para facilitar a adição de fundos via API (com autenticação).

---

### 2. Investigar e Corrigir Distribuição de Prêmios

#### 2.1 Verificar Status Atual

**Verificações Necessárias**:
1. ✅ Verificar se há commits pendentes no Supabase
2. ✅ Verificar se o worker está rodando
3. ✅ Verificar se há erros nos logs do worker
4. ✅ Verificar se o contrato tem USDC suficiente

#### 2.2 Soluções Propostas

##### Opção A: Melhorar o Worker (Recomendado)
- Tornar o worker mais robusto
- Adicionar retry logic
- Melhorar logging
- Adicionar alertas/notificações

##### Opção B: Automatizar com Cron Job
- Configurar cron job para rodar o worker automaticamente
- Vercel Cron Jobs ou similar
- Executar a cada hora ou quando necessário

##### Opção C: Processar Manualmente
- Criar script para processar commits pendentes manualmente
- Útil para casos de emergência

#### 2.3 Criar Script de Verificação

**Arquivo**: `scripts/check-pending-commits.ts`

Verificar:
- Commits pendentes no Supabase
- Status de cada commit
- Erros que impediram o processamento
- Sugerir ações corretivas

#### 2.4 Criar Script de Processamento Manual

**Arquivo**: `scripts/process-pending-commits.ts`

Permitir processar commits pendentes manualmente:
```bash
npm run process-commits
```

---

## 🛠️ Ordem de Implementação

### Fase 1: Investigação (Primeiro)
1. ✅ Criar script para verificar commits pendentes
2. ✅ Verificar status do worker
3. ✅ Identificar por que o dia anterior não foi finalizado

### Fase 2: Adicionar Função de Depósito
1. Modificar contrato `Tournament.sol`
2. Adicionar função `addFundsToPool`
3. Adicionar evento `FundsAdded`
4. Atualizar ABI no frontend
5. Criar função helper em `lib/contract.ts`
6. Testar localmente
7. Deploy do novo contrato
8. Atualizar endereço no `.env`

### Fase 3: Melhorar Processo de Distribuição
1. Melhorar worker com retry logic
2. Adicionar melhor logging
3. Criar script de processamento manual
4. Configurar cron job (se necessário)
5. Processar dia anterior pendente

---

## ⚠️ Considerações Importantes

### Deploy de Novo Contrato
- **IMPORTANTE**: Adicionar função ao contrato requer novo deploy
- O contrato atual não pode ser modificado
- Todos os dados do contrato antigo serão perdidos
- **Solução**: Manter contrato antigo para histórico, criar novo para produção

### Migração de Dados
- Pool do dia anterior (35 USDC) está no contrato antigo
- Precisa decidir: transferir fundos ou deixar no antigo?

### Worker
- Worker precisa estar rodando para processar commits
- Se não estiver rodando, prêmios nunca serão distribuídos
- Recomendação: Automatizar com cron job

---

## 📊 Checklist de Implementação

### Função addFundsToPool
- [ ] Modificar `Tournament.sol`
- [ ] Adicionar evento `FundsAdded`
- [ ] Compilar contrato
- [ ] Testar localmente
- [ ] Deploy em testnet
- [ ] Atualizar ABI no frontend
- [ ] Criar função helper
- [ ] Criar script de teste
- [ ] Documentar uso

### Investigação de Distribuição
- [ ] Criar script de verificação
- [ ] Verificar commits pendentes
- [ ] Verificar status do worker
- [ ] Identificar problema
- [ ] Processar dia anterior pendente
- [ ] Melhorar worker
- [ ] Configurar automação

---

## 🔐 Segurança

### Função addFundsToPool
- ✅ Apenas owner pode chamar (`onlyOwner`)
- ✅ Verifica se dia não foi finalizado
- ✅ Valida amount > 0
- ✅ Usa `transferFrom` para garantir aprovação prévia

### Distribuição de Prêmios
- ✅ Apenas owner pode finalizar (`onlyOwner`)
- ✅ Valida ganhadores (não zero addresses)
- ✅ Distribuição automática na blockchain
- ⚠️ Requer worker rodando para processar

---

## 📝 Próximos Passos

1. **Agora**: Criar script para verificar commits pendentes
2. **Depois**: Implementar função `addFundsToPool` no contrato
3. **Depois**: Melhorar worker e automação
4. **Final**: Processar dia anterior pendente

---

## ❓ Perguntas para Decisão

1. **Contrato**: Criar novo contrato ou manter o atual?
   - Recomendação: Criar novo para produção, manter antigo para histórico

2. **Pool do dia anterior**: O que fazer com os 35 USDC?
   - Opção A: Deixar no contrato antigo
   - Opção B: Transferir para novo contrato (se criar)
   - Opção C: Distribuir manualmente

3. **Worker**: Como automatizar?
   - Opção A: Vercel Cron Jobs
   - Opção B: Servidor dedicado
   - Opção C: Processamento manual quando necessário

4. **Dia anterior**: Processar agora ou deixar como está?
   - Recomendação: Processar para manter integridade
