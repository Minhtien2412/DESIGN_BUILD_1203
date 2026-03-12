import config, { SOCKET_EVENTS } from '@/config/construction-map.config';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { Task } from './useConstructionMapAPI';

export interface TaskMovedEvent {
  taskId: string;
  x: number;
  y: number;
  updatedBy: string;
  timestamp: Date;
}

export interface TaskStatusChangedEvent {
  taskId: string;
  status: Task['status'];
  updatedBy: string;
  timestamp: Date;
}

export interface UserJoinedEvent {
  userId: string;
  timestamp: Date;
}

export interface ZoomChangedEvent {
  zoom: number;
  userId: string;
}

export interface PanChangedEvent {
  offsetX: number;
  offsetY: number;
  userId: string;
}

/**
 * Hook for Construction Map WebSocket real-time sync
 * Handles bi-directional communication for collaborative editing
 */
export function useConstructionMapSync(projectId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  // Event handlers (can be overridden)
  const [onTaskMoved, setOnTaskMoved] = useState<((event: TaskMovedEvent) => void) | null>(null);
  const [onTaskStatusChanged, setOnTaskStatusChanged] = useState<((event: TaskStatusChangedEvent) => void) | null>(null);
  const [onUserJoined, setOnUserJoined] = useState<((event: UserJoinedEvent) => void) | null>(null);
  const [onUserLeft, setOnUserLeft] = useState<((event: UserJoinedEvent) => void) | null>(null);
  const [onZoomChanged, setOnZoomChanged] = useState<((event: ZoomChangedEvent) => void) | null>(null);
  const [onPanChanged, setOnPanChanged] = useState<((event: PanChangedEvent) => void) | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!projectId) return;

    const socket = io(config.websocket.url, {
      path: config.websocket.path,
      transports: config.websocket.transports,
      reconnection: config.websocket.reconnection,
      reconnectionDelay: config.websocket.reconnectionDelay,
      reconnectionAttempts: config.websocket.reconnectionAttempts,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[WebSocket] Connected to Construction Map server');
      setConnected(true);
      
      // Join project room
      socket.emit(SOCKET_EVENTS.JOIN_PROJECT, { projectId });
      
      if (config.features.enableDebugLogs) {
        console.log('[WebSocket] Joined project:', projectId);
      }
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server');
      setConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    // Project room events
    socket.on(SOCKET_EVENTS.USER_JOINED, (event: UserJoinedEvent) => {
      if (config.features.enableDebugLogs) {
        console.log('[WebSocket] User joined:', event.userId);
      }
      setActiveUsers(prev => [...prev, event.userId]);
      onUserJoined?.(event);
    });

    socket.on(SOCKET_EVENTS.USER_LEFT, (event: UserJoinedEvent) => {
      if (config.features.enableDebugLogs) {
        console.log('[WebSocket] User left:', event.userId);
      }
      setActiveUsers(prev => prev.filter(id => id !== event.userId));
      onUserLeft?.(event);
    });

    // Task events
    socket.on(SOCKET_EVENTS.TASK_MOVED_BROADCAST, (event: TaskMovedEvent) => {
      if (config.features.enableDebugLogs) {
        console.log('[WebSocket] Task moved:', event);
      }
      onTaskMoved?.(event);
    });

    socket.on(SOCKET_EVENTS.TASK_STATUS_CHANGED_BROADCAST, (event: TaskStatusChangedEvent) => {
      if (config.features.enableDebugLogs) {
        console.log('[WebSocket] Task status changed:', event);
      }
      onTaskStatusChanged?.(event);
    });

    // Canvas events
    socket.on(SOCKET_EVENTS.ZOOM_CHANGED_BROADCAST, (event: ZoomChangedEvent) => {
      onZoomChanged?.(event);
    });

    socket.on(SOCKET_EVENTS.PAN_CHANGED_BROADCAST, (event: PanChangedEvent) => {
      onPanChanged?.(event);
    });

    // Cleanup on unmount
    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_PROJECT, { projectId });
      socket.disconnect();
    };
  }, [projectId]);

  // Emit task moved event
  const emitTaskMoved = useCallback((taskId: string, x: number, y: number) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit(SOCKET_EVENTS.TASK_MOVED, {
      projectId,
      taskId,
      x,
      y,
    });
  }, [projectId]);

  // Emit task status changed event
  const emitTaskStatusChanged = useCallback((taskId: string, status: Task['status']) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit(SOCKET_EVENTS.TASK_STATUS_CHANGED, {
      projectId,
      taskId,
      status,
    });
  }, [projectId]);

  // Emit zoom changed event (optional - for collaborative viewing)
  const emitZoomChanged = useCallback((zoom: number) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit(SOCKET_EVENTS.ZOOM_CHANGED, {
      projectId,
      zoom,
    });
  }, [projectId]);

  // Emit pan changed event (optional - for collaborative viewing)
  const emitPanChanged = useCallback((offsetX: number, offsetY: number) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit(SOCKET_EVENTS.PAN_CHANGED, {
      projectId,
      offsetX,
      offsetY,
    });
  }, [projectId]);

  // Ping for health check
  const ping = useCallback(() => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit(SOCKET_EVENTS.PING);
    socketRef.current.once(SOCKET_EVENTS.PONG, (response: unknown) => {
      if (config.features.enableDebugLogs) {
        console.log('[WebSocket] Pong received:', response);
      }
    });
  }, []);

  return {
    // Connection state
    connected,
    activeUsers,
    
    // Emit events (send to server)
    emitTaskMoved,
    emitTaskStatusChanged,
    emitZoomChanged,
    emitPanChanged,
    ping,
    
    // Set event handlers (receive from server)
    setOnTaskMoved,
    setOnTaskStatusChanged,
    setOnUserJoined,
    setOnUserLeft,
    setOnZoomChanged,
    setOnPanChanged,
  };
}
