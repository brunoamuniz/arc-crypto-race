# ⚠️ IMPORTANTE: Atualizar Variável de Ambiente no Vercel

## 🔴 Problema Atual

O site está usando o **contrato antigo** porque a variável de ambiente no Vercel não foi aplicada ao deployment atual.

## ✅ Solução

### Passo 1: Verificar Variável no Vercel

1. Acesse: https://vercel.com/brunoamuniz-9230s-projects/arc-crypto-race/settings/environment-variables
2. Verifique se `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS` está configurada como:
   ```
   0x4b6DBD9195F388C180830f3f0df8C8E8AC907B67
   ```

### Passo 2: Fazer Redeploy

**IMPORTANTE**: No Vercel, alterar variáveis de ambiente **NÃO** aplica automaticamente ao deployment atual. Você precisa fazer um **novo deploy**.

#### Opção A: Redeploy Manual (Mais Rápido)

1. Acesse: https://vercel.com/brunoamuniz-9230s-projects/arc-crypto-race
2. Vá no último deployment (`dpl_AQ8SeTPjL2Q46sMpVCjrnrtyRZMx`)
3. Clique nos **três pontos (⋯)** → **"Redeploy"**
4. Confirme o redeploy
5. Aguarde o build completar (1-3 minutos)

#### Opção B: Aguardar Deploy Automático

O commit vazio já foi feito (`51cc695`), então o Vercel deve fazer deploy automaticamente. Mas pode demorar alguns minutos.

### Passo 3: Verificar

Após o deploy, verifique:

```bash
curl https://arccryptorace.xyz/api/check-prize-pool | jq .contract
```

Deve retornar: `"0x4b6DBD9195F388C180830f3f0df8C8E8AC907B67"`

## 📝 Por Que Isso Acontece?

No Next.js/Vercel:
- Variáveis de ambiente são **embutidas no código durante o build**
- Alterar a variável no dashboard **NÃO** atualiza deployments existentes
- É necessário fazer um **novo build** para aplicar mudanças

## 🔍 Verificação do Código

O código está correto e usa a variável de ambiente:

```typescript
// lib/contract.ts
const TOURNAMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '';

// components/EnterTournamentButton.tsx
const TOURNAMENT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;

// app/api/check-prize-pool/route.ts
const TOURNAMENT_CONTRACT = (process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '') as `0x${string}`;
```

O problema é apenas que o Vercel precisa fazer um novo build com a nova variável.
