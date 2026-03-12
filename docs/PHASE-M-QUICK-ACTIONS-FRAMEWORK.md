# Phase M — Quick Actions Framework

**Date:** 2026-03-10  
**Status:** Architecture Design COMPLETE

---

## M1 — Current State Assessment

### Problem

18 screens implement their own ad-hoc `QUICK_ACTIONS` arrays with custom rendering, no shared executor, no audit logging, and no state-based filtering. Three separate FAB systems exist (`quick-action-sheet.tsx`, `ContextFAB.tsx`, `floating-action-button.tsx`) with no shared registry.

### Existing Assets to Reuse

| Asset                      | Path                                           | Reuse                            |
| -------------------------- | ---------------------------------------------- | -------------------------------- |
| Global `QUICK_ACTIONS`     | `constants/categories.ts`                      | Migrate entries → ActionRegistry |
| Quick action bottom sheet  | `components/navigation/quick-action-sheet.tsx` | Keep as primary UI shell         |
| Context-aware FAB          | `components/navigation/ContextFAB.tsx`         | Refactor to consume registry     |
| Dashboard QuickAction tile | `components/dashboard/QuickAction.tsx`         | Keep for admin grids             |
| Role check hook            | `hooks/usePermission.ts`                       | Integrate into `useQuickActions` |
| Badge system               | `context/UnifiedBadgeContext.tsx`              | Wire badge counts to actions     |

---

## M2 — Architecture Design

### Core Concepts

```
┌─────────────────────────────────────────────────────────┐
│                    ACTION REGISTRY                        │
│  constants/action-registry.ts                            │
│                                                          │
│  ActionConfig {                                          │
│    id: 'entity.verb'       // e.g. 'project.create'     │
│    label: string           // Vietnamese display name    │
│    icon: IoniconsName      // Ionicons icon name         │
│    route?: string          // Navigation target          │
│    handler?: () => void    // Custom execute function    │
│    entity: EntityType      // 'project' | 'task' | ...   │
│    category: ActionCategory// 'navigation' | 'mutation'  │
│    requiredRoles?: Role[]  // Empty = everyone           │
│    requiredStates?: string[] // Entity state whitelist   │
│    confirmRequired?: boolean // Show confirm dialog      │
│    badge?: BadgeKey        // Badge context key           │
│  }                                                       │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
┌────────────┐ ┌────────────┐ ┌──────────────┐
│useQuickAct.│ │ContextFAB  │ │ ActionSheet  │
│  (hook)    │ │ (component)│ │ (component)  │
│            │ │            │ │              │
│ Filters by:│ │ Reads from │ │ Reads from   │
│ - entity   │ │ registry + │ │ registry +   │
│ - role     │ │ pathname   │ │ selected     │
│ - state    │ │            │ │ context      │
│ - context  │ │            │ │              │
└────────────┘ └────────────┘ └──────────────┘
```

### ActionConfig Interface

```typescript
// constants/action-registry.ts

export type EntityType =
  | "global" // Always available
  | "project"
  | "task"
  | "conversation"
  | "file"
  | "report"
  | "customer"
  | "product"
  | "order"
  | "invoice"
  | "worker"
  | "schedule";

export type ActionCategory =
  | "navigation" // Just router.push(route)
  | "mutation" // API call + side effects
  | "communication" // Call, chat, video
  | "creation"; // Create new entity

export interface ActionConfig {
  /** Unique ID: 'entity.verb' e.g. 'project.create' */
  id: string;
  /** Display label (Vietnamese) */
  label: string;
  /** Ionicons icon name */
  icon: string;
  /** Optional icon color override */
  color?: string;
  /** Route to navigate to (for navigation actions) */
  route?: string;
  /** Entity this action belongs to */
  entity: EntityType;
  /** Action category */
  category: ActionCategory;
  /** Roles allowed (empty = all) */
  requiredRoles?: string[];
  /** Entity states where action is visible */
  requiredStates?: string[];
  /** Show confirmation dialog before executing */
  confirmRequired?: boolean;
  /** Badge key to display count from UnifiedBadgeContext */
  badge?: string;
  /** Sort priority (lower = shown first, default 50) */
  priority?: number;
}
```

### Action Registry — Initial Entries

