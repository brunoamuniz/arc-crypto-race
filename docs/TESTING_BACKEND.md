# 🧪 Guia de Testes do Backend - ARC CRYPTO RACE

## 📋 Pré-requisitos

1. ✅ Supabase configurado (ver `SUPABASE_SETUP.md`)
2. ✅ `.env` preenchido com todas as variáveis
3. ✅ Smart contract deployado (opcional para testes básicos)

## 🚀 Testando as APIs

### 1. Iniciar Servidor

```bash
cd arc-crypto-race
npm run dev
```

### 2. Testar Submit Score

```bash
# Teste básico
curl -X POST http://localhost:3000/api/submit-score \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0xCa64ddA1Cf192Ac11336DCE42367bE0099eca343",
    "dayId": 20251211,
    "score": 12345
  }'
```

**Resposta esperada:**
```json
{
  "ok": true,
  "score": {
    "id": "...",
    "wallet": "0xca64dda1cf192ac11336dce42367be0099eca343",
    "day_id": 20251211,
    "score": 12345,
    "created_at": "2025-12-11T..."
  }
}
```

### 3. Testar Leaderboard

```bash
curl http://localhost:3000/api/leaderboard?dayId=20251211
```

**Resposta esperada:**
```json
{
  "dayId": 20251211,
  "leaderboard": [
    {
      "wallet": "0xca64dda1cf192ac11336dce42367be0099eca343",
      "best_score": 12345,
      "updated_at": "2025-12-11T..."
    }
  ],
  "checkpoints": []
}
```

### 4. Testar Finalize Day (Admin)

```bash
curl -X POST http://localhost:3000/api/admin/finalize-day \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer arc-crypto-bros-admin-key-2025" \
  -d '{
    "dayId": 20251211
  }'
```

**Resposta esperada:**
```json
{
  "ok": true,
  "dayId": 20251211,
  "winners": ["0x...", "0x...", "0x..."],
  "scores": [12345, 12000, 11500],
  "commitId": "..."
}
```

## 🧪 Testes Automatizados

### Script de Teste Completo

```bash
# Criar arquivo test-backend.sh
#!/bin/bash

BASE_URL="http://localhost:3000"
WALLET="0xCa64ddA1Cf192Ac11336DCE42367bE0099eca343"
DAY_ID=$(date +%Y%m%d)
ADMIN_KEY="arc-crypto-bros-admin-key-2025"

echo "🧪 Testing Backend APIs..."
echo ""

# Test 1: Submit Score
echo "1️⃣ Testing submit-score..."
curl -X POST "$BASE_URL/api/submit-score" \
  -H "Content-Type: application/json" \
  -d "{\"wallet\":\"$WALLET\",\"dayId\":$DAY_ID,\"score\":12345}" \
  | jq '.'

echo ""
echo "2️⃣ Testing leaderboard..."
curl "$BASE_URL/api/leaderboard?dayId=$DAY_ID" | jq '.'

echo ""
echo "✅ Tests completed!"
```

## 🔍 Verificar Supabase

### Via Dashboard

1. Acesse seu projeto no Supabase
2. Vá em **Table Editor**
3. Verifique as tabelas:
   - `scores` - Deve ter o score inserido
   - `best_scores` - Deve ter o melhor score
   - `pending_commits` - Deve ter commit de checkpoint

### Via SQL

```sql
-- Ver scores
SELECT * FROM scores ORDER BY created_at DESC LIMIT 10;

-- Ver best scores
SELECT * FROM best_scores ORDER BY best_score DESC LIMIT 10;

-- Ver pending commits
SELECT * FROM pending_commits WHERE status = 'pending';
```

## 🐛 Troubleshooting

### Erro: "Supabase not configured"
- Verifique se `.env` tem `NEXT_PUBLIC_SUPABASE_URL`
- Reinicie o servidor após alterar `.env`

### Erro: "relation does not exist"
- Execute o schema SQL no Supabase
- Verifique se as tabelas foram criadas

### Erro: "Invalid wallet format"
- Wallet deve começar com `0x`
- Deve ter 42 caracteres (0x + 40 hex)

### Erro: "Unauthorized" (finalize-day)
- Verifique `ADMIN_API_KEY` no `.env`
- Use o mesmo valor no header Authorization

## ✅ Checklist de Testes

- [ ] Submit score funciona
- [ ] Leaderboard retorna dados
- [ ] Best score atualiza corretamente
- [ ] Pending commits são criados
- [ ] Finalize day funciona (admin)
- [ ] Dados aparecem no Supabase

