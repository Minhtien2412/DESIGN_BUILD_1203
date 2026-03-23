#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# OpenClaw Full Installation Script
# Run as root: bash /opt/openclaw/scripts/install.sh
#
# This script automates Steps 0-7 of the deployment guide.
# Steps 8-10 (Nginx, SSL, verification) run separately.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

echo "═══════════════════════════════════════════════════════════"
echo "  OpenClaw Installation Script"
echo "  Target: baotienweb.cloud (103.200.20.100)"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Pre-flight checks
if [ "$(id -u)" -ne 0 ]; then
    echo "ERROR: Must run as root"
    exit 1
fi

# -----------------------------------------------------------
echo "Step 0: Swap Space"
echo "-----------------------------------------------------------"
if swapon --show 2>/dev/null | grep -q "/"; then
    echo "  Swap already configured:"
    swapon --show
else
    echo "  Creating 2GB swap file..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    echo "  Swap created and enabled."
fi
echo ""
free -h | head -3
echo ""

# -----------------------------------------------------------
echo "Step 1: Create Dedicated User"
echo "-----------------------------------------------------------"
if id openclaw &>/dev/null; then
    echo "  User 'openclaw' already exists. Skipping creation."
else
    useradd -m -s /bin/bash -c "OpenClaw AI Assistant" openclaw
    echo "  User 'openclaw' created."
fi

loginctl enable-linger openclaw
echo "  Lingering enabled for openclaw user."
echo ""

# -----------------------------------------------------------
echo "Step 2: Create Deployment Directories"
echo "-----------------------------------------------------------"
mkdir -p /opt/openclaw/{scripts,nginx,docs,backups}
chown -R openclaw:openclaw /opt/openclaw
echo "  /opt/openclaw/ structure ready."
echo ""

# -----------------------------------------------------------
echo "Step 3: Install Node.js 22 LTS via nvm"
echo "-----------------------------------------------------------"
su - openclaw << 'NVM_EOF'
set -euo pipefail

# Install nvm if not present
if [ ! -d "$HOME/.nvm" ]; then
    echo "  Installing nvm..."
    curl -so- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
else
    echo "  nvm already installed."
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node 22 if not present
if ! nvm ls 22 &>/dev/null; then
    echo "  Installing Node.js 22 LTS..."
    nvm install 22
fi

nvm alias default 22
nvm use default

echo "  Node: $(node --version)"
echo "  npm:  $(npm --version)"
NVM_EOF
echo ""

# -----------------------------------------------------------
echo "Step 4: Install OpenClaw"
echo "-----------------------------------------------------------"
su - openclaw << 'OC_EOF'
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if already installed
if command -v openclaw &>/dev/null; then
    echo "  OpenClaw already installed: $(openclaw --version)"
    echo "  Updating to latest..."
fi

npm install -g openclaw@latest
echo "  OpenClaw: $(openclaw --version)"
echo "  Path:     $(which openclaw)"
OC_EOF
echo ""

# -----------------------------------------------------------
echo "Step 5: Set Permissions"
echo "-----------------------------------------------------------"
if [ -d /home/openclaw/.openclaw ]; then
    chmod 700 /home/openclaw/.openclaw
    if [ -f /home/openclaw/.openclaw/openclaw.json ]; then
        chmod 600 /home/openclaw/.openclaw/openclaw.json
    fi
    echo "  Permissions secured."
else
    echo "  ~/.openclaw not yet created (will be created by onboarding)."
fi
echo ""

# -----------------------------------------------------------
echo "═══════════════════════════════════════════════════════════"
echo "  Installation Phase Complete!"
echo ""
echo "  NEXT STEPS (manual):"
echo ""
echo "  1. Switch to openclaw user:"
echo "       su - openclaw"
echo ""
echo "  2. Run onboarding wizard:"
echo "       openclaw onboard --install-daemon"
echo "     Choose: mode=local, bind=loopback, auth=token, port=18789"
echo "     SAVE THE TOKEN IT GENERATES!"
echo ""
echo "  3. Edit config:"
echo "       nano ~/.openclaw/openclaw.json"
echo "     Apply the config from the deployment guide."
echo ""
echo "  4. Create .env file:"
echo "       nano ~/.openclaw/.env"
echo "     Set: OPENCLAW_GATEWAY_TOKEN=<your-token>"
echo ""
echo "  5. Start the service:"
echo "       systemctl --user start openclaw-gateway"
echo "       systemctl --user status openclaw-gateway"
echo ""
echo "  6. Exit back to root and configure Nginx:"
echo "       exit"
echo "       cp /opt/openclaw/nginx/openclaw.conf /etc/nginx/sites-available/openclaw"
echo "       ln -s /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/"
echo "       nginx -t && systemctl reload nginx"
echo ""
echo "  7. Run verification:"
echo "       bash /opt/openclaw/scripts/verify.sh"
echo "═══════════════════════════════════════════════════════════"
