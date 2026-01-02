import { Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConstructionMapService } from './construction-map.service';

interface JoinRoomPayload {
  projectId: string;
}

interface TaskMovedPayload {
  taskId: string;
  x: number;
  y: number;
}

interface TaskStatusChangedPayload {
  taskId: string;
  status: 'pending' | 'in-progress' | 'done' | 'late';
}

interface ZoomChangedPayload {
  zoom: number;
}

interface PanChangedPayload {
  offsetX: number;
  offsetY: number;
}

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
  },
  namespace: '/construction-map',
})
export class ConstructionMapGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ConstructionMapGateway');
  private activeConnections = new Map<string, Set<string>>(); // projectId -> Set<socketId>

  constructor(private readonly service: ConstructionMapService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove from all rooms
    this.activeConnections.forEach((clients, projectId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.activeConnections.delete(projectId);
      }
    });
  }

  // ==================== ROOM MANAGEMENT ====================

  @SubscribeMessage('join-project')
  handleJoinProject(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId } = data;
    const room = `project:${projectId}`;
    
    client.join(room);
    
    if (!this.activeConnections.has(projectId)) {
      this.activeConnections.set(projectId, new Set());
    }
    this.activeConnections.get(projectId).add(client.id);
    
    this.logger.log(`Client ${client.id} joined project ${projectId}`);
    
    // Notify others
    client.to(room).emit('user-joined', {
      userId: client.id,
      timestamp: new Date(),
    });

    return { success: true, projectId };
  }

  @SubscribeMessage('leave-project')
  handleLeaveProject(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId } = data;
    const room = `project:${projectId}`;
    
    client.leave(room);
    
    const clients = this.activeConnections.get(projectId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.activeConnections.delete(projectId);
      }
    }
    
    this.logger.log(`Client ${client.id} left project ${projectId}`);
    
    // Notify others
    client.to(room).emit('user-left', {
      userId: client.id,
      timestamp: new Date(),
    });

    return { success: true, projectId };
  }

  // ==================== REAL-TIME UPDATES ====================

  @SubscribeMessage('task-moved')
  async handleTaskMoved(
    @MessageBody() data: TaskMovedPayload & { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { taskId, x, y, projectId } = data;
    
    try {
      // Update in database
      await this.service.updateTaskPosition(taskId, { x, y });
      
      // Broadcast to all clients in project room (except sender)
      const room = `project:${projectId}`;
      client.to(room).emit('task-moved', {
        taskId,
        x,
        y,
        updatedBy: client.id,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error moving task: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('task-status-changed')
  async handleTaskStatusChanged(
    @MessageBody() data: TaskStatusChangedPayload & { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { taskId, status, projectId } = data;
    
    try {
      // Update in database
      await this.service.updateTaskStatus(taskId, { status });
      
      // Broadcast to all clients in project room
      const room = `project:${projectId}`;
      this.server.to(room).emit('task-status-changed', {
        taskId,
        status,
        updatedBy: client.id,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error changing task status: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('zoom-changed')
  handleZoomChanged(
    @MessageBody() data: ZoomChangedPayload & { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { zoom, projectId } = data;
    const room = `project:${projectId}`;
    
    // Broadcast to others (optional - for collaborative viewing)
    client.to(room).emit('zoom-changed', {
      zoom,
      userId: client.id,
    });

    return { success: true };
  }

  @SubscribeMessage('pan-changed')
  handlePanChanged(
    @MessageBody() data: PanChangedPayload & { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { offsetX, offsetY, projectId } = data;
    const room = `project:${projectId}`;
    
    // Broadcast to others (optional - for collaborative viewing)
    client.to(room).emit('pan-changed', {
      offsetX,
      offsetY,
      userId: client.id,
    });

    return { success: true };
  }

  // ==================== UTILITY ====================

  @SubscribeMessage('ping')
  handlePing() {
    return { pong: true, timestamp: new Date() };
  }

  getActiveConnections(projectId: string): number {
    return this.activeConnections.get(projectId)?.size || 0;
  }
}
