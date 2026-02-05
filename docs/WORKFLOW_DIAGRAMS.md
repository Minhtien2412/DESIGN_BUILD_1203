# Sơ Đồ Luồng Chức Năng - Construction App

## 1. Luồng Đăng Ký & Đăng Nhập

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  START   │────▶│ Login/Signup│────▶│   Get OTP    │────▶│  Verify OTP      │
└──────────┘     │   Screen    │     │  API Call    │     │  & Get Token     │
                 └─────────────┘     └──────────────┘     └────────┬─────────┘
                       │                                           │
                       │                                           ▼
                       │                                  ┌──────────────────┐
                       │                                  │  Save Tokens     │
                       │                                  │  (Access/Refresh)│
                       │                                  └────────┬─────────┘
                       │                                           │
                       ▼                                           ▼
                 ┌─────────────┐                          ┌──────────────────┐
                 │ Social Login│                          │   Navigate to    │
                 │(Google/Zalo)│─────────────────────────▶│   Home Screen    │
                 └─────────────┘                          └──────────────────┘

Context: AuthContext.tsx
Hooks: useAuth(), useOtpAuth()
Services: auth.ts, token.service.ts
```

---

## 2. Luồng Tìm Thiết Kế Nhà (House Design)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HOUSE DESIGN WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────┐     ┌──────────────────────────────┐
│ Home Screen  │────▶│ House Design    │────▶│ Browse Designs               │
│ (Services)   │     │ List Screen     │     │ - Filter by type/style       │
└──────────────┘     └─────────────────┘     │ - Search by name/location    │
                                              └──────────────┬───────────────┘
                                                             │
                    ┌────────────────────────────────────────┼──────────────────┐
                    │                                        │                  │
                    ▼                                        ▼                  ▼
           ┌────────────────┐                    ┌────────────────┐   ┌─────────────────┐
           │ View Design    │                    │ Contact        │   │ Save to         │
           │ Detail         │                    │ Designer       │   │ Favorites       │
           │ - Images       │                    │ (Chat)         │   └─────────────────┘
           │ - Floor plans  │                    └────────┬───────┘
           │ - Specs        │                             │
           └────────┬───────┘                             │
                    │                                     │
                    ▼                                     ▼
           ┌────────────────┐                    ┌────────────────┐
           │ View Similar   │                    │ Create         │
           │ Designs        │                    │ Consultation   │
           └────────────────┘                    │ Request        │
                                                 └────────────────┘

API: house-design.api.ts
Hook: useHouseDesigns()
Screen: app/services/house-design.tsx
```

---

## 3. Luồng Tìm Thợ (Workers)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            WORKERS WORKFLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────┐     ┌──────────────────────────────┐
│ Home Screen  │────▶│ Workers List    │────▶│ Browse Workers               │
│ (Labor)      │     │ Screen          │     │ - Filter by specialty        │
└──────────────┘     └─────────────────┘     │ - Filter by location         │
                                              │ - Filter by rating/price     │
                                              └──────────────┬───────────────┘
                                                             │
           ┌─────────────────────────────────────────────────┼─────────────────┐
           │                                                 │                 │
           ▼                                                 ▼                 ▼
  ┌─────────────────┐                             ┌─────────────────┐   ┌─────────────────┐
  │ View Worker     │                             │ Contact Worker  │   │ View Worker     │
  │ Profile         │                             │ - Send message  │   │ Stats Map       │
  │ - Experience    │                             │ - Book service  │   │ (Distribution)  │
  │ - Reviews       │                             └────────┬────────┘   └─────────────────┘
  │ - Portfolio     │                                      │
  └────────┬────────┘                                      ▼
           │                                      ┌─────────────────┐
           ▼                                      │ Create Project  │
  ┌─────────────────┐                             │ Assignment      │
  │ Add Review      │                             └─────────────────┘
  │ (After service) │
  └─────────────────┘

                         ┌─────────────────────────────────────┐
                         │      WORKER REGISTRATION FLOW        │
                         └─────────────────────────────────────┘
                                         │
                                         ▼
                         ┌─────────────────────────────────────┐
                         │ Fill Registration Form              │
                         │ - Personal info                     │
                         │ - Skills & Experience               │
                         │ - ID verification                   │
                         │ - Portfolio                         │
                         └──────────────┬──────────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────────────┐
                         │ Submit for Admin Approval           │
                         │ Status: PENDING                     │
                         └──────────────┬──────────────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                         ▼              ▼              ▼
                    ┌─────────┐   ┌─────────┐   ┌─────────────┐
                    │ APPROVED│   │ REJECTED│   │ Request     │
                    │ ✓       │   │ ✗       │   │ More Info   │
                    └─────────┘   └─────────┘   └─────────────┘

