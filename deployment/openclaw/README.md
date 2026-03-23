# OpenClaw Deployment Guide — Production VPS

> **Target VPS**: root@baotienweb.cloud (103.200.20.100)
> **OpenClaw Version**: 2026.3.13+
> **Date**: 2025-06-13
> **Author**: DevOps / AI Infra Engineer

---

## ⚠️ CRITICAL WARNING — RAM CONSTRAINT

Your VPS has **~7 GB / 8 GB RAM in use**. Only ~1 GB is free.
OpenClaw Gateway is lightweight (~100-200 MB), but you MUST:

1. Add swap space (2 GB recommended) as safety net
2. Monitor memory during and after installation
3. **DO NOT use Docker approach** — Docker build requires 2+ GB RAM and will likely OOM

**Recommended approach: Native npm install with dedicated user (isolated)**

---

## PART A — Architecture Assessment

### Current VPS Services (Expected)

| Service          | Status  | Risk if Disrupted                     |
| ---------------- | ------- | ------------------------------------- |
| Nginx            | Running | HIGH — reverse proxy for all services |
| PM2 + Node.js    | Running | HIGH — production APIs                |
| Docker           | Running | MEDIUM — containerized services       |
| PostgreSQL/MySQL | Running | HIGH — databases                      |
| SSH              | Running | CRITICAL — only access method         |

### OpenClaw Architecture on VPS

```
┌─────────────────────────────────────────────────────────────────┐
│                        VPS (103.200.20.100)                     │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────────────────────────┐   │
│  │   Nginx      │    │  Existing Services (PM2, Docker...)  │   │
│  │   (port 80/  │    │  ← DO NOT TOUCH                     │   │
│  │    443)      │    └──────────────────────────────────────┘   │
│  │              │                                               │
│  │  /openclaw   │───▶ ┌─────────────────────────────────┐      │
│  │  subdomain   │     │  OpenClaw Gateway                │      │
│  │              │     │  Port: 18789 (loopback only)     │      │
│  └──────────────┘     │  User: openclaw (dedicated)      │      │
│                       │  Node: 22 LTS (via nvm, isolated)│      │
│                       │  Config: ~/.openclaw/openclaw.json│      │
│                       │  Health: /healthz, /readyz       │      │
│                       └─────────────────────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  /opt/openclaw/  — deployment scripts, backups, docs    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Comparison Table: Direct Install vs Isolated Install

| Criteria                  | Direct Install (root)      | Isolated Install (dedicated user) |
| ------------------------- | -------------------------- | --------------------------------- |
| **Node.js version**       | Uses system Node           | Separate Node via nvm             |
| **Isolation**             | ❌ Shares root environment | ✅ Dedicated `openclaw` user      |
| **Risk to existing apps** | ⚠️ HIGH — npm conflicts    | ✅ LOW — completely separate      |
| **Rollback difficulty**   | ⚠️ Hard — mixed with root  | ✅ Easy — delete user & home dir  |
| **File permissions**      | ❌ Root owns everything    | ✅ Proper ownership model         |
| **Security**              | ❌ Gateway runs as root    | ✅ Least-privilege principle      |
| **Systemd service**       | System-level               | User-level (lingering)            |
| **Maintenance**           | ⚠️ Updates affect system   | ✅ Independent package management |
| **Recommended**           | ❌ NO                      | ✅ **YES — USE THIS**             |

**Decision: Isolated Install with dedicated `openclaw` user**

---

## PART B — Directory Structure

### User Home (~openclaw)

```
/home/openclaw/
├── .nvm/                          # Node Version Manager (isolated Node 22+)
├── .openclaw/                     # OpenClaw data directory (auto-created)
│   ├── openclaw.json              # Main config (JSON5)
│   ├── .env                       # Environment variables (API keys)
│   ├── workspace/                 # Agent workspace
│   ├── credentials/               # Channel credentials
│   ├── agents/                    # Agent data + sessions
│   │   └── main/
│   │       ├── agent/
│   │       │   ├── auth-profiles.json
│   │       │   └── models.json
│   │       └── sessions/
│   └── extensions/                # Installed plugins
├── .config/
│   └── systemd/
│       └── user/
│           └── openclaw-gateway.service  # Systemd user service
└── .bashrc                        # nvm init + PATH
```

### Deployment Scripts (/opt/openclaw/)

```
/opt/openclaw/
├── README.md                      # This guide (for reference on server)
├── scripts/
│   ├── survey.sh                  # VPS survey script
│   ├── install.sh                 # Main installation script
│   ├── verify.sh                  # Post-deployment verification
│   ├── backup.sh                  # Backup script
│   └── rollback.sh                # Emergency rollback
├── nginx/
│   └── openclaw.conf              # Nginx reverse proxy config
├── docs/
│   └── checklist.txt              # Verification checklist
└── backups/                       # Backup storage
```

---

## PART C — VPS Survey Script

Run this **BEFORE** installation to understand your VPS state:

```bash
# Copy to server and run:
scp deployment/openclaw/scripts/survey.sh root@baotienweb.cloud:/tmp/
ssh root@baotienweb.cloud 'bash /tmp/survey.sh'
```

See [scripts/survey.sh](scripts/survey.sh) for the full script.

---

## PART D — Installation Steps (Copy-Paste Ready)

### Step 0: Add Swap Space (CRITICAL — only ~1 GB free RAM)

```bash
# Check if swap already exists
swapon --show

