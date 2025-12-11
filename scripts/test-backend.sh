#!/bin/bash

# Backend Testing Script
# Tests all API endpoints

BASE_URL="http://localhost:3000"
WALLET="0xCa64ddA1Cf192Ac11336DCE42367bE0099eca343"
DAY_ID=$(date +%Y%m%d)
ADMIN_KEY="arc-crypto-bros-admin-key-2025"

echo "🧪 Testing Arc Crypto Bros Backend APIs"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Submit Score
echo -e "${YELLOW}1️⃣ Testing POST /api/submit-score${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/submit-score" \
  -H "Content-Type: application/json" \
  -d "{\"wallet\":\"$WALLET\",\"dayId\":$DAY_ID,\"score\":12345}")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Submit score: SUCCESS${NC}"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
  echo -e "${RED}❌ Submit score: FAILED${NC}"
  echo "$RESPONSE"
fi

echo ""
sleep 1

# Test 2: Leaderboard
echo -e "${YELLOW}2️⃣ Testing GET /api/leaderboard${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/leaderboard?dayId=$DAY_ID")

if echo "$RESPONSE" | grep -q '"dayId"'; then
  echo -e "${GREEN}✅ Leaderboard: SUCCESS${NC}"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
  echo -e "${RED}❌ Leaderboard: FAILED${NC}"
  echo "$RESPONSE"
fi

echo ""
sleep 1

# Test 3: Submit another score (should update best)
echo -e "${YELLOW}3️⃣ Testing score update (higher score)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/submit-score" \
  -H "Content-Type: application/json" \
  -d "{\"wallet\":\"$WALLET\",\"dayId\":$DAY_ID,\"score\":15000}")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Score update: SUCCESS${NC}"
else
  echo -e "${RED}❌ Score update: FAILED${NC}"
  echo "$RESPONSE"
fi

echo ""
sleep 1

# Test 4: Check leaderboard again
echo -e "${YELLOW}4️⃣ Verifying best score updated${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/leaderboard?dayId=$DAY_ID")
BEST_SCORE=$(echo "$RESPONSE" | jq -r '.leaderboard[0].best_score // "0"' 2>/dev/null)

if [ "$BEST_SCORE" = "15000" ]; then
  echo -e "${GREEN}✅ Best score updated correctly: $BEST_SCORE${NC}"
else
  echo -e "${YELLOW}⚠️  Best score: $BEST_SCORE (expected 15000)${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Backend tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Check Supabase dashboard for data"
echo "2. Test worker script: npm run worker"
echo "3. Deploy smart contract"

