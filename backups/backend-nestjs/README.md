# Construction Map Backend API

NestJS backend for Construction Progress Mapping system at baotienweb.cloud.

## Features

- ✅ RESTful API for tasks, stages, links, map state
- ✅ WebSocket real-time synchronization
- ✅ PostgreSQL database with TypeORM
- ✅ Redis caching layer
- ✅ Input validation with class-validator
- ✅ Production-ready configuration

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM 0.3.17
- **Cache**: Redis 7+
- **WebSocket**: Socket.IO 4.6
- **Authentication**: JWT (ready for integration)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env  # Update with your credentials
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb construction_map

# Run migrations
npm run migration:run
```

### 4. Development

```bash
# Start dev server
npm run start:dev

# API: http://localhost:3001/api
# WebSocket: ws://localhost:3002
```

### 5. Production Build

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Project

- `GET /api/construction-map/:projectId` - Get full project data (stages, tasks, links)
- `GET /api/construction-map/:projectId/progress` - Calculate progress

### Tasks

- `GET /api/construction-map/:projectId/tasks` - List all tasks
- `GET /api/construction-map/tasks/:id` - Get single task
- `POST /api/construction-map/tasks` - Create task
- `PUT /api/construction-map/tasks/:id` - Update task
- `PATCH /api/construction-map/tasks/:id/position` - Move task
- `PATCH /api/construction-map/tasks/:id/status` - Change status
- `DELETE /api/construction-map/tasks/:id` - Delete task

### Stages

- `GET /api/construction-map/:projectId/stages` - List all stages
- `GET /api/construction-map/stages/:id` - Get single stage
- `POST /api/construction-map/stages` - Create stage
- `PUT /api/construction-map/stages/:id` - Update stage
- `DELETE /api/construction-map/stages/:id` - Delete stage

### Map State

- `GET /api/construction-map/:projectId/state` - Get map state
- `PUT /api/construction-map/:projectId/state` - Save map state

### Health

- `GET /api/construction-map/health` - Health check

## WebSocket Events

### Client → Server

- `join-project` - Join project room
- `leave-project` - Leave project room
- `task-moved` - Update task position
- `task-status-changed` - Update task status
- `zoom-changed` - Sync zoom level
- `pan-changed` - Sync pan offset

### Server → Client

- `user-joined` - New user joined project
- `user-left` - User left project
- `task-moved` - Task position updated
- `task-status-changed` - Task status updated
- `zoom-changed` - Zoom level changed
- `pan-changed` - Pan offset changed

## Database Schema

### Tasks

```typescript
{
  id: uuid
  projectId: string
  stageId: string (FK)
  label: string
  description: string
  status: 'pending' | 'in-progress' | 'done' | 'late'
  progress: number (0-100)
  x, y: decimal // Canvas position
  width, height: number
  assignedWorkers: string[]
  startDate, endDate: timestamp
  dependencies: string[]
  notes: string
  photos: string[]
}
```

### Stages

```typescript
{
  id: uuid
  projectId: string
  number: string // "01", "02", "03", "04"
  label: string
  description: string
  status: 'upcoming' | 'active' | 'completed'
  x, y: decimal
  startDate, endDate: timestamp
  tasks: Task[] // relation
}
```

### Links

```typescript
{
  id: uuid
  projectId: string
  sourceId: string
  targetId: string
  type: 'dependency' | 'stage-task'
  style: { color, width, dashArray }
}
```

### MapState

```typescript
{
  projectId: string (PK)
  zoom: decimal (0.1-5.0)
  offsetX, offsetY: decimal
  selectedTaskIds: string[]
  version: number // for conflict resolution
}
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full production deployment instructions.

### Quick Deploy to baotienweb.cloud

```bash
# Using bash script (Linux/Mac/WSL)
chmod +x deploy.sh
./deploy.sh

# Or manually follow steps in deploy.ps1
```

## Scripts

```bash
npm run build          # Build production
npm run start:dev      # Development server
npm run start:prod     # Production server
npm run lint           # ESLint
npm run test           # Run tests
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations
npm run migration:revert    # Revert migration
```

## Environment Variables

```env
# Server
NODE_ENV=production
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=construction_map
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=300

# CORS
CORS_ORIGIN=https://yourdomain.com

# JWT (for future auth)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Monitoring

### PM2

```bash
# View logs
pm2 logs construction-map-api

# Monitor
pm2 monit

# Restart
pm2 restart construction-map-api
```

### Health Check

```bash
curl https://api.baotienweb.cloud/api/construction-map/health
```

## Architecture

```
src/
├── main.ts                    # Bootstrap
├── app.module.ts              # Root module
└── construction-map/
    ├── construction-map.module.ts      # Feature module
    ├── construction-map.controller.ts  # REST API
    ├── construction-map.service.ts     # Business logic
    ├── construction-map.gateway.ts     # WebSocket
    ├── entities/
    │   ├── task.entity.ts
    │   ├── stage.entity.ts
    │   ├── link.entity.ts
    │   └── map-state.entity.ts
    └── dto/
        ├── create-task.dto.ts
        ├── update-task.dto.ts
        ├── create-stage.dto.ts
        └── update-map-state.dto.ts
```

## Performance

- **Redis Caching**: 5-minute TTL for getProject()
- **Auto Invalidation**: Cache cleared on mutations
- **Connection Pool**: TypeORM connection pooling
- **Cluster Mode**: PM2 cluster for multi-core

## Security

- **Input Validation**: class-validator on all DTOs
- **CORS**: Configured for specific origins
- **SQL Injection**: Protected by TypeORM parameterized queries
- **Rate Limiting**: (TODO - implement @nestjs/throttler)

## License

MIT