API: workers.api.ts
Hook: useWorkersAPI(), useWorker(), useWorkerRegistration()
Screen: app/labor/workers.tsx
```

---

## 4. Luồng Mua Sắm (Shop/Products)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHOPPING WORKFLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────┐     ┌──────────────────────────────┐
│ Home Screen  │────▶│ Shop Screen     │────▶│ Browse Products              │
│ (Shop Tab)   │     │                 │     │ - Categories                 │
└──────────────┘     │ ┌─────────────┐ │     │ - Featured                   │
                     │ │ Search Bar  │ │     │ - Best Sellers               │
                     │ └─────────────┘ │     │ - New Arrivals               │
                     │ ┌─────────────┐ │     └──────────────┬───────────────┘
                     │ │ Categories  │ │                    │
                     │ └─────────────┘ │     ┌──────────────┼──────────────┐
                     │ ┌─────────────┐ │     │              │              │
                     │ │ Products    │ │     ▼              ▼              ▼
                     │ └─────────────┘ │ ┌────────────┐ ┌────────────┐ ┌────────────┐
                     └─────────────────┘ │ View Detail│ │ Add to     │ │ Add to     │
                                         │            │ │ Cart       │ │ Favorites  │
                                         └─────┬──────┘ └──────┬─────┘ └────────────┘
                                               │               │
                                               ▼               ▼
                                         ┌────────────┐ ┌────────────────┐
                                         │ View       │ │ View Cart      │
                                         │ Reviews    │ │ ┌────────────┐ │
                                         └────────────┘ │ │ Products   │ │
                                                        │ │ Quantity   │ │
                                                        │ │ Total      │ │
                                                        │ └────────────┘ │
                                                        └───────┬────────┘
                                                                │
                                                                ▼
                                                        ┌────────────────┐
                                                        │ Checkout       │
                                                        │ - Address      │
                                                        │ - Payment      │
                                                        │ - Confirm      │
                                                        └───────┬────────┘
                                                                │
                                                                ▼
                                                        ┌────────────────┐
                                                        │ Order Created  │
                                                        │ Track Order    │
                                                        └────────────────┘

API: products.api.ts
Hook: useShopAPI(), useProduct()
Context: cart-context.tsx
Screen: app/(tabs)/menu.tsx (Shop section)
```

---

