# Construction Map Backend Integration Guide

## 📋 Tổng quan

File này hướng dẫn cách sử dụng backend API và WebSocket cho Construction Map trong React/React Native.

## 🔧 Cài đặt

```bash
npm install socket.io-client
```

## 📁 File cấu hình

**`config/construction-map.config.ts`** - File cấu hình tập trung cho tất cả môi trường

### Các môi trường có sẵn:
- **Development**: IP trực tiếp `http://103.200.20.100`
- **Staging**: Domain staging (tùy chọn)
- **Production**: Domain chính `https://baotienweb.cloud`

### Tự động chọn môi trường:
```typescript
import config from '@/config/construction-map.config';

// Config tự động chọn môi trường dựa trên __DEV__ hoặc process.env.NODE_ENV
console.log(config.api.baseUrl); // Development: http://103.200.20.100:3003/api/construction-map
                                  // Production: https://baotienweb.cloud/api/construction-map
```

## 🎯 Cách sử dụng

### 1️⃣ REST API Hook - `useConstructionMapAPI`

Hook này quản lý tất cả CRUD operations với backend.

```typescript
import { useConstructionMapAPI } from '@/hooks/useConstructionMapAPI';

function ProjectScreen({ projectId }: { projectId: string }) {
  const {
    data,           // Dữ liệu project (stages, tasks, links)
    loading,        // Trạng thái loading
    error,          // Lỗi nếu có
    refresh,        // Làm mới dữ liệu
    createTask,     // Tạo task mới
    updateTask,     // Cập nhật task
    deleteTask,     // Xóa task
    updateTaskPosition,  // Di chuyển task (drag & drop)
    updateTaskStatus,    // Thay đổi trạng thái task
    createStage,    // Tạo giai đoạn mới
    saveMapState,   // Lưu trạng thái canvas (zoom, pan)
    loadMapState,   // Khôi phục trạng thái canvas
    getProgress,    // Lấy % tiến độ
  } = useConstructionMapAPI(projectId);

  if (loading) return <Loader />;
  if (error) return <Text>Lỗi: {error.message}</Text>;
  
  return (
    <View>
      <Text>Tổng số tasks: {data?.tasks.length}</Text>
      {data?.stages.map(stage => (
        <StageCard key={stage.id} stage={stage} />
      ))}
    </View>
  );
}
```

### 2️⃣ WebSocket Hook - `useConstructionMapSync`

Hook này quản lý real-time sync giữa nhiều users.

```typescript
import { useConstructionMapSync } from '@/hooks/useConstructionMapSync';

function CollaborativeMap({ projectId }: { projectId: string }) {
  const {
    connected,           // Trạng thái kết nối WebSocket
    activeUsers,         // Danh sách users đang online
    emitTaskMoved,       // Broadcast khi di chuyển task
    emitTaskStatusChanged, // Broadcast khi thay đổi status
    setOnTaskMoved,      // Lắng nghe task bị di chuyển
    setOnTaskStatusChanged, // Lắng nghe task đổi status
    setOnUserJoined,     // Lắng nghe user mới join
    setOnUserLeft,       // Lắng nghe user rời đi
  } = useConstructionMapSync(projectId);

  // Setup listeners khi component mount
  useEffect(() => {
    // Lắng nghe task bị user khác di chuyển
    setOnTaskMoved((event) => {
      console.log(`Task ${event.taskId} moved to (${event.x}, ${event.y}) by ${event.updatedBy}`);
      // Cập nhật UI local
      updateLocalTaskPosition(event.taskId, event.x, event.y);
    });

    // Lắng nghe task đổi status từ user khác
    setOnTaskStatusChanged((event) => {
      console.log(`Task ${event.taskId} status: ${event.status}`);
      updateLocalTaskStatus(event.taskId, event.status);
    });

    // Lắng nghe user mới join
    setOnUserJoined((event) => {
      showToast(`${event.userId} vừa tham gia`);
    });
  }, []);

  return (
    <View>
      <Text>WebSocket: {connected ? '🟢 Connected' : '🔴 Disconnected'}</Text>
      <Text>Online: {activeUsers.length} users</Text>
    </View>
  );
}
```

