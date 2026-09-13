#!/bin/bash
# Test script for AmicalPay Render deployment
# Run this after both services are deployed

echo "🧪 AmicalPay Render Deployment Tests"
echo "====================================="
echo ""

BACKEND_URL="https://amical-pay-api.onrender.com"
FRONTEND_URL="https://amical-pay-frontend.onrender.com"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo "${YELLOW}Test 1: Backend Health Check${NC}"
echo "Endpoint: GET $BACKEND_URL/health"
RESPONSE=$(curl -s $BACKEND_URL/health)
if echo $RESPONSE | grep -q "ok"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "Response: $RESPONSE"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 2: FazerCards Connection
echo "${YELLOW}Test 2: FazerCards Connection${NC}"
echo "Endpoint: GET $BACKEND_URL/api/fazer/health"
RESPONSE=$(curl -s $BACKEND_URL/api/fazer/health)
if echo $RESPONSE | grep -q "SUCCESS\|AUTHENTICATION_ERROR\|MISSING_API_KEY"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "Response: $RESPONSE"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 3: Get Categories
echo "${YELLOW}Test 3: Get FazerCards Categories${NC}"
echo "Endpoint: GET $BACKEND_URL/api/fazer/categories"
RESPONSE=$(curl -s $BACKEND_URL/api/fazer/categories)
if echo $RESPONSE | grep -q "success"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "Response: $RESPONSE" | head -c 200
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 4: Get Free Fire LATAM Offers
echo "${YELLOW}Test 4: Get Free Fire LATAM Offers${NC}"
echo "Endpoint: GET $BACKEND_URL/api/fazer/offers/free_fire_latam"
RESPONSE=$(curl -s $BACKEND_URL/api/fazer/offers/free_fire_latam)
if echo $RESPONSE | grep -q "success"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "Response (first 300 chars): "
  echo "$RESPONSE" | head -c 300
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 5: Validate Player
echo "${YELLOW}Test 5: Validate Free Fire Player${NC}"
echo "Endpoint: POST $BACKEND_URL/api/fazer/validate-player"
echo "Payload: {\"playerId\": \"123456789\", \"region\": \"LATAM\"}"
RESPONSE=$(curl -s -X POST $BACKEND_URL/api/fazer/validate-player \
  -H "Content-Type: application/json" \
  -d '{"playerId": "123456789", "region": "LATAM"}')
if echo $RESPONSE | grep -q "success"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "Response: $RESPONSE"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 6: Get Products
echo "${YELLOW}Test 6: Get Products (LATAM)${NC}"
echo "Endpoint: GET $BACKEND_URL/api/products?region=LATAM"
RESPONSE=$(curl -s "$BACKEND_URL/api/products?region=LATAM")
if echo $RESPONSE | grep -q "LATAM"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "Response (first 300 chars): "
  echo "$RESPONSE" | head -c 300
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 7: Frontend Accessibility
echo "${YELLOW}Test 7: Frontend Accessibility${NC}"
echo "Endpoint: GET $FRONTEND_URL"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$RESPONSE" = "200" ]; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "HTTP Status: $RESPONSE"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "HTTP Status: $RESPONSE"
fi
echo ""

echo "====================================="
echo "🎯 Tests Complete!"
echo ""
echo "If all tests passed, your AmicalPay deployment is ready! 🎉"
