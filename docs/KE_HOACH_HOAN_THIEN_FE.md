# 📋 KẾ HOẠCH HOÀN THIỆN FRONTEND
## Tích hợp với Backend Construction Map API

**Ngày lập:** 09/12/2025  
**Mục tiêu:** Hoàn thiện tích hợp Frontend với Backend đã có  
**Timeline:** 4-6 tuần  

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### ✅ BACKEND ĐÃ CÓ (100% hoàn thành)

#### **Construction Map API** - Backend NestJS
```
📍 Location: /backend-nestjs/src/construction-map/

✅ Entities (4 models):
   • Task - Công việc
   • Stage - Giai đoạn  
   • Link - Liên kết
   • MapState - Trạng thái canvas

✅ API Endpoints (17 endpoints):
   • Projects: GET /:projectId, GET /:projectId/progress
   • Tasks: CRUD + PATCH position/status
   • Stages: Full CRUD
   • Map State: GET/PUT state
   • Health check

✅ WebSocket (10 events):
   • Real-time sync: task-moved, task-status-changed
   • Collaboration: zoom-changed, pan-changed
   • Room management: join-project, leave-project

✅ Features:
   • Redis caching
   • Input validation
   • Error handling
   • Progress calculation
```

#### **Construction Map Library** - Frontend Library
```
📍 Location: /lib/construction-map/

✅ Core Engine:
   • ConstructionMapEngine - Main class
   • Camera - Zoom/Pan management
   • EventBus - Event handling

✅ Features:
   • Infinite 2D canvas
   • Smooth zoom & pan
   • Touch gestures
   • Viewport culling
   • Export PNG/SVG/PDF
   • TypeScript support

✅ React Integration:
   • useConstructionMap hook (example)
   • React component example
```

### ❌ FRONTEND CHƯA CÓ

```
❌ Screen cho Construction Map trong /app
❌ Tích hợp Construction Map Library vào app
❌ Service layer kết nối với Construction Map API
❌ Components hiển thị Task, Stage, Link
❌ Real-time sync với WebSocket
❌ UI controls cho zoom, pan, edit
❌ Integration với Project Management module
```

---

## 🎯 KẾ HOẠCH THỰC HIỆN

### 📅 SPRINT 1 (Tuần 1-2): Setup & Core Integration

#### **Week 1: Setup cơ bản**

##### Day 1-2: Chuẩn bị môi trường
```bash
✓ Task 1.1: Cài đặt Construction Map Library
  • Copy /lib/construction-map vào node_modules hoặc
  • Link local: npm link ./lib/construction-map
  • Hoặc build và publish: npm run build

✓ Task 1.2: Setup API Service
  • Tạo services/constructionMapApi.ts
  • Configure base URL cho Construction Map API
  • Add TypeScript types từ backend DTOs

✓ Task 1.3: Setup WebSocket Service  
  • Tạo services/websocket/construction-socket.ts
  • Connect đến ws://api.thietkeresort.com.vn:3002
  • Handle reconnection logic
```

**File cần tạo:**
```typescript
// services/api/constructionMapApi.ts
import api from './api';

export interface Task {
  id: string;
  stageId: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  assignedTo?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface Stage {
  id: string;
  projectId: string;
  number: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  color?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface MapState {
  projectId: string;
  zoom: number;
  panX: number;
  panY: number;
  viewport: {
    width: number;
    height: number;
  };
}

// API Methods
export const constructionMapApi = {
  // Projects
  getProject: (projectId: string) => 
    api.get(`/construction-map/${projectId}`),
    
  getProgress: (projectId: string) =>
    api.get(`/construction-map/${projectId}/progress`),

  // Tasks
  getTasks: (projectId: string) =>
    api.get(`/construction-map/${projectId}/tasks`),
    
  getTask: (id: string) =>
    api.get(`/construction-map/tasks/${id}`),
    
  createTask: (data: Partial<Task>) =>
    api.post('/construction-map/tasks', data),
    
  updateTask: (id: string, data: Partial<Task>) =>
    api.put(`/construction-map/tasks/${id}`, data),
    
  moveTask: (id: string, x: number, y: number) =>
    api.patch(`/construction-map/tasks/${id}/position`, { x, y }),
    
  updateTaskStatus: (id: string, status: Task['status']) =>
    api.patch(`/construction-map/tasks/${id}/status`, { status }),
    
  deleteTask: (id: string) =>
    api.delete(`/construction-map/tasks/${id}`),

  // Stages
  getStages: (projectId: string) =>
    api.get(`/construction-map/${projectId}/stages`),
    
  getStage: (id: string) =>
    api.get(`/construction-map/stages/${id}`),
    
  createStage: (data: Partial<Stage>) =>
    api.post('/construction-map/stages', data),
    
  updateStage: (id: string, data: Partial<Stage>) =>
    api.put(`/construction-map/stages/${id}`, data),
    
  deleteStage: (id: string) =>
    api.delete(`/construction-map/stages/${id}`),

  // Map State
  getMapState: (projectId: string) =>
    api.get(`/construction-map/${projectId}/state`),
    
  saveMapState: (projectId: string, state: Partial<MapState>) =>
    api.put(`/construction-map/${projectId}/state`, state),

  // Health
  healthCheck: () =>
    api.get('/construction-map/health'),
};
```

