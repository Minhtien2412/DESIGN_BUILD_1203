# Hướng Dẫn Cài Đặt Perfex CRM

## Tổng Quan

Perfex CRM sẽ được cài đặt tại subdomain `crm.appdesignbuild.com` và dùng chung database với app hiện tại để đồng bộ dữ liệu.

## Bước 1: Chuẩn Bị Cấu Trúc Thư Mục

### 1.1. Tạo thư mục cho Perfex CRM

```bash
# SSH vào VPS
ssh root@appdesignbuild.com

# Tạo thư mục
mkdir -p /var/www/crm.appdesignbuild.com
cd /var/www/crm.appdesignbuild.com

# Set quyền
chown -R www-data:www-data /var/www/crm.appdesignbuild.com
chmod -R 755 /var/www/crm.appdesignbuild.com
```

### 1.2. Cấu trúc thư mục đề xuất

```
/var/www/
├── appdesignbuild.com/          # App chính
├── crm.appdesignbuild.com/      # Perfex CRM
│   ├── application/
│   ├── assets/
│   ├── modules/
│   ├── uploads/
│   └── ...
└── api.appdesignbuild.com/      # API Backend hiện tại
```

## Bước 2: Cấu Hình Database

### 2.1. Tạo Database và User (nếu chưa có)

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database cho CRM (hoặc dùng chung với app)
CREATE DATABASE IF NOT EXISTS perfex_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Tạo user cho CRM
CREATE USER 'perfex_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

# Cấp quyền
GRANT ALL PRIVILEGES ON perfex_crm.* TO 'perfex_user'@'localhost';
FLUSH PRIVILEGES;

# Hoặc nếu muốn dùng chung database với app hiện tại:
# Chỉ cần cấp quyền cho database hiện có
GRANT ALL PRIVILEGES ON existing_app_db.* TO 'perfex_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### 2.2. Thông tin Database

```
Database Name: perfex_crm (hoặc dùng chung với app)
Username: perfex_user
Password: your_strong_password_here
Host: localhost
Port: 3306
```

## Bước 3: Cài Đặt PHP 8.0

### 3.1. Cài đặt PHP 8.0 và Extensions

```bash
# Update repository
apt update
apt upgrade -y

# Thêm repository PHP
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update

# Cài PHP 8.0 và extensions cần thiết cho Perfex CRM
apt install -y php8.0 php8.0-fpm php8.0-cli php8.0-common \
  php8.0-mysql php8.0-mbstring php8.0-xml php8.0-curl \
  php8.0-zip php8.0-gd php8.0-intl php8.0-bcmath \
  php8.0-imap php8.0-soap php8.0-xmlrpc

# Kiểm tra version
php -v
```

### 3.2. Cấu hình PHP cho Perfex CRM

```bash
# Chỉnh sửa php.ini
nano /etc/php/8.0/fpm/php.ini

# Tìm và chỉnh các dòng sau:
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
max_input_time = 300
date.timezone = Asia/Ho_Chi_Minh

# Khởi động lại PHP-FPM
systemctl restart php8.0-fpm
systemctl enable php8.0-fpm
```

## Bước 4: Cấu Hình Nginx cho Subdomain

### 4.1. Tạo file cấu hình Nginx

```bash
nano /etc/nginx/sites-available/crm.appdesignbuild.com
```

