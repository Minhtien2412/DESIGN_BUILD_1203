# ✅ Frontend Development Checklist - BaoTienWeb

## 🚀 QUICK START

### Bước 1: Setup môi trường
```bash
# Clone frontend repo
git clone <frontend-repo-url>
cd baotienweb-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Bước 2: Configure API
```env
# .env
REACT_APP_API_URL=https://baotienweb.cloud/api/v1
REACT_APP_WS_URL=https://baotienweb.cloud
REACT_APP_LIVEKIT_URL=wss://livekit.baotienweb.cloud
```

### Bước 3: Test connection
```javascript
// Test API connection
fetch('https://baotienweb.cloud/health')
  .then(res => res.json())
  .then(data => console.log('API Status:', data.status));
```

---

## 📋 DEVELOPMENT PHASES

### 🔴 **PHASE 1: CRITICAL - Authentication (Week 1-2)**

**Pages cần build:**
```
/login              - Login page
/register           - Register page  
/forgot-password    - Password reset request
/reset-password     - New password form
/profile            - User profile
```

**Components:**
- [ ] LoginForm (email, password, OAuth buttons)
- [ ] RegisterForm (name, email, password, role)
- [ ] AuthGuard (protected routes)
- [ ] TokenManager (store, refresh tokens)

**API Endpoints cần integrate:**
```javascript
POST /auth/login
POST /auth/register
POST /auth/refresh
GET  /auth/google
GET  /auth/apple
POST /auth/forgot-password
POST /auth/reset-password
```

**Testing Checklist:**
- [ ] Login thành công → redirect to dashboard
- [ ] Login thất bại → show error
- [ ] Token tự động refresh
- [ ] Logout → clear tokens
- [ ] Protected routes → redirect to login

---

### 🔴 **PHASE 2: CRITICAL - Projects & Tasks (Week 3-5)**

**Pages:**
```
/projects           - Projects list
/projects/:id       - Project detail
/projects/new       - Create project
/projects/:id/edit  - Edit project
/tasks              - All tasks (Kanban)
```

**Components:**
- [ ] ProjectCard
- [ ] ProjectList (grid/list view)
- [ ] ProjectForm
- [ ] TaskCard
- [ ] KanbanBoard (drag & drop)
- [ ] TaskModal (create/edit)

**API Endpoints:**
```javascript
GET    /projects
GET    /projects/:id
POST   /projects
PUT    /projects/:id
DELETE /projects/:id

GET    /tasks/project/:projectId
POST   /tasks
PUT    /tasks/:id
PATCH  /tasks/:id/status
DELETE /tasks/:id
```

**Features:**
- [ ] Filter projects by status
- [ ] Search projects
- [ ] Upload project images
- [ ] Drag & drop tasks between columns
- [ ] Assign tasks to users
- [ ] Set task priority & due date

---

### 🟠 **PHASE 3: HIGH - Contracts & Payments (Week 6-8)**

**Pages:**
```
/contracts          - Contracts list
/contracts/:id      - Contract detail
/contracts/new      - Create contract
/payments           - Payment history
/payments/success   - Payment success page
/payments/failed    - Payment failed page
```

**Components:**
- [ ] ContractTable
- [ ] ContractViewer
- [ ] PaymentScheduleTable
- [ ] PaymentMethodSelector (Momo/VNPay/Stripe)
- [ ] PaymentStatusBadge

**API Endpoints:**
```javascript
GET  /contract
GET  /contract/:id
POST /contract
POST /contract/:id/sign
GET  /contract/:id/payment-schedule

