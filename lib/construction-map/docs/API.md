# API Reference - Construction Map Library

## Core Classes

### ConstructionMapEngine

Main engine class for managing the canvas and objects.

#### Constructor

```typescript
constructor(config: EngineConfig)
```

**Parameters:**

```typescript
interface EngineConfig {
  container: HTMLElement;        // DOM container for canvas
  width?: number;                // Canvas width (default: container width)
  height?: number;               // Canvas height (default: container height)
  enableWebGL?: boolean;         // Use WebGL renderer (default: false)
  maxZoom?: number;              // Maximum zoom level (default: 5.0)
  minZoom?: number;              // Minimum zoom level (default: 0.1)
  initialZoom?: number;          // Starting zoom level (default: 1.0)
  backgroundColor?: string;      // Canvas background (default: '#ffffff')
  gridEnabled?: boolean;         // Show grid overlay (default: true)
  gridSpacing?: number;          // Grid cell size (default: 40)
}
```

#### Methods

##### Object Management

```typescript
// Add a stage to the canvas
addStage(stage: StageData): void

// Add a task to the canvas
addTask(task: TaskData): void

// Add a link between objects
addLink(link: LinkData): void

// Remove any object by ID
removeObject(id: string): void

// Get object by ID
getObject(id: string): BaseObject | undefined

// Get all objects
getAllObjects(): BaseObject[]

// Clear all objects
clear(): void
```

##### Camera Control

```typescript
// Zoom in by 1.2x
zoomIn(): void

// Zoom out by 0.8x
zoomOut(): void

// Set absolute zoom level
zoomTo(level: number): void

// Zoom to specific point
zoomToPoint(level: number, screenX: number, screenY: number): void

// Pan by delta (in world coordinates)
pan(deltaX: number, deltaY: number): void

// Pan to absolute position
panTo(x: number, y: number): void

// Fit all objects in viewport
fitToView(objects?: BaseObject[]): void

// Reset to initial view
resetView(): void
```

##### Selection

```typescript
// Select object(s)
select(id: string | string[]): void

// Deselect object(s)
deselect(id: string | string[]): void

// Clear selection
clearSelection(): void

// Get selected objects
getSelection(): BaseObject[]
```

##### Export

```typescript
// Export as PNG blob
exportToPNG(): Promise<Blob>

// Export as SVG string
exportToSVG(): string

// Export as PDF (requires jsPDF)
exportToPDF(): Promise<Blob>

// Get current state as JSON
getState(): MapState

// Restore from state
setState(state: MapState): void
```

##### Events

```typescript
// Listen to events
on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void

// Remove event listener
off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void

// Emit event (internal use)
emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void
```

##### Lifecycle

```typescript
// Start render loop
start(): void

// Stop render loop
stop(): void

// Destroy engine and cleanup
destroy(): void
```

---

### Camera

Camera system for viewport transformations.

#### Methods

```typescript
// Transform world coordinates to screen coordinates
worldToScreen(worldX: number, worldY: number): Point

// Transform screen coordinates to world coordinates
screenToWorld(screenX: number, screenY: number): Point

// Zoom to point (keeps point under cursor)
zoomToPoint(zoomDelta: number, screenX: number, screenY: number, animated?: boolean): void

// Zoom by factor (centered)
zoomBy(factor: number, animated?: boolean): void

// Set absolute zoom
setZoom(zoom: number, animated?: boolean): void

// Pan by delta
pan(deltaX: number, deltaY: number, animated?: boolean): void

// Set absolute pan position
setPan(x: number, y: number, animated?: boolean): void

// Fit bounds to viewport
fitToBounds(bounds: BBox, padding?: number, animated?: boolean): void

// Update camera (call in render loop)
update(deltaTime: number): boolean

// Get visible world bounds
getVisibleBounds(): BBox

// Get camera state
getState(): CameraState

// Getters
getZoom(): number
getOffsetX(): number
getOffsetY(): number
```

---

## Data Types

### TaskData

```typescript
interface TaskData {
  id: string;                    // Unique identifier
  stageId: string;               // Parent stage ID
  label: string;                 // Display name
  description?: string;          // Detailed description
  status: TaskStatus;            // Current status
  progress: number;              // 0-100
  x: number;                     // Canvas X position
  y: number;                     // Canvas Y position
  width?: number;                // Custom width (default: 170)
  height?: number;               // Custom height (default: 46)
  assignedWorkers?: string[];    // Worker IDs
  startDate?: Date;              // Planned start
  endDate?: Date;                // Planned end
  dependencies?: string[];       // Task IDs that must complete first
  notes?: string;                // Additional notes
  photos?: string[];             // Photo URLs
}

type TaskStatus = 'pending' | 'in-progress' | 'done' | 'late';
```