```typescript
// constants/action-registry.ts

export const ACTION_REGISTRY: ActionConfig[] = [
  // ═══════ GLOBAL ACTIONS (always available) ═══════
  {
    id: "global.search",
    label: "Tìm kiếm",
    icon: "search-outline",
    route: "/search",
    entity: "global",
    category: "navigation",
    priority: 10,
  },
  {
    id: "global.messages",
    label: "Tin nhắn",
    icon: "chatbubbles-outline",
    route: "/(tabs)/messages",
    entity: "global",
    category: "communication",
    badge: "messages",
    priority: 15,
  },
  {
    id: "global.notifications",
    label: "Thông báo",
    icon: "notifications-outline",
    route: "/notification-center",
    entity: "global",
    category: "navigation",
    badge: "notifications",
    priority: 16,
  },

  // ═══════ PROJECT ACTIONS ═══════
  {
    id: "project.create",
    label: "Tạo dự án",
    icon: "add-circle-outline",
    route: "/projects/create",
    entity: "project",
    category: "creation",
    requiredRoles: ["ADMIN", "MANAGER", "STAFF"],
    priority: 20,
  },
  {
    id: "project.list",
    label: "Danh sách dự án",
    icon: "folder-outline",
    route: "/projects",
    entity: "project",
    category: "navigation",
    priority: 21,
  },
  {
    id: "project.progress",
    label: "Theo dõi tiến độ",
    icon: "stats-chart-outline",
    route: "/progress-tracking",
    entity: "project",
    category: "navigation",
    priority: 22,
  },

  // ═══════ COMMUNICATION ACTIONS ═══════
  {
    id: "communication.call",
    label: "Gọi điện",
    icon: "call-outline",
    route: "/call",
    entity: "global",
    category: "communication",
    priority: 30,
  },
  {
    id: "communication.video",
    label: "Video call",
    icon: "videocam-outline",
    route: "/call/video",
    entity: "global",
    category: "communication",
    priority: 31,
  },
  {
    id: "communication.livestream",
    label: "Livestream",
    icon: "radio-outline",
    route: "/livestream",
    entity: "global",
    category: "communication",
    priority: 32,
  },

  // ═══════ FILE ACTIONS ═══════
  {
    id: "file.upload",
    label: "Upload File",
    icon: "cloud-upload-outline",
    route: "/file-upload",
    entity: "file",
    category: "creation",
    priority: 40,
  },
  {
    id: "file.manager",
    label: "Quản lý File",
    icon: "folder-open-outline",
    route: "/file-manager",
    entity: "file",
    category: "navigation",
    priority: 41,
  },

  // ═══════ REPORT ACTIONS ═══════
  {
    id: "report.daily.create",
    label: "Báo cáo hàng ngày",
    icon: "document-text-outline",
    route: "/daily-report/create",
    entity: "report",
    category: "creation",
    requiredRoles: ["ADMIN", "MANAGER", "STAFF"],
    priority: 50,
  },
  {
    id: "report.analytics",
    label: "Phân tích",
    icon: "analytics-outline",
    route: "/analytics",
    entity: "report",
    category: "navigation",
    priority: 51,
  },

  // ═══════ PRODUCT/ORDER ACTIONS ═══════
  {
    id: "product.catalog",
    label: "Sản phẩm",
    icon: "storefront-outline",
    route: "/shopping/products-from-backend",
    entity: "product",
    category: "navigation",
    priority: 60,
  },
  {
    id: "order.cart",
    label: "Giỏ hàng",
    icon: "cart-outline",
    route: "/cart",
    entity: "order",
    category: "navigation",
    badge: "cart",
    priority: 61,
  },
  {
    id: "order.quote",
    label: "Yêu cầu báo giá",
    icon: "receipt-outline",
    route: "/quote-request",
    entity: "order",
    category: "creation",
    priority: 62,
  },

  // ═══════ CUSTOMER/CRM ACTIONS ═══════
  {
    id: "customer.contacts",
    label: "Danh bạ",
    icon: "people-outline",
    route: "/contact",
    entity: "customer",
    category: "navigation",
    priority: 70,
  },
  {
    id: "customer.find-workers",
    label: "Tìm thợ",
    icon: "construct-outline",
    route: "/find-workers",
    entity: "worker",
    category: "navigation",
    priority: 71,
  },

  // ═══════ SCHEDULE ACTIONS ═══════
  {
    id: "schedule.tasks",
    label: "Lịch công việc",
    icon: "calendar-outline",
    route: "/scheduled-tasks",
    entity: "schedule",
    category: "navigation",
    priority: 80,
  },

  // ═══════ CONSTRUCTION ACTIONS (context-specific) ═══════
  {
    id: "construction.photo",
    label: "Chụp ảnh",
    icon: "camera-outline",
    route: "/construction/photo",
    entity: "project",
    category: "creation",
    priority: 90,
  },
  {
    id: "construction.report",
    label: "Báo cáo công trường",
    icon: "clipboard-outline",
    route: "/construction/report",
    entity: "report",
    category: "creation",
    requiredRoles: ["ADMIN", "MANAGER", "STAFF"],
    priority: 91,
  },
];
```

