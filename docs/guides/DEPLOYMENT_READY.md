# 🚀 Deployment Checklist

## Pre-Deployment Verification

### Backend (NestJS)

- [x] Backend builds successfully (`npm run build`)
- [x] Prisma client generated (`npx prisma generate`)
- [x] New models added (ManagedFile, ManagedFileVersion, ManagedFolder, ManagedFileAuditLog)
- [x] FilesModule registered in AppModule
- [x] Dockerfile created for production
- [x] docker-compose.prod.yml configured

### Frontend (Expo)

- [x] Performance utilities exist (`utils/performance.ts`)
- [x] Bundle analysis script added (`npm run analyze:bundle`)
- [x] Screen loading fallback component (`components/ui/ScreenLoadingFallback.tsx`)

## Deployment Steps

### 1. On Development Machine

```bash
# Build backend
cd BE-baotienweb.cloud
npm run build

# Verify no errors
npm run lint
```

### 2. On VPS Server

```bash
# SSH to server
ssh root@baotienweb.cloud

# Create deployment directory
mkdir -p /opt/baotienweb
cd /opt/baotienweb

# Clone/pull latest code
git pull origin main

# Install dependencies
cd BE-baotienweb.cloud
npm ci --production

# Run database migrations
npx prisma migrate deploy

# Start services with Docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 3. Verify Deployment

```bash
# Check container status
docker ps

# Check API health
curl http://localhost:3000/health

# Check logs
docker logs baotienweb-api -f
```

## Environment Variables Required

Create `.env` file with:

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/baotienweb
REDIS_URL=redis://redis:6379
JWT_SECRET=your-jwt-secret
API_KEY=your-api-key
PORT=3000
NODE_ENV=production
```

## Post-Deployment

- [ ] Verify all API endpoints respond
- [ ] Test authentication flow
- [ ] Test file upload/download
- [ ] Monitor logs for errors
- [ ] Set up SSL with Let's Encrypt (if not done)

## Rollback Procedure

If deployment fails:

```bash
# Stop containers
docker-compose down

# Restore from backup
cd /opt/baotienweb-backups
tar -xzf backup-YYYYMMDD_HHMMSS.tar.gz -C /opt/baotienweb

# Restart
docker-compose up -d
```

## Files Created/Modified

### New Files

- `BE-baotienweb.cloud/src/files/files.service.ts` - File versioning & trash
- `BE-baotienweb.cloud/src/files/files.controller.ts` - REST API endpoints
- `BE-baotienweb.cloud/src/files/files.module.ts` - Module registration
- `BE-baotienweb.cloud/src/files/files.scheduler.ts` - Trash cleanup cron
- `BE-baotienweb.cloud/Dockerfile` - Production Docker image
- `BE-baotienweb.cloud/docker-compose.prod.yml` - Production compose override
- `BE-baotienweb.cloud/deploy-production.sh` - Deployment script
- `scripts/analyze-bundle.ts` - Bundle size analysis

### Modified Files

- `prisma/schema.prisma` - Added ManagedFile models
- `BE-baotienweb.cloud/prisma/schema.prisma` - Added ManagedFile models
- `BE-baotienweb.cloud/src/app.module.ts` - Registered FilesModule
- `package.json` - Added analyze:bundle script

## Summary

| Task                              | Status             |
| --------------------------------- | ------------------ |
| PERF-001: Route Lazy Loading      | ✅ Complete        |
| PERF-002: Bundle Size Analysis    | ✅ Complete        |
| FILE-003: File Versioning & Trash | ✅ Complete        |
| Deploy Preparation                | ✅ Complete        |
| Deploy to Server                  | 🔄 Ready to deploy |

---

_Generated: 2026-01-23_