## 5. Luồng Quản Lý Tiến Độ Xây Dựng (Construction Progress)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONSTRUCTION PROGRESS WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────────────────────────────────────────────┐
│ Projects     │────▶│              PROJECT OVERVIEW                           │
│ Screen       │     │  ┌─────────────────────────────────────────────────┐   │
└──────────────┘     │  │ Overall Progress: ████████████░░░░░░░░ 65%      │   │
                     │  │ Budget: 2.5B / 4B VND                            │   │
                     │  │ Timeline: 01/2024 - 12/2024                      │   │
                     │  └─────────────────────────────────────────────────┘   │
                     └────────────────────────┬────────────────────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
              ▼                               ▼                               ▼
     ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
     │ PHASES VIEW     │            │ REPORTS VIEW    │            │ TIMELINE VIEW   │
     │ ┌─────────────┐ │            │ ┌─────────────┐ │            │ (Gantt Chart)   │
     │ │ Phase 1 ✓  │ │            │ │ Report #12  │ │            │                 │
     │ │ Móng       │ │            │ │ 15/10/2024  │ │            │  ─────█████──── │
     │ └─────────────┘ │            │ └─────────────┘ │            │  ─────────█████ │
     │ ┌─────────────┐ │            │ ┌─────────────┐ │            │  ──████──────── │
     │ │ Phase 2 ▶  │ │            │ │ Report #11  │ │            │                 │
     │ │ Thô        │ │            │ │ 08/10/2024  │ │            └─────────────────┘
     │ └─────────────┘ │            │ └─────────────┘ │
     │ ┌─────────────┐ │            └─────────────────┘
     │ │ Phase 3 ○  │ │
     │ │ Hoàn thiện │ │
     │ └─────────────┘ │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────────────────────────────────────────────────────────────┐
     │                         PHASE DETAIL VIEW                                │
     │  Phase: Phần thô (In Progress)                                          │
     │  Progress: ████████████░░░░░░░░ 60%                                     │
     │  Timeline: 01/03/2024 - 30/06/2024                                      │
     │                                                                          │
     │  ┌─────────────────────────────────────────────────────────────────┐    │
     │  │ TASKS                                                            │    │
     │  ├─────────────────────────────────────────────────────────────────┤    │
     │  │ ☑ Đổ cột tầng 1          100%  ✓ Hoàn thành                    │    │
     │  │ ☑ Đổ sàn tầng 1          100%  ✓ Hoàn thành                    │    │
     │  │ ▶ Đổ cột tầng 2           70%  ⟳ Đang thực hiện                │    │
     │  │ ○ Đổ sàn tầng 2            0%  ○ Chưa bắt đầu                   │    │
     │  │ ⚠ Xây tường ngăn          40%  ⚠ Chậm tiến độ                  │    │
     │  └─────────────────────────────────────────────────────────────────┘    │
     └────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
     ┌─────────────────────────────────────────────────────────────────────────┐
     │                           TASK DETAIL                                    │
     │  Task: Đổ cột tầng 2                                                    │
     │  Status: Đang thực hiện                                                 │
     │  Progress: ████████████████░░░░ 70%                                     │
     │  Assigned: Đội thi công A (5 thợ)                                       │
     │                                                                          │
     │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
     │  │ SUB-TASKS    │  │ PHOTOS       │  │ NOTES        │                   │
     │  │ ☑ Coffa      │  │ 📷 12 ảnh   │  │ Vật liệu đã  │                   │
     │  │ ☑ Đổ bê tông │  │             │  │ nhập đủ      │                   │
     │  │ ○ Tháo coffa │  │             │  │              │                   │
     │  └──────────────┘  └──────────────┘  └──────────────┘                   │
     │                                                                          │
     │  [Update Progress] [Add Photo] [Add Note] [Report Issue]                │
     └─────────────────────────────────────────────────────────────────────────┘

