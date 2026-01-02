# Kế Hoạch Phát Triển Thư Viện Construction Map 2D

## 🎯 Mục Tiêu

Xây dựng thư viện JavaScript độc lập cho việc hiển thị và quản lý sơ đồ tiến độ xây dựng dạng 2D với:
- Canvas 2D không giới hạn (infinite canvas)
- Zoom/Pan mượt mà không giới hạn
- Tích hợp dữ liệu thực tế từ công trường
- Đồng bộ real-time với server
- Tối ưu cho cả web và mobile

---

## 📚 Công Nghệ Stack

### 1. Core Technologies

| Công nghệ | Mục đích | Lý do chọn |
|-----------|----------|------------|
| **TypeScript** | Language | Type safety, IDE support, maintainability |
| **HTML5 Canvas API** | Rendering | Native, performant, không dependencies |
| **WebGL** (Optional) | Advanced rendering | Hardware acceleration cho >1000 objects |
| **Web Workers** | Background processing | Tính toán spatial index, export không block UI |

### 2. Supporting Libraries

| Library | Version | Use Case |
|---------|---------|----------|
| **Hammer.js** | 2.0.8 | Multi-touch gesture handling |
| **gl-matrix** | 3.4.3 | Matrix calculations (zoom/pan transforms) |
| **rbush** | 3.0.1 | R-tree spatial indexing cho collision detection |
| **bezier-easing** | 2.1.0 | Smooth animation curves |
| **pako** | 2.1.0 | Gzip compression cho large datasets |

### 3. Development Tools

```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/parser": "^6.0.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 🏗️ Kiến Trúc Thư Viện

### Folder Structure

```
lib/construction-map/
├── core/
│   ├── Engine.ts              # Main engine class
│   ├── Camera.ts              # Viewport & zoom/pan management
│   ├── Canvas.ts              # Low-level canvas wrapper
│   ├── Transform.ts           # Matrix transformations
│   └── EventBus.ts            # Event system
├── objects/
│   ├── BaseObject.ts          # Abstract base class
│   ├── Stage.ts               # Construction stage node
│   ├── Task.ts                # Task card node
│   ├── Link.ts                # Connection line
│   └── Grid.ts                # Background grid
├── interactions/
│   ├── GestureManager.ts      # Touch/mouse gestures
│   ├── SelectionManager.ts    # Object selection
│   ├── DragManager.ts         # Drag & drop
│   └── KeyboardManager.ts     # Keyboard shortcuts
├── rendering/
│   ├── Renderer.ts            # Main render loop
│   ├── LayerManager.ts        # Layer system
│   ├── SpatialIndex.ts        # R-tree for culling
│   └── StyleManager.ts        # Visual styles
├── data/
│   ├── DataAdapter.ts         # Server communication
│   ├── StateManager.ts        # Local state
│   ├── SyncEngine.ts          # Real-time sync
│   └── CacheManager.ts        # Data caching
├── utils/
│   ├── Math.ts                # Math utilities
│   ├── Export.ts              # PNG/SVG/PDF export
│   └── Performance.ts         # Performance monitoring
└── index.ts                   # Public API
```

---

## 🔧 Chi Tiết Kỹ Thuật

### 1. Core Engine Architecture

```typescript
// lib/construction-map/core/Engine.ts

export interface EngineConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  enableWebGL?: boolean;
  maxZoom?: number;
  minZoom?: number;
  initialZoom?: number;
  backgroundColor?: string;
}

export class ConstructionMapEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private renderer: Renderer;
  private spatialIndex: RBush;
  private objects: Map<string, BaseObject>;
  private animationFrameId: number | null = null;
  
  constructor(config: EngineConfig) {
    this.initCanvas(config);
    this.initCamera(config);
    this.initRenderer();
    this.setupEventListeners();
    this.startRenderLoop();
  }
  
  // Public API methods
  addObject(object: BaseObject): void;
  removeObject(id: string): void;
  getObject(id: string): BaseObject | undefined;
  zoomTo(level: number, point?: Point): void;
  panTo(x: number, y: number, animated?: boolean): void;
  fitToView(objects?: BaseObject[]): void;
  exportToPNG(): Promise<Blob>;
  destroy(): void;
}
```

### 2. Infinite Canvas System

```typescript
// lib/construction-map/core/Camera.ts

