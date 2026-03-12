# Touch Gestures Specification - Construction Map

## 📱 Tổng quan hệ thống cảm ứng

App hỗ trợ **đa điểm cảm ứng** (multi-touch) với trải nghiệm tự nhiên, mượt mà.

---

## 🖐️ Các loại cảm ứng

### 1️⃣ MỘT NGÓN TAY (Single Touch)

#### **1.1. Giữ (Long Press) - 500ms**
- **Chức năng**: Chọn/Bỏ chọn Task hoặc Stage
- **Hành động**:
  * Giữ trên Task → Hiển thị menu context (Sửa/Xóa/Đổi trạng thái)
  * Giữ trên Stage → Hiển thị chi tiết Stage
  * Giữ trên vùng trống → Tạo Task/Stage mới
- **Visual feedback**: 
  * Ripple effect màu xanh
  * Vibration nhẹ (50ms)
  * Scale nhẹ 1.05x

#### **1.2. Nhấn đơn (Tap)**
- **Chức năng**: Chọn nhanh hoặc mở chi tiết
- **Hành động**:
  * Tap vào Task → Hiển thị thông tin task (panel bên phải)
  * Tap vào Stage → Mở rộng/Thu gọn các tasks trong stage
  * Tap vào vùng trống → Bỏ chọn tất cả
- **Visual feedback**: Highlight viền màu primary

#### **1.3. Nhấn đúp (Double Tap)**
- **Chức năng**: Zoom to fit
- **Hành động**:
  * Double tap trên Task → Zoom 100% tập trung vào task đó
  * Double tap trên Stage → Zoom fit tất cả tasks trong stage
  * Double tap vào vùng trống → Reset zoom về 100% (center canvas)
- **Animation**: Smooth zoom 300ms với easing

#### **1.4. Kéo (Drag)**
- **Chức năng**: Di chuyển đối tượng
- **Hành động**:
  * Kéo Task → Di chuyển vị trí task (cập nhật x, y)
  * Kéo Stage → Di chuyển cả stage và tasks con
  * Kéo từ Task A → Task B → Tạo dependency link
- **Visual feedback**:
  * Shadow mờ dưới đối tượng đang kéo
  * Grid snapping (mỗi 10px)
  * Đường nét đứt khi tạo link
- **WebSocket**: Broadcast real-time `task-moved` event

#### **1.5. Pan (Kéo canvas)**
- **Chức năng**: Di chuyển toàn bộ canvas
- **Điều kiện**: Kéo trên vùng trống (không phải Task/Stage)
- **Hành động**: Thay đổi offsetX, offsetY của camera
- **Smooth**: Inertia scrolling (tiếp tục lăn khi thả tay)
- **Giới hạn**: Infinite canvas (không giới hạn)

---

### 2️⃣ HAI NGÓN TAY (Two-Finger Gestures) ⭐

#### **2.1. Pinch Zoom (Kéo vào/ra)**
- **Chức năng**: Thu phóng canvas
- **Hành động**:
  * **Kéo RA (Pinch Out)** → Zoom IN (phóng to)
  * **Kéo VÀO (Pinch In)** → Zoom OUT (thu nhỏ)
- **Giới hạn**: 
  * Min zoom: **0.1x** (10%) - nhìn toàn cảnh
  * Max zoom: **5.0x** (500%) - xem chi tiết
- **Pivot point**: Zoom tại điểm giữa 2 ngón tay
- **Smooth**: 60 FPS với transform GPU
- **Visual feedback**: 
  * Hiển thị % zoom ở góc dưới phải (overlay)
  * "100%" khi về scale gốc

**Code implementation**:
```typescript
// lib/construction-map/src/core/GestureHandler.ts
handlePinch(event: PinchEvent) {
  const delta = event.scale - this.lastScale;
  const centerX = (event.touches[0].x + event.touches[1].x) / 2;
  const centerY = (event.touches[0].y + event.touches[1].y) / 2;
  
  this.camera.zoomToPoint(delta, centerX, centerY);
  this.lastScale = event.scale;
  
  // Clamp zoom
  this.camera.zoom = Math.max(0.1, Math.min(5.0, this.camera.zoom));
}
```