API: construction-progress.api.ts
Hook: useConstructionProgress()
Screen: app/(tabs)/progress.tsx
Features: features/progress-report/
```

---

## 6. Luồng Giao Tiếp (Communication)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMMUNICATION WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────────────────────┐
                         │       COMMUNICATION HUB         │
                         │                                 │
                         │  ┌─────┐ ┌─────┐ ┌─────┐       │
                         │  │Chat │ │Call │ │Video│       │
                         │  └──┬──┘ └──┬──┘ └──┬──┘       │
                         └─────┼───────┼───────┼───────────┘
                               │       │       │
          ┌────────────────────┼───────┼───────┼────────────────────┐
          │                    │       │       │                    │
          ▼                    ▼       ▼       ▼                    ▼
   ┌─────────────┐      ┌─────────────────────────────┐      ┌─────────────┐
   │ MESSAGES    │      │        CALLS                 │      │ CONTACTS    │
   │             │      │                              │      │             │
   │ ┌─────────┐ │      │ ┌───────────┐ ┌───────────┐ │      │ All contacts│
   │ │ Chat 1  │ │      │ │Audio Call │ │Video Call │ │      │ Workers     │
   │ │ Designer│ │      │ │           │ │           │ │      │ Designers   │
   │ └─────────┘ │      │ │ ┌─────┐   │ │ ┌─────┐   │ │      │ Clients     │
   │ ┌─────────┐ │      │ │ │ 🎤  │   │ │ │ 📹  │   │ │      │ Contractors │
   │ │ Chat 2  │ │      │ │ └─────┘   │ │ └─────┘   │ │      └─────────────┘
   │ │ Worker  │ │      │ │ Mute     │ │ │ Camera  │ │
   │ └─────────┘ │      │ │ Speaker  │ │ │ Mute    │ │
   │ ┌─────────┐ │      │ │ End Call │ │ │ Switch  │ │
   │ │ Group   │ │      │ └───────────┘ │ End Call │ │
   │ │ Project │ │      │               └───────────┘ │
   │ └─────────┘ │      └─────────────────────────────┘
   └──────┬──────┘
          │
          ▼
   ┌──────────────────────────────────────────────────┐
   │                 CHAT SCREEN                       │
   │  ┌────────────────────────────────────────────┐  │
   │  │ Header: Contact Name / Group Name          │  │
   │  │ [Call] [Video] [Info]                      │  │
   │  └────────────────────────────────────────────┘  │
   │  ┌────────────────────────────────────────────┐  │
   │  │                                            │  │
   │  │  ◀ Message from them                       │  │
   │  │                    Message from me ▶       │  │
   │  │  ◀ Photo attached                          │  │
   │  │                    Document sent ▶         │  │
   │  │  ◀ Voice message                           │  │
   │  │                                            │  │
   │  └────────────────────────────────────────────┘  │
   │  ┌────────────────────────────────────────────┐  │
   │  │ [📷] [📎] [🎤] | Type message...    [Send] │  │
   │  └────────────────────────────────────────────┘  │
   └──────────────────────────────────────────────────┘

Context: CommunicationHubContext.tsx
Hooks: useChat(), useCall(), useVoiceCall()
Screens: app/(tabs)/contacts.tsx, app/messages/
WebSocket: Socket.IO /chat, /call namespaces
```

---

## 7. Luồng Thông Báo (Notifications)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

              ┌─────────────────────────────────────┐
              │         NOTIFICATION SOURCES        │
              └──────────────────┬──────────────────┘
                                 │
    ┌────────────────┬───────────┼───────────┬────────────────┐
    │                │           │           │                │
    ▼                ▼           ▼           ▼                ▼
┌────────┐    ┌───────────┐ ┌────────┐ ┌───────────┐   ┌────────────┐
│ Chat   │    │ Progress  │ │ Orders │ │ Workers   │   │ System     │
│ Message│    │ Updates   │ │ Status │ │ Approval  │   │ Alerts     │
└───┬────┘    └─────┬─────┘ └───┬────┘ └─────┬─────┘   └──────┬─────┘
    │               │           │            │                │
    └───────────────┴───────────┴────────────┴────────────────┘
                                │
                                ▼
              ┌─────────────────────────────────────┐
              │         PUSH NOTIFICATION           │
              │         (FCM / Expo Push)           │
              └──────────────────┬──────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ App Foreground  │    │ App Background  │    │ App Closed      │
