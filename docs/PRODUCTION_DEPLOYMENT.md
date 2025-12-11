# 🚀 Guia de Deploy para Produção - ARC CRYPTO RACE

Este guia explica o processo completo para fazer o deploy do contrato e liberar a aplicação para usuários reais.

> 💡 **Dica**: Recomendamos ter **dois contratos separados**: um para teste/desenvolvimento e outro para produção. Veja o guia completo em [`CONTRACT_MANAGEMENT.md`](./CONTRACT_MANAGEMENT.md).

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Conta no ARC Testnet com ETH suficiente para gas
- [ ] USDC no ARC Testnet (para testar transações)
- [ ] Chave privada da carteira que será owner do contrato
- [ ] Endereço do USDC no ARC Testnet
- [ ] Projeto Supabase configurado
- [ ] Acesso ao Vercel (ou plataforma de deploy)

## 🔧 Passo 1: Preparar Variáveis de Ambiente

### 1.1 Criar/Atualizar `.env` na raiz do projeto

```bash
# Supabase (já deve estar configurado)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Blockchain - ARC Testnet
NEXT_PUBLIC_ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
USDC_ADDRESS=0x3600000000000000000000000000000000000000
# NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS será preenchido após deploy

# Contract Owner (para deploy e transações admin)
PRIVATE_KEY=0x...sua_chave_privada_sem_0x...

# Admin API (opcional, para endpoints admin)
ADMIN_API_KEY=seu_admin_api_key_secreto
```

### 1.2 Criar `.env` na pasta `contracts/`

```bash
cd contracts
```

Crie um arquivo `.env` na pasta `contracts/`:

```env
# ARC Testnet RPC
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network

# USDC Address no ARC Testnet
USDC_ADDRESS=0x3600000000000000000000000000000000000000

# Private Key do Owner (sem 0x no início)
PRIVATE_KEY=sua_chave_privada_sem_0x
```

**⚠️ IMPORTANTE**: 
- A chave privada deve ser da carteira que será **owner** do contrato
- Esta carteira precisa ter ETH suficiente para pagar o gas do deploy
- Nunca commite o `.env` no git!

## 📦 Passo 2: Instalar Dependências do Contrato

```bash
cd contracts
npm install
```

## 🔨 Passo 3: Compilar o Contrato

```bash
npm run compile
```

Isso vai gerar os arquivos de artefato em `contracts/artifacts/`.

## 🚀 Passo 4: Fazer Deploy do Contrato

```bash
npm run deploy:arc
```

### O que acontece:

1. O script conecta à ARC Testnet usando sua `PRIVATE_KEY`
2. Verifica o saldo da carteira
3. Faz deploy do contrato `Tournament.sol`
4. Passa como parâmetros:
   - `USDC_ADDRESS`: Endereço do token USDC
   - `deployer.address`: Endereço que será owner do contrato

### Saída esperada:

```
Deploying contracts with account: 0x...
Account balance: 0.5 ETH
Tournament deployed to: 0x1234567890abcdef1234567890abcdef12345678

Deployment Info:
Contract Address: 0x1234567890abcdef1234567890abcdef12345678
USDC Address: 0x3600000000000000000000000000000000000000
Owner: 0x...

Add to .env:
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

## ✅ Passo 5: Atualizar Variáveis de Ambiente

### 5.1 Atualizar `.env` na raiz do projeto

Adicione o endereço do contrato que foi retornado:

```env
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### 5.2 Verificar no Block Explorer

1. Acesse: https://testnet.arcscan.app
2. Cole o endereço do contrato
3. Verifique se o contrato foi deployado corretamente
4. Verifique se o owner está correto

## 🔍 Passo 6: Verificar o Deploy

### 6.1 Verificar o contrato

```bash
# Na raiz do projeto
npx tsx scripts/check-tournament-entry.ts
```

### 6.2 Testar entrada no torneio (opcional)

```bash
npx tsx scripts/test-contract-interaction.ts
```

## 🌐 Passo 7: Configurar Variáveis no Vercel

### 7.1 Acessar Vercel Dashboard

1. Vá para: https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings → Environment Variables**

### 7.2 Adicionar todas as variáveis

