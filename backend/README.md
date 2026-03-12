# 🔙 Backend Directory

All backend services and infrastructure.

## 📂 Structure

### `/BE-baotienweb.cloud/`
Main NestJS backend API
- RESTful API endpoints
- WebSocket services
- Database (PostgreSQL + Prisma)
- Authentication & Authorization

### `/strapi-cms/`
Strapi headless CMS
- Content management
- API generation
- Admin panel

### `/perfex-module/`
Perfex CRM integration module
- Mobile API extension
- CRM synchronization

### `/admin-web/`
Next.js admin dashboard
- Web-based admin interface
- User management
- Analytics

## 🚀 Quick Start

Each backend service has its own README with setup instructions.

### Start Backend Services

```bash
# Main API
cd backend/BE-baotienweb.cloud
npm install
npm run start:dev

# Strapi CMS
cd backend/strapi-cms
npm install
npm run develop

# Admin Web
cd backend/admin-web
npm install
npm run dev
```

## 📖 Documentation
- [API Documentation](../docs/api/)
- [Deployment Guide](../docs/deployment/)
