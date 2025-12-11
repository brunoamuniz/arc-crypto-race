# 🧪 Scripts de Teste - ARC CRYPTO RACE

## 📋 Scripts Disponíveis

### 1. `test-contract-interaction.ts`
Teste completo de interação com contratos.

**O que testa:**
- ✅ Verifica se o contrato USDC existe e é válido
- ✅ Valida o cálculo do Entry Fee (5 USDC = 5000000)
- ✅ Verifica se o contrato Tournament existe
- ✅ Simula a chamada `approve` com os parâmetros corretos
- ✅ Testa transação real (opcional, requer PRIVATE_KEY)

**Como executar:**
```bash
npx tsx scripts/test-contract-interaction.ts
```

**Resultado esperado:**
- Todos os testes devem passar ✅
- Se algum falhar, o script indica o problema específico

---

### 2. `find-usdc-address.ts`
Tenta encontrar o endereço USDC correto no ARC Testnet.

**Como executar:**
```bash
npx tsx scripts/find-usdc-address.ts
```

**Nota:** Se USDC for token nativo no ARC Testnet, não haverá contrato ERC20 separado.

---

## 🔍 Problemas Identificados

### ❌ Endereço USDC Inválido
- **Endereço atual:** `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Problema:** Não é um contrato válido (não tem código)
- **Solução:** Encontrar o endereço correto ou usar abordagem diferente

### ✅ Entry Fee Correto
- **Valor:** 5000000 (5 USDC com 6 decimais)
- **Cálculo:** `parseUnits('5', 6)` = 5000000 ✅

### ✅ Contrato Tournament Válido
- **Endereço:** `0xBf8dA08341f420cD8538Af4C47909B2Ad6B7f93B`
- **Status:** Contrato existe e é válido ✅

---

## 💡 Próximos Passos

1. **Encontrar endereço USDC correto:**
   - Acesse: https://testnet.arcscan.app
   - Procure por transações USDC recentes
   - Verifique o endereço do contrato usado

2. **Se USDC for token nativo:**
   - Modificar contrato Tournament para receber USDC nativo
   - Não usar `approve` (não há contrato ERC20)
   - Enviar USDC diretamente como valor da transação

3. **Atualizar `.env`:**
   ```bash
   NEXT_PUBLIC_USDC_ADDRESS=<endereço_correto>
   ```

---

## 🐛 Debug

Se as transações continuarem falhando:

1. Execute o teste completo:
   ```bash
   npx tsx scripts/test-contract-interaction.ts
   ```

2. Verifique os logs no console do navegador (F12)

3. Verifique a transação no ArcScan:
   - Veja os parâmetros enviados
   - Verifique o erro específico
   - Confirme o endereço do contrato usado

---

## 📝 Notas

- No ARC Testnet, USDC pode ser o token nativo (gas token)
- Se for token nativo, não há contrato ERC20 separado
- Nesse caso, precisamos modificar a abordagem de aprovação

