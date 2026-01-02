# Progress Map Feature - Technical Specification
## Interactive Construction Progress Visualization (Minimap/Roadmap)

---

## 1. Overview

**Goal**: Xây dựng giao diện quản lý tiến độ thi công dạng **graph-based canvas** với khả năng:
- Zoom/Pan mượt mà như Google Maps
- Minimap để điều hướng toàn cảnh
- Kéo-thả để sắp xếp tasks/phases
- Thêm/sửa/xóa nodes và dependencies realtime
- 3 trạng thái: Chưa bắt đầu / Đang làm / Hoàn thành

**Reference**: Map tiến độ thi công biệt thự (580×811 Figma export) với:
- 4 phases (01-04) màu xanh tròn
- Các task cards xếp cột quanh mỗi phase
- Dependency lines màu theo trade (ME+Hoa, Máy lạnh, Trần thạch cao, Sơn)
- Vòng cam chạy từ "Bắt đầu" → "Kết thúc"

---

## 2. Core Features

### A. Canvas System (Infinite Canvas)
```typescript
// Canvas capabilities
interface CanvasFeatures {
  zoom: {
    min: 0.1,
    max: 3.0,
    default: 1.0,
    wheelZoom: true,
    pinchZoom: true, // mobile
    zoomToFit: true,
    zoomToSelection: true
  },
  pan: {
    mouseDrag: true, // middle button hoặc space + drag
    touchDrag: true,
    boundaries: 'infinite' | { x: [-5000, 5000], y: [-5000, 5000] }
  },
  grid: {
    enabled: boolean,
    size: 20, // pixels
    snap: boolean,
    snapThreshold: 10
  }
}
```

**Implementation**: React Flow hoặc PixiJS
- React Flow: Nhanh, có sẵn minimap/controls
- PixiJS: Performance cao cho >1000 nodes

### B. Minimap Component
```
┌─────────────────────┐
│  Minimap (150x200)  │
│  ┌───────────────┐  │
│  │               │  │
│  │  ┌────────┐   │  │ <- Full canvas view
│  │  │Viewport│   │  │ <- Red rectangle = current viewport
│  │  └────────┘   │  │
│  │               │  │
│  └───────────────┘  │
└─────────────────────┘
```

**Features**:
- Hiển thị toàn bộ canvas thu nhỏ
- Viewport rectangle (red border) draggable
- Click minimap → pan to that position
- Update realtime khi:
  - Zoom/pan canvas chính
  - Thêm/xóa/di chuyển nodes
  - Đổi trạng thái (đổi màu)

### C. Node Types

#### 1. Phase Node (Milestone)
```typescript
interface PhaseNode {
  id: string;
  type: 'phase';
  position: { x: number; y: number };
  data: {
    code: '01' | '02' | '03' | '04';
    label: string;
    color: string; // #2196F3 (xanh tròn)
    tasksCount: number;
    completedCount: number;
  };
}
```

**UI**: Hình tròn 60px, số phase ở giữa, màu xanh #2196F3

#### 2. Task Card Node
```typescript
interface TaskNode {
  id: string;
  type: 'task';
  position: { x: number; y: number };
  size: { width: 200, height: 120 };
  data: {
    title: string;
    code: string; // VD: "01.ME.001"
    trade: Trade; // ME+Hoa, Máy lạnh...
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
    startDate?: Date;
    endDate?: Date;
    progress?: number; // 0-100
    assignee?: User;
    phaseId: string;
  };
}
```

**UI States**:
| Status | Background | Border | Icon |
|--------|-----------|---------|------|
| NOT_STARTED | #F5F5F5 | #BDBDBD | ⭕ |
| IN_PROGRESS | #FFF9C4 | #FBC02D | 🔄 |
| DONE | #C8E6C9 | #4CAF50 | ✅ |

#### 3. Start/End Badge
```typescript
interface BadgeNode {
  id: string;
  type: 'badge';
  data: {
    label: 'Bắt đầu' | 'Kết thúc';
    color: '#FF9800'; // cam
  };
}
```

### D. Edge Types (Dependency Lines)

