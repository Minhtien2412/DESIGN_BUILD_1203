# 🏗️ Construction Progress Map - React Native App

**2D Interactive Progress Tracking with Real-time Collaboration**

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)]()
[![Backend](https://img.shields.io/badge/backend-deployed-blue)]()
[![Frontend](https://img.shields.io/badge/frontend-complete-blue)]()

Ứng dụng quản lý tiến độ thi công dạng bản đồ 2D với khả năng kéo thả, zoom/pan, và đồng bộ real-time giữa nhiều users.

---

## ✨ Features

### 🎯 Core Features
- ✅ **Board View** - Kanban board với drag & drop tasks giữa các stages
- ✅ **Diagram View** - Sơ đồ 2D SVG với grid background, zoom/pan
- ✅ **Real-time Collaboration** - WebSocket sync giữa nhiều users
- ✅ **Touch Gestures** - Pinch zoom (0.5x-2.5x), pan gesture infinite canvas
- ✅ **Backend Integration** - NestJS API với PostgreSQL database
- ✅ **Progress Tracking** - Auto-calculate progress cho stages và tổng thể

### 🎨 UI/UX
- 📱 Mobile-first design
- 🌓 Dark/Light mode support
- 🎨 Status colors (pending, in-progress, done, late)
- 📊 Progress bars cho từng stage
- 🔔 Connection status indicator
- 👥 Active users counter

### 🔧 Technical
- ⚡ TypeScript strict mode
- 🎣 Custom hooks (API + WebSocket)
- 🔄 Optimistic UI updates
- 💾 Backend persistence (PostgreSQL)
- 🔌 Socket.IO real-time events
- 📦 Centralized configuration

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
Node.js >= 18
React Native development environment
Expo CLI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run App
```bash
npm start
```

### 4. Navigate to Demo
```
/demo/construction-progress
```

**Xem chi tiết**: [QUICK_START.md](docs/QUICK_START.md)

---

## 📁 Project Structure

```
APP_DESIGN_BUILD/
├── app/
│   ├── demo/
│   │   └── construction-progress.tsx    # Demo screen
│   └── projects/[id]/
│       └── minimap.tsx                   # Project-specific map
├── components/
│   └── construction/
│       ├── ConstructionProgressBoard.tsx # Main component (500+ lines)
│       └── InteractiveProgressMap.tsx    # Legacy component
├── hooks/
│   ├── useConstructionMapAPI.ts          # REST API integration
│   └── useConstructionMapSync.ts         # WebSocket integration
├── config/
│   └── construction-map.config.ts        # Centralized config
├── docs/
│   ├── QUICK_START.md                    # 5-minute setup guide
│   ├── IMPLEMENTATION_COMPLETE.md        # Full implementation report
│   ├── BACKEND_INTEGRATION_GUIDE.md      # API/WebSocket guide
│   ├── TOUCH_GESTURES_SPEC.md            # Gesture specifications
│   └── FRONTEND_READINESS_REPORT.md      # Readiness assessment
└── backend-nestjs/                       # NestJS backend (deployed)
    ├── src/construction-map/
    │   ├── construction-map.controller.ts
    │   ├── construction-map.service.ts
    │   ├── construction-map.gateway.ts
    │   └── entities/
    └── DEPLOYMENT_SUCCESS_REPORT.md
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     React Native App (Expo)             │
│  ┌────────────────────────────────┐     │
│  │ ConstructionProgressBoard      │     │
│  │  ├─ Board View (Kanban)        │     │
│  │  └─ Diagram View (2D Map)      │     │
│  └────────────────────────────────┘     │
│           ↕ Hooks                        │
│  ┌────────────────────────────────┐     │
│  │ useConstructionMapAPI          │     │
│  │ useConstructionMapSync         │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
              ↕ HTTP/WebSocket
┌─────────────────────────────────────────┐
│  Backend (baotienweb.cloud)             │
│  ├─ NestJS API (17 endpoints)           │
│  ├─ WebSocket Gateway (10 events)       │
│  ├─ PostgreSQL (construction_map DB)    │
│  └─ PM2 Process Manager                 │
└─────────────────────────────────────────┘
```

---

## 🎮 Usage Examples

### Basic Usage
```tsx
import ConstructionProgressBoard from '@/components/construction/ConstructionProgressBoard';

export default function MyScreen() {
  return (
    <ConstructionProgressBoard 
      projectId="my-project-123" 
      isAdmin={true} 
    />
  );
}
```

### Custom Integration
```tsx
import { useConstructionMapAPI } from '@/hooks/useConstructionMapAPI';
import { useConstructionMapSync } from '@/hooks/useConstructionMapSync';

function CustomComponent({ projectId }) {
  const { data, loading, updateTaskStatus } = useConstructionMapAPI(projectId);
  const { connected, emitTaskMoved } = useConstructionMapSync(projectId);
  
  // Your custom logic...
}
```

**Xem thêm**: [BACKEND_INTEGRATION_GUIDE.md](docs/BACKEND_INTEGRATION_GUIDE.md)

---

## 🧪 Testing

### Manual Testing
```bash
# 1. Start app
npm start

# 2. Navigate to demo
/demo/construction-progress

# 3. Test features
- Board: Drag tasks between columns
- Diagram: Pinch zoom, pan
- Add task: Tap FAB button
- Real-time: Open 2 devices, move task
```

### Backend Testing
```bash
# Health check
curl http://103.200.20.100/api/construction-map/health

# Get project
curl http://103.200.20.100/api/construction-map/demo-project
```

---

## 📊 Backend API

### Base URL
```
Development: http://103.200.20.100:3003/api/construction-map
Production:  https://baotienweb.cloud/api/construction-map (pending DNS)
```

### Key Endpoints
```
GET    /health
GET    /:projectId
GET    /:projectId/progress
POST   /tasks
PATCH  /tasks/:id/position
PATCH  /tasks/:id/status
DELETE /tasks/:id
POST   /stages
PUT    /:projectId/state
```

### WebSocket Events
```javascript
// Client → Server
join-project, leave-project, task-moved, task-status-changed

// Server → Client  
user-joined, user-left, task-moved, task-status-changed
```

**Full API docs**: [BACKEND_INTEGRATION_GUIDE.md](docs/BACKEND_INTEGRATION_GUIDE.md)

---

## ⚙️ Configuration

### Environment Auto-Detection
```typescript
import config from '@/config/construction-map.config';

// Automatically selects based on __DEV__ or NODE_ENV
console.log(config.env);           // 'development' | 'production'
console.log(config.api.baseUrl);   // Auto-selected
console.log(config.websocket.url); // Auto-selected
```

### Manual Override
```typescript
import { getConstructionMapConfig } from '@/config/construction-map.config';

const prodConfig = getConstructionMapConfig('production');
const devConfig  = getConstructionMapConfig('development');
```

---

## 🎨 UI Components

### ConstructionProgressBoard
Main component với 2 view modes:

**Props**:
```typescript
interface Props {
  projectId: string;  // Required: Backend project ID
  isAdmin?: boolean;  // Optional: Show admin controls (default: false)
}
```

**Features**:
- Board View: Kanban columns drag & drop
- Diagram View: 2D SVG map zoom/pan
- Real-time sync: Multi-user collaboration
- Touch gestures: Pinch zoom, pan
- CRUD operations: Create/Update/Delete tasks
- Progress tracking: Auto-calculate %

---

## 🔧 Tech Stack

### Frontend
- **React Native** 0.76+ (Expo SDK 54)
- **TypeScript** 5.x strict mode
- **Expo Router** - File-based routing
- **react-native-svg** - 2D diagram rendering
- **react-native-gesture-handler** - Touch gestures
- **react-native-reanimated** - Smooth animations
- **socket.io-client** - WebSocket integration

### Backend
- **NestJS** 10.x - Backend framework
- **TypeORM** 0.3.x - ORM
- **PostgreSQL** - Database
- **Socket.IO** 4.6 - WebSocket server
- **PM2** - Process manager
- **Nginx** - Reverse proxy

---

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| iOS | ✅ Supported | Tested on iOS 14+ |
| Android | ✅ Supported | Tested on Android 10+ |
| Web | ⚠️ Partial | SVG gestures limited |

---

## 🐛 Known Issues & Limitations

1. **No offline mode** - Requires network connection
2. **No photo uploads** - Planned for Phase 2
3. **No filters/search** - Planned for Phase 2
4. **Web gestures limited** - Pinch zoom doesn't work on web (mouse limitation)

---

## 🔮 Roadmap

### Phase 2 (Optional - 2-3 hours)
- [ ] Long press context menu
- [ ] Double tap zoom to task
- [ ] Task filters (status, stage, worker)
- [ ] Search functionality
- [ ] Photo attachments
- [ ] Export to PDF

### Phase 3 (Optional - 2-3 hours)
- [ ] Offline mode (AsyncStorage)
- [ ] Timeline view (Gantt chart)
- [ ] Performance optimization (virtualized lists)
- [ ] Advanced animations

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](docs/QUICK_START.md) | 5-minute setup guide |
| [IMPLEMENTATION_COMPLETE.md](docs/IMPLEMENTATION_COMPLETE.md) | Full implementation report |
| [BACKEND_INTEGRATION_GUIDE.md](docs/BACKEND_INTEGRATION_GUIDE.md) | API/WebSocket integration |
| [TOUCH_GESTURES_SPEC.md](docs/TOUCH_GESTURES_SPEC.md) | Gesture specifications |
| [FRONTEND_READINESS_REPORT.md](docs/FRONTEND_READINESS_REPORT.md) | Readiness assessment |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 👥 Team

**Development**: Construction Map Team  
**Tech Lead**: [Your Name]  
**Backend**: NestJS + PostgreSQL  
**Frontend**: React Native + Expo  
**Date**: December 4, 2025

---

## 🙏 Acknowledgments

- HTML5 demo inspiration for UI/UX design
- D3.js concepts for diagram interactions
- SortableJS patterns for drag & drop

---

## 📞 Support

For issues or questions:
1. Check [QUICK_START.md](docs/QUICK_START.md) troubleshooting section
2. Review [BACKEND_INTEGRATION_GUIDE.md](docs/BACKEND_INTEGRATION_GUIDE.md)
3. Contact development team

---

## ✅ Status

**Backend**: ✅ Deployed & Stable (PM2)  
**Frontend**: ✅ Complete (500+ lines)  
**Integration**: ✅ Working (API + WebSocket)  
**Gestures**: ✅ Implemented (Pinch + Pan)  
**Documentation**: ✅ Comprehensive  

**Overall**: 🎉 **PRODUCTION READY**

---

**Built with ❤️ using React Native + NestJS**
