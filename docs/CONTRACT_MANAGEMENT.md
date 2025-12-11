# 📋 Gerenciamento de Contratos - Teste vs Produção

Este guia explica como gerenciar dois contratos separados: um para **teste/desenvolvimento** e outro para **produção**.

## 🎯 Estrutura de Dois Contratos

### Contrato de Teste (Development)
- **Uso**: Desenvolvimento local, testes, debug
- **Rede**: ARC Testnet
- **Variável**: `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS_DEV` (opcional)
- **Quando usar**: Durante desenvolvimento, testes de features, debug

### Contrato de Produção (Production)
- **Uso**: Usuários reais, ambiente de produção
- **Rede**: ARC Testnet (mesma rede, mas contrato separado)
- **Variável**: `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS`
- **Quando usar**: Quando a aplicação estiver live para usuários

## 🔧 Configuração

### Opção 1: Usar Variável de Ambiente para Alternar

Você pode usar uma variável `NODE_ENV` ou criar uma variável customizada:

```env
# .env.local (desenvolvimento)
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x...CONTRATO_DE_TESTE...
NEXT_PUBLIC_USE_TEST_CONTRACT=true

# .env.production (produção no Vercel)
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x...CONTRATO_DE_PRODUCAO...
NEXT_PUBLIC_USE_TEST_CONTRACT=false
```

### Opção 2: Dois Contratos com Variáveis Separadas (Recomendado)

```env
# Contrato de Teste
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS_DEV=0x...CONTRATO_DE_TESTE...

# Contrato de Produção
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x...CONTRATO_DE_PRODUCAO...

# Escolher qual usar (opcional, pode ser automático baseado em NODE_ENV)
NEXT_PUBLIC_USE_DEV_CONTRACT=false
```

## 📝 Passo a Passo: Deploy de Dois Contratos

### 1. Deploy do Contrato de Teste

```bash
cd contracts

# Certifique-se de que o .env tem a chave de teste
# PRIVATE_KEY=0x...chave_da_carteira_de_teste...

npm run deploy:arc
```

**Anote o endereço retornado** (ex: `0x1111111111111111111111111111111111111111`)

### 2. Deploy do Contrato de Produção

```bash
# Use uma carteira diferente OU a mesma (depende da sua estratégia)
# Atualize o .env com a chave de produção
# PRIVATE_KEY=0x...chave_da_carteira_de_producao...

npm run deploy:arc
```

**Anote o endereço retornado** (ex: `0x2222222222222222222222222222222222222222`)

### 3. Configurar Variáveis de Ambiente

#### No `.env.local` (desenvolvimento local):

```env
# Contrato de Teste
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x1111111111111111111111111111111111111111
```

#### No Vercel (produção):

Adicione nas **Environment Variables**:

```
NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x2222222222222222222222222222222222222222
```

Configure para:
- ✅ **Production**
- ❌ **Preview** (ou use o de teste)
- ❌ **Development** (ou use o de teste)

## 🔄 Alternando Entre Contratos

### Método Automático (Recomendado)

O código já usa `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS`, então:

- **Local**: Use `.env.local` com o contrato de teste
- **Vercel Production**: Use variável de ambiente com o contrato de produção
- **Vercel Preview**: Pode usar o contrato de teste ou produção

### Método Manual (Se precisar alternar)

Você pode criar uma variável de controle:

```typescript
// lib/contract.ts
const USE_DEV_CONTRACT = process.env.NEXT_PUBLIC_USE_DEV_CONTRACT === 'true';
const DEV_CONTRACT = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS_DEV || '';
const PROD_CONTRACT = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS || '';

export const TOURNAMENT_CONTRACT_ADDRESS = USE_DEV_CONTRACT ? DEV_CONTRACT : PROD_CONTRACT;
```

## 📊 Comparação dos Contratos

| Aspecto | Contrato de Teste | Contrato de Produção |
|---------|-------------------|----------------------|
| **Uso** | Desenvolvimento, testes | Usuários reais |
| **Owner** | Sua carteira de teste | Sua carteira de produção |
| **Dados** | Pode ser resetado | Dados reais dos usuários |
| **Deploy** | Frequente (testes) | Estável (produção) |
| **Variável** | `.env.local` | Vercel Environment Variables |

## ✅ Checklist: Setup de Dois Contratos

### Contrato de Teste
- [ ] Carteira de teste criada/configurada
- [ ] ETH suficiente na carteira de teste
- [ ] Deploy do contrato de teste realizado
- [ ] Endereço do contrato de teste anotado
- [ ] `.env.local` configurado com contrato de teste

### Contrato de Produção
- [ ] Carteira de produção criada/configurada
- [ ] ETH suficiente na carteira de produção
- [ ] Deploy do contrato de produção realizado
- [ ] Endereço do contrato de produção anotado
- [ ] Variáveis no Vercel configuradas com contrato de produção

### Verificação
- [ ] Teste local usando contrato de teste
- [ ] Produção no Vercel usando contrato de produção
- [ ] Ambos funcionando corretamente

## 🔍 Scripts Úteis

### Verificar Qual Contrato Está Sendo Usado

Crie `scripts/check-active-contract.ts`:

```typescript
const contract = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS;
const devContract = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS_DEV;
const useDev = process.env.NEXT_PUBLIC_USE_DEV_CONTRACT === 'true';

console.log('📋 Active Contract Configuration:');
console.log('   Environment:', process.env.NODE_ENV);
console.log('   Use Dev Contract:', useDev);
console.log('   Production Contract:', contract || 'NOT SET');
console.log('   Dev Contract:', devContract || 'NOT SET');
console.log('   Active Contract:', useDev ? devContract : contract);
```

## 🎯 Estratégias de Uso

### Estratégia 1: Carteiras Separadas (Recomendado)
- **Teste**: Carteira dedicada para testes
- **Produção**: Carteira dedicada para produção
- **Vantagem**: Isolamento completo, segurança

### Estratégia 2: Mesma Carteira, Contratos Diferentes
- **Teste e Produção**: Mesma carteira como owner
- **Vantagem**: Mais simples de gerenciar
- **Desvantagem**: Menos isolamento

## 🚨 Importante

1. **Nunca misture**: Não use o contrato de teste em produção
2. **Backup**: Anote os endereços dos contratos em local seguro
3. **Owner**: Lembre-se qual carteira é owner de cada contrato
4. **Reset**: O contrato de teste pode ser resetado (novo deploy), o de produção não

## 📚 Próximos Passos

Após configurar os dois contratos:

1. Teste localmente com o contrato de teste
2. Faça deploy em produção com o contrato de produção
3. Documente os endereços dos contratos
4. Configure monitoramento (opcional)
