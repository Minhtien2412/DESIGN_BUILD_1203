#!/bin/bash
#============================================================================
# PERFEX CRM AUTO INSTALLER cho appdesignbuild.com
# Chạy script này trên VPS sau khi SSH vào
# Usage: bash perfex-crm-install.sh
#============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration - THAY ĐỔI CÁC GIÁ TRỊ NÀY
DOMAIN="crm.appdesignbuild.com"
WEB_ROOT="/var/www/$DOMAIN"
DB_NAME="perfex_crm"
DB_USER="perfex_user"
DB_PASS="PerfexCRM@2026Secure!"  # THAY ĐỔI PASSWORD NÀY
PHP_VERSION="8.0"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   PERFEX CRM INSTALLER - appdesignbuild   ${NC}"
echo -e "${BLUE}============================================${NC}"

#============================================================================
# STEP 1: Update system
#============================================================================
echo -e "\n${YELLOW}[1/8] Updating system...${NC}"
apt update && apt upgrade -y

#============================================================================
# STEP 2: Install PHP 8.0
#============================================================================
echo -e "\n${YELLOW}[2/8] Installing PHP $PHP_VERSION...${NC}"

# Add PHP repository
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update

# Install PHP and extensions
apt install -y \
    php${PHP_VERSION} \
    php${PHP_VERSION}-fpm \
    php${PHP_VERSION}-cli \
    php${PHP_VERSION}-common \
    php${PHP_VERSION}-mysql \
    php${PHP_VERSION}-mbstring \
    php${PHP_VERSION}-xml \
    php${PHP_VERSION}-curl \
    php${PHP_VERSION}-zip \
    php${PHP_VERSION}-gd \
    php${PHP_VERSION}-intl \
    php${PHP_VERSION}-bcmath \
    php${PHP_VERSION}-imap \
    php${PHP_VERSION}-soap

# Configure PHP
cat > /etc/php/${PHP_VERSION}/fpm/conf.d/99-perfex.ini << 'EOF'
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
max_input_time = 300
date.timezone = Asia/Ho_Chi_Minh
EOF

systemctl restart php${PHP_VERSION}-fpm
systemctl enable php${PHP_VERSION}-fpm

echo -e "${GREEN}✓ PHP $PHP_VERSION installed${NC}"

#============================================================================
# STEP 3: Create database
#============================================================================
echo -e "\n${YELLOW}[3/8] Creating database...${NC}"

mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✓ Database created: ${DB_NAME}${NC}"
echo -e "${GREEN}  Username: ${DB_USER}${NC}"

#============================================================================
# STEP 4: Create web directory
#============================================================================
echo -e "\n${YELLOW}[4/8] Creating web directory...${NC}"

mkdir -p ${WEB_ROOT}
mkdir -p ${WEB_ROOT}/uploads
mkdir -p ${WEB_ROOT}/application/config

