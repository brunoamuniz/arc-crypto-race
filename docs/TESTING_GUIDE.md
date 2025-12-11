# 🧪 Guia de Testes - ARC CRYPTO RACE

## ✅ Integração Completa

Todas as funcionalidades foram implementadas e estão prontas para teste!

## 📋 Checklist de Testes

### 1. Preparação
- [x] Contrato deployado: `0xBf8dA08341f420cD8538Af4C47909B2Ad6B7f93B`
- [x] Supabase configurado e schema executado
- [x] APIs implementadas
- [x] Frontend integrado

### 2. Testar Fluxo Completo

#### Passo 1: Iniciar Servidor
```bash
cd arc-crypto-race
npm run dev
```

#### Passo 2: Conectar Wallet
1. Acesse: http://localhost:3000
2. Clique em "Connect Wallet"
3. Conecte sua wallet MetaMask (ou outra compatível)
4. Certifique-se de estar na ARC Testnet

#### Passo 3: Entrar no Torneio
1. Vá para: http://localhost:3000/game
2. Você verá: "⚠️ You must enter the tournament to play (5 USDC)"
3. Clique em "Enter Tournament (5 USDC)"
4. Aprove a transação de aprovação de USDC
5. Aprove a transação de entrada no torneio
6. Aguarde confirmação

#### Passo 4: Jogar
1. Após entrar, você verá: "✅ You're entered in today's tournament!"
2. Clique em "START RACE"
3. Jogue por até 5 minutos
4. Use "Stop Playing" para terminar antes do tempo

#### Passo 5: Verificar Score
1. Ao finalizar, o score é enviado automaticamente
2. Verifique no console do navegador: "✅ Score submitted successfully!"
3. Vá para: http://localhost:3000/leaderboard
4. Verifique se seu score aparece no leaderboard

### 3. Testar APIs Manualmente

#### Test Submit Score
```bash
curl -X POST http://localhost:3000/api/submit-score \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0xCa64ddA1Cf192Ac11336DCE42367bE0099eca343",
    "dayId": 20251211,
    "score": 12345
  }'
```

#### Test Leaderboard
```bash
curl http://localhost:3000/api/leaderboard?dayId=20251211
```

### 4. Verificar Supabase

1. Acesse: https://supabase.com/dashboard
2. Vá em: Table Editor
3. Verifique tabelas:
   - `scores` - Deve ter os scores enviados
   - `best_scores` - Deve ter os melhores scores
   - `pending_commits` - Deve ter commits pendentes

### 5. Verificar Blockchain

1. Acesse: https://testnet.arcscan.app
2. Busque pelo contrato: `0xBf8dA08341f420cD8538Af4C47909B2Ad6B7f93B`
3. Verifique transações:
   - `enterTournament` - Entrada no torneio
   - `commitCheckpoint` - Checkpoints (via worker)
   - `finalizeDay` - Finalização (via admin)

## 🐛 Troubleshooting

### Erro: "Tournament contract not configured"
- Verifique `.env` tem `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS`
- Reinicie o servidor após alterar `.env`

### Erro: "User has not entered tournament"
- Certifique-se de ter entrado no torneio antes de jogar
- Verifique se a transação foi confirmada

### Erro: "USDC transfer failed"
- Certifique-se de ter USDC suficiente na wallet
- Verifique se aprovou USDC para o contrato

### Leaderboard não atualiza
- Verifique se o score foi enviado (console do navegador)
- Verifique Supabase (tabela `best_scores`)
- Recarregue a página do leaderboard

## ✅ Próximos Passos

Após testes bem-sucedidos:
1. Deploy em produção (Vercel, etc.)
2. Configurar worker/cron para processar commits
3. Configurar finalização automática diária
4. Monitorar logs e métricas