# Create 2 GB swap file
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Verify
free -h
```

### Step 1: Create Dedicated User

```bash
# Create openclaw user with home directory
useradd -m -s /bin/bash -c "OpenClaw AI Assistant" openclaw

# Set password (for emergency login)
passwd openclaw

# Allow lingering systemd services (runs after logout)
loginctl enable-linger openclaw
```

### Step 2: Create Deployment Directory

```bash
# Create /opt/openclaw owned by openclaw user
mkdir -p /opt/openclaw/{scripts,nginx,docs,backups}
chown -R openclaw:openclaw /opt/openclaw
```

### Step 3: Install Node.js 22 LTS via nvm (as openclaw user)

```bash
# Switch to openclaw user
su - openclaw

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node 22 LTS (minimum for OpenClaw)
nvm install 22
nvm alias default 22
nvm use default

# Verify
node --version   # Should be v22.x.x
npm --version
```

### Step 4: Install OpenClaw

```bash
# Still as openclaw user
npm install -g openclaw@latest

# Verify installation
openclaw --version
which openclaw
```

### Step 5: Run Onboarding Wizard

```bash
# Interactive onboarding — installs systemd daemon
openclaw onboard --install-daemon
```

During onboarding, choose:

- **Mode**: `local`
- **Bind**: `loopback` (we'll use Nginx as reverse proxy)
- **Auth**: `token` (save the generated token!)
- **Port**: `18789` (default)

### Step 6: Configure OpenClaw

After onboarding, edit the config:

```bash
# Edit config (JSON5 format — comments allowed)
nano ~/.openclaw/openclaw.json
```

Apply the minimal secure config (see [Part E: Config Files](#part-e--config-files) below).

### Step 7: Install Systemd Service (if not done by onboarding)

```bash
# Create systemd user directory
mkdir -p ~/.config/systemd/user/

# Copy service file (see Part E for content)
# Then reload and enable
systemctl --user daemon-reload
systemctl --user enable openclaw-gateway
systemctl --user start openclaw-gateway
systemctl --user status openclaw-gateway

# Exit back to root
exit
```

### Step 8: Configure Nginx Reverse Proxy (as root)

```bash
# Copy nginx config
cp /opt/openclaw/nginx/openclaw.conf /etc/nginx/sites-available/openclaw
ln -s /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

### Step 9: SSL Certificate (as root)

```bash
# If using standalone subdomain:
certbot --nginx -d openclaw.baotienweb.cloud

# Or if already have wildcard:
# SSL is already configured
```

### Step 10: Verify Everything

```bash
# Run verification script
bash /opt/openclaw/scripts/verify.sh
```

---

## PART E — Config Files

### openclaw.json (Minimal Secure Config)

```json5
// ~/.openclaw/openclaw.json
// OpenClaw Gateway — Production Config for baotienweb.cloud
{
  gateway: {
    mode: "local",
    port: 18789,
    bind: "loopback",
    auth: {
      mode: "token",
      token: "${OPENCLAW_GATEWAY_TOKEN}",
      rateLimit: {
        maxAttempts: 10,
        windowMs: 60000,
        lockoutMs: 300000,
        exemptLoopback: true,
      },
    },
    trustedProxies: ["127.0.0.1"],
    controlUi: {
      enabled: true,
    },
  },

  session: {
    dmScope: "per-channel-peer",
    reset: {
      mode: "daily",
      atHour: 4,
    },
  },

  tools: {
    profile: "coding",
    deny: ["gateway", "cron"],
    elevated: { enabled: false },
  },

  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-sonnet-4-6",
      },
      workspace: "~/.openclaw/workspace",
      userTimezone: "Asia/Ho_Chi_Minh",
    },
  },

  discovery: {
    mdns: { mode: "off" },
  },

  logging: {
    level: "info",
    file: "~/.openclaw/logs/openclaw.log",
    redactSensitive: "tools",
  },
}
```

### .env (Environment Variables)

```bash
# ~/.openclaw/.env
# Generate a strong random token:
#   openssl rand -hex 32
OPENCLAW_GATEWAY_TOKEN=REPLACE_WITH_GENERATED_TOKEN

# AI Provider API Keys (add as needed)
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# OPENROUTER_API_KEY=sk-or-...
```