export class Camera {
  private zoom: number = 1.0;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private targetZoom: number = 1.0;
  private targetOffsetX: number = 0;
  private targetOffsetY: number = 0;
  
  // Transform world coordinates to screen coordinates
  worldToScreen(worldX: number, worldY: number): Point {
    return {
      x: (worldX + this.offsetX) * this.zoom,
      y: (worldY + this.offsetY) * this.zoom
    };
  }
  
  // Transform screen coordinates to world coordinates
  screenToWorld(screenX: number, screenY: number): Point {
    return {
      x: screenX / this.zoom - this.offsetX,
      y: screenY / this.zoom - this.offsetY
    };
  }
  
  // Zoom to specific point (keeps point under cursor)
  zoomToPoint(zoomDelta: number, screenX: number, screenY: number): void {
    const worldBefore = this.screenToWorld(screenX, screenY);
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomDelta));
    const worldAfter = this.screenToWorld(screenX, screenY);
    
    this.offsetX += worldAfter.x - worldBefore.x;
    this.offsetY += worldAfter.y - worldBefore.y;
  }
  
  // Smooth animation
  update(deltaTime: number): void {
    const lerpFactor = 1 - Math.exp(-10 * deltaTime);
    this.zoom = lerp(this.zoom, this.targetZoom, lerpFactor);
    this.offsetX = lerp(this.offsetX, this.targetOffsetX, lerpFactor);
    this.offsetY = lerp(this.offsetY, this.targetOffsetY, lerpFactor);
  }
}
```

### 3. Object System

```typescript
// lib/construction-map/objects/Task.ts

export interface TaskData {
  id: string;
  stageId: string;
  label: string;
  status: 'pending' | 'in-progress' | 'done' | 'late';
  progress: number; // 0-100
  x: number;
  y: number;
  width?: number;
  height?: number;
  assignedWorkers?: string[];
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

export class Task extends BaseObject {
  private static readonly WIDTH = 170;
  private static readonly HEIGHT = 46;
  
  constructor(private data: TaskData) {
    super(data.id);
  }
  
  // Rendering
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screen = camera.worldToScreen(this.data.x, this.data.y);
    const scale = camera.getZoom();
    
    // Draw background
    ctx.fillStyle = this.getBackgroundColor();
    ctx.fillRect(screen.x, screen.y, Task.WIDTH * scale, Task.HEIGHT * scale);
    
    // Draw border
    ctx.strokeStyle = this.getBorderColor();
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(screen.x, screen.y, Task.WIDTH * scale, Task.HEIGHT * scale);
    
    // Draw label (with LOD - Level of Detail)
    if (scale > 0.3) {
      ctx.fillStyle = '#222';
      ctx.font = `${12 * scale}px sans-serif`;
      ctx.fillText(this.data.label, screen.x + 10 * scale, screen.y + 20 * scale);
    }
    
    // Draw progress bar
    this.renderProgressBar(ctx, screen, scale);
    
    // Draw status indicator
    this.renderStatusIndicator(ctx, screen, scale);
  }
  
  // Hit testing
  containsPoint(worldX: number, worldY: number): boolean {
    return worldX >= this.data.x && 
           worldX <= this.data.x + Task.WIDTH &&
           worldY >= this.data.y && 
           worldY <= this.data.y + Task.HEIGHT;
  }
  
  // Bounding box for spatial index
  getBounds(): BBox {
    return {
      minX: this.data.x,
      minY: this.data.y,
      maxX: this.data.x + Task.WIDTH,
      maxY: this.data.y + Task.HEIGHT
    };
  }
}
```

### 4. Spatial Indexing (Performance)

```typescript
// lib/construction-map/rendering/SpatialIndex.ts

import RBush from 'rbush';

export class SpatialIndex {
  private tree: RBush<IndexedObject>;
  
