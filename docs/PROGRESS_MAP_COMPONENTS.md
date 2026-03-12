# Progress Map - Component Architecture
## React Flow Implementation Guide

---

## 1. File Structure

```
app/
└── construction/
    └── progress-map/
        ├── index.tsx                    # Main canvas page
        ├── _layout.tsx
        ├── components/
        │   ├── ProgressCanvas.tsx       # React Flow wrapper
        │   ├── nodes/
        │   │   ├── PhaseNode.tsx        # Milestone node (01-04)
        │   │   ├── TaskCardNode.tsx     # Task card with status
        │   │   └── BadgeNode.tsx        # Start/End badge
        │   ├── edges/
        │   │   └── DependencyEdge.tsx   # Colored dependency line
        │   ├── Toolbar.tsx              # Zoom controls, export
        │   ├── Sidebar.tsx              # Task templates, filters
        │   ├── Inspector.tsx            # Edit selected task
        │   ├── Legend.tsx               # Trade color legend
        │   └── CustomMiniMap.tsx        # Enhanced minimap
        ├── hooks/
        │   ├── useProgressCanvas.ts     # Canvas state management
        │   ├── useTaskDrag.ts           # Drag-drop logic
        │   └── useRealtimeSync.ts       # WebSocket sync
        ├── stores/
        │   └── canvasStore.ts           # Zustand store
        └── types/
            └── canvas.types.ts          # TypeScript types

services/
└── api/
    └── progressApi.ts                   # API client

BE-baotienweb.cloud/
└── src/
    └── construction-progress/
        ├── construction-progress.module.ts
        ├── construction-progress.controller.ts
        ├── construction-progress.service.ts
        ├── construction-progress.gateway.ts  # WebSocket
        ├── dto/
        │   ├── create-task.dto.ts
        │   ├── update-task-position.dto.ts
        │   └── create-dependency.dto.ts
        └── entities/
            ├── phase.entity.ts
            ├── task.entity.ts
            ├── dependency.entity.ts
            └── trade.entity.ts
```

---

## 2. Core Components

### A. ProgressCanvas.tsx (Main Container)

```typescript
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useProgressCanvas } from '../hooks/useProgressCanvas';
import PhaseNode from './nodes/PhaseNode';
import TaskCardNode from './nodes/TaskCardNode';
import BadgeNode from './nodes/BadgeNode';
import DependencyEdge from './edges/DependencyEdge';

const nodeTypes = {
  phase: PhaseNode,
  task: TaskCardNode,
  badge: BadgeNode,
};

const edgeTypes = {
  dependency: DependencyEdge,
};

export default function ProgressCanvas({ projectId }: { projectId: string }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStop,
    loading
  } = useProgressCanvas(projectId);

  if (loading) return <div>Loading canvas...</div>;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={3}
        snapToGrid
        snapGrid={[20, 20]}
      >
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            if (node.type === 'task') {
              const status = node.data.status;
              return status === 'DONE' ? '#4CAF50' : 
                     status === 'IN_PROGRESS' ? '#FBC02D' : '#BDBDBD';
            }
            return '#2196F3';
          }}
          pannable
          zoomable
        />
        <Controls showInteractive={false} />
        <Background gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
```

### B. TaskCardNode.tsx (Custom Node)