---

## M3 — useQuickActions Hook

### Design

```typescript
// hooks/useQuickActions.ts

interface UseQuickActionsOptions {
  /** Filter by entity type */
  entity?: EntityType | EntityType[];
  /** Filter by action category */
  category?: ActionCategory | ActionCategory[];
  /** Current entity state (for state-based filtering) */
  entityState?: string;
  /** Max actions to return */
  limit?: number;
  /** Current route (for context-awareness) */
  route?: string;
}

interface UseQuickActionsReturn {
  /** Filtered, sorted actions */
  actions: ActionConfig[];
  /** Execute an action (navigate or call handler) */
  execute: (actionId: string, params?: Record<string, string>) => void;
  /** Get badge count for an action */
  getBadge: (actionId: string) => number;
}

function useQuickActions(
  options?: UseQuickActionsOptions,
): UseQuickActionsReturn {
  const { user } = useAuth();
  const { badges } = useUnifiedBadge();
  const router = useRouter();

  const actions = useMemo(() => {
    let filtered = ACTION_REGISTRY;

    // Entity filter
    if (options?.entity) {
      const entities = Array.isArray(options.entity)
        ? options.entity
        : [options.entity];
      filtered = filtered.filter((a) => entities.includes(a.entity));
    }

    // Category filter
    if (options?.category) {
      const cats = Array.isArray(options.category)
        ? options.category
        : [options.category];
      filtered = filtered.filter((a) => cats.includes(a.category));
    }

    // Role filter
    if (user?.role) {
      filtered = filtered.filter(
        (a) => !a.requiredRoles?.length || a.requiredRoles.includes(user.role),
      );
    }

    // State filter
    if (options?.entityState) {
      filtered = filtered.filter(
        (a) =>
          !a.requiredStates?.length ||
          a.requiredStates.includes(options.entityState!),
      );
    }

    // Sort by priority
    filtered = [...filtered].sort(
      (a, b) => (a.priority ?? 50) - (b.priority ?? 50),
    );

    // Limit
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }, [
    options?.entity,
    options?.category,
    options?.entityState,
    options?.limit,
    user?.role,
  ]);

  const execute = useCallback(
    (actionId: string, params?: Record<string, string>) => {
      const action = ACTION_REGISTRY.find((a) => a.id === actionId);
      if (!action) return;

      if (action.route) {
        let route = action.route;
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            route = route.replace(`:${key}`, value);
          });
        }
        router.push(route as any);
      }
    },
    [router],
  );

  const getBadge = useCallback(
    (actionId: string) => {
      const action = ACTION_REGISTRY.find((a) => a.id === actionId);
      if (!action?.badge) return 0;
      return badges?.[action.badge] ?? 0;
    },
    [badges],
  );

  return { actions, execute, getBadge };
}
```

---

## M4 — Component Integration Plan

### ContextFAB Refactor

Current `ContextFAB.tsx` uses hardcoded route-to-actions mapping. Refactor to consume the registry:

```typescript
// BEFORE (hardcoded):
if (pathname.startsWith("/projects")) {
  return [
    {
      icon: "add",
      color: "#27AE60",
      route: "/projects/new",
      label: "Tạo dự án",
    },
    { icon: "list", color: "#4A90E2", route: "/projects", label: "Danh sách" },
  ];
}

// AFTER (registry-based):
const ROUTE_ENTITY_MAP: Record<string, EntityType[]> = {
  "/projects": ["project"],
  "/construction": ["project", "report"],
  "/messages": ["conversation"],
  "/crm": ["customer"],
};

const entity = Object.entries(ROUTE_ENTITY_MAP).find(([prefix]) =>
  pathname.startsWith(prefix),
)?.[1] ?? ["global"];

const { actions } = useQuickActions({ entity, limit: 3 });
```

### QuickActionSheet Refactor

Current `quick-action-sheet.tsx` has hardcoded PRIMARY/SECONDARY arrays. Refactor:

