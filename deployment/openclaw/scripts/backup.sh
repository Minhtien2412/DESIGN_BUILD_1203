#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# OpenClaw Backup Script
# Run as root: bash /opt/openclaw/scripts/backup.sh
# Cron: 0 3 * * * /opt/openclaw/scripts/backup.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

BACKUP_DIR="/opt/openclaw/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/openclaw-backup-${TIMESTAMP}.tar.gz"
MAX_BACKUPS=7

echo "=== OpenClaw Backup — $(date) ==="

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Backup OpenClaw config and data (excluding large session logs and node_modules)
tar czf "$BACKUP_FILE" \
    --exclude='*/node_modules/*' \
    --exclude='*/.nvm/*' \
    --exclude='*/agents/*/sessions/*.jsonl' \
    --exclude='*/sandboxes/*' \
    -C /home/openclaw \
    .openclaw/ \
    .config/systemd/user/openclaw-gateway.service \
    2>/dev/null || true

# Also back up Nginx config
tar rzf "$BACKUP_FILE" \
    -C / \
    etc/nginx/sites-available/openclaw \
    2>/dev/null || true

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Rotate — keep only last N backups
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/openclaw-backup-*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    ls -1t "${BACKUP_DIR}"/openclaw-backup-*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | while read -r old; do
        echo "Removing old backup: $old"
        rm -f "$old"
    done
fi

echo "=== Backup complete. Keeping last $MAX_BACKUPS backups ==="
ls -lh "${BACKUP_DIR}"/openclaw-backup-*.tar.gz 2>/dev/null