#### **2.2. Rotate (Xoay 2 ngón)**
- **Chức năng**: Xoay canvas (optional - có thể tắt)
- **Hành động**: Xoay toàn bộ view
- **Giới hạn**: 0° - 360°
- **Snap**: Snap về 0°, 90°, 180°, 270° khi gần (±5°)
- **Reset**: Double tap 2 ngón → về 0°

#### **2.3. Two-Finger Pan**
- **Chức năng**: Di chuyển canvas nhanh (giống pan 1 ngón)
- **Ưu điểm**: Smooth hơn khi đang zoom
- **Hành động**: Giống pan 1 ngón nhưng độ nhạy cao hơn

---

### 3️⃣ BA NGÓN TAY (Three-Finger Gestures)

#### **3.1. Three-Finger Swipe**
- **Chức năng**: Undo/Redo
- **Hành động**:
  * Swipe TRÁI → Undo
  * Swipe PHẢI → Redo
- **Visual feedback**: Toast message "Đã hoàn tác"

#### **3.2. Three-Finger Tap**
- **Chức năng**: Toggle mini-map
- **Hành động**: Hiện/Ẩn mini-map ở góc dưới trái

---

## 🎨 Visual Feedback & UX

### Haptic Feedback (Rung)
```typescript
const haptics = {
  selection: { duration: 50, intensity: 'light' },    // Tap task
  longPress: { duration: 100, intensity: 'medium' },  // Long press
  delete: { duration: 150, intensity: 'heavy' },      // Xóa task
  success: { duration: 70, intensity: 'medium' },     // Lưu thành công
};
```

### Visual States
```typescript
const visualStates = {
  idle: { opacity: 1, scale: 1 },
  hover: { opacity: 1, scale: 1.02 },
  pressed: { opacity: 0.8, scale: 0.98 },
  dragging: { opacity: 0.7, scale: 1.05, shadow: '0 8px 16px rgba(0,0,0,0.2)' },
  selected: { border: '2px solid #0066FF' },
};
```

### Smooth Animations
- **Pan**: Linear interpolation (lerp) với alpha = 0.2
- **Zoom**: Easing function `easeOutCubic`
- **Task move**: Spring animation với stiffness = 300
- **All transitions**: 60 FPS (16.67ms/frame)

---

## 📊 Priority Matrix (Độ ưu tiên tính năng)

| Gesture | Mức độ quan trọng | Thân thiện | Độ khó |
|---------|-------------------|------------|---------|
| **Pinch Zoom** | ⭐⭐⭐⭐⭐ CRITICAL | ⭐⭐⭐⭐⭐ | Medium |
| One-finger Pan | ⭐⭐⭐⭐⭐ CRITICAL | ⭐⭐⭐⭐⭐ | Easy |
| Drag Task | ⭐⭐⭐⭐⭐ CRITICAL | ⭐⭐⭐⭐ | Medium |
| Long Press | ⭐⭐⭐⭐ HIGH | ⭐⭐⭐⭐ | Easy |
| Double Tap | ⭐⭐⭐ MEDIUM | ⭐⭐⭐⭐ | Easy |
| Rotate | ⭐⭐ LOW | ⭐⭐ | Hard |
| 3-Finger | ⭐ OPTIONAL | ⭐⭐⭐ | Easy |

---

## 🔧 Implementation Plan

