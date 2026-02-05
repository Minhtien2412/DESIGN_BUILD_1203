#!/bin/bash
# Test Notification WebSocket
# Run this script to test sending notifications to the app

# Configuration
API_BASE="https://baotienweb.cloud/api/v1"
API_KEY="sk_live_designbuild_2025_secure_key_v1"

# First, login to get a token
echo "=== Step 1: Login to get token ==="
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "email": "testuser1@baotienweb.cloud",
    "password": "Test@123456"
  }')

echo "Login response:"
echo "$LOGIN_RESPONSE" | head -c 500

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo ""
  echo "❌ Failed to get token. Check credentials."
  exit 1
fi

echo ""
echo "✅ Got token: ${TOKEN:0:50}..."

# Step 2: Create a notification
echo ""
echo "=== Step 2: Create a test notification ==="
NOTIF_RESPONSE=$(curl -s -X POST "$API_BASE/notifications" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "SYSTEM",
    "title": "WebSocket Test",
    "message": "This is a test notification sent at '"$(date +%H:%M:%S)"'",
    "data": {
      "test": true,
      "timestamp": "'"$(date +%Y-%m-%dT%H:%M:%S)"'"
    }
  }')

echo "Notification response:"
echo "$NOTIF_RESPONSE"

echo ""
echo "=== Done ==="
echo "Check the app console for:"
echo "  🔔 [UnifiedNotification] Received notification"
echo "  or"
echo "  🔔 Received notification from WebSocket"
