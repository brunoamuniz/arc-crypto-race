# 🔄 Atualização do Endereço USDC

## ✅ Problema Resolvido

O endereço USDC estava incorreto, causando falhas nas transações.

## 📋 Endereço Correto

**Fonte oficial:** [ARC Network Documentation](https://docs.arc.network/arc/references/contract-addresses)

- **Endereço:** `0x3600000000000000000000000000000000000000`
- **Descrição:** Optional ERC-20 interface for native USDC
- **Decimals:** 6

## 🔧 Ações Necessárias

### 1. Atualizar `.env`

Adicione ou atualize as seguintes variáveis:

```bash
USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

### 2. Redeploy do Contrato Tournament

O contrato Tournament foi deployado com o endereço USDC antigo. É necessário redeployar:

```bash
cd contracts
npm run deploy
```

Isso vai criar um novo contrato com o endereço USDC correto.

### 3. Atualizar `.env` com Novo Endereço do Contrato

Após o redeploy, atualize:

```bash
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=<novo_endereço>
```

## ✅ Validação

Execute o teste para validar:

```bash
npx tsx scripts/test-contract-interaction.ts
```

**Resultado esperado:**
- ✅ Contrato USDC: PASSOU
- ✅ Cálculo Entry Fee: PASSOU
- ✅ Contrato Tournament: PASSOU
- ✅ Simulação Approve: PASSOU
- ✅ Teste Real Approve: PASSOU

## 📝 Notas

- O endereço antigo `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` não é um contrato válido
- O novo endereço `0x3600000000000000000000000000000000000000` é a interface ERC-20 oficial para USDC nativo no ARC
- USDC no ARC usa 6 decimais na interface ERC-20 (mas 18 decimais como token nativo)

