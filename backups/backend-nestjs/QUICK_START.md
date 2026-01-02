# 🚀 Quick Start Guide - baotienweb.cloud Deployment

## Prerequisites ✅

- Node.js 18+ installed locally
- SSH access to baotienweb.cloud (root user)
- PostgreSQL 14+ on server
- Redis 7+ on server
- Nginx on server

## Step 1: Install Dependencies Locally

```bash
cd backend-nestjs
npm install
```

## Step 2: Test Locally (Optional)

```bash
# Create local database
createdb construction_map

# Configure environment
cp .env.example .env
# Edit .env with local PostgreSQL credentials

# Start dev server
npm run start:dev

# Test in browser
# http://localhost:3001/api/construction-map/health
```

## Step 3: Build Production

```bash
npm run build
```

## Step 4: Upload to Server

### Option A: Using deploy.sh (Linux/Mac/WSL)

```bash
chmod +x deploy.sh
./deploy.sh
# Enter SSH password when prompted
```

### Option B: Manual Upload (Windows)

```powershell
# Use WinSCP or similar tool
# Upload entire backend-nestjs folder to:
# /var/www/construction-map-backend/
# Exclude: node_modules, .git, dist, .env
```

## Step 5: SSH to Server

```bash
ssh root@baotienweb.cloud
# Enter password: [tôi cung cấp mật khẩu]
```

## Step 6: Setup Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE construction_map;
CREATE USER construction_user WITH PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE construction_map TO construction_user;
\q
```

## Step 7: Configure Application

```bash
cd /var/www/construction-map-backend

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env
```

### Edit .env file:

```env
NODE_ENV=production
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=construction_user
DB_PASSWORD=YourSecurePassword123!
DB_DATABASE=construction_map
DB_SYNCHRONIZE=false
DB_LOGGING=false

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=300

CORS_ORIGIN=https://baotienweb.cloud,https://www.baotienweb.cloud

JWT_SECRET=generate-random-secret-key-here
JWT_EXPIRES_IN=7d
```

Save with `Ctrl+O`, exit with `Ctrl+X`

## Step 8: Build & Run Migrations

```bash
# Build application
npm run build

# Run database migrations
npm run migration:run
```

## Step 9: Start with PM2

```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Start application
pm2 start dist/main.js --name construction-map-api --instances 2 --exec-mode cluster

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command shown
```

## Step 10: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/construction-map-api
```

Paste this configuration:

```nginx
upstream construction_api {
    least_conn;
    server localhost:3001;
}

server {
    listen 80;
    server_name api.baotienweb.cloud;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.baotienweb.cloud;

    # SSL certificates (will be configured by Certbot)
    # ssl_certificate /etc/letsencrypt/live/api.baotienweb.cloud/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.baotienweb.cloud/privkey.pem;

    # REST API
    location /api/ {
        proxy_pass http://construction_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /construction-map {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and enable:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/construction-map-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 11: Setup SSL with Let's Encrypt

```bash
# Install Certbot (if not installed)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.baotienweb.cloud

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect (option 2)

# Auto-renewal is configured automatically
```

## Step 12: Test Deployment

```bash
# Test health check
curl https://api.baotienweb.cloud/api/construction-map/health

# Should return:
# {"status":"ok","timestamp":"2025-01-XX..."}
```

## Step 13: Create Test Data

```bash
# Create first stage
curl -X POST https://api.baotienweb.cloud/api/construction-map/stages \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-project-1",
    "number": "01",
    "label": "Giai đoạn Khởi công",
    "description": "Chuẩn bị mặt bằng và đào móng",
    "status": "active",
    "x": 200,
    "y": 200,
    "startDate": "2025-01-15T00:00:00Z",
    "endDate": "2025-02-15T00:00:00Z"
  }'

# Create first task
curl -X POST https://api.baotienweb.cloud/api/construction-map/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-project-1",
    "stageId": "USE_ID_FROM_PREVIOUS_RESPONSE",
    "label": "Đào móng",
    "description": "Đào móng sâu 2m",
    "status": "in-progress",
    "progress": 35,
    "x": 250,
    "y": 250,
    "width": 200,
    "height": 80,
    "assignedWorkers": ["Công nhân A", "Công nhân B"],
    "startDate": "2025-01-15T00:00:00Z",
    "endDate": "2025-01-25T00:00:00Z"
  }'

# Get project data
curl https://api.baotienweb.cloud/api/construction-map/test-project-1
```

## Step 14: Monitor

```bash
# View PM2 processes
pm2 list

# View logs
pm2 logs construction-map-api

# Monitor in real-time
pm2 monit

# Restart if needed
pm2 restart construction-map-api
```

## Troubleshooting

### Database connection error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check credentials in .env match database
```

### Redis connection error

```bash
# Check Redis is running
sudo systemctl status redis

# Start if stopped
sudo systemctl start redis
```

### Port already in use

```bash
# Check what's using port 3001
sudo lsof -i :3001

# Kill process or change PORT in .env
```

### Nginx 502 Bad Gateway

```bash
# Check PM2 is running
pm2 list

# Restart application
pm2 restart construction-map-api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

## Useful Commands

```bash
# View all PM2 processes
pm2 list

# Restart application
pm2 restart construction-map-api

# View logs
pm2 logs construction-map-api --lines 100

# Monitor resources
pm2 monit

# Stop application
pm2 stop construction-map-api

# Delete from PM2
pm2 delete construction-map-api

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# PostgreSQL access
sudo -u postgres psql construction_map
```

## API Documentation

Full API docs: `backend-nestjs/README.md`

Quick reference:
- Health: `GET /api/construction-map/health`
- Get project: `GET /api/construction-map/:projectId`
- Create task: `POST /api/construction-map/tasks`
- Update position: `PATCH /api/construction-map/tasks/:id/position`
- WebSocket: `wss://api.baotienweb.cloud/construction-map`

## Next Steps

1. ✅ Backend deployed and running
2. ⏳ Integrate frontend with API
3. ⏳ Setup authentication (JWT)
4. ⏳ Add rate limiting
5. ⏳ Setup monitoring (e.g., PM2 Plus)
6. ⏳ Configure backups

## Support

Check logs:
- Application: `pm2 logs construction-map-api`
- Nginx: `/var/log/nginx/error.log`
- PostgreSQL: `/var/log/postgresql/postgresql-14-main.log`

---

**Status**: Ready for deployment to baotienweb.cloud 🚀