### 4.2. Nội dung cấu hình Nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name crm.appdesignbuild.com;

    root /var/www/crm.appdesignbuild.com;
    index index.php index.html index.htm;

    # Logging
    access_log /var/log/nginx/crm.appdesignbuild.com.access.log;
    error_log /var/log/nginx/crm.appdesignbuild.com.error.log;

    # Client body size
    client_max_body_size 100M;

    # Main location
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM configuration
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_intercept_errors on;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 256 16k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
        fastcgi_read_timeout 300;
    }

    # Security headers
    location ~ /\.ht {
        deny all;
    }

    location ~ /\.git {
        deny all;
    }

    # Cache static files
    location ~* \.(jpg|jpeg|gif|png|css|js|ico|xml|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### 4.3. Enable site và reload Nginx

```bash
# Tạo symbolic link
ln -s /etc/nginx/sites-available/crm.appdesignbuild.com /etc/nginx/sites-enabled/

# Kiểm tra cấu hình
nginx -t

# Reload Nginx
systemctl reload nginx
systemctl restart nginx
```

## Bước 5: Cài Đặt SSL (Let's Encrypt)

```bash
# Cài Certbot
apt install -y certbot python3-certbot-nginx

# Tạo SSL certificate
certbot --nginx -d crm.appdesignbuild.com

# Auto-renew (đã tự động với certbot)
certbot renew --dry-run
```

## Bước 6: Upload và Cài Đặt Perfex CRM

### 6.1. Download Perfex CRM

```bash
cd /tmp

# Download Perfex CRM (giả sử bạn đã có file zip)
# Hoặc upload từ máy local qua FTP/SFTP
# wget https://your-perfex-download-link/perfex.zip

# Giải nén vào thư mục CRM
unzip perfex.zip -d /var/www/crm.appdesignbuild.com/

# Set quyền
chown -R www-data:www-data /var/www/crm.appdesignbuild.com
chmod -R 755 /var/www/crm.appdesignbuild.com
chmod -R 777 /var/www/crm.appdesignbuild.com/uploads
chmod -R 777 /var/www/crm.appdesignbuild.com/application/config
```

### 6.2. Cài đặt qua Web Interface

1. Truy cập: `https://crm.appdesignbuild.com`
2. Follow hướng dẫn cài đặt
3. Điền thông tin database:
   - Database Host: localhost
   - Database Name: perfex_crm
   - Database User: perfex_user
   - Database Password: your_strong_password_here

## Bước 7: Đồng Bộ Database với App

### 7.1. Chiến lược đồng bộ

**Option A: Dùng chung database**

```sql
-- Perfex CRM và App sẽ dùng chung 1 database
-- Tables của Perfex có prefix: tblprojects_, tblclients_, etc.
-- Tables của App có prefix: app_products, app_users, etc.

-- Không bị xung đột vì prefix khác nhau
```

**Option B: 2 Database riêng + API sync**

```
App Database (app_db) ←→ API Backend ←→ CRM Database (perfex_crm)
```

### 7.2. Tạo API Sync giữa App và CRM

Tạo file trong backend để sync dữ liệu:

```javascript
// BE-baotienweb.cloud/src/routes/crm-sync.js
const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// Connection pools
const appDB = mysql.createPool({
  host: "localhost",
  user: "app_user",
  password: "app_password",
  database: "app_database",
});

const crmDB = mysql.createPool({
  host: "localhost",
  user: "perfex_user",
  password: "your_strong_password_here",
  database: "perfex_crm",
});

// Sync products từ CRM sang App
router.post("/sync-products-from-crm", async (req, res) => {
  try {
    // Lấy products từ Perfex CRM
    const [crmProducts] = await crmDB.query(`
      SELECT * FROM tblinvoiceitems WHERE active = 1
    `);

    // Sync vào App database
    for (const product of crmProducts) {
      await appDB.query(
        `
        INSERT INTO app_products (name, price, description, created_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        price = VALUES(price),
        description = VALUES(description)
      `,
        [product.description, product.rate, product.long_description],
      );
    }

    res.json({ success: true, synced: crmProducts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync orders từ App sang CRM
router.post("/sync-orders-to-crm", async (req, res) => {
  try {
    const [appOrders] = await appDB.query(`
      SELECT * FROM app_orders WHERE synced_to_crm = 0
    `);

    for (const order of appOrders) {
      // Tạo invoice trong Perfex CRM
      await crmDB.query(
        `
        INSERT INTO tblinvoices (clientid, number, date, duedate, total)
        VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), ?)
      `,
        [order.customer_id, order.order_number, order.total],
      );

      // Đánh dấu đã sync
      await appDB.query(
        `
        UPDATE app_orders SET synced_to_crm = 1 WHERE id = ?
      `,
        [order.id],
      );
    }

    res.json({ success: true, synced: appOrders.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 7.3. Cấu hình Webhook trong Perfex CRM

Tạo file trong Perfex CRM để gọi API khi có thay đổi:

```php
// /var/www/crm.appdesignbuild.com/application/hooks/product_webhook.php
<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Product_webhook {
    protected $ci;

    public function __construct() {
        $this->ci =& get_instance();
        $this->ci->load->library('App_db_helper');
    }

    public function after_product_update($product_id) {
        // Gọi API để sync sản phẩm về App
        $api_url = 'https://api.appdesignbuild.com/api/crm-sync/sync-products-from-crm';

        $ch = curl_init($api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-API-Key: your-api-key-here'
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        log_activity('Product synced to app: ' . $product_id);
    }
}
```

## Bước 8: Cấu Hình DNS

```bash
# Thêm A record cho subdomain tại DNS provider
# Type: A
# Name: crm
# Value: [IP của VPS]
# TTL: 3600
```

Hoặc nếu dùng Cloudflare:

1. Đăng nhập Cloudflare
2. Chọn domain appdesignbuild.com
3. DNS → Add record
   - Type: A
   - Name: crm
   - IPv4 address: [IP VPS]
   - Proxy status: Proxied (cam)

## Bước 9: Kiểm Tra và Test

### 9.1. Checklist

```bash
# 1. Kiểm tra PHP-FPM
systemctl status php8.0-fpm

# 2. Kiểm tra Nginx
systemctl status nginx
nginx -t

# 3. Kiểm tra MySQL
mysql -u perfex_user -p perfex_crm

# 4. Kiểm tra quyền thư mục
ls -la /var/www/crm.appdesignbuild.com/

# 5. Kiểm tra DNS
nslookup crm.appdesignbuild.com

# 6. Kiểm tra SSL
curl -I https://crm.appdesignbuild.com
```

### 9.2. Test URLs

- Frontend App: `https://appdesignbuild.com`
- API Backend: `https://api.appdesignbuild.com`
- Perfex CRM: `https://crm.appdesignbuild.com`

## Bước 10: Bảo Mật

### 10.1. Firewall

```bash
# UFW firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 10.2. Bảo vệ Admin Panel

```nginx
# Thêm vào nginx config
location /admin {
    # Whitelist IP (optional)
    allow YOUR_IP_ADDRESS;
    deny all;

    try_files $uri $uri/ /index.php?$query_string;
}
```

### 10.3. Backup định kỳ

```bash
# Tạo script backup
nano /root/backup-crm.sh
```

```bash
#!/bin/bash
# Backup Perfex CRM

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/crm"
CRM_DIR="/var/www/crm.appdesignbuild.com"
DB_NAME="perfex_crm"
DB_USER="perfex_user"
DB_PASS="your_strong_password_here"

mkdir -p $BACKUP_DIR

# Backup files
tar -czf $BACKUP_DIR/crm_files_$DATE.tar.gz $CRM_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/crm_db_$DATE.sql.gz

# Xóa backup cũ hơn 30 ngày
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Set quyền và tạo cron job
chmod +x /root/backup-crm.sh
crontab -e

# Thêm dòng: backup mỗi ngày lúc 2AM
0 2 * * * /root/backup-crm.sh
```

## Tóm Tắt Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    appdesignbuild.com                        │
│                    (Main Domain - VPS)                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌──────────────────┐   ┌──────────────┐
│   Frontend    │   │   API Backend    │   │  Perfex CRM  │
│  React Native │   │   Node.js/       │   │     PHP      │
│   Expo App    │◄─►│   Fastify        │◄─►│   Backend    │
│               │   │                  │   │   Management │
└───────────────┘   └──────────────────┘   └──────────────┘
                              │                     │
                              ▼                     ▼
                    ┌─────────────────────────────────┐
                    │      MySQL Database             │
                    │   - app_* tables (App)          │
                    │   - tbl* tables (Perfex CRM)    │
                    │   - Shared sync                 │
                    └─────────────────────────────────┘

URLs:
- App: https://appdesignbuild.com
- API: https://api.appdesignbuild.com
- CRM: https://crm.appdesignbuild.com
```

## Lưu Ý Quan Trọng

1. **Database Prefix**: Perfex CRM dùng prefix `tbl*` cho tất cả tables, nên không xung đột với tables của app
2. **API Sync**: Tạo endpoints để đồng bộ realtime hoặc theo schedule
3. **Authentication**: CRM có hệ thống auth riêng, cần tích hợp SSO nếu muốn dùng chung login
4. **Permissions**: CRM quản lý products/orders, App chỉ đọc dữ liệu qua API
5. **Backup**: Backup cả files và database định kỳ
6. **Monitoring**: Theo dõi logs của cả 3 services (App, API, CRM)

## Troubleshooting

### Lỗi thường gặp:

**1. 502 Bad Gateway**

```bash
# Kiểm tra PHP-FPM
systemctl restart php8.0-fpm
tail -f /var/log/nginx/error.log
```

**2. Database connection failed**

```bash
# Test connection
mysql -u perfex_user -p -h localhost perfex_crm
# Check credentials trong config
```

**3. Permission denied**

```bash
# Fix permissions
chown -R www-data:www-data /var/www/crm.appdesignbuild.com
chmod -R 755 /var/www/crm.appdesignbuild.com
```

**4. SSL certificate error**

```bash
# Renew certificate
certbot renew --force-renewal -d crm.appdesignbuild.com
```

## Liên Hệ & Support

Nếu gặp vấn đề, kiểm tra:

- Nginx logs: `/var/log/nginx/`
- PHP-FPM logs: `/var/log/php8.0-fpm.log`
- MySQL logs: `/var/log/mysql/error.log`
- Perfex CRM logs: `/var/www/crm.appdesignbuild.com/application/logs/`