  constructor() {
    this.tree = new RBush();
  }
  
  // Insert object
  insert(object: BaseObject): void {
    const bbox = object.getBounds();
    this.tree.insert({
      minX: bbox.minX,
      minY: bbox.minY,
      maxX: bbox.maxX,
      maxY: bbox.maxY,
      object: object
    });
  }
  
  // Query visible objects (viewport culling)
  queryViewport(camera: Camera, width: number, height: number): BaseObject[] {
    const topLeft = camera.screenToWorld(0, 0);
    const bottomRight = camera.screenToWorld(width, height);
    
    const results = this.tree.search({
      minX: topLeft.x,
      minY: topLeft.y,
      maxX: bottomRight.x,
      maxY: bottomRight.y
    });
    
    return results.map(r => r.object);
  }
  
  // Query objects at point (for click detection)
  queryPoint(worldX: number, worldY: number): BaseObject[] {
    const results = this.tree.search({
      minX: worldX,
      minY: worldY,
      maxX: worldX,
      maxY: worldY
    });
    
    return results
      .map(r => r.object)
      .filter(obj => obj.containsPoint(worldX, worldY));
  }
}
```

### 5. Render Loop with Optimization

```typescript
// lib/construction-map/rendering/Renderer.ts

export class Renderer {
  private lastFrameTime: number = 0;
  private fps: number = 60;
  private dirtyRects: Rect[] = [];
  private fullRedraw: boolean = true;
  
  render(timestamp: number): void {
    const deltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    
    // Update animations
    this.camera.update(deltaTime);
    this.updateAnimations(deltaTime);
    
    // Early exit if nothing changed
    if (!this.fullRedraw && this.dirtyRects.length === 0) {
      return;
    }
    
    // Clear canvas
    if (this.fullRedraw) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    } else {
      this.clearDirtyRects();
    }
    
    // Query visible objects (viewport culling)
    const visibleObjects = this.spatialIndex.queryViewport(
      this.camera,
      this.width,
      this.height
    );
    
    // Render layers
    this.renderLayer('background', visibleObjects);
    this.renderLayer('grid', visibleObjects);
    this.renderLayer('links', visibleObjects);
    this.renderLayer('nodes', visibleObjects);
    this.renderLayer('ui', visibleObjects);
    
    // Reset flags
    this.fullRedraw = false;
    this.dirtyRects = [];
    
    // Performance monitoring
    this.updateFPS(deltaTime);
  }
  
  private renderLayer(layerName: string, objects: BaseObject[]): void {
    const layerObjects = objects.filter(obj => obj.getLayer() === layerName);
    
    for (const object of layerObjects) {
      // LOD - skip rendering small objects when zoomed out
      if (this.shouldRender(object)) {
        object.render(this.ctx, this.camera);
      }
    }
  }
}
```

### 6. Real-time Data Sync

```typescript
// lib/construction-map/data/SyncEngine.ts

export class SyncEngine {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private pendingChanges: Change[] = [];
  
  constructor(private dataAdapter: DataAdapter) {}
  
