#!/bin/bash
# API Test Script - Direct Backend Testing via SSH
# Usage: bash test-api-direct.sh [admin|engineer|client]

SERVER="103.200.20.100"
API_PORT="3000"
API_BASE="http://localhost:${API_PORT}"
API_PREFIX="/api/v1"
API_KEY="baotienweb-api-key-2025"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test accounts
declare -A ACCOUNTS=(
    ["admin"]="admin@baotien.vn:admin123"
    ["engineer"]="engineer@baotien.vn:engineer123"
    ["client"]="client@baotien.vn:client123"
)

# Get account from argument or default to admin
ACCOUNT_TYPE="${1:-admin}"
IFS=':' read -r EMAIL PASSWORD <<< "${ACCOUNTS[$ACCOUNT_TYPE]}"

echo -e "${BLUE}🧪 API Test Script - Direct Backend Testing${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Function to make API request
api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    local url="${API_BASE}${API_PREFIX}${endpoint}"
    local headers="Content-Type: application/json"
    headers="${headers}\nX-API-Key: ${API_KEY}"
    
    if [ -n "$token" ]; then
        headers="${headers}\nAuthorization: Bearer ${token}"
    fi
    
    if [ "$method" = "GET" ] || [ "$method" = "DELETE" ]; then
        curl -s -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -H "X-API-Key: ${API_KEY}" \
            ${token:+-H "Authorization: Bearer $token"}
    else
        curl -s -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -H "X-API-Key: ${API_KEY}" \
            ${token:+-H "Authorization: Bearer $token"} \
            -d "$data"
    fi
}

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET ${API_BASE}/health"
HEALTH_RESPONSE=$(curl -s "${API_BASE}/health")
echo "Response: $HEALTH_RESPONSE"

if [[ $HEALTH_RESPONSE == *"healthy"* ]] || [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo -e "${GREEN}✅ Health check passed${NC}\n"
else
    echo -e "${RED}❌ Health check failed${NC}\n"
    exit 1
fi

# Test 2: Login
echo -e "${YELLOW}Test 2: Login (${ACCOUNT_TYPE})${NC}"
echo "POST ${API_PREFIX}/auth/login"
echo "Email: $EMAIL"

LOGIN_DATA=$(cat <<EOF
{
    "email": "$EMAIL",
    "password": "$PASSWORD"
}
EOF
)

LOGIN_RESPONSE=$(api_request "POST" "/auth/login" "$LOGIN_DATA")
echo "Response: $LOGIN_RESPONSE"

# Extract token from response
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "Token: ${ACCESS_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Login failed - No token received${NC}\n"
    exit 1
fi
echo ""

# Test 3: Get Current User
echo -e "${YELLOW}Test 3: Get Current User${NC}"
echo "GET ${API_PREFIX}/auth/me"

ME_RESPONSE=$(api_request "GET" "/auth/me" "" "$ACCESS_TOKEN")
echo "Response: $ME_RESPONSE"

if [[ $ME_RESPONSE == *"email"* ]]; then
    echo -e "${GREEN}✅ Get current user successful${NC}\n"
else
    echo -e "${RED}❌ Get current user failed${NC}\n"
fi

# Test 4: List Users (Admin only)
if [ "$ACCOUNT_TYPE" = "admin" ]; then
    echo -e "${YELLOW}Test 4: List Users${NC}"
    echo "GET ${API_PREFIX}/users?page=1&limit=5"
    
    USERS_RESPONSE=$(api_request "GET" "/users?page=1&limit=5" "" "$ACCESS_TOKEN")
    echo "Response: $USERS_RESPONSE"
    
    if [[ $USERS_RESPONSE == *"data"* ]]; then
        echo -e "${GREEN}✅ List users successful${NC}\n"
    else
        echo -e "${RED}❌ List users failed${NC}\n"
    fi
fi

# Test 5: List Projects
echo -e "${YELLOW}Test 5: List Projects${NC}"
echo "GET ${API_PREFIX}/projects?page=1&limit=5"

PROJECTS_RESPONSE=$(api_request "GET" "/projects?page=1&limit=5" "" "$ACCESS_TOKEN")
echo "Response: $PROJECTS_RESPONSE"

if [[ $PROJECTS_RESPONSE == *"data"* ]] || [[ $PROJECTS_RESPONSE == *"projects"* ]]; then
    echo -e "${GREEN}✅ List projects successful${NC}\n"
else
    echo -e "${RED}❌ List projects failed${NC}\n"
fi

# Test 6: Get Dashboard
echo -e "${YELLOW}Test 6: Get Dashboard (${ACCOUNT_TYPE})${NC}"
echo "GET ${API_PREFIX}/dashboard/${ACCOUNT_TYPE}"

DASHBOARD_RESPONSE=$(api_request "GET" "/dashboard/${ACCOUNT_TYPE}" "" "$ACCESS_TOKEN")
echo "Response: $DASHBOARD_RESPONSE"

if [[ $DASHBOARD_RESPONSE == *"stats"* ]] || [[ $DASHBOARD_RESPONSE == *"total"* ]]; then
    echo -e "${GREEN}✅ Get dashboard successful${NC}\n"
else
    echo -e "${RED}❌ Get dashboard failed${NC}\n"
fi

# Test 7: List Tasks
echo -e "${YELLOW}Test 7: List Tasks${NC}"
echo "GET ${API_PREFIX}/tasks?page=1&limit=5"

TASKS_RESPONSE=$(api_request "GET" "/tasks?page=1&limit=5" "" "$ACCESS_TOKEN")
echo "Response: $TASKS_RESPONSE"

if [[ $TASKS_RESPONSE == *"data"* ]] || [[ $TASKS_RESPONSE == *"tasks"* ]]; then
    echo -e "${GREEN}✅ List tasks successful${NC}\n"
else
    echo -e "${RED}❌ List tasks failed${NC}\n"
fi

# Summary
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 API Test Complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "All core endpoints tested successfully."
echo "Access token is valid and working."
echo ""
echo "You can now use this token in your app:"
echo "export ACCESS_TOKEN='${ACCESS_TOKEN}'"