### Systemd Service File

See [scripts/openclaw-gateway.service](scripts/openclaw-gateway.service).

### Nginx Config

See [nginx/openclaw.conf](nginx/openclaw.conf).

---

## PART F — Verification Checklist

See [docs/checklist.txt](docs/checklist.txt) for the full checklist.

Quick verification:

```bash
# 1. Check process is running
systemctl --user status openclaw-gateway

# 2. Check health endpoint
curl -s http://127.0.0.1:18789/healthz

# 3. Check readiness
curl -s http://127.0.0.1:18789/readyz

# 4. Check Nginx proxy (if SSL configured)
curl -s https://openclaw.baotienweb.cloud/healthz

# 5. Check memory impact
free -h
```

---

## PART G — Rollback Procedures

See [scripts/rollback.sh](scripts/rollback.sh) for automated rollback.

### Manual Rollback (Nuclear Option)

```bash
# As root — complete removal in reverse order

# 1. Remove Nginx config
rm /etc/nginx/sites-enabled/openclaw
rm /etc/nginx/sites-available/openclaw
nginx -t && systemctl reload nginx

# 2. Stop and disable service (as openclaw user)
su - openclaw -c 'systemctl --user stop openclaw-gateway'
su - openclaw -c 'systemctl --user disable openclaw-gateway'

# 3. Disable lingering
loginctl disable-linger openclaw

# 4. Backup data before deletion
tar czf /opt/openclaw/backups/openclaw-home-$(date +%Y%m%d).tar.gz /home/openclaw/

# 5. Remove user and home directory
userdel -r openclaw

# 6. Remove deployment directory (optional — keep for backups)
# rm -rf /opt/openclaw

# 7. Remove swap (only if you added it just for OpenClaw)
# swapoff /swapfile
# rm /swapfile
# sed -i '/swapfile/d' /etc/fstab
```

---

## Quick Deploy (Complete Copy-Paste Block)

**WARNING**: Read the full guide first. This is the condensed version.

```bash
#!/bin/bash
# Quick Deploy OpenClaw — Run as root on baotienweb.cloud
set -euo pipefail

echo "=== Step 0: Add Swap ==="
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
echo "Swap: $(swapon --show | tail -1)"

echo "=== Step 1: Create User ==="
id openclaw &>/dev/null || useradd -m -s /bin/bash -c "OpenClaw AI" openclaw
loginctl enable-linger openclaw

echo "=== Step 2: Create Directories ==="
mkdir -p /opt/openclaw/{scripts,nginx,docs,backups}
chown -R openclaw:openclaw /opt/openclaw

echo "=== Step 3-4: Install Node + OpenClaw (as openclaw user) ==="
su - openclaw << 'INSTALL_EOF'
set -euo pipefail

# Install nvm if not present
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node 22 LTS
nvm install 22
nvm alias default 22
nvm use default

# Install OpenClaw
npm install -g openclaw@latest

echo "Node: $(node --version)"
echo "OpenClaw: $(openclaw --version)"
echo ""
echo "=== NEXT STEPS (manual) ==="
echo "1. Run: openclaw onboard --install-daemon"
echo "2. Choose: mode=local, bind=loopback, auth=token, port=18789"
echo "3. Edit: ~/.openclaw/openclaw.json (see deployment guide)"
echo "4. Edit: ~/.openclaw/.env (add OPENCLAW_GATEWAY_TOKEN)"
echo "5. Start: systemctl --user start openclaw-gateway"
INSTALL_EOF

echo ""
echo "=== User 'openclaw' created, Node + OpenClaw installed ==="
echo "=== Now switch to openclaw user and run onboarding: ==="
echo "    su - openclaw"
echo "    openclaw onboard --install-daemon"
```

---

## Access Methods

### Method 1: SSH Tunnel (Recommended for initial setup)

```bash
# From your local machine:
ssh -N -L 18789:127.0.0.1:18789 root@baotienweb.cloud
# Then open: http://127.0.0.1:18789/
# Paste your gateway token when prompted
```

### Method 2: Nginx Reverse Proxy (After SSL setup)

```
https://openclaw.baotienweb.cloud/
```

---

## Monitoring & Maintenance

### Check Status

```bash
su - openclaw -c 'systemctl --user status openclaw-gateway'
```

### View Logs

```bash
su - openclaw -c 'tail -f ~/.openclaw/logs/openclaw.log'
# Or gateway journal:
su - openclaw -c 'journalctl --user -u openclaw-gateway -f'
```

### Update OpenClaw

```bash
su - openclaw << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm update -g openclaw@latest
systemctl --user restart openclaw-gateway
openclaw --version
EOF
```

### Security Audit

```bash
su - openclaw << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
openclaw security audit
EOF
```

### Backup

```bash
bash /opt/openclaw/scripts/backup.sh
```