### 3️⃣ Kết hợp cả 2 hooks

```typescript
import { useConstructionMapAPI } from '@/hooks/useConstructionMapAPI';
import { useConstructionMapSync } from '@/hooks/useConstructionMapSync';

function InteractiveProgressMap({ projectId }: { projectId: string }) {
  // REST API cho CRUD
  const { data, updateTaskPosition } = useConstructionMapAPI(projectId);
  
  // WebSocket cho real-time sync
  const { emitTaskMoved, setOnTaskMoved } = useConstructionMapSync(projectId);

  // Lắng nghe task bị user khác di chuyển
  useEffect(() => {
    setOnTaskMoved((event) => {
      // Cập nhật canvas local ngay lập tức
      canvas.moveTask(event.taskId, event.x, event.y);
    });
  }, []);

  // Handler khi user drag task
  const handleTaskDrag = async (taskId: string, newX: number, newY: number) => {
    // 1. Cập nhật UI ngay (optimistic update)
    canvas.moveTask(taskId, newX, newY);
    
    // 2. Broadcast đến users khác qua WebSocket
    emitTaskMoved(taskId, newX, newY);
    
    // 3. Lưu vào database qua REST API
    try {
      await updateTaskPosition(taskId, newX, newY);
    } catch (error) {
      // Rollback nếu lỗi
      canvas.moveTask(taskId, oldX, oldY);
      showError('Không thể di chuyển task');
    }
  };

  return (
    <Canvas 
      tasks={data?.tasks} 
      onTaskDrag={handleTaskDrag}
    />
  );
}
```

## 🔐 Sử dụng Config trực tiếp

### Lấy URL endpoints:

```typescript
import { getApiUrl, API_ENDPOINTS } from '@/config/construction-map.config';

// Lấy URL health check
const healthUrl = getApiUrl(API_ENDPOINTS.health);
// => Development: "http://103.200.20.100:3003/api/construction-map/health"
// => Production: "https://baotienweb.cloud/api/construction-map/health"

// Lấy URL get project
const projectUrl = getApiUrl(API_ENDPOINTS.getProject('project-123'));
// => "http://103.200.20.100:3003/api/construction-map/project-123"

// Custom fetch với timeout từ config
import config from '@/config/construction-map.config';

const response = await fetch(healthUrl, {
  signal: AbortSignal.timeout(config.api.timeout), // 10s dev, 20s prod
});
```

### Sử dụng WebSocket Events:

```typescript
import { SOCKET_EVENTS } from '@/config/construction-map.config';

// Emit events
socket.emit(SOCKET_EVENTS.JOIN_PROJECT, { projectId: 'abc' });
socket.emit(SOCKET_EVENTS.TASK_MOVED, { taskId, x, y });

// Listen events
socket.on(SOCKET_EVENTS.TASK_MOVED_BROADCAST, (event) => {
  console.log('Task moved:', event);
});

socket.on(SOCKET_EVENTS.USER_JOINED, (event) => {
  console.log('User joined:', event.userId);
});
```

### Kiểm tra feature flags:

```typescript
import { isFeatureEnabled } from '@/config/construction-map.config';

if (isFeatureEnabled('enableRealTimeSync')) {
  // Kích hoạt WebSocket
  initWebSocket();
}

if (isFeatureEnabled('enableDebugLogs')) {
  console.log('Debug mode ON');
}

if (isFeatureEnabled('enableOfflineMode')) {
  // Cache data local
  saveToAsyncStorage(data);
}
```

## 📊 Danh sách API Endpoints

Tất cả endpoints đều có trong `API_ENDPOINTS`:

```typescript
import { API_ENDPOINTS } from '@/config/construction-map.config';

// Health
API_ENDPOINTS.health // => "/health"

// Project
API_ENDPOINTS.getProject('project-1') // => "/project-1"
API_ENDPOINTS.getProgress('project-1') // => "/project-1/progress"

// Map State
API_ENDPOINTS.getMapState('project-1') // => "/project-1/state"
API_ENDPOINTS.saveMapState('project-1') // => "/project-1/state"

// Tasks
API_ENDPOINTS.createTask // => "/tasks"
API_ENDPOINTS.getTask('task-1') // => "/tasks/task-1"
API_ENDPOINTS.updateTask('task-1') // => "/tasks/task-1"
API_ENDPOINTS.deleteTask('task-1') // => "/tasks/task-1"
API_ENDPOINTS.updateTaskPosition('task-1') // => "/tasks/task-1/position"
API_ENDPOINTS.updateTaskStatus('task-1') // => "/tasks/task-1/status"

// Stages
API_ENDPOINTS.createStage // => "/stages"
API_ENDPOINTS.getStage('stage-1') // => "/stages/stage-1"

// Links
API_ENDPOINTS.createLink // => "/links"
API_ENDPOINTS.deleteLink('link-1') // => "/links/link-1"
```

## 📡 Danh sách WebSocket Events

```typescript
import { SOCKET_EVENTS } from '@/config/construction-map.config';

// Client → Server (Emit)
SOCKET_EVENTS.JOIN_PROJECT          // 'join-project'
SOCKET_EVENTS.LEAVE_PROJECT         // 'leave-project'
SOCKET_EVENTS.TASK_MOVED            // 'task-moved'
SOCKET_EVENTS.TASK_STATUS_CHANGED   // 'task-status-changed'
SOCKET_EVENTS.ZOOM_CHANGED          // 'zoom-changed'
SOCKET_EVENTS.PAN_CHANGED           // 'pan-changed'
SOCKET_EVENTS.PING                  // 'ping'

// Server → Client (Listen)
SOCKET_EVENTS.USER_JOINED                    // 'user-joined'
SOCKET_EVENTS.USER_LEFT                      // 'user-left'
SOCKET_EVENTS.TASK_MOVED_BROADCAST           // 'task-moved'
SOCKET_EVENTS.TASK_STATUS_CHANGED_BROADCAST  // 'task-status-changed'
SOCKET_EVENTS.ZOOM_CHANGED_BROADCAST         // 'zoom-changed'
SOCKET_EVENTS.PAN_CHANGED_BROADCAST          // 'pan-changed'
SOCKET_EVENTS.PONG                           // 'pong'
```

## 🌍 Thay đổi môi trường

### Auto (khuyến nghị):
```typescript
// Config tự động chọn môi trường
import config from '@/config/construction-map.config';
```

### Manual (nếu cần):
```typescript
import { getConstructionMapConfig } from '@/config/construction-map.config';

// Force development
const devConfig = getConstructionMapConfig('development');

// Force production
const prodConfig = getConstructionMapConfig('production');

// Force staging
const stagingConfig = getConstructionMapConfig('staging');
```

### Override config cho testing:
```typescript
import { developmentConfig } from '@/config/construction-map.config';

const testConfig = {
  ...developmentConfig,
  api: {
    ...developmentConfig.api,
    baseUrl: 'http://localhost:3003/api/construction-map', // Local testing
  },
};
```

## ⚙️ Cấu hình nâng cao

### Thay đổi timeout:
```typescript
import config from '@/config/construction-map.config';

// Development: 10s
// Production: 20s
config.api.timeout

// Custom timeout cho 1 request
fetch(url, {
  signal: AbortSignal.timeout(5000), // 5s
});
```

### Retry logic:
```typescript
import config from '@/config/construction-map.config';

async function fetchWithRetry(url: string) {
  for (let i = 0; i < config.api.retryAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === config.api.retryAttempts - 1) throw error;
      await new Promise(r => setTimeout(r, config.api.retryDelay));
    }
  }
}
```

### Cache strategy:
```typescript
import config from '@/config/construction-map.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'construction-map-cache';

async function getCachedData(projectId: string) {
  const cached = await AsyncStorage.getItem(`${CACHE_KEY}-${projectId}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    // Check if cache still valid
    if (age < config.performance.cacheTimeout) {
      return data;
    }
  }
  return null;
}

async function setCachedData(projectId: string, data: any) {
  await AsyncStorage.setItem(`${CACHE_KEY}-${projectId}`, JSON.stringify({
    data,
    timestamp: Date.now(),
  }));
}
```

## 🚨 Error Handling

```typescript
import { ERROR_MESSAGES } from '@/config/construction-map.config';