POST /contract/payment/momo
POST /contract/payment/vnpay
POST /contract/payment/stripe
```

**Payment Flow:**
1. User clicks "Thanh toán"
2. Select payment method
3. Call API → get payment URL
4. Redirect to payment gateway
5. Handle callback → update status

---

### 🟠 **PHASE 4: HIGH - Quality Control (Week 9-10)**

**Pages:**
```
/qc/inspections     - Inspections list
/qc/bugs            - Bugs list
/qc/inspections/:id - Inspection detail
/qc/bugs/:id        - Bug detail
```

**Components:**
- [ ] InspectionCard
- [ ] QCChecklistForm
- [ ] BugReportForm
- [ ] BugCard (với severity colors)
- [ ] ImageUploader (multiple images)

**API Endpoints:**
```javascript
GET   /qc/inspections
POST  /qc/inspections
GET   /qc/bugs
POST  /qc/bugs
PATCH /qc/bugs/:id/assign
PATCH /qc/bugs/:id/resolve
```

---

### 🟡 **PHASE 5: MEDIUM - Real-time Chat (Week 11-13)**

**Pages:**
```
/chat               - Chat interface
```

**Components:**
- [ ] ChatRoomList
- [ ] MessageList (với infinite scroll)
- [ ] MessageInput (với file upload)
- [ ] TypingIndicator
- [ ] OnlineStatus

**WebSocket Events:**
```javascript
// Emit
socket.emit('joinRoom', { roomId })
socket.emit('sendMessage', { roomId, content })
socket.emit('typing', { roomId })

// Listen
socket.on('message', handleNewMessage)
socket.on('userOnline', updateOnlineStatus)
socket.on('typing', showTypingIndicator)
```

**Features:**
- [ ] Real-time messaging
- [ ] Online/offline status
- [ ] Typing indicators
- [ ] Unread count badges
- [ ] File attachments
- [ ] Message read receipts

---

### 🟡 **PHASE 6: MEDIUM - Video Call (Week 14-15)**

**Pages:**
```
/video              - Video rooms list
/video/:roomId      - Video call room
```

**Components:**
- [ ] VideoRoomCard
- [ ] VideoPlayer
- [ ] ParticipantList
- [ ] VideoControls (mute/unmute, camera on/off)

**LiveKit Integration:**
```bash
npm install livekit-client
```

```javascript
import { Room } from 'livekit-client';

// 1. Get token from API
const { token, serverUrl } = await api.getVideoToken(roomId);

// 2. Connect to room
const room = new Room();
await room.connect(serverUrl, token);

// 3. Publish tracks
await room.localParticipant.setCameraEnabled(true);
await room.localParticipant.setMicrophoneEnabled(true);
```

---

### 🟡 **PHASE 7: MEDIUM - Dashboard (Week 16-17)**

**Pages:**
```
/dashboard          - Main dashboard
/dashboard/admin    - Admin dashboard (admins only)
```

**Components:**
- [ ] StatsCard (projects, tasks, revenue)
- [ ] RevenueChart (Line/Bar chart)
- [ ] ProjectStatusChart (Pie/Donut)
- [ ] RecentActivities
- [ ] TasksOverview

**Chart Libraries:**
- Recharts
- Chart.js + react-chartjs-2
- Apache ECharts

**API Endpoints:**
```javascript
GET /dashboard/stats
GET /dashboard/revenue
GET /dashboard/projects/stats
```

---

### 🟢 **PHASE 8: LOW - Notifications (Week 18)**

**Components:**
- [ ] NotificationBell (với badge count)
- [ ] NotificationDropdown
- [ ] NotificationList
- [ ] NotificationItem

**Push Notifications:**
```bash
# Firebase Cloud Messaging
npm install firebase
```

```javascript
// Request permission
const messaging = getMessaging();
const token = await getToken(messaging, {
  vapidKey: 'YOUR_VAPID_KEY'
});

