# OpenClaw Rollback Guide

## Rollback Levels

### Level 1 — Stop Only (Preserve Data)

```bash
# As root:
bash /opt/openclaw/scripts/rollback.sh
```

This stops the gateway service and removes the Nginx config.
User `openclaw` and all data are preserved. You can restart later.

### Level 2 — Full Removal

```bash
# As root:
bash /opt/openclaw/scripts/rollback.sh --full
```

This creates a final backup, then removes the user and all data.

### Level 3 — Manual Step-by-Step

#### 3.1 Stop Service

```bash
su - openclaw -c 'systemctl --user stop openclaw-gateway'
su - openclaw -c 'systemctl --user disable openclaw-gateway'
```

#### 3.2 Remove Nginx Config

```bash
rm -f /etc/nginx/sites-enabled/openclaw
rm -f /etc/nginx/sites-available/openclaw
nginx -t && systemctl reload nginx
```

#### 3.3 Backup Before Removal

```bash
tar czf /opt/openclaw/backups/openclaw-final-$(date +%Y%m%d).tar.gz \
    -C /home/openclaw .openclaw/ .config/systemd/
```

#### 3.4 Disable Lingering

```bash
loginctl disable-linger openclaw
```

#### 3.5 Remove User

```bash
pkill -u openclaw 2>/dev/null || true
sleep 2
userdel -r openclaw
```

#### 3.6 Clean Up Swap (Optional)

Only if you added swap exclusively for OpenClaw:

```bash
swapoff /swapfile
rm /swapfile
sed -i '/swapfile/d' /etc/fstab
```

#### 3.7 Verify

```bash
# User gone
id openclaw 2>/dev/null && echo "STILL EXISTS" || echo "REMOVED ✓"

# Port freed
ss -tlnp | grep 18789 && echo "STILL LISTENING" || echo "FREED ✓"

# Nginx healthy
nginx -t

# Existing services unaffected
pm2 list
docker ps
```

## Restore from Backup

```bash
# List available backups
ls -lh /opt/openclaw/backups/

# Recreate user
useradd -m -s /bin/bash openclaw
loginctl enable-linger openclaw

# Restore data
tar xzf /opt/openclaw/backups/openclaw-backup-YYYYMMDD-HHMMSS.tar.gz \
    -C /home/openclaw/
chown -R openclaw:openclaw /home/openclaw/.openclaw

# Reinstall Node + OpenClaw and start service
# Follow Steps 3-7 in the main README.md
```

## Emergency: VPS is Unresponsive

If the VPS becomes unresponsive after OpenClaw installation:

1. **Reboot via hosting panel** (VPS control panel at your provider)
2. SSH in immediately after boot
3. Check if OpenClaw auto-started: `ss -tlnp | grep 18789`
4. If memory is the issue, stop OpenClaw first:
   ```bash
   pkill -f "openclaw gateway"
   ```
5. Run soft rollback: `bash /opt/openclaw/scripts/rollback.sh`
6. Check other services: `pm2 list && docker ps`