```typescript
// services/websocket/construction-socket.ts
import { io, Socket } from 'socket.io-client';
import { WEBSOCKET_URL } from '@/config/env';

class ConstructionSocket {
  private socket: Socket | null = null;
  private currentProjectId: string | null = null;

  connect(projectId: string) {
    if (this.socket?.connected) {
      this.leaveProject();
    }

    this.socket = io(`${WEBSOCKET_URL}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Construction Map WebSocket');
      this.joinProject(projectId);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Construction Map WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  joinProject(projectId: string) {
    this.currentProjectId = projectId;
    this.socket?.emit('join-project', { projectId });
  }

  leaveProject() {
    if (this.currentProjectId) {
      this.socket?.emit('leave-project', { projectId: this.currentProjectId });
      this.currentProjectId = null;
    }
  }

  // Events
  onTaskMoved(callback: (data: any) => void) {
    this.socket?.on('task-moved', callback);
  }

  onTaskStatusChanged(callback: (data: any) => void) {
    this.socket?.on('task-status-changed', callback);
  }

  onZoomChanged(callback: (data: any) => void) {
    this.socket?.on('zoom-changed', callback);
  }

  onPanChanged(callback: (data: any) => void) {
    this.socket?.on('pan-changed', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('user-left', callback);
  }

  // Emit events
  emitTaskMoved(taskId: string, x: number, y: number) {
    this.socket?.emit('task-moved', { taskId, x, y });
  }

  emitTaskStatusChanged(taskId: string, status: string) {
    this.socket?.emit('task-status-changed', { taskId, status });
  }

  emitZoomChanged(zoom: number) {
    this.socket?.emit('zoom-changed', { zoom });
  }

  emitPanChanged(panX: number, panY: number) {
    this.socket?.emit('pan-changed', { panX, panY });
  }

  disconnect() {
    this.leaveProject();
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const constructionSocket = new ConstructionSocket();
```

##### Day 3-4: Tạo React Hook
```typescript
// hooks/useConstructionMap.ts
import { useEffect, useRef, useState } from 'react';
import { ConstructionMapEngine } from '@construction-app/canvas-map';
import { constructionMapApi, Task, Stage } from '@/services/api/constructionMapApi';
import { constructionSocket } from '@/services/websocket/construction-socket';

interface UseConstructionMapProps {
  projectId: string;
  readOnly?: boolean;
}

export function useConstructionMap({ projectId, readOnly = false }: UseConstructionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ConstructionMapEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [zoom, setZoom] = useState(100);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new ConstructionMapEngine({
      container: containerRef.current,
      minZoom: 0.1,
      maxZoom: 5.0,
      initialZoom: 1.0,
      readOnly,
    });

    engineRef.current = engine;

    // Load project data
    loadProjectData();

    // Setup WebSocket
    if (!readOnly) {
      setupWebSocket();
    }

    // Cleanup
    return () => {
      engine.destroy();
      constructionSocket.disconnect();
    };
  }, [projectId, readOnly]);

  async function loadProjectData() {
    try {
      setLoading(true);
      setError(null);

      // Load tasks and stages
      const [tasksRes, stagesRes, stateRes] = await Promise.all([
        constructionMapApi.getTasks(projectId),
        constructionMapApi.getStages(projectId),
        constructionMapApi.getMapState(projectId),
      ]);

      const loadedTasks = tasksRes.data;
      const loadedStages = stagesRes.data;
      const mapState = stateRes.data;

      setTasks(loadedTasks);
      setStages(loadedStages);

      // Render to canvas
      const engine = engineRef.current;
      if (engine) {
        // Add stages first
        loadedStages.forEach((stage: Stage) => {
          engine.addStage({
            id: stage.id,
            number: stage.number,
            label: stage.label,
            x: stage.x,
            y: stage.y,
            status: stage.status,
            color: stage.color,
          });
        });

        // Add tasks
        loadedTasks.forEach((task: Task) => {
          engine.addTask({
            id: task.id,
            stageId: task.stageId,
            label: task.label,
            x: task.x,
            y: task.y,
            status: task.status,
            progress: task.progress,
          });
        });

        // Restore map state
        if (mapState) {
          engine.zoomTo(mapState.zoom);
          engine.panTo(mapState.panX, mapState.panY);
        }
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load construction map');
      setLoading(false);
    }
  }

  function setupWebSocket() {
    constructionSocket.connect(projectId);

    // Listen to real-time updates
    constructionSocket.onTaskMoved(({ taskId, x, y }) => {
      engineRef.current?.moveObject(taskId, x, y);
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, x, y } : t)
      );
    });

    constructionSocket.onTaskStatusChanged(({ taskId, status }) => {
      engineRef.current?.updateTaskStatus(taskId, status);
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status } : t)
      );
    });

    constructionSocket.onZoomChanged(({ zoom }) => {
      engineRef.current?.zoomTo(zoom);
      setZoom(Math.round(zoom * 100));
    });

    constructionSocket.onPanChanged(({ panX, panY }) => {
      engineRef.current?.panTo(panX, panY);
    });
  }

  // Actions
  const zoomIn = () => {
    engineRef.current?.zoomIn();
    const newZoom = engineRef.current?.getZoom() || 1;
    setZoom(Math.round(newZoom * 100));
    if (!readOnly) {
      constructionSocket.emitZoomChanged(newZoom);
    }
  };

  const zoomOut = () => {
    engineRef.current?.zoomOut();
    const newZoom = engineRef.current?.getZoom() || 1;
    setZoom(Math.round(newZoom * 100));
    if (!readOnly) {
      constructionSocket.emitZoomChanged(newZoom);
    }
  };

  const resetView = () => {
    engineRef.current?.resetView();
    setZoom(100);
  };

  const createTask = async (data: Partial<Task>) => {
    try {
      const res = await constructionMapApi.createTask({ ...data, projectId });
      const newTask = res.data;
      setTasks(prev => [...prev, newTask]);
      engineRef.current?.addTask(newTask);
      return newTask;
    } catch (err) {
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      const res = await constructionMapApi.updateTask(id, data);
      const updatedTask = res.data;
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      engineRef.current?.updateTask(id, data);
      return updatedTask;
    } catch (err) {
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await constructionMapApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      engineRef.current?.removeObject(id);
    } catch (err) {
      throw err;
    }
  };

  const saveMapState = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    const zoom = engine.getZoom();
    const { x: panX, y: panY } = engine.getPan();
    const { width, height } = engine.getViewport();

    await constructionMapApi.saveMapState(projectId, {
      projectId,
      zoom,
      panX,
      panY,
      viewport: { width, height },
    });
  };

  return {
    containerRef,
    engine: engineRef.current,
    loading,
    error,
    tasks,
    stages,
    zoom,
    selectedTask,
    zoomIn,
    zoomOut,
    resetView,
    createTask,
    updateTask,
    deleteTask,
    saveMapState,
    reload: loadProjectData,
  };
}
```

##### Day 5: Test API Connection
```bash
✓ Task 1.4: Test API endpoints
  • Verify health check
  • Test CRUD operations
  • Check WebSocket connection
  • Debug connection issues

