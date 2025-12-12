# 💰 Como Adicionar Fundos ao Pool de Prêmios

## ⚠️ Limitação do Contrato Atual

O contrato `Tournament.sol` **não possui uma função específica** para adicionar fundos diretamente ao pool de prêmios. O pool só aumenta quando usuários entram no torneio através da função `enterTournament()`.

## 🔧 Soluções Possíveis

### Opção 1: Adicionar Função no Contrato (Recomendado)

A melhor solução é adicionar uma função `addFunds()` no contrato que permita ao owner adicionar fundos diretamente.

#### 1.1 Modificar o Contrato

Adicione esta função ao `contracts/src/Tournament.sol`:

```solidity
/**
 * @dev Add funds to the prize pool for a specific day (owner only)
 * @param dayId The day identifier
 * @param amount Amount of USDC to add (in 6 decimals)
 */
function addFunds(uint256 dayId, uint256 amount) external onlyOwner {
    require(!dayInfo[dayId].finalized, "Day already finalized");
    require(amount > 0, "Amount must be greater than zero");
    
    // Transfer USDC from owner to contract
    require(
        usdc.transferFrom(msg.sender, address(this), amount),
        "USDC transfer failed"
    );
    
    // Add to pool
    dayInfo[dayId].totalPool += amount;
    
    emit FundsAdded(dayId, msg.sender, amount);
}
```

E adicione o evento:

```solidity
event FundsAdded(uint256 indexed dayId, address indexed contributor, uint256 amount);
```

#### 1.2 Fazer Novo Deploy

```bash
cd contracts
npm run compile
npm run deploy:arc
```

#### 1.3 Usar a Nova Função

Crie um script ou use o frontend para chamar `addFunds(dayId, amount)`.

### Opção 2: Workaround (Não Recomendado)

Você pode simular entradas no torneio usando múltiplas carteiras, mas isso é:
- ❌ Caro (5 USDC por entrada)
- ❌ Trabalhoso (múltiplas transações)
- ❌ Não prático para grandes quantias

**Exemplo:** Para adicionar 100 USDC, você precisaria de 20 entradas (20 × 5 USDC = 100 USDC).

## 📝 Script de Exemplo

Criei um script `scripts/add-funds-to-pool.ts` que:
- Verifica o pool atual
- Mostra quanto seria necessário para adicionar fundos
- Explica a limitação e a solução recomendada

**Uso:**
```bash
npx tsx scripts/add-funds-to-pool.ts <dayId> <amount>
```

**Exemplo:**
```bash
npx tsx scripts/add-funds-to-pool.ts 20251213 100
```

## ✅ Recomendação Final

**Para adicionar fundos ao pool, você precisa:**

1. ✅ Adicionar a função `addFunds()` ao contrato
2. ✅ Fazer novo deploy do contrato
3. ✅ Atualizar `NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS` no `.env` e Vercel
4. ✅ Usar a nova função para adicionar fundos

**Alternativa temporária:**
- Use múltiplas carteiras para fazer entradas no torneio
- Não é prático para grandes quantias

## 🔐 Segurança

A função `addFunds()` deve ser `onlyOwner` para garantir que apenas o dono do contrato possa adicionar fundos. Isso previne:
- Manipulação do pool por terceiros
- Adição de fundos não autorizados
- Fraudes

## 📚 Próximos Passos

1. Decida se quer adicionar a função ao contrato
2. Se sim, modifique `contracts/src/Tournament.sol`
3. Faça novo deploy
4. Atualize as variáveis de ambiente
5. Use a nova função para adicionar fundos