```typescript
interface DependencyEdge {
  id: string;
  source: string; // task ID
  target: string; // task ID
  type: 'dependency';
  data: {
    trade: Trade; // để tô màu theo trade
    relationType: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-to-Start...
  };
  style: {
    stroke: string; // màu theo trade
    strokeWidth: 2,
    strokeDasharray: status === 'DONE' ? '5,5' : undefined // nét đứt nếu hoàn thành
  };
}
```

**Trade Colors** (theo legend):
```typescript
const TRADE_COLORS = {
  'ME_HOA': '#2196F3',      // Xanh dương
  'MAY_LANH': '#00BCD4',    // Xanh cyan
  'TRAN': '#FFC107',        // Vàng
  'SON': '#FF9800',         // Cam
  'NUOC': '#4CAF50',        // Xanh lá
  'DIEN': '#F44336',        // Đỏ
};
```

---

## 3. Interactions (User Actions)

### A. Drag & Drop

#### Drag Task Node
```typescript
const onNodeDrag = (event, node) => {
  // 1. Update position in state
  updateNodePosition(node.id, node.position);
  
  // 2. Snap to grid if enabled
  if (gridSnap) {
    node.position = snapToGrid(node.position, gridSize);
  }
  
  // 3. Update minimap
  minimapRef.current?.update();
};

const onNodeDragStop = async (event, node) => {
  // Save to backend
  await api.updateTaskPosition(node.id, node.position);
};
```

#### Drag from Sidebar (Template Task)
```typescript
const onDrop = (event) => {
  const taskTemplate = JSON.parse(event.dataTransfer.getData('task'));
  const position = screenToCanvas(event.clientX, event.clientY);
  
  // Detect which phase zone
  const phaseId = detectPhaseZone(position);
  
  // Create new task
  createTask({
    ...taskTemplate,
    position,
    phaseId
  });
};
```

### B. Connect Dependencies

```typescript
// Kéo từ handle task A → thả vào task B
const onConnect = (params) => {
  const edge = {
    source: params.source,
    target: params.target,
    type: 'dependency',
    data: {
      trade: getTaskTrade(params.source),
      relationType: 'FS' // default
    }
  };
  
  addEdge(edge);
  api.createDependency(edge);
};
```

### C. Status Toggle (1-click)

```typescript
const cycleStatus = (taskId: string) => {
  const task = getTask(taskId);
  const nextStatus = {
    NOT_STARTED: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE: 'NOT_STARTED'
  }[task.status];
  
  updateTaskStatus(taskId, nextStatus);
  
  // Change node color
  updateNodeStyle(taskId, getStatusStyle(nextStatus));
  
  // Dim dependency lines if task is DONE
  updateConnectedEdges(taskId, { opacity: nextStatus === 'DONE' ? 0.3 : 1 });
};
```

### D. Add New Task (Quick Action)

```typescript
// Nút "+" trên phase node
const onAddTask = (phaseId: string) => {
  const phase = getPhase(phaseId);
  const position = calculateNextTaskPosition(phaseId); // stack theo cột
  
  const newTask = {
    title: 'New Task',
    code: generateTaskCode(phaseId),
    phaseId,
    status: 'NOT_STARTED',
    position
  };
  
  createTask(newTask);
};
```

---

## 4. UI Components Architecture

```
<ProgressMapCanvas>
  ├─ <ReactFlow>
  │   ├─ <CustomNodes>
  │   │   ├─ PhaseNode
  │   │   ├─ TaskCardNode
  │   │   └─ BadgeNode
  │   ├─ <CustomEdges>
  │   │   └─ DependencyEdge
  │   ├─ <Background grid />
  │   ├─ <Controls zoom={true} />
  │   └─ <MiniMap />
  │
  ├─ <Toolbar>
  │   ├─ ZoomIn/ZoomOut
  │   ├─ FitView
  │   ├─ ToggleGrid
  │   └─ ExportImage
  │
  ├─ <Sidebar>
  │   ├─ <TaskTemplates /> (draggable)
  │   ├─ <PhaseList />
  │   └─ <TradeFilter />
  │
  ├─ <Inspector> (khi select node)
  │   ├─ <TaskForm />
  │   ├─ <StatusDropdown />
  │   ├─ <AssigneeSelect />
  │   └─ <DeleteButton />
  │
  └─ <Legend>
      └─ {TRADE_COLORS.map(trade => <LegendItem />)}
```

