# 🧪 Testing Payment and Prize Distribution

This guide explains how to test the payment flow and prize distribution system.

## 📋 Prerequisites

1. **Environment Variables** (in `.env`):
   ```env
   NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
   PRIVATE_KEY=0x...  # Owner wallet private key
   ```

2. **Test Wallets** (optional, for multiple wallet testing):
   ```env
   TEST_WALLET_1_PRIVATE_KEY=0x...
   TEST_WALLET_2_PRIVATE_KEY=0x...
   TEST_WALLET_3_PRIVATE_KEY=0x...
   ```
   If not set, the script will use the owner wallet for all entries (for single-wallet testing).

3. **USDC Balance**:
   - Each test wallet needs at least 5 USDC
   - Owner wallet needs some USDC for gas fees
   - Get testnet USDC from: https://easyfaucetarc.xyz/

## 🧪 Automated Test Script

### Full Payment and Distribution Test

Run the comprehensive test script that tests the entire flow:

```bash
npx tsx scripts/test-payment-and-prize-distribution.ts [dayId]
```

**What it tests:**
1. ✅ Initial state verification
2. ✅ Tournament entry payments (3 wallets)
3. ✅ Prize pool accumulation
4. ✅ Prize distribution (finalizeDay)
5. ✅ Balance verification before/after
6. ✅ Site fee distribution to owner

**Example output:**
```
📊 PHASE 1: Initial State
  Total Pool: 0 USDC
  Finalized: false

💰 PHASE 2: Tournament Entries
  1️⃣  Wallet 1 Entry...
  2️⃣  Wallet 2 Entry...
  3️⃣  Wallet 3 Entry...
  ✅ Pool increased correctly

🏆 PHASE 3: Prize Distribution
  Finalizing with winners...
  ✅ Finalization confirmed

✅ PHASE 4: Verifying Distribution
  ✅ All prizes distributed correctly
```

## 🔍 Manual Testing Steps

### Step 1: Test Tournament Entry (Payment)

#### Option A: Using the Frontend
1. Start the dev server: `npm run dev`
2. Navigate to `/game`
3. Connect your wallet
4. Click "Enter Tournament"
5. Approve USDC spending (if needed)
6. Confirm the entry transaction

#### Option B: Using Scripts
```bash
# Check if wallet has entered
npx tsx scripts/check-tournament-entry.ts [wallet_address] [dayId]

# Verify transaction
npx tsx scripts/check-transaction.ts [tx_hash]
```

### Step 2: Verify Entry Payment

```bash
# Check contract balance increased
npx tsx scripts/test-payment-and-prize-distribution.ts [dayId]
```

**What to verify:**
- ✅ Contract USDC balance increased by 5 USDC per entry
- ✅ `hasEntered(dayId, wallet)` returns `true`
- ✅ `getDayInfo(dayId).totalPool` shows correct amount

### Step 3: Test Prize Distribution

#### Option A: Using the API (Recommended)

1. **Ensure you have at least 3 players with scores:**
   - Players need to submit scores via `/api/submit-score`
   - Or manually insert into Supabase `best_scores` table

2. **Call the finalize API:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/finalize-day \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
     -d '{"dayId": 20251211}'
   ```

3. **Run the worker to process:**
   ```bash
   npm run worker
   ```

#### Option B: Using the Test Script

The test script automatically:
- Creates 3 entries
- Finalizes the day
- Verifies prize distribution

### Step 4: Verify Prize Distribution

After finalization, verify:

1. **Winner balances increased:**
   ```bash
   # Check winner balances
   npx tsx scripts/test-payment-and-prize-distribution.ts [dayId]
   ```

2. **Contract state:**
   - `getDayInfo(dayId).finalized` should be `true`
   - `getDayInfo(dayId).winners` should show the 3 winners
   - Contract USDC balance should be near zero (all distributed)

3. **Prize amounts:**
   - 1st place: 60% of prize pool (after 10% site fee)
   - 2nd place: 25% of prize pool
   - 3rd place: 15% of prize pool
   - Owner: 10% site fee

## 📊 Expected Prize Calculation

For a pool with 3 entries (15 USDC total):

```
Total Pool: 15 USDC
Site Fee (10%): 1.5 USDC
Prize Pool: 13.5 USDC

1st Place (60%): 8.1 USDC
2nd Place (25%): 3.375 USDC
3rd Place (15%): 2.025 USDC
Owner (Site Fee): 1.5 USDC
```

## 🔍 Verification Checklist

### Payment Flow
- [ ] Wallet has sufficient USDC balance (≥5 USDC)
- [ ] USDC approval transaction succeeds
- [ ] Tournament entry transaction succeeds
- [ ] Contract balance increases by 5 USDC
- [ ] `hasEntered()` returns `true`
- [ ] `getDayInfo().totalPool` increases correctly

### Prize Distribution Flow
- [ ] At least 3 players have entered
- [ ] Day is not already finalized
- [ ] Finalize transaction succeeds
- [ ] Winners receive correct prize amounts
- [ ] Owner receives site fee (10%)
- [ ] Contract balance is cleared (near zero)
- [ ] `getDayInfo().finalized` is `true`
- [ ] `getDayInfo().winners` shows correct addresses

## 🐛 Troubleshooting

### "Insufficient balance"
- Get more USDC from faucet: https://easyfaucetarc.xyz/
- Check wallet address has USDC balance

### "Already entered today"
- Use a different day ID (tomorrow's date)
- Or use different wallet addresses

### "Day already finalized"
- Use a different day ID
- Or wait for next day

### "Owner mismatch"
- Ensure `PRIVATE_KEY` in `.env` matches contract owner
- Check contract owner: `npx tsx scripts/check-tournament-entry.ts`

### "Transaction failed"
- Check gas fees are sufficient
- Verify contract addresses are correct
- Check network connection (ARC Testnet)

## 📝 Example Test Scenario

1. **Setup:**
   ```bash
   # Set test wallets (optional)
   export TEST_WALLET_1_PRIVATE_KEY=0x...
   export TEST_WALLET_2_PRIVATE_KEY=0x...
   export TEST_WALLET_3_PRIVATE_KEY=0x...
   ```

2. **Run test:**
   ```bash
   npx tsx scripts/test-payment-and-prize-distribution.ts 20251211
   ```

3. **Expected flow:**
   - 3 wallets enter tournament (15 USDC total)
   - Pool accumulates to 15 USDC
   - Finalize distributes:
     - 1st: 8.1 USDC
     - 2nd: 3.375 USDC
     - 3rd: 2.025 USDC
     - Owner: 1.5 USDC

## 🔗 Related Scripts

- `scripts/test-contract-interaction.ts` - Basic contract interaction tests
- `scripts/check-tournament-entry.ts` - Check if wallet entered
- `scripts/check-transaction.ts` - Verify transaction details
- `scripts/worker.ts` - Process pending commits (checkpoints and finalize)

## 📚 Additional Resources

- [Contract Source](./../contracts/src/Tournament.sol)
- [Contract Interaction Library](./../lib/contract.ts)
- [Admin API](./../app/api/admin/finalize-day/route.ts)
- [ARC Testnet Explorer](https://testnet.arcscan.app)