try {
  const response = await fetch(url);
  if (!response.ok) {
    switch (response.status) {
      case 401:
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      case 404:
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      case 500:
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      default:
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }
} catch (error) {
  if (error instanceof TypeError) {
    // Network error
    Alert.alert('Lỗi', ERROR_MESSAGES.CONNECTION_FAILED);
  } else {
    Alert.alert('Lỗi', error.message);
  }
}
```

## 📝 Example: Full Integration

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useConstructionMapAPI } from '@/hooks/useConstructionMapAPI';
import { useConstructionMapSync } from '@/hooks/useConstructionMapSync';
import config, { isFeatureEnabled } from '@/config/construction-map.config';

export default function ConstructionMapScreen({ route }) {
  const { projectId } = route.params;
  
  // REST API Hook
  const {
    data,
    loading,
    error,
    refresh,
    updateTaskPosition,
    updateTaskStatus,
  } = useConstructionMapAPI(projectId);
  
  // WebSocket Hook (chỉ khi feature enabled)
  const wsEnabled = isFeatureEnabled('enableRealTimeSync');
  const {
    connected,
    activeUsers,
    emitTaskMoved,
    emitTaskStatusChanged,
    setOnTaskMoved,
    setOnTaskStatusChanged,
    setOnUserJoined,
  } = useConstructionMapSync(wsEnabled ? projectId : '');
  
  // Setup WebSocket listeners
  useEffect(() => {
    if (!wsEnabled) return;
    
    setOnTaskMoved((event) => {
      // Update local state from other users
      console.log(`Remote task moved: ${event.taskId}`);
    });
    
    setOnTaskStatusChanged((event) => {
      console.log(`Remote task status: ${event.status}`);
    });
    
    setOnUserJoined((event) => {
      Alert.alert('Thông báo', `${event.userId} vừa tham gia`);
    });
  }, [wsEnabled]);
  
  // Handle task drag
  const handleTaskDrag = async (taskId: string, x: number, y: number) => {
    try {
      // Optimistic update
      // ... update UI immediately
      
      // Broadcast to other users
      if (wsEnabled) {
        emitTaskMoved(taskId, x, y);
      }
      
      // Save to database
      await updateTaskPosition(taskId, x, y);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể di chuyển task');
    }
  };
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Đang tải dữ liệu từ {config.api.baseUrl}</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Lỗi: {error.message}</Text>
        <Button title="Thử lại" onPress={refresh} />
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <Text>Environment: {config.env}</Text>
        <Text>API: {config.api.baseUrl}</Text>
        {wsEnabled && (
          <Text>
            WebSocket: {connected ? '🟢' : '🔴'} | 
            Online: {activeUsers.length} users
          </Text>
        )}
      </View>
      
      {/* Canvas */}
      <InteractiveCanvas
        stages={data?.stages}
        tasks={data?.tasks}
        links={data?.links}
        onTaskDrag={handleTaskDrag}
      />
    </View>
  );
}
```

## 🔄 Migration từ hardcoded URLs

### Before:
```typescript
const API_URL = 'http://103.200.20.100:3003/api/construction-map';
fetch(`${API_URL}/health`);
```

### After:
```typescript
import { getApiUrl, API_ENDPOINTS } from '@/config/construction-map.config';
fetch(getApiUrl(API_ENDPOINTS.health));
```

## 📚 Tài liệu bổ sung

- Backend API Docs: `backend-nestjs/README.md`
- Touch Gestures Spec: `docs/TOUCH_GESTURES_SPEC.md`
- WebSocket Events: `backend-nestjs/src/construction-map/construction-map.gateway.ts`

## 🆘 Troubleshooting

### WebSocket không kết nối được:
1. Check `config.websocket.url` có đúng không
2. Kiểm tra port 3002 có mở không
3. Thử fallback sang polling: `transports: ['polling']`

### API timeout:
1. Tăng `config.api.timeout` trong development
2. Check network connection
3. Verify backend đang chạy: `pm2 list`

### Cache không hoạt động:
1. Check `config.performance.cacheTimeout`
2. Clear AsyncStorage cache
3. Disable cache trong development

---

**Last Updated**: December 4, 2025  
**Author**: Construction Map Development Team