### Phase 1: Core Gestures (Week 1-2)
```typescript
// lib/construction-map/src/core/GestureHandler.ts
class GestureHandler {
  private hammer: HammerManager;
  private camera: Camera;
  
  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.hammer = new Hammer.Manager(canvas);
    this.setupGestures();
  }
  
  private setupGestures() {
    // Pan (1 finger)
    const pan = new Hammer.Pan({ threshold: 0, pointers: 1 });
    this.hammer.add(pan);
    
    // Pinch (2 fingers) ⭐ MOST IMPORTANT
    const pinch = new Hammer.Pinch({ threshold: 0 });
    this.hammer.add(pinch);
    
    // Double tap
    const doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });
    this.hammer.add(doubleTap);
    
    // Long press
    const press = new Hammer.Press({ time: 500 });
    this.hammer.add(press);
    
    // Tap
    const tap = new Hammer.Tap();
    this.hammer.add(tap);
    
    // Event handlers
    this.hammer.on('pan', this.handlePan.bind(this));
    this.hammer.on('pinch', this.handlePinch.bind(this));
    this.hammer.on('doubletap', this.handleDoubleTap.bind(this));
    this.hammer.on('press', this.handlePress.bind(this));
    this.hammer.on('tap', this.handleTap.bind(this));
  }
  
  private handlePan(event: HammerInput) {
    if (this.isDraggingTask) return; // Skip if dragging task
    
    this.camera.offsetX += event.deltaX * this.camera.zoom;
    this.camera.offsetY += event.deltaY * this.camera.zoom;
  }
  
  private handlePinch(event: HammerInput) {
    const scale = event.scale;
    const center = { x: event.center.x, y: event.center.y };
    
    this.camera.zoomToPoint(scale - this.lastScale, center.x, center.y);
    this.lastScale = scale;
    
    if (event.isFinal) {
      this.lastScale = 1;
    }
  }
  
  private handleDoubleTap(event: HammerInput) {
    const target = this.getObjectAt(event.center.x, event.center.y);
    
    if (target) {
      // Zoom to object
      this.camera.fitToBounds(target.bounds, 0.8);
    } else {
      // Reset to 100%
      this.camera.zoom = 1.0;
      this.camera.offsetX = 0;
      this.camera.offsetY = 0;
    }
  }
  
  private handlePress(event: HammerInput) {
    const target = this.getObjectAt(event.center.x, event.center.y);
    
    if (target) {
      this.showContextMenu(target, event.center);
      this.vibrate(100);
    }
  }
  
  private handleTap(event: HammerInput) {
    const target = this.getObjectAt(event.center.x, event.center.y);
    
    if (target) {
      this.selectObject(target);
      this.vibrate(50);
    } else {
      this.deselectAll();
    }
  }
}
```

### Phase 2: Advanced Features (Week 3-4)
- Task dragging with collision detection
- Link creation (drag from task to task)
- Grid snapping
- Undo/Redo stack

### Phase 3: Polish (Week 5-6)
- Haptic feedback
- Smooth animations
- Loading states
- Error handling

---

## 🧪 Testing Checklist

### Gesture Tests
- [ ] Pinch zoom 0.1x → 5.0x works smoothly
- [ ] Pan with 1 finger doesn't interfere with task drag
- [ ] Double tap resets zoom correctly
- [ ] Long press shows context menu
- [ ] Drag task updates position in database
- [ ] Two-finger pan works while zoomed
- [ ] Gestures work on both iOS and Android
- [ ] No lag when 100+ tasks on screen

### Edge Cases
- [ ] What happens when zoom < 0.1 or > 5.0? → Clamp
- [ ] Pan outside canvas bounds? → Allow (infinite canvas)
- [ ] Drag task outside visible area? → Auto-scroll
- [ ] Two users drag same task? → Last write wins (version conflict)
- [ ] Slow network? → Optimistic UI update, rollback on error

---

## 📐 Coordinate System

```typescript
// Screen space (pixels from top-left)
const screenPos = { x: touchEvent.clientX, y: touchEvent.clientY };

// Canvas space (relative to canvas element)
const canvasPos = {
  x: screenPos.x - canvas.offsetLeft,
  y: screenPos.y - canvas.offsetTop,
};

// World space (infinite coordinate system)
const worldPos = camera.screenToWorld(canvasPos.x, canvasPos.y);
// worldPos = {
//   x: (canvasPos.x - camera.offsetX) / camera.zoom,
//   y: (canvasPos.y - camera.offsetY) / camera.zoom,
// }

// Task position stored in database uses WORLD coordinates
const task = {
  x: worldPos.x, // e.g., 1250.5
  y: worldPos.y, // e.g., 340.2
};
```

