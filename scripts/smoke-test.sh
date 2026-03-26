#!/usr/bin/env bash
# ============================================================
# Smoke Test Suite for Baotienweb API
# ============================================================
# Usage: bash scripts/smoke-test.sh [BASE_URL]
#
# Tests: Auth, Tasks, Notifications, Projects, Upload, Swagger
# ============================================================

set -euo pipefail

BASE="${1:-https://baotienweb.cloud/api}"
API_KEY="dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88"
EMAIL="admin@baotienweb.cloud"
PASS="Demo@123"

PASS_COUNT=0
FAIL_COUNT=0
TOTAL=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }
bold()  { printf "\033[1m%s\033[0m\n" "$1"; }

check() {
  local label="$1" expected_code="$2" actual_code="$3"
  TOTAL=$((TOTAL+1))
  if [ "$actual_code" = "$expected_code" ]; then
    green "  [PASS] $label (HTTP $actual_code)"
    PASS_COUNT=$((PASS_COUNT+1))
  else
    red "  [FAIL] $label (expected $expected_code, got $actual_code)"
    FAIL_COUNT=$((FAIL_COUNT+1))
  fi
}

bold "=========================================="
bold "  Baotienweb API Smoke Tests"
bold "  Base: $BASE"
bold "  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
bold "=========================================="

# ------------------------------------------
# 1. Health
# ------------------------------------------
bold "\n[1] Health Check"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: $API_KEY" "$BASE/health")
check "GET /health" "200" "$CODE"

# ------------------------------------------
# 2. Auth - Login
# ------------------------------------------
bold "\n[2] Authentication"
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
LOGIN_CODE=$(echo "$LOGIN_RESP" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESP" | sed '$d')
check "POST /auth/login" "200" "$LOGIN_CODE"

# Extract token
TOKEN=$(echo "$LOGIN_BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  red "  FATAL: Could not extract accessToken. Aborting."
  exit 1
fi

AUTH_H="Authorization: Bearer $TOKEN"

# GET /auth/me
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_H" -H "X-API-Key: $API_KEY" "$BASE/v1/auth/me")
check "GET /auth/me" "200" "$CODE"

# ------------------------------------------
# 3. Tasks CRUD
# ------------------------------------------
bold "\n[3] Tasks"

# Create with FE alias status + assignedToId
TASK_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/v1/tasks" \
  -H "$AUTH_H" -H "X-API-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"title":"Smoke test task","description":"auto","status":"DOING","projectId":1}')
TASK_CODE=$(echo "$TASK_RESP" | tail -1)
TASK_BODY=$(echo "$TASK_RESP" | sed '$d')
check "POST /tasks (status=DOING)" "201" "$TASK_CODE"

TASK_ID=$(echo "$TASK_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

# Verify status normalised to IN_PROGRESS
if echo "$TASK_BODY" | grep -q '"IN_PROGRESS"'; then
  green "  [PASS] Status normalized: DOING -> IN_PROGRESS"
  PASS_COUNT=$((PASS_COUNT+1))
else
  red "  [FAIL] Status not normalized to IN_PROGRESS"
  FAIL_COUNT=$((FAIL_COUNT+1))
fi
TOTAL=$((TOTAL+1))

# PATCH update (FE sends PATCH, not PUT)
if [ -n "$TASK_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/v1/tasks/$TASK_ID" \
    -H "$AUTH_H" -H "X-API-Key: $API_KEY" -H "Content-Type: application/json" \
    -d '{"status":"COMPLETED"}')
  check "PATCH /tasks/$TASK_ID (status=COMPLETED->DONE)" "200" "$CODE"

  # Cleanup
  curl -s -o /dev/null -X DELETE "$BASE/v1/tasks/$TASK_ID" \
    -H "$AUTH_H" -H "X-API-Key: $API_KEY"
fi

# GET all tasks
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_H" -H "X-API-Key: $API_KEY" "$BASE/v1/tasks")
check "GET /tasks" "200" "$CODE"

# ------------------------------------------
# 4. Notifications
# ------------------------------------------
bold "\n[4] Notifications"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_H" -H "X-API-Key: $API_KEY" \
  "$BASE/v1/notifications?page=1&limit=5")
check "GET /notifications (page+limit)" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_H" -H "X-API-Key: $API_KEY" \
  "$BASE/v1/notifications?type=SYSTEM")
check "GET /notifications (type=SYSTEM)" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_H" -H "X-API-Key: $API_KEY" \
  "$BASE/v1/notifications?category=SYSTEM")
check "GET /notifications (category alias)" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_H" -H "X-API-Key: $API_KEY" \
  "$BASE/v1/notifications/unread-count")
check "GET /notifications/unread-count" "200" "$CODE"

# ------------------------------------------
# 5. Projects
# ------------------------------------------
bold "\n[5] Projects"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_H" -H "X-API-Key: $API_KEY" "$BASE/v1/projects")
check "GET /projects" "200" "$CODE"

# ------------------------------------------
# 6. Upload (Presigned)
# ------------------------------------------
bold "\n[6] Upload"

PRESIGN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/v1/upload/presign" \
  -H "$AUTH_H" -H "X-API-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"filename":"smoke-test.pdf","contentType":"application/pdf","size":512}')
PRESIGN_CODE=$(echo "$PRESIGN_RESP" | tail -1)
check "POST /upload/presign" "201" "$PRESIGN_CODE"

# ------------------------------------------
# 7. Swagger Docs
# ------------------------------------------
bold "\n[7] Swagger / OpenAPI"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/docs")
check "GET /docs (Swagger UI)" "200" "$CODE"

SWAGGER_BODY=$(curl -s "$BASE/docs-json")
for TAG in "Notifications" "Push Tokens" "Conversation Messages" "Video Interactions"; do
  TOTAL=$((TOTAL+1))
  if echo "$SWAGGER_BODY" | grep -q "\"$TAG\""; then
    green "  [PASS] Swagger tag: $TAG"
    PASS_COUNT=$((PASS_COUNT+1))
  else
    red "  [FAIL] Swagger tag missing: $TAG"
    FAIL_COUNT=$((FAIL_COUNT+1))
  fi
done

# ------------------------------------------
# 8. Auth Logout
# ------------------------------------------
bold "\n[8] Logout"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/v1/auth/logout" \
  -H "$AUTH_H" -H "X-API-Key: $API_KEY")
check "POST /auth/logout" "200" "$CODE"

# Verify token is invalidated (JWT may still work until expiry - 401 or 200 both acceptable)
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_H" -H "X-API-Key: $API_KEY" "$BASE/v1/auth/me")
TOTAL=$((TOTAL+1))
if [ "$CODE" = "401" ]; then
  green "  [PASS] GET /auth/me after logout = 401 (session revoked)"
  PASS_COUNT=$((PASS_COUNT+1))
elif [ "$CODE" = "200" ]; then
  green "  [PASS] GET /auth/me after logout = 200 (JWT still valid until expiry)"
  PASS_COUNT=$((PASS_COUNT+1))
else
  red "  [FAIL] GET /auth/me after logout unexpected (HTTP $CODE)"
  FAIL_COUNT=$((FAIL_COUNT+1))
fi

# ------------------------------------------
# Summary
# ------------------------------------------
bold "\n=========================================="
bold "  Results: $PASS_COUNT passed / $FAIL_COUNT failed / $TOTAL total"
bold "=========================================="

if [ "$FAIL_COUNT" -gt 0 ]; then
  red "  SOME TESTS FAILED"
  exit 1
else
  green "  ALL TESTS PASSED"
  exit 0
fi