---

## 5. Data Model (Database Schema)

### 5.1. Core Tables

```prisma
model Project {
  id          Int       @id @default(autoincrement())
  name        String
  code        String    @unique
  startDate   DateTime?
  endDate     DateTime?
  
  phases      Phase[]
  tasks       Task[]
  trades      Trade[]
  dependencies Dependency[]
  canvasState CanvasState?
}

model Phase {
  id          Int       @id @default(autoincrement())
  projectId   Int
  code        String    // "01", "02", "03", "04"
  name        String
  order       Int
  
  // Layout position on canvas
  layoutX     Float
  layoutY     Float
  
  project     Project   @relation(fields: [projectId], references: [id])
  tasks       Task[]
  
  @@unique([projectId, code])
}

model Trade {
  id          Int       @id @default(autoincrement())
  projectId   Int
  name        String    // "ME+Hoa", "Máy lạnh"...
  code        String
  color       String    // "#2196F3"
  lineStyle   String?   // "solid", "dashed"
  
  project     Project   @relation(fields: [projectId], references: [id])
  tasks       Task[]
  dependencies Dependency[]
}

model Task {
  id          Int       @id @default(autoincrement())
  projectId   Int
  phaseId     Int
  tradeId     Int
  
  code        String    // "01.ME.001"
  title       String
  description String?
  
  status      TaskStatus @default(NOT_STARTED)
  progress    Int       @default(0) // 0-100
  
  startPlan   DateTime?
  endPlan     DateTime?
  startActual DateTime?
  endActual   DateTime?
  
  // Canvas layout (để giữ nguyên bố cục)
  layoutX     Float
  layoutY     Float
  layoutWidth Float     @default(200)
  layoutHeight Float    @default(120)
  
  assigneeId  Int?
  parentTaskId Int?
  
  project     Project   @relation(fields: [projectId], references: [id])
  phase       Phase     @relation(fields: [phaseId], references: [id])
  trade       Trade     @relation(fields: [tradeId], references: [id])
  assignee    User?     @relation(fields: [assigneeId], references: [id])
  parent      Task?     @relation("TaskHierarchy", fields: [parentTaskId], references: [id])
  children    Task[]    @relation("TaskHierarchy")
  
  dependenciesFrom Dependency[] @relation("FromTask")
  dependenciesTo   Dependency[] @relation("ToTask")
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([projectId, status])
  @@index([phaseId])
  @@index([tradeId])
}

enum TaskStatus {
  NOT_STARTED
  IN_PROGRESS
  DONE
}

model Dependency {
  id          Int       @id @default(autoincrement())
  projectId   Int
  fromTaskId  Int
  toTaskId    Int
  tradeId     Int?      // để tô màu line
  
  type        DependencyType @default(FS)
  lag         Int       @default(0) // days
  
  project     Project   @relation(fields: [projectId], references: [id])
  fromTask    Task      @relation("FromTask", fields: [fromTaskId], references: [id])
  toTask      Task      @relation("ToTask", fields: [toTaskId], references: [id])
  trade       Trade?    @relation(fields: [tradeId], references: [id])
  
  @@unique([fromTaskId, toTaskId])
}

enum DependencyType {
  FS  // Finish-to-Start
  SS  // Start-to-Start
  FF  // Finish-to-Finish
  SF  // Start-to-Finish
}

model CanvasState {
  id          Int       @id @default(autoincrement())
  projectId   Int       @unique
  
  zoomLevel   Float     @default(1.0)
  panX        Float     @default(0)
  panY        Float     @default(0)
  
  gridEnabled Boolean   @default(true)
  gridSize    Int       @default(20)
  snapEnabled Boolean   @default(true)
  
  updatedAt   DateTime  @updatedAt
  
  project     Project   @relation(fields: [projectId], references: [id])
}
```

---

## 6. API Endpoints

### 6.1. REST API