Adicione **TODAS** as variáveis do `.env`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Blockchain
NEXT_PUBLIC_ARC_TESTNET_RPC_URL
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS  ← NOVO!
USDC_ADDRESS

# Admin
ADMIN_API_KEY (opcional)

# Contract Owner (apenas se precisar fazer transações admin)
PRIVATE_KEY  ← ⚠️ SECRETO!
```

**⚠️ IMPORTANTE**:
- Marque `PRIVATE_KEY` e `SUPABASE_SERVICE_ROLE_KEY` como **Secret**
- Marque `ADMIN_API_KEY` como **Secret** (se usar)
- Configure para **Production**, **Preview** e **Development** conforme necessário

### 7.3 Fazer novo deploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push

## 🧪 Passo 8: Testar em Produção

### 8.1 Verificar se o site está funcionando

1. Acesse sua URL no Vercel
2. Verifique se a página carrega
3. Tente conectar a carteira
4. Verifique se o contrato está sendo detectado

### 8.2 Testar entrada no torneio

1. Conecte sua carteira MetaMask
2. Certifique-se de estar na **ARC Testnet**
3. Tenha USDC suficiente (5 USDC + gas)
4. Clique em "Enter Tournament"
5. Aprove a transação USDC
6. Aprove a transação de entrada

### 8.3 Verificar no Block Explorer

1. Acesse: https://testnet.arcscan.app
2. Verifique a transação de entrada
3. Verifique se o contrato está atualizado

## 📝 Passo 9: Configurar Worker (Opcional)

Se você usa um worker para finalizar os dias automaticamente:

### 9.1 Vercel Cron Jobs

1. Crie `vercel.json` na raiz:

```json
{
  "crons": [
    {
      "path": "/api/cron/finalize-day",
      "schedule": "55 23 * * *"
    }
  ]
}
```

2. Crie a rota `/app/api/cron/finalize-day/route.ts`

### 9.2 Ou use um serviço externo

- GitHub Actions
- AWS Lambda
- Google Cloud Functions
- Outro serviço de cron

## ✅ Checklist Final

Antes de liberar para usuários:

- [ ] Contrato deployado e verificado no block explorer
- [ ] `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS` configurado
- [ ] Todas as variáveis de ambiente no Vercel
- [ ] Site funcionando em produção
- [ ] Teste de entrada no torneio funcionando
- [ ] Worker/cron configurado (se necessário)
- [ ] Documentação atualizada
- [ ] Backup das chaves privadas em local seguro

## 🔄 Para Criar um Novo Contrato (Reset)

Se você precisar criar um novo contrato (por exemplo, para resetar o torneio):

1. Siga os **Passos 1-4** novamente
2. Um novo endereço será gerado
3. Atualize `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS` no `.env` e no Vercel
4. Faça novo deploy

**⚠️ ATENÇÃO**: 
- Criar um novo contrato significa que **todos os dados anteriores serão perdidos**
- Usuários que entraram no contrato antigo precisarão entrar novamente
- O histórico de dias anteriores não estará disponível

## 🎯 Usando Dois Contratos (Teste + Produção)

Recomendamos ter dois contratos separados:

- **Contrato de Teste**: Para desenvolvimento e testes locais
- **Contrato de Produção**: Para usuários reais em produção

Veja o guia completo em [`CONTRACT_MANAGEMENT.md`](./CONTRACT_MANAGEMENT.md) para:
- Como fazer deploy de dois contratos
- Como alternar entre eles
- Melhores práticas de gerenciamento

## 🆘 Troubleshooting

### Erro: "Insufficient funds"
- Verifique se a carteira tem ETH suficiente para gas

### Erro: "USDC transfer failed"
- Verifique se o endereço do USDC está correto
- Verifique se você tem USDC suficiente

### Erro: "Contract address not set"
- Verifique se `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS` está no `.env`
- Verifique se está no Vercel (para produção)

### Contrato não aparece no block explorer
- Aguarde alguns minutos (pode demorar para indexar)
- Verifique se o deploy foi bem-sucedido
- Verifique se está na rede correta (ARC Testnet)

## 📚 Recursos Adicionais

- [ARC Testnet Docs](https://docs.arc.network/)
- [ARC Testnet Explorer](https://testnet.arcscan.app)
- [Hardhat Docs](https://hardhat.org/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
