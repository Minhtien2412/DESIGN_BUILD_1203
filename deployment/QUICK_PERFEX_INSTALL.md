# HƯỚNG DẪN NHANH - Cài Đặt Perfex CRM

## 🚀 CHỈ CẦN 5 BƯỚC ĐƠN GIẢN

---

## BƯỚC 1: SSH vào VPS

```bash
ssh root@YOUR_VPS_IP
# Hoặc
ssh root@appdesignbuild.com
```

---

## BƯỚC 2: Tải và chạy script cài đặt

**Cách A - Copy script trực tiếp:**

```bash
# Tạo file script
nano /root/perfex-install.sh
```

Paste nội dung từ file `deployment/perfex-crm-install.sh` vào, sau đó:

```bash
# Chạy script
chmod +x /root/perfex-install.sh
bash /root/perfex-install.sh
```

**Cách B - Chạy từng lệnh:**

```bash
# 1. Update system
apt update && apt upgrade -y

# 2. Install PHP 8.0
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.0 php8.0-fpm php8.0-cli php8.0-mysql php8.0-mbstring php8.0-xml php8.0-curl php8.0-zip php8.0-gd php8.0-intl php8.0-bcmath php8.0-imap php8.0-soap

# 3. Configure PHP
cat > /etc/php/8.0/fpm/conf.d/99-perfex.ini << 'EOF'
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
date.timezone = Asia/Ho_Chi_Minh
EOF

systemctl restart php8.0-fpm

# 4. Create database
mysql -u root << 'EOF'
CREATE DATABASE perfex_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'perfex_user'@'localhost' IDENTIFIED BY 'PerfexCRM@2026Secure!';
GRANT ALL PRIVILEGES ON perfex_crm.* TO 'perfex_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 5. Create web directory
mkdir -p /var/www/crm.appdesignbuild.com
chown -R www-data:www-data /var/www/crm.appdesignbuild.com
```

---

## BƯỚC 3: Cấu hình Nginx

```bash
# Tạo nginx config
cat > /etc/nginx/sites-available/crm.appdesignbuild.com << 'EOF'
server {
    listen 80;
    server_name crm.appdesignbuild.com;
    root /var/www/crm.appdesignbuild.com;
    index index.php index.html;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht { deny all; }
    location ~ /application { deny all; }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/crm.appdesignbuild.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## BƯỚC 4: Cấu hình DNS

Vào Cloudflare hoặc DNS provider của bạn, thêm:

| Type | Name | Value        |
| ---- | ---- | ------------ |
| A    | crm  | [IP của VPS] |

Chờ 5-10 phút để DNS propagate.

---

## BƯỚC 5: Upload Perfex CRM

### Sử dụng SFTP (FileZilla):

1. Mở FileZilla
2. Host: `sftp://YOUR_VPS_IP`
3. Username: `root`
4. Password: [mật khẩu VPS]
5. Port: `22`
6. Upload files Perfex CRM vào `/var/www/crm.appdesignbuild.com/`

### Hoặc sử dụng SCP từ máy local:

```bash
# Từ máy local có file Perfex
scp -r perfex_crm/* root@YOUR_VPS_IP:/var/www/crm.appdesignbuild.com/
```

### Sau khi upload, fix permissions:

```bash
# SSH vào VPS và chạy:
chown -R www-data:www-data /var/www/crm.appdesignbuild.com
chmod -R 755 /var/www/crm.appdesignbuild.com
chmod -R 777 /var/www/crm.appdesignbuild.com/uploads
chmod -R 777 /var/www/crm.appdesignbuild.com/application/config
chmod -R 777 /var/www/crm.appdesignbuild.com/application/logs
```

---

## BƯỚC 6: Cài SSL

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d crm.appdesignbuild.com
```

---

## BƯỚC 7: Cài đặt Perfex CRM

1. Mở browser: `https://crm.appdesignbuild.com`
2. Follow wizard cài đặt
3. Điền thông tin database:

```
Host:     localhost
Database: perfex_crm
Username: perfex_user
Password: PerfexCRM@2026Secure!
```

---

## 📋 THÔNG TIN QUAN TRỌNG

### Database Credentials:

```
Database: perfex_crm
Username: perfex_user
Password: PerfexCRM@2026Secure!
Host:     localhost
```

### Đường dẫn:

```
Web Root:  /var/www/crm.appdesignbuild.com
Nginx:     /etc/nginx/sites-available/crm.appdesignbuild.com
PHP Config: /etc/php/8.0/fpm/conf.d/99-perfex.ini
```

### URLs sau khi cài xong:

- CRM Admin: `https://crm.appdesignbuild.com/admin`
- API Backend: `https://api.appdesignbuild.com`
- App Frontend: `https://appdesignbuild.com`

---

## ⚠️ TROUBLESHOOTING

### Lỗi 502 Bad Gateway:

```bash
systemctl restart php8.0-fpm
systemctl restart nginx
```

### Lỗi Permission:

```bash
chown -R www-data:www-data /var/www/crm.appdesignbuild.com
chmod -R 755 /var/www/crm.appdesignbuild.com
```

### Lỗi Database Connection:

```bash
mysql -u perfex_user -p'PerfexCRM@2026Secure!' perfex_crm
# Nếu không vào được, tạo lại user
```

### Xem logs:

```bash
tail -f /var/log/nginx/crm.appdesignbuild.com.error.log
tail -f /var/log/php8.0-fpm.log
```

---

## 🔗 ĐỒNG BỘ VỚI APP

Sau khi CRM hoạt động, tạo API sync trong backend:

1. Perfex CRM quản lý sản phẩm/orders
2. API sync về app database
3. App hiển thị dữ liệu từ CRM

Xem chi tiết trong file `PERFEX_CRM_SETUP_GUIDE.md`