```typescript
// BEFORE: Hardcoded 4 primary + 5 secondary actions
// AFTER:
const { actions: primary } = useQuickActions({
  category: "communication",
  limit: 4,
});
const { actions: secondary } = useQuickActions({
  category: ["navigation", "creation"],
  limit: 5,
});
```

### Home Screen Grid Migration

Replace the `QUICK_ACTIONS` constant in `constants/categories.ts` with:

```typescript
// In app/(tabs)/index.tsx:
const { actions } = useQuickActions({ entity: "global", limit: 7 });
```

---

## M5 — Endpoint Style Guide for Actions

### Navigation vs Mutation Actions

| Type              | Example        | Endpoint                  | FE Handler                        |
| ----------------- | -------------- | ------------------------- | --------------------------------- |
| **Navigation**    | View projects  | N/A                       | `router.push(route)`              |
| **Creation**      | Create project | `POST /projects`          | `router.push('/projects/create')` |
| **Mutation**      | Approve task   | `POST /tasks/:id/approve` | `handler()` + API call            |
| **Communication** | Start call     | `POST /calls/initiate`    | `router.push('/call/' + userId)`  |

### REST Naming Convention for Action Endpoints

```
POST /api/v1/{entity}/{id}/{verb}
```

Examples:

- `POST /api/v1/tasks/{id}/approve` → `task.approve`
- `POST /api/v1/tasks/{id}/assign` → `task.assign`
- `POST /api/v1/projects/{id}/archive` → `project.archive`
- `POST /api/v1/orders/{id}/cancel` → `order.cancel`

### Side Effects Pattern (Future)

When a mutation action runs, it can trigger side effects:

```typescript
// Future: Execute with side effects
async function executeAction(actionId: string, entityId: string) {
  const action = ACTION_REGISTRY.find((a) => a.id === actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);

  // 1. Confirmation dialog (if required)
  if (action.confirmRequired) {
    const confirmed = await showConfirmDialog(action.label);
    if (!confirmed) return;
  }

  // 2. API call
  const result = await action.handler?.(entityId);

  // 3. Invalidate relevant caches (React Query)
  queryClient.invalidateQueries({ queryKey: [action.entity] });

  // 4. Badge refresh
  refreshBadges();
}
```

---

## M6 — Rollout Plan

### Sprint 1: Foundation

| Step                       | Files                          | Change                                              | Risk |
| -------------------------- | ------------------------------ | --------------------------------------------------- | ---- |
| 1. Create registry         | `constants/action-registry.ts` | New file with `ActionConfig` type + initial entries | Zero |
| 2. Create hook             | `hooks/useQuickActions.ts`     | New file, consumes registry + auth + badges         | Zero |
| 3. Migrate `QUICK_ACTIONS` | `constants/categories.ts`      | Deprecate in favor of registry                      | Low  |

### Sprint 2: Component Integration

| Step                    | Files                                          | Change                           | Risk |
| ----------------------- | ---------------------------------------------- | -------------------------------- | ---- |
| 4. Refactor ContextFAB  | `components/navigation/ContextFAB.tsx`         | Consume registry via hook        | Low  |
| 5. Refactor ActionSheet | `components/navigation/quick-action-sheet.tsx` | Consume registry via hook        | Low  |
| 6. Home screen grid     | `app/(tabs)/index.tsx`                         | Use `useQuickActions()` for grid | Low  |

### Sprint 3: Screen-by-Screen Migration

Migrate remaining 15 screens from ad-hoc `QUICK_ACTIONS` to `useQuickActions()`:

- Admin dashboards (3 screens)
- CRM screens (3 screens)
- Project screens (3 screens)
- Remaining (6 screens)

### Sprint 4: Mutation Actions (Optional)

Add `handler` support for non-navigation actions:

- Task approval/rejection
- Order status changes
- Confirmation dialogs
- Audit logging
- Socket event emission

---

## Decision Log

| Decision                                  | Rationale                                                    |
| ----------------------------------------- | ------------------------------------------------------------ |
| Registry is a static array, not a Map     | Simple iteration, easy to declare, serializable              |
| `entity.verb` naming for action IDs       | Matches REST convention, instantly clear scope               |
| Roles are string arrays, not enums        | Backend role names may evolve; avoid coupling                |
| Priority is numeric (lower = first)       | Flexible reordering without array position dependency        |
| `handler` is optional, `route` is primary | 90% of actions are navigation; keep mutation as opt-in       |
| No side-effect system in Sprint 1         | YAGNI — add when mutation actions are actually needed        |
| Keep existing FAB components              | They work; just change data source from hardcoded → registry |
