#!/bin/bash

# LiveKit Server Deployment Script
# Automates the process of updating LiveKit configuration on server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE="/var/www/thietkeresort-api/.env"
PM2_APP_NAME="thietkeresort-api"
BACKUP_DIR="/var/backups/thietkeresort"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  LiveKit Server Configuration${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if running as root/sudo
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Create backup directory
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        print_status "Creating backup directory..."
        mkdir -p "$BACKUP_DIR"
        chmod 750 "$BACKUP_DIR"
    fi
}

# Backup current .env file
backup_env_file() {
    if [[ -f "$ENV_FILE" ]]; then
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        BACKUP_FILE="$BACKUP_DIR/.env.backup.$TIMESTAMP"
        print_status "Backing up current .env file to $BACKUP_FILE"
        cp "$ENV_FILE" "$BACKUP_FILE"
        chmod 600 "$BACKUP_FILE"
    fi
}

# Check if LiveKit config exists
check_livekit_config() {
    if grep -q "LIVEKIT_URL" "$ENV_FILE" 2>/dev/null; then
        print_warning "LiveKit configuration already exists in .env file"
        read -p "Do you want to update it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Skipping LiveKit configuration update"
            return 1
        fi
    fi
    return 0
}

# Generate new API keys
generate_api_keys() {
    print_status "Generating new LiveKit API keys..."
    
    # Generate API key (lk_api_ + 32 random chars)
    API_KEY="lk_api_$(openssl rand -hex 16)"
    
    # Generate API secret (64 random chars)
    API_SECRET="$(openssl rand -hex 32)"
    
    print_status "Generated new API credentials"
    echo "  API Key: $API_KEY"
    echo "  Secret:  ${API_SECRET:0:20}..." # Show only first 20 chars for security
}

# Update .env file with LiveKit configuration
update_env_file() {
    print_status "Updating .env file with LiveKit configuration..."
    
    # Remove existing LiveKit config if present
    sed -i '/^LIVEKIT_/d' "$ENV_FILE" 2>/dev/null || true
    
    # Add new LiveKit configuration
    cat >> "$ENV_FILE" << EOF

# LiveKit Configuration - Added $(date)
LIVEKIT_URL=http://127.0.0.1:7880
LIVEKIT_API_KEY=$API_KEY
LIVEKIT_API_SECRET=$API_SECRET
EOF

    print_status "LiveKit configuration added to .env file"
}

# Set proper file permissions
set_permissions() {
    print_status "Setting proper file permissions..."
    chown www-data:www-data "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    
    # Verify permissions
    PERMS=$(stat -c "%a" "$ENV_FILE")
    OWNER=$(stat -c "%U:%G" "$ENV_FILE")
    print_status "File permissions set: $PERMS ($OWNER)"
}

# Restart PM2 process
restart_pm2() {
    print_status "Restarting PM2 process..."
    
    # Check if PM2 process exists
    if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
        pm2 restart "$PM2_APP_NAME" --update-env
        print_status "PM2 process restarted successfully"
        
        # Wait a moment for startup
        sleep 3
        
        # Show process status
        pm2 status "$PM2_APP_NAME"
    else
        print_error "PM2 process '$PM2_APP_NAME' not found"
        print_status "Available PM2 processes:"
        pm2 list
        return 1
    fi
}

# Verify configuration
verify_config() {
    print_status "Verifying LiveKit configuration..."
    
    # Check if environment variables are loaded
    ENV_CHECK=$(pm2 show "$PM2_APP_NAME" | grep -E "LIVEKIT_" || true)
    
    if [[ -n "$ENV_CHECK" ]]; then
        print_status "✅ LiveKit environment variables detected in PM2"
    else
        print_warning "⚠️  LiveKit environment variables not visible in PM2"
    fi
    
    # Show recent logs
    print_status "Recent application logs:"
    pm2 logs "$PM2_APP_NAME" --lines 10 --nostream
}

# Main execution
main() {
    print_header
    
    # Pre-flight checks
    check_permissions
    create_backup_dir
    
    # Backup and configuration
    backup_env_file
    
    if check_livekit_config; then
        generate_api_keys
        update_env_file
        set_permissions
        restart_pm2
        verify_config
        
        print_status "✅ LiveKit configuration completed successfully!"
        echo
        print_status "🔑 Your new API credentials:"
        echo "    API Key: $API_KEY"
        echo "    Secret:  ${API_SECRET:0:20}... (truncated for security)"
        echo
        print_status "📝 Configuration saved to: $ENV_FILE"
        print_status "💾 Backup saved to: $BACKUP_DIR"
        
        # Security reminder
        echo
        print_warning "🛡️  Security Reminders:"
        echo "    • Keep these credentials secure"
        echo "    • Don't share them in chat/email"
        echo "    • Rotate them periodically"
        echo "    • Monitor access logs"
    fi
}

# Run main function
main "$@"