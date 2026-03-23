#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# OpenClaw Pre-Deployment VPS Survey
# Run as root: bash /tmp/survey.sh | tee /tmp/openclaw-survey.log
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

LOGFILE="/tmp/openclaw-survey.log"
SEP="═══════════════════════════════════════════════════════════"

log() { echo -e "\n${SEP}\n$1\n${SEP}"; }

log "1. SYSTEM INFO"
echo "Hostname  : $(hostname)"
echo "OS        : $(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d '"')"
echo "Kernel    : $(uname -r)"
echo "Arch      : $(uname -m)"
echo "Uptime    : $(uptime -p 2>/dev/null || uptime)"
echo "Date      : $(date '+%Y-%m-%d %H:%M:%S %Z')"

log "2. CPU"
echo "Cores     : $(nproc)"
echo "Model     : $(grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2 | xargs)"
echo "Load Avg  : $(cat /proc/loadavg)"

log "3. MEMORY (CRITICAL CHECK)"
free -h
echo ""
echo "--- Swap ---"
swapon --show 2>/dev/null || echo "No swap configured"
echo ""
echo "--- Top memory consumers ---"
ps aux --sort=-%mem | head -15

log "4. DISK"
df -h / /home /tmp 2>/dev/null
echo ""
echo "--- Disk usage in key directories ---"
du -sh /home/* 2>/dev/null || true
du -sh /var/lib/docker 2>/dev/null || echo "Docker dir not found"
du -sh /var/lib/mysql 2>/dev/null || echo "MySQL dir not found"
du -sh /var/lib/postgresql 2>/dev/null || echo "PostgreSQL dir not found"

log "5. NETWORK — Port Check (OpenClaw needs 18789)"
echo "--- Ports in use ---"
ss -tlnp | head -30
echo ""
echo "--- Checking critical ports ---"
for port in 80 443 3000 8000 8080 18789; do
    result=$(ss -tlnp | grep ":${port} " || true)
    if [ -n "$result" ]; then
        echo "  Port $port: IN USE  ← $result"
    else
        echo "  Port $port: FREE ✓"
    fi
done

log "6. NGINX STATUS"
if command -v nginx &>/dev/null; then
    echo "Nginx Version: $(nginx -v 2>&1)"
    echo "Nginx Status : $(systemctl is-active nginx 2>/dev/null || echo 'unknown')"
    echo ""
    echo "--- Existing server blocks ---"
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites-enabled"
    echo ""
    echo "--- Current Nginx config test ---"
    nginx -t 2>&1 || true
else
    echo "Nginx NOT installed"
fi

log "7. NODE.JS & PM2"
echo "--- System Node ---"
if command -v node &>/dev/null; then
    echo "Node Version : $(node --version)"
    echo "Node Path    : $(which node)"
    echo "npm Version  : $(npm --version)"
else
    echo "Node NOT found in system PATH"
fi
echo ""
echo "--- PM2 ---"
if command -v pm2 &>/dev/null; then
    echo "PM2 Version  : $(pm2 --version 2>/dev/null || echo 'unknown')"
    echo ""
    echo "--- PM2 processes ---"
    pm2 list 2>/dev/null || true
else
    echo "PM2 NOT installed"
fi

log "8. DOCKER"
if command -v docker &>/dev/null; then
    echo "Docker Version: $(docker --version)"
    echo "Docker Status : $(systemctl is-active docker 2>/dev/null || echo 'unknown')"
    echo ""
    echo "--- Running containers ---"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
    echo ""
    echo "--- Docker disk usage ---"
    docker system df 2>/dev/null || true
else
    echo "Docker NOT installed"
fi

log "9. SYSTEMD SERVICES (active, custom)"
systemctl list-units --type=service --state=active --no-pager | grep -v "systemd-" | head -25

log "10. USERS & SSH"
echo "--- Users with login shell ---"
grep -v '/nologin\|/false' /etc/passwd | cut -d: -f1,6,7
echo ""
echo "--- Who is logged in ---"
w

log "11. FIREWALL (UFW / iptables)"
if command -v ufw &>/dev/null; then
    echo "UFW Status:"
    ufw status verbose 2>/dev/null || echo "UFW not active"
else
    echo "UFW not installed"
fi
echo ""
echo "--- iptables INPUT rules ---"
iptables -L INPUT -n --line-numbers 2>/dev/null | head -20

log "12. EXISTING WEB DIRECTORIES"
for dir in /var/www /srv/www /home/*/public_html; do
    if [ -d "$dir" ]; then
        echo "--- $dir ---"
        ls -la "$dir" 2>/dev/null | head -10
    fi
done

log "13. DNS CHECK"
echo "--- A record for baotienweb.cloud ---"
dig +short baotienweb.cloud A 2>/dev/null || nslookup baotienweb.cloud 2>/dev/null || echo "dig/nslookup not available"
echo ""
echo "--- A record for openclaw.baotienweb.cloud ---"
dig +short openclaw.baotienweb.cloud A 2>/dev/null || echo "Subdomain not configured yet"

log "14. CERTBOT / SSL"
if command -v certbot &>/dev/null; then
    echo "Certbot Version: $(certbot --version 2>&1 || echo 'unknown')"
    echo ""
    echo "--- Existing certificates ---"
    certbot certificates 2>/dev/null || true
else
    echo "Certbot NOT installed"
fi

log "15. OPENCLAW PRE-FLIGHT SUMMARY"
echo ""

# RAM check
FREE_MB=$(free -m | awk '/Mem:/ {print $7}')
if [ "$FREE_MB" -lt 500 ]; then
    echo "⚠️  RAM CRITICAL: Only ${FREE_MB}MB available — MUST add swap before installing"
elif [ "$FREE_MB" -lt 1024 ]; then
    echo "⚠️  RAM WARNING: ${FREE_MB}MB available — recommend adding 2GB swap"
else
    echo "✅ RAM OK: ${FREE_MB}MB available"
fi

# Port 18789 check
if ss -tlnp | grep -q ":18789 "; then
    echo "❌ PORT 18789 IN USE — must choose different port or free it"
else
    echo "✅ Port 18789 is available"
fi

# User check
if id openclaw &>/dev/null; then
    echo "⚠️  User 'openclaw' already exists"
else
    echo "✅ User 'openclaw' does not exist (will be created)"
fi

# Swap check
if swapon --show 2>/dev/null | grep -q "/"; then
    echo "✅ Swap is configured"
else
    echo "⚠️  NO SWAP — must create swap before installing"
fi

# Nginx check
if systemctl is-active nginx &>/dev/null; then
    echo "✅ Nginx is running"
else
    echo "⚠️  Nginx is NOT running"
fi

echo ""
echo "Survey complete. Review output above before proceeding."
echo "Log saved to: $LOGFILE"