```typescript
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Ionicons } from '@expo/vector-icons';
import { TaskStatus } from '@/types/canvas.types';

interface TaskNodeData {
  code: string;
  title: string;
  status: TaskStatus;
  trade: { name: string; color: string };
  progress?: number;
  assignee?: { name: string; avatar?: string };
}

const STATUS_CONFIG = {
  NOT_STARTED: {
    bg: '#F5F5F5',
    border: '#BDBDBD',
    icon: 'radio-button-off-outline',
    iconColor: '#757575'
  },
  IN_PROGRESS: {
    bg: '#FFF9C4',
    border: '#FBC02D',
    icon: 'reload-circle-outline',
    iconColor: '#F57C00'
  },
  DONE: {
    bg: '#C8E6C9',
    border: '#4CAF50',
    icon: 'checkmark-circle',
    iconColor: '#2E7D32'
  }
};

function TaskCardNode({ data, selected }: NodeProps<TaskNodeData>) {
  const config = STATUS_CONFIG[data.status];
  
  return (
    <div
      style={{
        width: 200,
        backgroundColor: config.bg,
        border: `2px solid ${selected ? '#2196F3' : config.border}`,
        borderRadius: 12,
        padding: 12,
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.1)',
        cursor: 'grab',
      }}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Ionicons name={config.icon as any} size={20} color={config.iconColor} />
        <div
          style={{
            fontSize: 10,
            fontWeight: '600',
            color: '#666',
            background: '#fff',
            padding: '2px 6px',
            borderRadius: 4
          }}
        >
          {data.code}
        </div>
      </div>
      
      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 8 }}>
        {data.title}
      </div>
      
      {/* Trade badge */}
      <div
        style={{
          display: 'inline-block',
          fontSize: 10,
          fontWeight: '500',
          color: '#fff',
          background: data.trade.color,
          padding: '2px 8px',
          borderRadius: 8,
          marginBottom: 8
        }}
      >
        {data.trade.name}
      </div>
      
      {/* Progress bar */}
      {data.progress !== undefined && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>
            {data.progress}% Complete
          </div>
          <div style={{ height: 4, background: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${data.progress}%`,
                background: config.iconColor,
                transition: 'width 0.3s'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Assignee */}
      {data.assignee && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#2196F3',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: '600'
            }}
          >
            {data.assignee.name[0]}
          </div>
          <div style={{ fontSize: 10, color: '#666' }}>{data.assignee.name}</div>
        </div>
      )}
    </div>
  );
}

export default memo(TaskCardNode);
```

### C. PhaseNode.tsx (Milestone)

```typescript
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface PhaseNodeData {
  code: string;
  label: string;
  tasksCount: number;
  completedCount: number;
}

function PhaseNode({ data }: NodeProps<PhaseNodeData>) {
  const completion = data.tasksCount > 0 
    ? Math.round((data.completedCount / data.tasksCount) * 100)
    : 0;
  
  return (
    <div style={{ textAlign: 'center' }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      
      {/* Circle */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#2196F3',
          border: '4px solid #fff',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 24,
          fontWeight: '700',
          position: 'relative'
        }}
      >
        {data.code}
        
        {/* Completion ring */}
        <svg
          style={{ position: 'absolute', top: -4, left: -4, width: 68, height: 68 }}
          viewBox="0 0 68 68"
        >
          <circle
            cx="34"
            cy="34"
            r="30"
            fill="none"
            stroke="#4CAF50"
            strokeWidth="4"
            strokeDasharray={`${completion * 1.88} 188`}
            strokeLinecap="round"
            transform="rotate(-90 34 34)"
          />
        </svg>
      </div>
      
      {/* Label */}
      <div style={{ marginTop: 8, fontSize: 12, fontWeight: '600', color: '#424242' }}>
        {data.label}
      </div>
      <div style={{ fontSize: 10, color: '#757575' }}>
        {data.completedCount}/{data.tasksCount} tasks
      </div>
    </div>
  );
}

export default memo(PhaseNode);
```

### D. DependencyEdge.tsx (Colored Line)

```typescript
import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

function DependencyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  const color = data?.trade?.color || '#2196F3';
  const isDone = data?.sourceStatus === 'DONE' && data?.targetStatus === 'DONE';
  
  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={isDone ? '5,5' : undefined}
        opacity={isDone ? 0.4 : 1}
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={color} />
        </marker>
      </defs>
    </>
  );
}

export default memo(DependencyEdge);
```

---

## 3. Custom Hook - useProgressCanvas.ts

```typescript
import { useCallback, useEffect } from 'react';
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeDragHandler
} from 'reactflow';
import { progressApi } from '@/services/api/progressApi';
import { useRealtimeSync } from './useRealtimeSync';

