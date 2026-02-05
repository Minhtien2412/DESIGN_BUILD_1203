#!/bin/bash
# Test Chat API

# Login to get token
TOKEN=$(curl -s localhost:3000/api/auth/login \
  -H "x-api-key: baotienweb-api-key-2025" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@baotienweb.com","password":"Test@123456"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))")

echo "Token: ${TOKEN:0:50}..."
echo ""

# Test 1: Get chat rooms
echo "=== 1. GET /api/v1/chat/rooms ==="
curl -s localhost:3000/api/v1/chat/rooms \
  -H "x-api-key: baotienweb-api-key-2025" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || cat
echo ""

# Test 2: Create chat room  
echo "=== 2. POST /api/v1/chat/rooms (create room) ==="
ROOM_RESULT=$(curl -s localhost:3000/api/v1/chat/rooms \
  -X POST \
  -H "x-api-key: baotienweb-api-key-2025" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","type":"GROUP"}')
echo "$ROOM_RESULT" | python3 -m json.tool 2>/dev/null || echo "$ROOM_RESULT"
echo ""

# Extract room ID if created
ROOM_ID=$(echo "$ROOM_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")

if [ -n "$ROOM_ID" ]; then
  # Test 3: Send message
  echo "=== 3. POST /api/v1/chat/messages (send message) ==="
  curl -s localhost:3000/api/v1/chat/messages \
    -X POST \
    -H "x-api-key: baotienweb-api-key-2025" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"roomId\":$ROOM_ID,\"content\":\"Hello from API test!\"}" | python3 -m json.tool 2>/dev/null || cat
  echo ""
  
  # Test 4: Get room messages
  echo "=== 4. GET /api/v1/chat/rooms/$ROOM_ID/messages ==="
  curl -s "localhost:3000/api/v1/chat/rooms/$ROOM_ID/messages" \
    -H "x-api-key: baotienweb-api-key-2025" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || cat
  echo ""
fi

echo "=== Chat API Test Complete ==="
