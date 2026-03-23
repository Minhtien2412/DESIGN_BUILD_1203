#!/bin/bash
API=https://baotienweb.cloud/api/v1
MP=https://baotienweb.cloud/api/v1/marketplace-payments
KEY=thietke-resort-api-key-2024

echo '=== Login ==='
TOKEN=$(curl -sk -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $KEY" \
  -d '{"email":"admin@baotienweb.cloud","password":"TestMarket123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken','NO_TOKEN'))")
echo "Token: ${TOKEN:0:40}..."

echo '=== Wallet Balance (PM2) ==='
curl -sk "$MP/wallet/balance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $KEY" | python3 -m json.tool

echo '=== Promo Codes (PM2) ==='
curl -sk "$MP/promo" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $KEY" | python3 -m json.tool

echo '=== CRM Clients (PM2 direct) ==='
curl -sk "https://baotienweb.cloud:3000/api/v1/crm/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $KEY" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Count: {len(d) if isinstance(d,list) else d}')" 2>/dev/null || \
curl -sk "http://127.0.0.1:3000/api/v1/crm/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $KEY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Count: {len(d) if isinstance(d,list) else d}')"

echo '=== Escrow List (PM2) ==='
curl -sk "$MP/escrow" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $KEY" | python3 -m json.tool

echo '=== DONE ==='