│                 │    │                 │    │                 │
│ In-app Toast    │    │ System Notif    │    │ System Notif    │
│ Badge Update    │    │ Badge Update    │    │ Launch on Tap   │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                                ▼
              ┌─────────────────────────────────────┐
              │       NOTIFICATION CENTER           │
              │  ┌───────────────────────────────┐  │
              │  │ All    Unread    Messages     │  │
              │  └───────────────────────────────┘  │
              │  ┌───────────────────────────────┐  │
              │  │ 🔔 New message from Designer  │  │
              │  │    2 minutes ago        [Read]│  │
              │  ├───────────────────────────────┤  │
              │  │ 📊 Progress updated: 70%      │  │
              │  │    1 hour ago          [View] │  │
              │  ├───────────────────────────────┤  │
              │  │ ✓ Order #123 shipped          │  │
              │  │    Yesterday           [Track]│  │
              │  └───────────────────────────────┘  │
              └─────────────────────────────────────┘

Context: NotificationContext.tsx, PushNotificationContext.tsx
Hooks: useNotifications(), usePushNotifications()
Screen: app/(tabs)/notifications.tsx
Services: notification-service.ts
```

---

## 8. Tổng Quan Kiến Trúc Ứng Dụng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                            Expo Router                                │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │   │
│  │  │ Home   │ │ Shop   │ │Progress│ │ Social │ │Messages│ │Profile │  │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                          UI Components                                │   │
│  │  components/ui/  │  features/  │  domains/                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┬┘
                                                                             │
┌────────────────────────────────────────────────────────────────────────────┼┐
│                              STATE MANAGEMENT                              ││
│  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │                        React Context                                 │  ││
│  │  Auth │ Cart │ Favorites │ Communication │ Notifications │ Progress │  ││
│  └─────────────────────────────────────────────────────────────────────┘  ││
│  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │                       Custom Hooks                                   │  ││
│  │  useHouseDesigns │ useWorkersAPI │ useShopAPI │ useConstructionProgress│
│  └─────────────────────────────────────────────────────────────────────┘  ││
└────────────────────────────────────────────────────────────────────────────┼┘
                                                                             │
┌────────────────────────────────────────────────────────────────────────────┼┐
│                              DATA LAYER                                    ││
│  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │                       API Services                                   │  ││
│  │  services/api.ts (apiFetch with retry, refresh token)               │  ││
│  │  ├── house-design.api.ts                                            │  ││
│  │  ├── workers.api.ts                                                 │  ││
│  │  ├── products.api.ts                                                │  ││
│  │  ├── construction-progress.api.ts                                   │  ││
│  │  └── ...                                                            │  ││
│  └─────────────────────────────────────────────────────────────────────┘  ││
│  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │                     Local Storage                                    │  ││
│  │  AsyncStorage │ SecureStore │ MMKV (fast sync)                      │  ││
│  └─────────────────────────────────────────────────────────────────────┘  ││
└────────────────────────────────────────────────────────────────────────────┼┘
                                                                             │
┌────────────────────────────────────────────────────────────────────────────┼┐
│                           REAL-TIME LAYER                                  ││
│  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │                      WebSocket (Socket.IO)                           │  ││
│  │  Namespaces: /chat │ /call │ /progress │ /notifications             │  ││
│  └─────────────────────────────────────────────────────────────────────┘  ││
└────────────────────────────────────────────────────────────────────────────┼┘
                                                                             │
                                                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (NestJS)                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                            REST API                                   │   │
│  │  /auth │ /users │ /house-designs │ /workers │ /products │ /progress │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Database (PostgreSQL + Prisma)                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Biểu Đồ Trạng Thái (State Diagrams)

### 9.1 Trạng Thái Worker

```
┌─────────────────────────────────────────────────────────────────┐
│                     WORKER STATUS STATES                         │
└─────────────────────────────────────────────────────────────────┘

                    ┌───────────────┐
     ┌──────────────│   REGISTER    │──────────────┐
     │              └───────────────┘              │
     │                     │                       │
     │                     ▼                       │
     │              ┌───────────────┐              │
     │         ┌────│   PENDING     │────┐        │
     │         │    └───────────────┘    │        │
     │         │           │             │        │
     │    Reject│      Approve          │Request  │
     │         │           │        More Info     │
     │         ▼           ▼             │        │
     │  ┌───────────┐ ┌───────────┐     │        │
     │  │ REJECTED  │ │ APPROVED  │◀────┘        │
     │  └───────────┘ └─────┬─────┘              │
     │         │            │                    │
     │    Resubmit     Violation                 │
     │         │            │                    │
     │         ▼            ▼                    │
     │  ┌───────────┐ ┌───────────┐              │
     └─▶│  PENDING  │ │ SUSPENDED │              │
        └───────────┘ └───────────┘              │
                            │                    │
                       Reinstate                 │
                            │                    │
                            └────────────────────┘