export function useProgressCanvas(projectId: string) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  
  // Load initial data
  useEffect(() => {
    loadCanvas();
  }, [projectId]);
  
  const loadCanvas = async () => {
    try {
      const data = await progressApi.getCanvasData(projectId);
      
      // Transform to React Flow format
      const phaseNodes: Node[] = data.phases.map(p => ({
        id: `phase-${p.id}`,
        type: 'phase',
        position: { x: p.layoutX, y: p.layoutY },
        data: {
          code: p.code,
          label: p.name,
          tasksCount: p.tasksCount,
          completedCount: p.completedCount
        }
      }));
      
      const taskNodes: Node[] = data.tasks.map(t => ({
        id: `task-${t.id}`,
        type: 'task',
        position: { x: t.layoutX, y: t.layoutY },
        data: {
          code: t.code,
          title: t.title,
          status: t.status,
          trade: t.trade,
          progress: t.progress,
          assignee: t.assignee
        }
      }));
      
      const dependencyEdges: Edge[] = data.dependencies.map(d => ({
        id: `dep-${d.id}`,
        source: `task-${d.fromTaskId}`,
        target: `task-${d.toTaskId}`,
        type: 'dependency',
        data: {
          trade: d.trade,
          sourceStatus: d.fromTask.status,
          targetStatus: d.toTask.status
        }
      }));
      
      setNodes([...phaseNodes, ...taskNodes]);
      setEdges(dependencyEdges);
    } catch (error) {
      console.error('Failed to load canvas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle node drag stop (save position)
  const onNodeDragStop: NodeDragHandler = useCallback(async (event, node) => {
    if (node.type === 'task') {
      const taskId = parseInt(node.id.replace('task-', ''));
      await progressApi.updateTaskPosition(taskId, node.position);
    }
  }, []);
  
  // Handle connect (create dependency)
  const onConnect = useCallback(async (connection: Connection) => {
    const sourceId = parseInt(connection.source!.replace('task-', ''));
    const targetId = parseInt(connection.target!.replace('task-', ''));
    
    await progressApi.createDependency({ fromTaskId: sourceId, toTaskId: targetId });
    
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);
  
  // Realtime sync
  useRealtimeSync({
    projectId,
    onTaskMoved: (data) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === `task-${data.taskId}`
            ? { ...n, position: data.position }
            : n
        )
      );
    },
    onTaskStatusChanged: (data) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === `task-${data.taskId}`
            ? { ...n, data: { ...n.data, status: data.status } }
            : n
        )
      );
    }
  });
  
  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStop,
    loading
  };
}
```

---

## 4. Backend Controller

```typescript
// construction-progress.controller.ts
import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { ConstructionProgressService } from './construction-progress.service';

@Controller('construction-progress')
export class ConstructionProgressController {
  constructor(private readonly service: ConstructionProgressService) {}
  
  @Get('projects/:id/canvas')
  async getCanvasData(@Param('id') projectId: string) {
    return this.service.getCanvasData(parseInt(projectId));
  }
  
  @Post('tasks')
  async createTask(@Body() dto: CreateTaskDto) {
    return this.service.createTask(dto);
  }
  
  @Patch('tasks/:id/position')
  async updateTaskPosition(
    @Param('id') taskId: string,
    @Body() dto: { layoutX: number; layoutY: number }
  ) {
    return this.service.updateTaskPosition(parseInt(taskId), dto);
  }
  
  @Patch('tasks/:id/status')
  async updateTaskStatus(
    @Param('id') taskId: string,
    @Body() dto: { status: TaskStatus }
  ) {
    return this.service.updateTaskStatus(parseInt(taskId), dto.status);
  }
  
  @Post('dependencies')
  async createDependency(@Body() dto: CreateDependencyDto) {
    return this.service.createDependency(dto);
  }
}
```

---

**Next**: Implement WebSocket gateway cho realtime collaboration.