# Create placeholder file
cat > ${WEB_ROOT}/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Perfex CRM - Ready for Installation</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
        .box { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2196F3; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left; }
        code { background: #263238; color: #4CAF50; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="box">
        <h1>🚀 Ready for Perfex CRM</h1>
        <p>Server is configured and ready!</p>
        <div class="info">
            <strong>Next steps:</strong><br>
            1. Upload Perfex CRM files to:<br>
            <code>/var/www/crm.appdesignbuild.com/</code><br><br>
            2. Set permissions:<br>
            <code>chown -R www-data:www-data /var/www/crm.appdesignbuild.com</code><br><br>
            3. Access this URL again to install
        </div>
    </div>
</body>
</html>
EOF

chown -R www-data:www-data ${WEB_ROOT}
chmod -R 755 ${WEB_ROOT}

echo -e "${GREEN}✓ Web directory created: ${WEB_ROOT}${NC}"

#============================================================================
# STEP 5: Configure Nginx
#============================================================================
echo -e "\n${YELLOW}[5/8] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/${DOMAIN} << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    root ${WEB_ROOT};
    index index.php index.html;

    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log /var/log/nginx/${DOMAIN}.error.log;

    client_max_body_size 100M;

    # Perfex CRM rewrite rules
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # PHP processing
    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 256 16k;
    }

    # Security
    location ~ /\.ht { deny all; }
    location ~ /\.git { deny all; }
    location ~ /application { deny all; }

    # Cache static
    location ~* \.(jpg|jpeg|gif|png|css|js|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo -e "${GREEN}✓ Nginx configured for ${DOMAIN}${NC}"

#============================================================================
# STEP 6: Install SSL
#============================================================================
echo -e "\n${YELLOW}[6/8] Installing SSL certificate...${NC}"

apt install -y certbot python3-certbot-nginx

# Attempt SSL (will fail if DNS not configured yet)
echo -e "${YELLOW}Attempting to get SSL certificate...${NC}"
certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@appdesignbuild.com || {
    echo -e "${RED}SSL failed - DNS may not be configured yet${NC}"
    echo -e "${YELLOW}Run later: certbot --nginx -d ${DOMAIN}${NC}"
}

#============================================================================
# STEP 7: Create upload helper script
#============================================================================
echo -e "\n${YELLOW}[7/8] Creating helper scripts...${NC}"

# Script to fix permissions after upload
cat > /root/fix-perfex-permissions.sh << 'EOF'
#!/bin/bash
WEB_ROOT="/var/www/crm.appdesignbuild.com"
chown -R www-data:www-data $WEB_ROOT
chmod -R 755 $WEB_ROOT
chmod -R 777 $WEB_ROOT/uploads
chmod -R 777 $WEB_ROOT/application/config
chmod -R 777 $WEB_ROOT/application/logs
chmod -R 777 $WEB_ROOT/temp
echo "✓ Permissions fixed!"
EOF
chmod +x /root/fix-perfex-permissions.sh

# Backup script
cat > /root/backup-perfex.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/perfex"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/perfex_files_$DATE.tar.gz /var/www/crm.appdesignbuild.com
mysqldump -u perfex_user -p'PerfexCRM@2026Secure!' perfex_crm | gzip > $BACKUP_DIR/perfex_db_$DATE.sql.gz
find $BACKUP_DIR -type f -mtime +30 -delete
echo "✓ Backup completed: $DATE"
EOF
chmod +x /root/backup-perfex.sh

echo -e "${GREEN}✓ Helper scripts created${NC}"

#============================================================================
# STEP 8: Summary
#============================================================================
echo -e "\n${BLUE}============================================${NC}"
echo -e "${GREEN}   ✓ INSTALLATION COMPLETED!${NC}"
echo -e "${BLUE}============================================${NC}"

echo -e "\n${YELLOW}DATABASE CREDENTIALS:${NC}"
echo -e "  Host:     localhost"
echo -e "  Database: ${DB_NAME}"
echo -e "  Username: ${DB_USER}"
echo -e "  Password: ${DB_PASS}"

echo -e "\n${YELLOW}NEXT STEPS:${NC}"
echo -e "1. ${BLUE}Configure DNS:${NC}"
echo -e "   Add A record: crm → [YOUR_VPS_IP]"
echo -e ""
echo -e "2. ${BLUE}Upload Perfex CRM files:${NC}"
echo -e "   Use FTP/SFTP to upload to: ${WEB_ROOT}"
echo -e "   Or use: scp -r perfex/* root@your-vps:${WEB_ROOT}/"
echo -e ""
echo -e "3. ${BLUE}Fix permissions after upload:${NC}"
echo -e "   bash /root/fix-perfex-permissions.sh"
echo -e ""
echo -e "4. ${BLUE}Get SSL (if DNS ready):${NC}"
echo -e "   certbot --nginx -d ${DOMAIN}"
echo -e ""
echo -e "5. ${BLUE}Install Perfex CRM:${NC}"
echo -e "   Visit: https://${DOMAIN}"
echo -e ""
echo -e "${YELLOW}HELPER COMMANDS:${NC}"
echo -e "  Fix permissions:  bash /root/fix-perfex-permissions.sh"
echo -e "  Backup:           bash /root/backup-perfex.sh"
echo -e ""
echo -e "${GREEN}Save these credentials securely!${NC}"