```

### 9.2 Trạng Thái Task

```
┌─────────────────────────────────────────────────────────────────┐
│                      TASK STATUS STATES                          │
└─────────────────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────────────┐
        │                                             │
        ▼                                             │
 ┌─────────────┐    Start     ┌─────────────┐       │
 │ NOT_STARTED │─────────────▶│ IN_PROGRESS │       │
 └─────────────┘              └──────┬──────┘       │
        │                            │              │
        │                   ┌────────┼────────┐     │
        │                   │        │        │     │
   Hold │              Complete   Delay    Hold│     │
        │                   │        │        │     │
        ▼                   ▼        ▼        ▼     │
 ┌─────────────┐    ┌─────────────┐ ┌─────────────┐│
 │   ON_HOLD   │    │  COMPLETED  │ │   DELAYED   ││
 └──────┬──────┘    └─────────────┘ └──────┬──────┘│
        │                                  │       │
        │              Resume              │       │
        └──────────────────────────────────┴───────┘
```

---

## 10. Cấu Trúc Thư Mục Chính

```
APP_DESIGN_BUILD05.12.2025/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── index.tsx             # Home screen
│   │   ├── menu.tsx              # Shop/Services menu
│   │   ├── progress.tsx          # Construction progress
│   │   ├── social.tsx            # Social feed
│   │   ├── contacts.tsx          # Contacts & messaging
│   │   └── profile.tsx           # User profile
│   ├── services/                 # Service screens
│   │   ├── house-design.tsx      # House design listings
│   │   └── house-design-ai.tsx   # AI design assistant
│   ├── labor/                    # Labor management
│   │   └── workers.tsx           # Workers listing
│   ├── messages/                 # Chat screens
│   └── _layout.tsx               # Root layout with providers
│
├── services/                     # API services
│   ├── api.ts                    # Base API with apiFetch
│   ├── house-design.api.ts       # House design APIs
│   ├── workers.api.ts            # Workers APIs
│   ├── products.api.ts           # Products APIs
│   └── construction-progress.api.ts  # Progress APIs
│
├── hooks/                        # Custom hooks
│   ├── useHouseDesigns.ts        # House design hook
│   ├── useWorkersAPI.ts          # Workers hook
│   ├── useShopAPI.ts             # Shop/products hook
│   └── useConstructionProgressAPI.ts  # Progress hook
│
├── context/                      # React contexts
│   ├── AuthContext.tsx           # Authentication state
│   ├── cart-context.tsx          # Shopping cart state
│   └── ...                       # Other contexts
│
├── features/                     # Feature modules
│   └── progress-report/          # Progress report feature
│
├── components/                   # Reusable components
│   └── ui/                       # UI primitives
│
├── constants/                    # App constants
│   └── theme.ts                  # Theme configuration
│
└── BE-baotienweb.cloud/          # Backend (NestJS)
    └── src/
        ├── auth/                 # Authentication module
        ├── house-design/         # House design module
        ├── workers/              # Workers module
        ├── products/             # Products module
        └── ...
```

---

_Tài liệu này mô tả các luồng chức năng chính của ứng dụng Construction App, giúp developers hiểu rõ cách các components, hooks, và services tương tác với nhau._
