# 🔄 Fluxo de Distribuição de Prêmios - ARC CRYPTO RACE

## 📊 Diagrama do Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ADMIN CHAMA API                                          │
│    POST /api/admin/finalize-day                            │
│    Headers: Authorization: Bearer {ADMIN_API_KEY}           │
│    Body: { dayId: 20251211 }                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. API PROCESSA                                             │
│    - Busca top 3 scores do Supabase                         │
│    - Cria registro em pending_commits                     │
│    - Status: 'pending'                                      │
│    - Payload: { winners: [...], scores: [...] }            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. WORKER PROCESSA (scripts/worker.ts)                     │
│    - Busca commits com status 'pending'                    │
│    - Chama finalizeDay() no contrato                        │
│    - Atualiza status para 'done'                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CONTRATO DISTRIBUI (Tournament.sol)                     │
│    - Calcula prêmios (60%/25%/15%)                          │
│    - Transfere USDC para ganhadores                         │
│    - Transfere site fee (10%) para owner                     │
│    - Marca dia como finalized                               │
└─────────────────────────────────────────────────────────────┘
```

## ⚠️ Problema Atual (Dia 20251211)

### O que aconteceu:
1. ❌ **Etapa 1 nunca aconteceu**: API nunca foi chamada
2. ⚠️ **Etapa 2 não pode acontecer**: Sem commit pendente
3. ⏳ **Etapa 3 não pode acontecer**: Sem chamada do worker

### Resultado:
- Pool de 35 USDC ainda no contrato
- Dia não finalizado
- Prêmios não distribuídos

## ✅ Solução Imediata

### Opção 1: Finalizar Manualmente Agora
```bash
# 1. Chamar API para criar commit
curl -X POST http://localhost:3000/api/admin/finalize-day \
  -H "Authorization: Bearer ${ADMIN_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"dayId": 20251211}'

# 2. Rodar worker para processar
npm run worker
```

### Opção 2: Verificar se há ganhadores suficientes
- Precisa de pelo menos 3 jogadores com scores
- Verificar no Supabase: `best_scores` para day_id = 20251211

## 🔧 Melhorias Necessárias

### 1. Automatizar Finalização
- Criar cron job para chamar API automaticamente à meia-noite UTC
- Ou melhorar worker para detectar dias que precisam ser finalizados

### 2. Melhorar Worker
- Adicionar retry logic
- Melhorar logging
- Adicionar alertas quando commits falham

### 3. Adicionar Monitoramento
- Dashboard para ver status de finalizações
- Alertas quando dias não são finalizados
- Verificação automática de prêmios não distribuídos