---

## 🎯 UX Best Practices

### 1. **Immediate Feedback**
- Mọi hành động có visual/haptic feedback ngay lập tức
- Không để người dùng chờ > 100ms

### 2. **Gesture Discovery**
- Hiển thị tutorial lần đầu mở app
- Overlay hints: "Pinch để zoom", "Kéo để di chuyển"
- Gesture guide trong Settings

### 3. **Error Prevention**
- Confirm trước khi xóa task
- Undo/Redo cho mọi thao tác
- Auto-save mọi 3 giây

### 4. **Performance**
- Throttle WebSocket events (max 10 events/second)
- Debounce save to database (500ms)
- Use requestAnimationFrame for smooth 60fps

### 5. **Accessibility**
- Minimum touch target: 44x44 dp
- High contrast mode
- Screen reader support
- Voice commands (future)

---

## 🔌 Integration with Backend

### WebSocket Events
```typescript
// Client → Server (real-time updates)
socket.emit('task-moved', {
  projectId: 'abc123',
  taskId: 'task-001',
  x: 1250.5,
  y: 340.2,
});

socket.emit('zoom-changed', {
  projectId: 'abc123',
  zoom: 1.5,
});

// Server → Client (broadcast to others)
socket.on('task-moved', (data) => {
  const task = engine.getTask(data.taskId);
  task.x = data.x;
  task.y = data.y;
  engine.render();
});
```

### REST API (save state)
```typescript
// Save map state every 3 seconds
const debouncedSave = debounce(async () => {
  await fetch(`/api/construction-map/${projectId}/state`, {
    method: 'PUT',
    body: JSON.stringify({
      zoom: camera.zoom,
      offsetX: camera.offsetX,
      offsetY: camera.offsetY,
      selectedTaskIds: selectedTasks.map(t => t.id),
    }),
  });
}, 3000);

camera.on('zoom-changed', debouncedSave);
camera.on('pan-changed', debouncedSave);
```

---

## 📱 Platform-Specific Notes

### iOS
- Use `-webkit-overflow-scrolling: touch` for smooth pan
- Prevent default pinch-zoom: `touch-action: none`
- Safari requires `touchstart` to be passive: false

### Android
- Chrome supports Pointer Events API
- Use `will-change: transform` for GPU acceleration
- Test on low-end devices (Samsung A series)

---

## 🚀 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Frame rate | 60 FPS | 30 FPS |
| Touch response | < 16ms | < 50ms |
| Pan smoothness | No jank | Occasional skip |
| Zoom smoothness | Buttery | Acceptable |
| Memory usage | < 100MB | < 200MB |
| Battery impact | Low | Medium |

---

## ✅ Summary

**Cảm ứng thân thiện nhất:**
1. **Pinch Zoom (2 ngón kéo vào/ra)** ⭐⭐⭐⭐⭐
   - Tự nhiên, quen thuộc (như Google Maps)
   - Zoom tại điểm chạm (pivot point)
   - Min 0.1x → Max 5.0x

2. **Pan (1 ngón kéo)** ⭐⭐⭐⭐⭐
   - Di chuyển canvas tự do
   - Infinite canvas (không giới hạn)

3. **Long Press (giữ 500ms)** ⭐⭐⭐⭐
   - Context menu
   - Vibration feedback

4. **Double Tap** ⭐⭐⭐⭐
   - Zoom to fit
   - Reset view

**Implementation Priority:**
1. Pinch Zoom + Pan (CRITICAL)
2. Drag Task (CRITICAL)
3. Long Press + Tap (HIGH)
4. Double Tap (MEDIUM)
5. Rotate + 3-finger (OPTIONAL)
