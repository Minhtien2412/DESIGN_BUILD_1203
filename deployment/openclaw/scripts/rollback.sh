#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# OpenClaw Rollback Script
# Run as root: bash /opt/openclaw/scripts/rollback.sh [--full]
#
# Without flags: stops service, preserves data
# --full:        removes user, home dir, everything
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

FULL_REMOVAL=false
if [ "${1:-}" = "--full" ]; then
    FULL_REMOVAL=true
fi

echo "═══════════════════════════════════════════════════════════"
echo "  OpenClaw Rollback Script"
echo "  Mode: $(if $FULL_REMOVAL; then echo 'FULL REMOVAL'; else echo 'Stop & Disable'; fi)"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════"
echo ""

# -----------------------------------------------------------
echo "Step 1: Stop OpenClaw Gateway Service"
echo "-----------------------------------------------------------"
if id openclaw &>/dev/null; then
    su - openclaw -c 'systemctl --user stop openclaw-gateway 2>/dev/null || true'
    su - openclaw -c 'systemctl --user disable openclaw-gateway 2>/dev/null || true'
    echo "  Service stopped and disabled."
else
    echo "  User openclaw does not exist. Skipping."
fi

# -----------------------------------------------------------
echo ""
echo "Step 2: Remove Nginx Config"
echo "-----------------------------------------------------------"
if [ -L /etc/nginx/sites-enabled/openclaw ]; then
    rm /etc/nginx/sites-enabled/openclaw
    echo "  Removed symlink from sites-enabled."
fi
if [ -f /etc/nginx/sites-available/openclaw ]; then
    rm /etc/nginx/sites-available/openclaw
    echo "  Removed config from sites-available."
fi

# Reload Nginx if it's running
if systemctl is-active nginx &>/dev/null; then
    nginx -t 2>/dev/null && systemctl reload nginx
    echo "  Nginx reloaded."
fi

if ! $FULL_REMOVAL; then
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  Rollback complete (soft mode)"
    echo "  - Gateway service stopped and disabled"
    echo "  - Nginx config removed"
    echo "  - User 'openclaw' and data preserved"
    echo ""
    echo "  To restart later:"
    echo "    su - openclaw -c 'systemctl --user start openclaw-gateway'"
    echo ""
    echo "  For FULL removal, run:"
    echo "    bash /opt/openclaw/scripts/rollback.sh --full"
    echo "═══════════════════════════════════════════════════════════"
    exit 0
fi

# -----------------------------------------------------------
echo ""
echo "Step 3: Create Final Backup"
echo "-----------------------------------------------------------"
BACKUP_DIR="/opt/openclaw/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${BACKUP_DIR}/openclaw-prerollback-$(date +%Y%m%d-%H%M%S).tar.gz"

if [ -d /home/openclaw ]; then
    tar czf "$BACKUP_FILE" \
        --exclude='*/node_modules/*' \
        --exclude='*/.nvm/*' \
        -C /home/openclaw . 2>/dev/null || true
    echo "  Backup saved: $BACKUP_FILE"
else
    echo "  No home directory to backup."
fi

# -----------------------------------------------------------
echo ""
echo "Step 4: Disable User Lingering"
echo "-----------------------------------------------------------"
if id openclaw &>/dev/null; then
    loginctl disable-linger openclaw 2>/dev/null || true
    echo "  Lingering disabled."
fi

# -----------------------------------------------------------
echo ""
echo "Step 5: Remove User and Home Directory"
echo "-----------------------------------------------------------"
if id openclaw &>/dev/null; then
    # Kill any remaining processes
    pkill -u openclaw 2>/dev/null || true
    sleep 2

    userdel -r openclaw 2>/dev/null || true
    echo "  User 'openclaw' and home directory removed."
else
    echo "  User 'openclaw' does not exist."
fi

# -----------------------------------------------------------
echo ""
echo "Step 6: Verify Cleanup"
echo "-----------------------------------------------------------"

# Check user removed
if id openclaw &>/dev/null; then
    echo "  ⚠️  User 'openclaw' still exists"
else
    echo "  ✅ User 'openclaw' removed"
fi

# Check port freed
if ss -tlnp | grep -q ":18789 "; then
    echo "  ⚠️  Port 18789 still in use"
else
    echo "  ✅ Port 18789 freed"
fi

# Check Nginx healthy
if nginx -t 2>&1 | grep -q "successful"; then
    echo "  ✅ Nginx config valid"
else
    echo "  ⚠️  Nginx config issue — check manually"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  FULL ROLLBACK COMPLETE"
echo ""
echo "  Data preserved at:"
echo "    $BACKUP_FILE"
echo "    /opt/openclaw/ (deployment scripts retained)"
echo ""
echo "  Swap file NOT removed (may be useful for other services)."
echo "  To remove swap: swapoff /swapfile && rm /swapfile"
echo "  Then edit /etc/fstab to remove the swap line."
echo "═══════════════════════════════════════════════════════════"