```typescript
// Projects
GET    /api/projects/:id/canvas
POST   /api/projects/:id/phases
PUT    /api/phases/:id/position

// Tasks
GET    /api/projects/:id/tasks
POST   /api/tasks
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status
PATCH  /api/tasks/:id/position
DELETE /api/tasks/:id

// Dependencies
GET    /api/projects/:id/dependencies
POST   /api/dependencies
DELETE /api/dependencies/:id

// Trades
GET    /api/projects/:id/trades
POST   /api/trades

// Canvas state
GET    /api/projects/:id/canvas-state
PUT    /api/projects/:id/canvas-state
```

### 6.2. WebSocket Events (Realtime Collaboration)

```typescript
// Client → Server
socket.emit('join-project', { projectId });
socket.emit('task:move', { taskId, position });
socket.emit('task:status', { taskId, status });
socket.emit('task:create', { task });
socket.emit('dependency:create', { fromTaskId, toTaskId });

// Server → Clients (broadcast)
socket.on('task:moved', ({ taskId, position, userId }));
socket.on('task:status-changed', ({ taskId, status, userId }));
socket.on('task:created', ({ task, userId }));
socket.on('dependency:created', ({ dependency, userId }));
socket.on('user:cursor', ({ userId, position })); // optional: show cursors
```

---

## 7. Technology Stack Recommendation

### Frontend
```json
{
  "canvas": "reactflow@11.10.0",
  "ui": "react@19 + tailwindcss",
  "state": "zustand (cho canvas state)",
  "realtime": "socket.io-client",
  "export": "html-to-image (export PNG/PDF)"
}
```

### Backend
```json
{
  "framework": "NestJS (đang dùng)",
  "orm": "Prisma (đang dùng)",
  "realtime": "socket.io",
  "queue": "Bull (optional, cho heavy operations)"
}
```

---

## 8. Implementation Phases

### Phase 1: Canvas Foundation (Week 1)
- [ ] Setup React Flow với custom theme
- [ ] Implement zoom/pan/minimap
- [ ] Create PhaseNode, TaskCardNode components
- [ ] Basic drag-drop (save position to state)

### Phase 2: Data Integration (Week 2)
- [ ] Prisma migrations (Project, Phase, Task, Dependency)
- [ ] REST API CRUD endpoints
- [ ] Load canvas data from API
- [ ] Save layout changes to backend

### Phase 3: Interactions (Week 3)
- [ ] Kéo-thả task between phases
- [ ] Connect dependencies (drag handle)
- [ ] Status toggle (3 states)
- [ ] Add task quick action
- [ ] Sidebar with templates

### Phase 4: Polish & Realtime (Week 4)
- [ ] WebSocket integration
- [ ] Multi-user cursors (optional)
- [ ] Export canvas to image
- [ ] Filter by trade/status
- [ ] Inspector panel (edit task details)

---

## 9. Performance Optimization

### For Large Projects (>500 tasks)
```typescript
// 1. Virtualization (chỉ render nodes trong viewport)
const visibleNodes = nodes.filter(node => 
  isInViewport(node.position, viewport, node.size)
);

// 2. Memoization
const MemoTaskNode = React.memo(TaskNode, (prev, next) => 
  prev.data.status === next.data.status &&
  prev.position.x === next.position.x &&
  prev.position.y === next.position.y
);

// 3. Debounce position updates
const debouncedSavePosition = debounce(
  (taskId, position) => api.updateTaskPosition(taskId, position),
  500
);
```

---

## 10. Definition of Done (Checklist)

- [ ] Canvas zoom/pan mượt (60fps)
- [ ] Minimap hiển thị và sync đúng
- [ ] Kéo-thả task lưu vị trí vào DB
- [ ] Thêm task mới từ nút "+" hoặc sidebar
- [ ] Nối dependency bằng drag handle
- [ ] 3 trạng thái hiển thị rõ ràng (màu + icon)
- [ ] Filter theo trade/status hoạt động
- [ ] Realtime sync khi nhiều người sửa
- [ ] Export canvas ra PNG/PDF
- [ ] Mobile responsive (pan/zoom bằng touch)

---

**Next Steps**: Implement Phase 1 (Canvas Foundation) với React Flow.

