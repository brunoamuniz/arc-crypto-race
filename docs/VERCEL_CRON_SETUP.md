# ⏰ Configuração do Vercel Cron Jobs

## 📋 Visão Geral

Configuramos um único cron job no Vercel para automatizar o processo de finalização e distribuição de prêmios:

1. **Finalize Day** (`/api/cron/finalize-day`) - Executa à meia-noite UTC todos os dias

**Nota**: Usamos apenas 1 cron job para respeitar o limite do plano Hobby (2 cron jobs por time no total). O endpoint faz ambas as tarefas: cria o commit de finalização e imediatamente processa todos os commits pendentes.

---

## 🔄 Fluxo Automatizado

```
00:00 UTC (Meia-noite)
  ↓
/api/cron/finalize-day
  ↓
1. Cria commit de finalização para o dia anterior
  ↓
2. Imediatamente processa commits pendentes (incluindo o recém-criado)
  ↓
Chama contrato para distribuir prêmios
```

---

## 📁 Arquivos Criados

### 1. `vercel.json`
Configuração do cron job:
```json
{
  "crons": [
    {
      "path": "/api/cron/finalize-day",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Nota**: Usamos apenas 1 cron job que executa ambas as tarefas (finalizar e processar) para respeitar o limite do plano Hobby (2 cron jobs por time no total).

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
3. Você deve ver um cron job:
   - `finalize-day` - Executa à meia-noite UTC (00:00) e faz tudo: cria commit de finalização e processa commits pendentes

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

### Testar Finalize Day (faz tudo: finalizar + processar)
```bash
curl http://localhost:3000/api/cron/finalize-day
```

**Nota**: Localmente, o cron job não executa automaticamente. Você precisa chamar o endpoint manualmente ou usar uma ferramenta como `cron` do sistema.

---

## ⏰ Horários

### Finalize Day (Único Cron Job)
- **Frequência**: Uma vez por dia
- **Schedule**: `0 0 * * *` (meia-noite UTC)
- **Funções**:
  1. Cria commit de finalização para o dia anterior
  2. Imediatamente processa todos os commits pendentes (incluindo o recém-criado)
  3. Chama o contrato para distribuir prêmios
- **Nota**: Combina ambas as tarefas em um único cron job para respeitar o limite do plano Hobby (2 cron jobs por time no total)

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

1. **Timezone**: O cron job usa UTC. Ajuste o schedule se necessário.
2. **Duração**: O cron job tem `maxDuration: 300` (5 minutos)
3. **Plano Hobby**: Limite de 2 cron jobs por time no total. Por isso, usamos apenas 1 cron job que faz tudo.
4. **Processamento**: O commit de finalização é criado e imediatamente processado na mesma execução.
5. **Custos**: Cron jobs são gratuitos no plano Hobby, mas há limites de execução.

---

## ✅ Checklist de Configuração

- [ ] `vercel.json` criado e commitado (com apenas 1 cron job)
- [ ] Deploy feito no Vercel
- [ ] Cron job aparece no dashboard
- [ ] Variáveis de ambiente configuradas
- [ ] Testado manualmente (curl)
- [ ] Verificado logs após primeira execução
- [ ] Monitorado por alguns dias para garantir funcionamento

