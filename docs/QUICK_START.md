# 🚀 Quick Start - Backend Testing

## ✅ Status Atual

### Configurado e Funcionando:
- ✅ Supabase conectado
- ✅ ARC Testnet configurado
- ✅ APIs implementadas
- ✅ Build passando

### ⏳ Próximo Passo (VOCÊ PRECISA FAZER):

**Executar Schema SQL no Supabase**

## 📝 Passo a Passo Rápido

### 1. Executar Schema SQL

1. Acesse: **https://supabase.com/dashboard**
2. Selecione seu projeto
3. Clique em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Abra o arquivo: `docs/SUPABASE_SCHEMA.sql`
6. **Copie TODO o conteúdo** e cole no editor
7. Clique em **Run** (ou Ctrl+Enter)

### 2. Verificar Tabelas

Após executar o SQL, vá em **Table Editor** e verifique se aparecem:
- ✅ scores
- ✅ best_scores
- ✅ pending_commits
- ✅ commit_logs

### 3. Testar Backend

```bash
# Testar conexão
npx tsx scripts/test-supabase-simple.ts

# Iniciar servidor
npm run dev

# Em outro terminal, testar APIs
npm run test:backend
```

## 🧪 Testar Manualmente

### Test Submit Score
```bash
curl -X POST http://localhost:3000/api/submit-score \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0xCa64ddA1Cf192Ac11336DCE42367bE0099eca343",
    "dayId": 20251211,
    "score": 12345
  }'
```

### Test Leaderboard
```bash
curl http://localhost:3000/api/leaderboard?dayId=20251211
```

## ✅ Checklist

- [x] Supabase configurado
- [x] Credenciais no `.env`
- [ ] **Schema SQL executado** ← FAÇA ISSO AGORA
- [ ] Tabelas verificadas
- [ ] Testes executados

## 🎯 Depois do Schema

Após executar o schema, você poderá:
1. ✅ Testar todas as APIs
2. ✅ Ver dados no Supabase
3. ✅ Deploy smart contract
4. ✅ Integrar frontend