✓ Task 1.5: Fix environment variables
  • Update .env with correct API URLs
  • Configure WebSocket URL
  • Test with different environments
```

---

#### **Week 2: Components & UI**

##### Day 1-2: Base Components
```typescript
// components/construction/ConstructionMapCanvas.tsx
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useConstructionMap } from '@/hooks/useConstructionMap';

interface ConstructionMapCanvasProps {
  projectId: string;
  readOnly?: boolean;
  height?: number;
}

export function ConstructionMapCanvas({ 
  projectId, 
  readOnly = false,
  height = 600 
}: ConstructionMapCanvasProps) {
  const {
    containerRef,
    loading,
    error,
    zoom,
    zoomIn,
    zoomOut,
    resetView,
  } = useConstructionMap({ projectId, readOnly });

  if (loading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" />
        <Text>Loading construction map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <div ref={containerRef} style={{ width: '100%', height }} />
      
      {!readOnly && (
        <View style={styles.controls}>
          <Button title="+" onPress={zoomIn} />
          <Text>{zoom}%</Text>
          <Button title="-" onPress={zoomOut} />
          <Button title="Reset" onPress={resetView} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});
```

```typescript
// components/construction/TaskCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '@/services/api/constructionMapApi';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ task, onPress, onEdit, onDelete }: TaskCardProps) {
  const statusColor = {
    'pending': '#FFB020',
    'in-progress': '#2E90FA',
    'completed': '#12B76A',
    'blocked': '#F04438',
  }[task.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
      
      <View style={styles.content}>
        <Text style={styles.label}>{task.label}</Text>
        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${task.progress}%` }]} 
            />
          </View>
          <Text style={styles.progress}>{task.progress}%</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.actionButton}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete}>
            <Text style={[styles.actionButton, styles.deleteButton]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBar: {
    width: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#667085',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F2F4F7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E90FA',
    borderRadius: 3,
  },
  progress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#344054',
    minWidth: 40,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    fontSize: 14,
    color: '#2E90FA',
    fontWeight: '500',
  },
  deleteButton: {
    color: '#F04438',
  },
});
```

##### Day 3-4: Screens
```bash
✓ Task 2.1: Tạo app/construction-map/index.tsx
  • Main screen hiển thị canvas
  • List view cho tasks/stages
  • Controls panel

✓ Task 2.2: Tạo app/construction-map/[id].tsx
  • Detail screen cho project
  • Full screen canvas
  • Edit mode

✓ Task 2.3: Tạo app/construction-map/task/[id].tsx
  • Task detail screen
  • Edit form
  • History & comments
```

##### Day 5: Integration với Projects
```bash
✓ Task 2.4: Add Construction Map button to Project Detail
  • Update app/projects/[id].tsx
  • Add navigation to construction map
  • Show progress indicator

✓ Task 2.5: Test end-to-end flow
  • Navigate từ Projects → Construction Map
  • CRUD operations
  • Real-time sync
```

---

### 📅 SPRINT 2 (Tuần 3-4): Advanced Features

#### **Week 3: Collaborative Features**

##### Day 1-2: Real-time Collaboration
```bash
✓ Task 3.1: User presence indicators
  • Show who's viewing the map
  • Display user cursors
  • Show active users list

✓ Task 3.2: Collaborative editing
  • Optimistic updates
  • Conflict resolution
  • Undo/Redo functionality

✓ Task 3.3: Comments & Annotations
  • Add comment pins to canvas
  • Comment threads
  • @mentions
```

##### Day 3-4: Advanced UI
```bash
✓ Task 3.4: Toolbar components
  • Tool selector (select, pan, add)
  • Quick actions menu
  • Layer controls

✓ Task 3.5: Context menus
  • Right-click menu for tasks
  • Bulk operations
  • Quick status change

✓ Task 3.6: Search & Filters
  • Search tasks by name
  • Filter by status, assignee
  • Highlight matching items
```

##### Day 5: Testing
```bash
✓ Task 3.7: Write tests
  • Unit tests for hooks
  • Component tests
  • Integration tests

✓ Task 3.8: Performance testing
  • Test with 100+ tasks
  • Memory profiling
  • Optimize rendering
```

---

#### **Week 4: Polish & Integration**

##### Day 1-2: Notifications
```bash
✓ Task 4.1: Push notifications
  • Task assigned
  • Status changed
  • Comments added

✓ Task 4.2: In-app notifications
  • Toast messages
  • Activity feed
  • Notification center
```

##### Day 3-4: Mobile Optimization
```bash
✓ Task 4.3: Touch gestures
  • Pinch to zoom
  • Two-finger pan
  • Long press for context menu

✓ Task 4.4: Mobile UI
  • Responsive controls
  • Bottom sheet for details
  • Mobile-friendly toolbar

✓ Task 4.5: Offline support
  • Cache map data
  • Queue operations
  • Sync when online
```

##### Day 5: Final Polish
```bash
✓ Task 4.6: UX improvements
  • Loading states
  • Error handling
  • Empty states
  • Help tooltips

✓ Task 4.7: Accessibility
  • Screen reader support
  • Keyboard navigation
  • High contrast mode

✓ Task 4.8: Documentation
  • User guide
  • Developer docs
  • API reference
```

---

### 📅 SPRINT 3 (Tuần 5-6): Advanced Integrations

#### **Week 5: Data Integration**

##### Day 1-2: Timeline Integration
```bash
✓ Task 5.1: Link với Timeline module
  • Sync tasks với timeline
  • Auto-create timeline entries
  • Bidirectional updates

✓ Task 5.2: Budget Integration
  • Show cost per task
  • Budget tracking on canvas
  • Cost visualization
```

##### Day 3-4: Team Integration
```bash
✓ Task 5.3: Contractor assignment
  • Assign contractors to tasks
  • Show contractor workload
  • Availability calendar

✓ Task 5.4: Permissions
  • Role-based access
  • Edit permissions per task
  • View-only mode
```

##### Day 5: Reports
```bash
✓ Task 5.5: Progress reports
  • Generate PDF reports
  • Export to Excel
  • Email reports

✓ Task 5.6: Analytics
  • Task completion metrics
  • Delay analysis
  • Performance dashboard
```

---

#### **Week 6: Production Ready**

##### Day 1-2: Testing
```bash
✓ Task 6.1: E2E testing
  • User flows testing
  • Cross-browser testing
  • Mobile device testing

✓ Task 6.2: Load testing
  • Test with multiple users
  • Stress testing
  • Performance benchmarks
```

##### Day 3: Bug Fixes
```bash
✓ Task 6.3: Fix critical bugs
  • Priority 1 bugs
  • UI/UX issues
  • Performance issues
```

##### Day 4: Deployment Prep
```bash
✓ Task 6.4: Production configuration
  • Environment variables
  • API endpoints
  • Error tracking

✓ Task 6.5: Documentation
  • Release notes
  • Change log
  • Migration guide
```

##### Day 5: Launch
```bash
✓ Task 6.6: Deploy to production
  • Backend deployment
  • Frontend deployment
  • Database migration

✓ Task 6.7: Monitor & Support
  • Error monitoring
  • User feedback
  • Quick fixes
```

---

## 📁 CẤU TRÚC FILE ĐỀ XUẤT

```
app/
├── construction-map/
│   ├── index.tsx                    # List all projects with maps
│   ├── [id].tsx                     # Project construction map view
│   ├── task/
│   │   ├── [id].tsx                # Task detail
│   │   └── new.tsx                 # Create new task
│   └── stage/
│       ├── [id].tsx                # Stage detail
│       └── new.tsx                 # Create new stage

components/
├── construction/
│   ├── ConstructionMapCanvas.tsx   # Main canvas component
│   ├── TaskCard.tsx                # Task display card
│   ├── StageCard.tsx               # Stage display card
│   ├── MapControls.tsx             # Zoom, pan controls
│   ├── MapToolbar.tsx              # Edit tools
│   ├── TaskForm.tsx                # Create/edit task form
│   ├── StageForm.tsx               # Create/edit stage form
│   ├── TaskList.tsx                # List view of tasks
│   ├── StageList.tsx               # List view of stages
│   ├── ProgressIndicator.tsx       # Progress visualization
│   ├── UserPresence.tsx            # Collaborative users
│   ├── CommentThread.tsx           # Task comments
│   └── MapLegend.tsx               # Status legend

services/
├── api/
│   └── constructionMapApi.ts       # API client
└── websocket/
    └── construction-socket.ts      # WebSocket client

hooks/
├── useConstructionMap.ts           # Main hook
├── useConstructionTasks.ts         # Tasks management
├── useConstructionStages.ts        # Stages management
├── useMapCollaboration.ts          # Real-time collaboration
└── useMapState.ts                  # Map state management

types/
└── construction-map.ts             # TypeScript types

lib/
└── construction-map/               # Canvas library (already exists)
    ├── src/
    ├── examples/
    └── docs/
```

---

## 🎯 DELIVERABLES

### Sprint 1 (Week 1-2)
- ✅ API Service layer hoàn chỉnh
- ✅ WebSocket connection working
- ✅ React Hook tích hợp library
- ✅ Base components (Canvas, TaskCard)
- ✅ 2 screens cơ bản

### Sprint 2 (Week 3-4)
- ✅ Real-time collaboration working
- ✅ Complete UI components
- ✅ Tests coverage > 60%
- ✅ Mobile optimized
- ✅ Offline support

### Sprint 3 (Week 5-6)
- ✅ Integration với Timeline, Budget
- ✅ Permissions system
- ✅ Reports & Analytics
- ✅ Production deployment
- ✅ Documentation complete

---

## 🧪 TESTING STRATEGY

### Unit Tests
```typescript
// __tests__/hooks/useConstructionMap.test.ts
// __tests__/components/TaskCard.test.tsx
// __tests__/services/constructionMapApi.test.ts
```

### Integration Tests
```typescript
// __tests__/integration/construction-map-flow.test.ts
// Test: Create project → Add tasks → Real-time sync
```

### E2E Tests
```typescript
// e2e/construction-map.spec.ts
// Test full user journey
```

---

## 📊 SUCCESS METRICS

### Technical
- [ ] API response time < 200ms
- [ ] WebSocket latency < 50ms
- [ ] Canvas FPS > 30
- [ ] Test coverage > 80%
- [ ] Zero critical bugs

### User Experience
- [ ] Task creation < 3 clicks
- [ ] Canvas load time < 2s
- [ ] Real-time sync < 100ms delay
- [ ] Mobile performance smooth (60fps)

### Business
- [ ] 100% feature parity với backend
- [ ] Support 10+ concurrent users
- [ ] Export functionality working
- [ ] Integration với 3+ modules

---

## 🚨 RISKS & MITIGATION

### Risk 1: WebSocket Connection Issues
**Mitigation:**
- Implement robust reconnection logic
- Fallback to polling if WebSocket fails
- Show connection status to users

### Risk 2: Performance với nhiều objects
**Mitigation:**
- Implement viewport culling
- Use virtual rendering
- Add pagination for task list

### Risk 3: Cross-platform compatibility
**Mitigation:**
- Test on iOS, Android, Web
- Use platform-specific optimizations
- Polyfills for older devices

### Risk 4: Backend API downtime
**Mitigation:**
- Offline mode với local cache
- Queue failed requests
- Clear error messages

---

## 📞 SUPPORT & RESOURCES

### Documentation
- Backend API: `/backend-nestjs/README.md`
- Library docs: `/lib/construction-map/docs/API.md`
- Examples: `/lib/construction-map/examples/`

### Tools
- Postman collection cho API testing
- WebSocket test client
- Performance monitoring tools

### Team
- Backend: Construction Map API đã sẵn sàng
- Frontend: Cần implement theo kế hoạch
- Testing: Unit + Integration + E2E

---

## ✅ CHECKLIST HOÀN THÀNH

### Phase 1: Setup (Week 1-2)
- [ ] Install Construction Map Library
- [ ] Create API service layer
- [ ] Setup WebSocket service
- [ ] Create useConstructionMap hook
- [ ] Build ConstructionMapCanvas component
- [ ] Build TaskCard component
- [ ] Create 2 main screens
- [ ] Test API integration
- [ ] Fix environment configuration

### Phase 2: Features (Week 3-4)
- [ ] Real-time collaboration
- [ ] User presence indicators
- [ ] Comments & annotations
- [ ] Advanced toolbar
- [ ] Context menus
- [ ] Search & filters
- [ ] Unit tests
- [ ] Mobile optimization
- [ ] Offline support

### Phase 3: Integration (Week 5-6)
- [ ] Timeline integration
- [ ] Budget integration
- [ ] Contractor assignment
- [ ] Permissions system
- [ ] Progress reports
- [ ] Analytics dashboard
- [ ] E2E tests
- [ ] Production deployment
- [ ] Documentation

---

## 🎉 KẾT LUẬN

Kế hoạch này sẽ hoàn thiện tích hợp Construction Map từ Backend vào Frontend trong **4-6 tuần**.

### Ưu tiên cao nhất:
1. **Week 1**: API Service + WebSocket
2. **Week 2**: Base Components + Screens
3. **Week 3**: Real-time Features
4. **Week 4**: Mobile Optimization
5. **Week 5**: Data Integration
6. **Week 6**: Production Launch

### Lợi ích sau khi hoàn thành:
✅ Construction Map hoạt động đầy đủ  
✅ Real-time collaboration  
✅ Mobile-friendly  
✅ Tích hợp với toàn bộ hệ thống  
✅ Production-ready  

---

**Người lập kế hoạch:** GitHub Copilot  
**Ngày:** 09/12/2025  
**Version:** 1.0.0