  connect(projectId: string): void {
    this.ws = new WebSocket(`wss://api.example.com/construction/${projectId}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.flushPendingChanges();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleServerUpdate(message);
    };
    
    this.ws.onclose = () => {
      this.reconnect();
    };
  }
  
  // Send local change to server
  sendChange(change: Change): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(change));
    } else {
      // Queue for later
      this.pendingChanges.push(change);
    }
  }
  
  // Handle incoming server update
  private handleServerUpdate(message: ServerUpdate): void {
    switch (message.type) {
      case 'task_moved':
        this.dataAdapter.updateTaskPosition(message.taskId, message.x, message.y);
        break;
      case 'task_status_changed':
        this.dataAdapter.updateTaskStatus(message.taskId, message.status);
        break;
      case 'task_created':
        this.dataAdapter.addTask(message.task);
        break;
      case 'task_deleted':
        this.dataAdapter.removeTask(message.taskId);
        break;
    }
    
    // Emit event for UI update
    this.emit('data-changed', message);
  }
  
  // Conflict resolution (Last Write Wins with version check)
  private resolveConflict(local: TaskData, remote: TaskData): TaskData {
    return remote.version > local.version ? remote : local;
  }
}
```

---

## 📊 Data Model Integration

### Construction Domain Types

```typescript
// types/construction-map.ts

export interface ConstructionProject {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  stages: Stage[];
  tasks: Task[];
  workers: Worker[];
}

export interface Stage {
  id: string;
  number: string; // "01", "02", "03", "04"
  label: string; // "Khởi đầu", "Kết cấu", etc.
  x: number; // Canvas position
  y: number;
  status: 'upcoming' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  tasks: string[]; // Task IDs
}

export interface Task {
  id: string;
  stageId: string;
  label: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'done' | 'late';
  progress: number; // 0-100
  x: number; // Canvas position (draggable)
  y: number;
  assignedWorkers: string[]; // Worker IDs
  startDate: Date;
  endDate: Date;
  dependencies: string[]; // Task IDs that must complete first
  notes?: string;
  photos?: string[]; // URLs
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  currentTaskId?: string;
}

export interface MapState {
  projectId: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  selectedTaskIds: string[];
  version: number; // For conflict resolution
  lastModified: Date;
}
```

### Server API Endpoints

```typescript
// services/construction-map.api.ts

export class ConstructionMapAPI {
  private baseURL = '/api/construction-map';
  
  // GET /api/construction-map/:projectId
  async getProject(projectId: string): Promise<ConstructionProject> {
    const response = await fetch(`${this.baseURL}/${projectId}`);
    return response.json();
  }
  
  // GET /api/construction-map/:projectId/state
  async getMapState(projectId: string): Promise<MapState> {
    const response = await fetch(`${this.baseURL}/${projectId}/state`);
    return response.json();
  }
  
  // PUT /api/construction-map/:projectId/state
  async saveMapState(projectId: string, state: MapState): Promise<void> {
    await fetch(`${this.baseURL}/${projectId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  }
  
  // PATCH /api/construction-map/tasks/:taskId/position
  async updateTaskPosition(taskId: string, x: number, y: number): Promise<void> {
    await fetch(`${this.baseURL}/tasks/${taskId}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y })
    });
  }
  
  // PATCH /api/construction-map/tasks/:taskId/status
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await fetch(`${this.baseURL}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }
  
  // POST /api/construction-map/tasks
  async createTask(task: Partial<Task>): Promise<Task> {
    const response = await fetch(`${this.baseURL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return response.json();
  }
  
  // DELETE /api/construction-map/tasks/:taskId
  async deleteTask(taskId: string): Promise<void> {
    await fetch(`${this.baseURL}/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }
}
```

---

## 🎨 React Integration

### Custom Hook

```typescript
// hooks/useConstructionMap.ts

import { useEffect, useRef } from 'react';
import { ConstructionMapEngine } from '@/lib/construction-map';

export function useConstructionMap(projectId: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ConstructionMapEngine | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize engine
    engineRef.current = new ConstructionMapEngine({
      container: containerRef.current,
      minZoom: 0.1,
      maxZoom: 5.0,
      initialZoom: 1.0
    });
    
    // Load data
    loadProjectData(projectId);
    
    // Cleanup
    return () => {
      engineRef.current?.destroy();
    };
  }, [projectId]);
  
  const loadProjectData = async (id: string) => {
    const project = await api.getProject(id);
    const state = await api.getMapState(id);
    
    // Add stages
    project.stages.forEach(stage => {
      engineRef.current?.addObject(new Stage(stage));
    });
    
    // Add tasks
    project.tasks.forEach(task => {
      engineRef.current?.addObject(new Task(task));
    });
    
    // Restore camera state
    engineRef.current?.setZoom(state.zoom);
    engineRef.current?.setPan(state.offsetX, state.offsetY);
  };
  
  const zoomIn = () => engineRef.current?.zoomBy(1.2);
  const zoomOut = () => engineRef.current?.zoomBy(0.8);
  const resetView = () => engineRef.current?.fitToView();
  
  return {
    containerRef,
    engine: engineRef.current,
    zoomIn,
    zoomOut,
    resetView
  };
}
```

### React Component

```tsx
// components/construction/ConstructionMapCanvas.tsx

export function ConstructionMapCanvas({ projectId }: { projectId: string }) {
  const { containerRef, engine, zoomIn, zoomOut, resetView } = useConstructionMap(projectId);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  useEffect(() => {
    if (!engine) return;
    
    // Listen to selection events
    engine.on('task-selected', (task: Task) => {
      setSelectedTask(task);
    });
    
    // Listen to data changes
    engine.on('task-moved', async (task: Task) => {
      await api.updateTaskPosition(task.id, task.x, task.y);
    });
  }, [engine]);
  
  return (
    <div className="construction-map-container">
      {/* Canvas */}
      <div ref={containerRef} className="canvas-wrapper" />
      
      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={zoomIn}>
          <Icon name="zoom-in" />
        </button>
        <button onClick={zoomOut}>
          <Icon name="zoom-out" />
        </button>
        <button onClick={resetView}>
          <Icon name="fit-to-screen" />
        </button>
      </div>
      
      {/* Side panel */}
      {selectedTask && (
        <TaskDetailPanel 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
```

---

## 📱 Mobile Optimization

### Touch Gesture Handling

```typescript
// lib/construction-map/interactions/GestureManager.ts

import Hammer from 'hammerjs';

export class GestureManager {
  private hammer: HammerManager;
  private isPanning: boolean = false;
  private lastPanX: number = 0;
  private lastPanY: number = 0;
  
  constructor(private canvas: HTMLCanvasElement, private camera: Camera) {
    this.hammer = new Hammer.Manager(canvas);
    this.setupGestures();
  }
  
  private setupGestures(): void {
    // Pan gesture
    const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL });
    this.hammer.add(pan);
    
    this.hammer.on('panstart', (e) => {
      this.isPanning = true;
      this.lastPanX = 0;
      this.lastPanY = 0;
    });
    
    this.hammer.on('panmove', (e) => {
      const deltaX = (e.deltaX - this.lastPanX) / this.camera.getZoom();
      const deltaY = (e.deltaY - this.lastPanY) / this.camera.getZoom();
      
      this.camera.pan(deltaX, deltaY);
      
      this.lastPanX = e.deltaX;
      this.lastPanY = e.deltaY;
    });
    
    this.hammer.on('panend', () => {
      this.isPanning = false;
    });
    
    // Pinch gesture (zoom)
    const pinch = new Hammer.Pinch();
    this.hammer.add(pinch);
    
    let lastScale = 1.0;
    this.hammer.on('pinchstart', () => {
      lastScale = 1.0;
    });
    
    this.hammer.on('pinchmove', (e) => {
      const scaleDelta = e.scale / lastScale;
      this.camera.zoomToPoint(
        scaleDelta,
        e.center.x,
        e.center.y
      );
      lastScale = e.scale;
    });
    
    // Tap gesture (selection)
    const tap = new Hammer.Tap();
    this.hammer.add(tap);
    
    this.hammer.on('tap', (e) => {
      const worldPos = this.camera.screenToWorld(e.center.x, e.center.y);
      this.emit('tap', worldPos);
    });
    
    // Long press (context menu)
    const press = new Hammer.Press({ time: 500 });
    this.hammer.add(press);
    
    this.hammer.on('press', (e) => {
      const worldPos = this.camera.screenToWorld(e.center.x, e.center.y);
      this.emit('long-press', worldPos);
    });
  }
}
```

---

## 🚀 Performance Optimization

### 1. Viewport Culling

Chỉ render objects trong viewport:

```typescript
const visibleBounds = {
  minX: camera.screenToWorld(0, 0).x,
  minY: camera.screenToWorld(0, 0).y,
  maxX: camera.screenToWorld(width, height).x,
  maxY: camera.screenToWorld(width, height).y
};

const visibleObjects = spatialIndex.search(visibleBounds);
```

### 2. Level of Detail (LOD)

Giảm detail khi zoom out:

```typescript
renderTask(task: Task, zoom: number) {
  if (zoom > 1.0) {
    // Full detail: icon, text, progress bar
    this.renderFullDetail(task);
  } else if (zoom > 0.5) {
    // Medium detail: text, colored box
    this.renderMediumDetail(task);
  } else {
    // Low detail: colored dot only
    this.renderLowDetail(task);
  }
}
```

### 3. Dirty Rectangle Optimization

Chỉ redraw phần thay đổi:

```typescript
class Renderer {
  markDirty(rect: Rect): void {
    this.dirtyRects.push(rect);
  }
  
  render(): void {
    if (this.dirtyRects.length > 0) {
      this.dirtyRects.forEach(rect => {
        this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
        this.renderRegion(rect);
      });
      this.dirtyRects = [];
    }
  }
}
```

### 4. Canvas Pooling

Sử dụng nhiều canvas layers:

```typescript
class LayerManager {
  private layers = {
    background: document.createElement('canvas'),
    grid: document.createElement('canvas'),
    objects: document.createElement('canvas'),
    ui: document.createElement('canvas')
  };
  
  render(): void {
    // Render static layers once
    if (this.gridDirty) {
      this.renderGrid(this.layers.grid);
      this.gridDirty = false;
    }
    
    // Composite layers
    this.mainCtx.drawImage(this.layers.background, 0, 0);
    this.mainCtx.drawImage(this.layers.grid, 0, 0);
    this.mainCtx.drawImage(this.layers.objects, 0, 0);
    this.mainCtx.drawImage(this.layers.ui, 0, 0);
  }
}
```

### 5. Web Worker for Heavy Computation

```typescript
// workers/spatial-index.worker.ts

self.onmessage = (e) => {
  const { type, data } = e.data;
  
  switch (type) {
    case 'rebuild-index':
      const tree = new RBush();
      data.objects.forEach(obj => tree.insert(obj.bounds));
      self.postMessage({ type: 'index-ready', tree });
      break;
      
    case 'query-viewport':
      const results = tree.search(data.bounds);
      self.postMessage({ type: 'query-results', results });
      break;
  }
};
```

---

## 📦 Export/Import Features

### Export to PNG

```typescript
exportToPNG(): Promise<Blob> {
  return new Promise((resolve) => {
    // Fit all objects to view
    const bounds = this.calculateBoundingBox(this.objects);
    const tempCamera = new Camera();
    tempCamera.fitToBounds(bounds, this.width, this.height);
    
    // Render to offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = this.width;
    offscreen.height = this.height;
    const ctx = offscreen.getContext('2d')!;
    
    this.renderFrame(ctx, tempCamera);
    
    // Convert to blob
    offscreen.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}
```

### Export to SVG

```typescript
exportToSVG(): string {
  let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
  
  this.objects.forEach(obj => {
    svg += obj.toSVG(this.camera);
  });
  
  svg += '</svg>';
  return svg;
}
```

### Save State to Server

```typescript
async saveState(): Promise<void> {
  const state: MapState = {
    projectId: this.projectId,
    zoom: this.camera.getZoom(),
    offsetX: this.camera.getOffsetX(),
    offsetY: this.camera.getOffsetY(),
    selectedTaskIds: this.selectedObjects.map(o => o.id),
    version: this.stateVersion++,
    lastModified: new Date()
  };
  
  await this.api.saveMapState(this.projectId, state);
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// __tests__/Camera.test.ts

describe('Camera', () => {
  let camera: Camera;
  
  beforeEach(() => {
    camera = new Camera({ width: 800, height: 600 });
  });
  
  test('should convert world to screen coordinates', () => {
    camera.setZoom(2.0);
    camera.setPan(100, 100);
    
    const screen = camera.worldToScreen(50, 50);
    expect(screen.x).toBe(300);
    expect(screen.y).toBe(300);
  });
  
  test('should zoom to point correctly', () => {
    camera.zoomToPoint(2.0, 400, 300);
    
    const worldAfter = camera.screenToWorld(400, 300);
    expect(worldAfter.x).toBeCloseTo(400);
    expect(worldAfter.y).toBeCloseTo(300);
  });
});
```

### Performance Benchmarks

```typescript
// benchmarks/render.bench.ts

describe('Rendering Performance', () => {
  test('should render 1000 objects at 60fps', async () => {
    const engine = createEngine();
    
    // Add 1000 tasks
    for (let i = 0; i < 1000; i++) {
      engine.addObject(createMockTask());
    }
    
    const fps = await measureFPS(engine, 1000); // 1 second
    expect(fps).toBeGreaterThan(55); // Allow margin
  });
  
  test('should handle 10000 objects with spatial index', () => {
    const index = new SpatialIndex();
    
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      index.insert(createMockTask());
    }
    const buildTime = performance.now() - start;
    
    expect(buildTime).toBeLessThan(100); // < 100ms
    
    const queryStart = performance.now();
    const results = index.queryViewport(camera, 800, 600);
    const queryTime = performance.now() - queryStart;
    
    expect(queryTime).toBeLessThan(5); // < 5ms per query
  });
});
```

---

## 📅 Development Timeline

### Phase 1: Core Foundation (Tuần 1-2)
- ✅ Setup project structure
- ✅ Implement Canvas wrapper
- ✅ Implement Camera system
- ✅ Basic render loop
- ✅ Transform matrix calculations

### Phase 2: Object System (Tuần 3-4)
- ✅ BaseObject abstract class
- ✅ Stage implementation
- ✅ Task implementation
- ✅ Link (connection) implementation
- ✅ Grid background

### Phase 3: Interactions (Tuần 5-6)
- ✅ Mouse/touch event handling
- ✅ Zoom gestures (wheel + pinch)
- ✅ Pan gestures
- ✅ Drag & drop
- ✅ Selection system

### Phase 4: Performance (Tuần 7-8)
- ✅ Spatial indexing (R-tree)
- ✅ Viewport culling
- ✅ LOD system
- ✅ Dirty rectangle optimization
- ✅ Canvas pooling

### Phase 5: Data Integration (Tuần 9-10)
- ✅ API service layer
- ✅ WebSocket real-time sync
- ✅ State management
- ✅ Conflict resolution
- ✅ Offline support

### Phase 6: Export/Features (Tuần 11-12)
- ✅ PNG export
- ✅ SVG export
- ✅ PDF export (jsPDF)
- ✅ Auto-save
- ✅ Keyboard shortcuts

### Phase 7: Mobile & Polish (Tuần 13-14)
- ✅ Touch optimization
- ✅ Responsive UI
- ✅ Performance profiling
- ✅ Bug fixes
- ✅ Documentation

### Phase 8: Testing & Release (Tuần 15-16)
- ✅ Unit tests (>80% coverage)
- ✅ Integration tests
- ✅ Performance benchmarks
- ✅ User acceptance testing
- ✅ Production deployment

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Performance** | 60 FPS | requestAnimationFrame monitoring |
| **Scalability** | >5000 objects | Stress testing |
| **Load Time** | <2s for 1000 tasks | Performance API |
| **Bundle Size** | <150KB gzipped | Webpack bundle analyzer |
| **Mobile Performance** | 30+ FPS | Chrome DevTools |
| **Test Coverage** | >80% | Jest coverage report |

---

## 📚 Documentation Deliverables

1. **API Documentation**: JSDoc comments + auto-generated docs
2. **Architecture Guide**: This document
3. **Integration Guide**: How to use in React/Vue/Angular
4. **Performance Guide**: Optimization tips
5. **Contribution Guide**: For open-source contributors
6. **Examples**: CodeSandbox demos

---

## 🔄 Next Steps

1. ✅ Review and approve this plan
2. ⏭️ Setup development environment
3. ⏭️ Create GitHub repository
4. ⏭️ Implement Phase 1 (Core Foundation)
5. ⏭️ Weekly progress reviews

---

**Tổng thời gian ước tính**: 16 tuần (4 tháng)  
**Team size khuyến nghị**: 2-3 developers  
**Budget**: ~$40,000 - $60,000 (tùy theo hourly rate)