// Send token to backend
await api.registerDeviceToken(token);
```

**WebSocket Notifications:**
```javascript
socket.on('notification', (notification) => {
  // Show toast
  toast.success(notification.title);
  
  // Update badge count
  setUnreadCount(prev => prev + 1);
});
```

---

### 🟠 **PHASE 9: HIGH - File Upload (Week 19)**

**Components:**
- [ ] ImageUploader (drag & drop)
- [ ] FileUploader
- [ ] UploadProgress
- [ ] ImageGallery (với lightbox)

**Upload Implementation:**
```javascript
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/v1/upload/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setProgress(percentCompleted);
    }
  });
  
  return response.data.url;
}
```

---

### 🔴 **PHASE 10: CRITICAL - Polish & Testing (Week 20-22)**

**Performance Optimization:**
- [ ] Code splitting (React.lazy)
- [ ] Image lazy loading
- [ ] Debounce search inputs
- [ ] Cache API responses (React Query)
- [ ] Optimize bundle size

**Responsive Design:**
- [ ] Mobile layouts (< 768px)
- [ ] Tablet layouts (768px - 1024px)
- [ ] Desktop layouts (> 1024px)
- [ ] Touch gestures

**Testing:**
- [ ] Unit tests (Jest + React Testing Library)
- [ ] Integration tests
- [ ] E2E tests (Cypress/Playwright)
- [ ] Accessibility tests (axe)

**Error Handling:**
- [ ] Global error boundary
- [ ] API error handling
- [ ] Retry failed requests
- [ ] Offline detection

---

## 🛠️ RECOMMENDED TECH STACK

### Core
- **React** 18+ hoặc **Next.js** 14+
- **TypeScript** (highly recommended)
- **Tailwind CSS** hoặc **Material-UI**

### State Management
- **Redux Toolkit** (complex state)
- **Zustand** (simple state)
- **React Query** (server state)

### Routing
- **React Router** v6+
- **Next.js** routing (nếu dùng Next.js)

### Forms
- **React Hook Form** + **Zod** validation
- **Formik** + **Yup** (alternative)

### UI Components
- **shadcn/ui** (Tailwind-based)
- **Ant Design**
- **Material-UI**
- **Chakra UI**

### Real-time
- **Socket.IO Client**
- **LiveKit Client** (video)

### Charts
- **Recharts**
- **Apache ECharts**

### File Upload
- **react-dropzone**
- **react-image-crop**

### Date/Time
- **date-fns** hoặc **Day.js**

---

## 📦 PACKAGE.JSON EXAMPLE

```json
{
  "name": "baotienweb-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "@tanstack/react-query": "^5.14.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "livekit-client": "^2.0.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0",
    "recharts": "^2.10.0",
    "react-dropzone": "^14.2.0",
    "date-fns": "^3.0.0",
    "react-hot-toast": "^2.4.0",
    "firebase": "^10.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "@testing-library/react": "^14.1.0",
    "jest": "^29.7.0",
    "cypress": "^13.6.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 🎯 PRIORITY MATRIX

### Must Have (Launch Blockers) 🔴
1. Authentication (login, register, tokens)
2. Projects CRUD
3. Tasks management
4. Basic contract viewing
5. File upload

### Should Have (Next Release) 🟠
1. Contracts creation & signing
2. Payment processing
3. QC inspections & bugs
4. Dashboard analytics
5. Notifications

### Nice to Have (Future) 🟡
1. Real-time chat
2. Video calls
3. AI features integration
4. Advanced analytics
5. Mobile app

---

## 🐛 COMMON ISSUES & SOLUTIONS

### 1. CORS Errors
```javascript
// Backend đã enable CORS, nhưng nếu vẫn lỗi:
// Kiểm tra request headers có đúng không
headers: {
  'Content-Type': 'application/json', // Đúng
  // 'Content-Type': 'text/plain',    // Sai
  'Authorization': `Bearer ${token}`
}
```

### 2. Token Expired
```javascript
// Implement auto-refresh trong axios interceptor
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token
      const newToken = await refreshToken();
      // Retry request
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 3. WebSocket Connection Failed
```javascript
// Check token trong auth
const socket = io('https://baotienweb.cloud', {
  auth: { token: accessToken },
  transports: ['websocket', 'polling'], // Fallback
  reconnection: true,
  reconnectionDelay: 1000
});
```

### 4. File Upload Too Large
```javascript
// Backend có limit, nén file trước khi upload
import imageCompression from 'browser-image-compression';

const options = { maxSizeMB: 1, maxWidthOrHeight: 1920 };
const compressedFile = await imageCompression(file, options);
```

---

## 📞 GET HELP

### Resources
- **API Docs:** https://baotienweb.cloud/api/docs
- **Postman Collection:** [Request from backend team]
- **Figma Design:** [Design team will provide]

### Communication
- **Daily Standup:** 9:00 AM
- **Slack Channels:**
  - `#frontend-dev` - General questions
  - `#api-support` - Backend/API issues
  - `#bugs` - Bug reports

### Code Review
- Create PR → request review
- All PRs need 1 approval
- Follow coding standards

---

## ✅ DEFINITION OF DONE

Feature is considered DONE when:
- [ ] Code implemented & tested
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passed
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors/warnings
- [ ] Accessibility checked (WCAG AA)
- [ ] Code reviewed & approved
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA tested & approved

---

**Good luck with the development! 🚀**

*Questions? Contact backend team or create an issue.*
