#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# OpenClaw Post-Deployment Verification Script
# Run as root: bash /opt/openclaw/scripts/verify.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

PASS=0
FAIL=0
WARN=0

check() {
    local desc="$1"
    local result="$2"
    if [ "$result" = "pass" ]; then
        echo "  ✅ PASS: $desc"
        PASS=$((PASS + 1))
    elif [ "$result" = "warn" ]; then
        echo "  ⚠️  WARN: $desc"
        WARN=$((WARN + 1))
    else
        echo "  ❌ FAIL: $desc"
        FAIL=$((FAIL + 1))
    fi
}

echo "═══════════════════════════════════════════════════════════"
echo "  OpenClaw Post-Deployment Verification"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════"
echo ""

# -----------------------------------------------------------
echo "1. USER & PERMISSIONS"
echo "-----------------------------------------------------------"

if id openclaw &>/dev/null; then
    check "User 'openclaw' exists" "pass"
else
    check "User 'openclaw' exists" "fail"
fi

if loginctl show-user openclaw 2>/dev/null | grep -q "Linger=yes"; then
    check "User lingering enabled" "pass"
else
    check "User lingering enabled" "fail"
fi

if [ -d /home/openclaw/.openclaw ]; then
    check "OpenClaw data directory exists" "pass"
else
    check "OpenClaw data directory exists" "fail"
fi

OC_PERMS=$(stat -c '%a' /home/openclaw/.openclaw 2>/dev/null || echo "000")
if [ "$OC_PERMS" = "700" ]; then
    check "~/.openclaw permissions (700)" "pass"
else
    check "~/.openclaw permissions (got $OC_PERMS, want 700)" "warn"
fi

# -----------------------------------------------------------
echo ""
echo "2. NODE.JS & OPENCLAW BINARY"
echo "-----------------------------------------------------------"

if su - openclaw -c 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; node --version' &>/dev/null; then
    NODE_VER=$(su - openclaw -c 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; node --version' 2>/dev/null)
    check "Node.js installed ($NODE_VER)" "pass"
else
    check "Node.js installed (via nvm)" "fail"
fi

if su - openclaw -c 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; openclaw --version' &>/dev/null; then
    OC_VER=$(su - openclaw -c 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; openclaw --version' 2>/dev/null)
    check "OpenClaw installed ($OC_VER)" "pass"
else
    check "OpenClaw binary accessible" "fail"
fi

# -----------------------------------------------------------
echo ""
echo "3. SYSTEMD SERVICE"
echo "-----------------------------------------------------------"

SVC_STATUS=$(su - openclaw -c 'systemctl --user is-active openclaw-gateway 2>/dev/null' || echo "inactive")
if [ "$SVC_STATUS" = "active" ]; then
    check "openclaw-gateway service active" "pass"
else
    check "openclaw-gateway service active (status: $SVC_STATUS)" "fail"
fi

SVC_ENABLED=$(su - openclaw -c 'systemctl --user is-enabled openclaw-gateway 2>/dev/null' || echo "disabled")
if [ "$SVC_ENABLED" = "enabled" ]; then
    check "openclaw-gateway service enabled" "pass"
else
    check "openclaw-gateway service enabled (status: $SVC_ENABLED)" "warn"
fi

# -----------------------------------------------------------
echo ""
echo "4. GATEWAY HEALTH"
echo "-----------------------------------------------------------"

HEALTH=$(curl -sf --max-time 5 http://127.0.0.1:18789/healthz 2>/dev/null || echo "FAILED")
if [ "$HEALTH" != "FAILED" ]; then
    check "Gateway /healthz responds" "pass"
else
    check "Gateway /healthz responds" "fail"
fi

READY=$(curl -sf --max-time 5 http://127.0.0.1:18789/readyz 2>/dev/null || echo "FAILED")
if [ "$READY" != "FAILED" ]; then
    check "Gateway /readyz responds" "pass"
else
    check "Gateway /readyz responds" "fail"
fi

# -----------------------------------------------------------
echo ""
echo "5. PORT BINDING"
echo "-----------------------------------------------------------"

if ss -tlnp | grep -q ":18789 "; then
    BIND_ADDR=$(ss -tlnp | grep ":18789 " | awk '{print $4}')
    if echo "$BIND_ADDR" | grep -q "127.0.0.1"; then
        check "Port 18789 bound to loopback only" "pass"
    else
        check "Port 18789 bound to $BIND_ADDR (should be 127.0.0.1)" "warn"
    fi
else
    check "Port 18789 listening" "fail"
fi

# -----------------------------------------------------------
echo ""
echo "6. NGINX REVERSE PROXY"
echo "-----------------------------------------------------------"

if [ -f /etc/nginx/sites-enabled/openclaw ]; then
    check "Nginx openclaw config enabled" "pass"
else
    check "Nginx openclaw config enabled" "warn"
fi

if nginx -t 2>&1 | grep -q "successful"; then
    check "Nginx config syntax valid" "pass"
else
    check "Nginx config syntax valid" "fail"
fi

NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "inactive")
if [ "$NGINX_STATUS" = "active" ]; then
    check "Nginx service active" "pass"
else
    check "Nginx service active" "fail"
fi

# Check if subdomain resolves (non-blocking)
SUBDOMAIN_IP=$(dig +short openclaw.baotienweb.cloud A 2>/dev/null || echo "")
if [ -n "$SUBDOMAIN_IP" ]; then
    check "DNS openclaw.baotienweb.cloud → $SUBDOMAIN_IP" "pass"
else
    check "DNS openclaw.baotienweb.cloud (not configured yet)" "warn"
fi

# -----------------------------------------------------------
echo ""
echo "7. MEMORY IMPACT"
echo "-----------------------------------------------------------"

FREE_MB=$(free -m | awk '/Mem:/ {print $7}')
SWAP_TOTAL=$(free -m | awk '/Swap:/ {print $2}')

if [ "$FREE_MB" -gt 500 ]; then
    check "Available RAM: ${FREE_MB}MB" "pass"
elif [ "$FREE_MB" -gt 200 ]; then
    check "Available RAM: ${FREE_MB}MB (low)" "warn"
else
    check "Available RAM: ${FREE_MB}MB (CRITICAL)" "fail"
fi

if [ "$SWAP_TOTAL" -gt 0 ]; then
    check "Swap configured: ${SWAP_TOTAL}MB" "pass"
else
    check "Swap not configured" "warn"
fi

# -----------------------------------------------------------
echo ""
echo "8. CONFIGURATION"
echo "-----------------------------------------------------------"

if [ -f /home/openclaw/.openclaw/openclaw.json ]; then
    check "openclaw.json config exists" "pass"
else
    check "openclaw.json config exists" "fail"
fi

if [ -f /home/openclaw/.openclaw/.env ]; then
    check ".env file exists" "pass"
else
    check ".env file exists" "warn"
fi

# -----------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  RESULTS: ✅ $PASS passed | ⚠️  $WARN warnings | ❌ $FAIL failed"
echo "═══════════════════════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
    echo "  ❌ Some checks failed. Review and fix before going live."
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "  ⚠️  Some warnings. Review but not blocking."
    exit 0
else
    echo "  ✅ All checks passed! OpenClaw is ready."
    exit 0
fi
