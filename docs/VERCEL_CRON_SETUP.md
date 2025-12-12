# ⏰ Configuração do Vercel Cron Jobs

## 📋 Visão Geral

Configuramos dois cron jobs no Vercel para automatizar o processo de finalização e distribuição de prêmios:

1. **Worker** (`/api/cron/worker`) - Executa a cada 10 minutos
2. **Finalize Day** (`/api/cron/finalize-day`) - Executa à meia-noite UTC todos os dias

---

## 🔄 Fluxo Automatizado

```
00:00 UTC (Meia-noite)
  ↓
/api/cron/finalize-day
  ↓
Cria commit de finalização para o dia anterior
  ↓
A cada 10 minutos
  ↓
/api/cron/worker
  ↓
Processa commits pendentes
  ↓
Chama contrato para distribuir prêmios
```

---

## 📁 Arquivos Criados

### 1. `vercel.json`
Configuração dos cron jobs:
```json
{
  "crons": [
    {
      "path": "/api/cron/worker",
      "schedule": "*/10 * * * *"
    },
    {
      "path": "/api/cron/finalize-day",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 2. `app/api/cron/worker/route.ts`
Endpoint que executa o worker para processar commits pendentes.

### 3. `app/api/cron/finalize-day/route.ts`
Endpoint que automaticamente finaliza o dia anterior à meia-noite UTC.

---

## ⚙️ Configuração no Vercel

### Passo 1: Deploy
O arquivo `vercel.json` já está configurado. Após o deploy, os cron jobs serão automaticamente criados.

### Passo 2: Verificar Cron Jobs
1. Acesse o dashboard do Vercel
2. Vá em **Settings** → **Cron Jobs**
3. Você deve ver dois cron jobs:
   - `worker` - Executa a cada 10 minutos
   - `finalize-day` - Executa à meia-noite UTC

### Passo 3: Variáveis de Ambiente
Certifique-se de que as seguintes variáveis estão configuradas no Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PRIVATE_KEY`
- `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_ARC_TESTNET_RPC_URL`
- `USDC_ADDRESS`
- `CRON_SECRET` (opcional, para segurança adicional)

---

## 🔐 Segurança

### CRON_SECRET (Opcional)
Se você definir `CRON_SECRET` nas variáveis de ambiente, os endpoints verificarão este secret. No entanto, o Vercel automaticamente adiciona headers de segurança (`x-vercel-signature`), então isso é opcional.

### Recomendação
- Deixe `CRON_SECRET` vazio ou não defina (Vercel já protege automaticamente)
- Ou defina um secret forte se quiser camada extra de segurança

---

## 📊 Monitoramento

### Logs do Vercel
1. Acesse o dashboard do Vercel
2. Vá em **Deployments** → Selecione o deployment
3. Vá em **Functions** → Veja os logs dos cron jobs

### Verificar Execuções
- Os cron jobs aparecem como funções serverless no Vercel
- Cada execução gera logs que podem ser visualizados
- Erros aparecem nos logs com prefixo `❌`

---

## 🧪 Testar Localmente

### Testar Worker
```bash
curl http://localhost:3000/api/cron/worker
```

### Testar Finalize Day
```bash
curl http://localhost:3000/api/cron/finalize-day
```

**Nota**: Localmente, os cron jobs não executam automaticamente. Você precisa chamar os endpoints manualmente ou usar uma ferramenta como `cron` do sistema.

---

## ⏰ Horários

### Worker
- **Frequência**: A cada 10 minutos
- **Schedule**: `*/10 * * * *`
- **Função**: Processa commits pendentes (checkpoints e finalizações)

### Finalize Day
- **Frequência**: Uma vez por dia
- **Schedule**: `0 0 * * *` (meia-noite UTC)
- **Função**: Cria commit de finalização para o dia anterior

---

## 🔧 Troubleshooting

### Cron Job não está executando
1. Verifique se `vercel.json` está no root do projeto
2. Verifique se o deploy foi feito após adicionar `vercel.json`
3. Verifique os logs no dashboard do Vercel

### Erros nos logs
1. Verifique variáveis de ambiente
2. Verifique conexão com Supabase
3. Verifique se o contrato está deployado
4. Verifique se `PRIVATE_KEY` está configurado

### Commits não estão sendo processados
1. Verifique se o worker está executando (logs)
2. Verifique se há commits pendentes no Supabase
3. Verifique se o contrato tem fundos suficientes
4. Verifique se `PRIVATE_KEY` tem permissões (owner do contrato)

---

## 📝 Notas Importantes

1. **Timezone**: Os cron jobs usam UTC. Ajuste o schedule se necessário.
2. **Duração**: Cada cron job tem `maxDuration: 300` (5 minutos)
3. **Rate Limits**: Vercel tem limites de execução. O plano Hobby permite 100 execuções/dia por cron job.
4. **Custos**: Cron jobs são gratuitos no plano Hobby, mas há limites.

---

## ✅ Checklist de Configuração

- [ ] `vercel.json` criado e commitado
- [ ] Deploy feito no Vercel
- [ ] Cron jobs aparecem no dashboard
- [ ] Variáveis de ambiente configuradas
- [ ] Testado manualmente (curl)
- [ ] Verificado logs após primeira execução
- [ ] Monitorado por alguns dias para garantir funcionamento
