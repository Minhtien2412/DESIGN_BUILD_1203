# Construction Map Library

> 2D infinite canvas library for construction progress visualization with zoom, pan, and real-time data synchronization.

## Features

- ✅ **Infinite Canvas**: Unlimited 2D workspace without boundaries
- ✅ **Smooth Zoom & Pan**: Hardware-accelerated transformations
- ✅ **Performance Optimized**: Viewport culling, spatial indexing, LOD
- ✅ **Touch Gestures**: Pinch-to-zoom, two-finger pan
- ✅ **Real-time Sync**: WebSocket integration for live updates
- ✅ **Export**: PNG, SVG, PDF output
- ✅ **TypeScript**: Full type safety
- ✅ **Framework Agnostic**: Use with React, Vue, Angular, or vanilla JS

## Installation

```bash
npm install @construction-app/canvas-map
```

## Quick Start

```typescript
import { ConstructionMapEngine } from '@construction-app/canvas-map';

// Create engine instance
const engine = new ConstructionMapEngine({
  container: document.getElementById('map-container'),
  minZoom: 0.1,
  maxZoom: 5.0,
  initialZoom: 1.0
});

// Add objects
engine.addStage({
  id: 'stage-1',
  number: '01',
  label: 'Khởi đầu',
  x: 100,
  y: 200,
  status: 'active'
});

engine.addTask({
  id: 'task-1',
  stageId: 'stage-1',
  label: 'Đào móng',
  x: 300,
  y: 200,
  status: 'in-progress',
  progress: 75
});

// Listen to events
engine.on('task-selected', (task) => {
  console.log('Task selected:', task.label);
});

// Zoom controls
engine.zoomIn();
engine.zoomOut();
engine.resetView();
```

## React Integration

```tsx
import { useConstructionMap } from '@construction-app/canvas-map/react';

function ConstructionMapCanvas({ projectId }: { projectId: string }) {
  const { containerRef, engine, zoomIn, zoomOut, resetView } = useConstructionMap(projectId);
  
  return (
    <div className="map-wrapper">
      <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
      
      <div className="controls">
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={resetView}>Reset</button>
      </div>
    </div>
  );
}
```

## API Documentation

### Engine Methods

| Method | Description |
|--------|-------------|
| `addStage(stage)` | Add a stage node |
| `addTask(task)` | Add a task node |
| `removeObject(id)` | Remove an object |
| `getObject(id)` | Get object by ID |
| `zoomIn()` | Zoom in by 1.2x |
| `zoomOut()` | Zoom out by 0.8x |
| `zoomTo(level)` | Set zoom level |
| `panTo(x, y)` | Pan to coordinates |
| `fitToView()` | Fit all objects in viewport |
| `exportToPNG()` | Export as PNG blob |
| `destroy()` | Clean up resources |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `task-selected` | `TaskData` | Task clicked |
| `task-moved` | `TaskData` | Task dragged |
| `task-status-changed` | `{taskId, status}` | Status updated |
| `zoom-changed` | `{zoom}` | Zoom level changed |
| `pan-changed` | `{x, y}` | Pan position changed |

## Performance

- **60 FPS** rendering for up to 5,000 objects
- **Viewport culling** - only render visible objects
- **Spatial indexing** - R-tree for fast queries
- **LOD system** - reduce detail when zoomed out
- **Canvas pooling** - multiple layers for optimization

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Documentation

Full documentation: [See CONSTRUCTION_MAP_LIBRARY_PLAN.md](../../docs/CONSTRUCTION_MAP_LIBRARY_PLAN.md)