### StageData

```typescript
interface StageData {
  id: string;                    // Unique identifier
  number: string;                // Display number ("01", "02", etc.)
  label: string;                 // Display name
  description?: string;          // Detailed description
  status: StageStatus;           // Current status
  x: number;                     // Canvas X position
  y: number;                     // Canvas Y position
  startDate?: Date;              // Planned start
  endDate?: Date;                // Planned end
  taskIds?: string[];            // Associated task IDs
}

type StageStatus = 'upcoming' | 'active' | 'completed';
```

### LinkData

```typescript
interface LinkData {
  id: string;                    // Unique identifier
  sourceId: string;              // Source object ID
  targetId: string;              // Target object ID
  type: 'dependency' | 'stage-task'; // Link type
  style?: {
    color?: string;              // Line color
    width?: number;              // Line width
    dashArray?: number[];        // Dash pattern
  };
}
```

### MapState

```typescript
interface MapState {
  projectId: string;             // Project identifier
  zoom: number;                  // Current zoom level
  offsetX: number;               // Pan X offset
  offsetY: number;               // Pan Y offset
  selectedTaskIds: string[];     // Selected task IDs
  version: number;               // Version for conflict resolution
  lastModified: Date;            // Last modification timestamp
}
```

---

## Events

### Event Map

```typescript
type EventMap = {
  'task-selected': TaskData;
  'task-deselected': TaskData;
  'task-moved': TaskData;
  'task-created': TaskData;
  'task-deleted': string;
  'task-status-changed': { taskId: string; status: TaskStatus };
  'stage-selected': StageData;
  'zoom-changed': { zoom: number };
  'pan-changed': { x: number; y: number };
  'viewport-changed': BBox;
  'data-loaded': ConstructionProject;
  'data-changed': any;
  'error': Error;
};
```

### Usage

```typescript
// Listen to task selection
engine.on('task-selected', (task) => {
  console.log('Selected task:', task.label);
});

// Listen to zoom changes
engine.on('zoom-changed', ({ zoom }) => {
  console.log('Zoom level:', zoom);
});

// Listen to task moves (for server sync)
engine.on('task-moved', async (task) => {
  await api.updateTaskPosition(task.id, task.x, task.y);
});
```

---

## Constants

### STATUS_CONFIG

Predefined styles for task statuses:

```typescript
const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  pending: {
    color: '#9e9e9e',      // Border color
    fill: '#f0f0f0',       // Background color
    progress: 0,           // Default progress
    label: 'Chưa bắt đầu', // Vietnamese label
  },
  'in-progress': {
    color: '#ffb300',
    fill: '#fff8e1',
    progress: 0.5,
    label: 'Đang thực hiện',
  },
  done: {
    color: '#4caf50',
    fill: '#e8f5e9',
    progress: 1,
    label: 'Hoàn thành',
  },
  late: {
    color: '#e53935',
    fill: '#ffebee',
    progress: 0.3,
    label: 'Trễ hạn',
  },
};
```

---

## Advanced Usage

### Custom Rendering

```typescript
import { BaseObject } from '@construction-app/canvas-map';

class CustomTask extends BaseObject {
  render(ctx: RenderContext): void {
    const { ctx: canvas, camera } = ctx;
    const screen = camera.worldToScreen(this.x, this.y);
    
    // Custom rendering logic
    canvas.fillStyle = '#custom-color';
    canvas.fillRect(screen.x, screen.y, 100, 50);
  }
}
```

### Performance Monitoring

```typescript
engine.on('performance', (stats) => {
  console.log('FPS:', stats.fps);
  console.log('Objects rendered:', stats.objectsRendered);
  console.log('Render time:', stats.renderTime);
});
```

### Real-time Sync

```typescript
// Connect to WebSocket
const syncEngine = new SyncEngine(engine);
syncEngine.connect(projectId);

// Auto-sync on changes
engine.on('task-moved', (task) => {
  syncEngine.sendChange({
    type: 'task_moved',
    taskId: task.id,
    x: task.x,
    y: task.y,
  });
});

// Handle incoming updates
syncEngine.on('remote-change', (change) => {
  engine.applyChange(change);
});
```

---

## Error Handling

```typescript
engine.on('error', (error) => {
  console.error('Engine error:', error);
  
  // Show user-friendly message
  showNotification('Đã xảy ra lỗi, vui lòng thử lại');
});

try {
  await engine.exportToPNG();
} catch (error) {
  console.error('Export failed:', error);
}
```
