import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ProgressStatus, ProgressTask, UserRole } from '@/types/progress';

export type MiniMapPoint = { x: number; y: number };

export type TaskEditEvent = {
  id: string;
  taskId: string;
  ts: string; // ISO
  actor: {
    id: string;
    name: string;
    role: UserRole;
  };
  kind: 'status' | 'position' | 'payment' | 'note';
  field?: string;
  from?: unknown;
  to?: unknown;
  progressAfter?: number;
};

export type TaskPaymentEvent = {
  id: string;
  taskId: string;
  ts: string; // ISO
  actor: {
    id: string;
    name: string;
    role: UserRole;
  };
  amount: number;
  currency: 'VND';
  method?: string;
  note?: string;
  status?: 'pending' | 'paid' | 'cancelled';
};

export type TaskProgressPoint = { ts: string; value: number };

export type ProgressMetaStoreV1 = {
  version: 1;
  projectId: string;
  updatedAt: string;
  tasks: Record<
    string,
    {
      position?: MiniMapPoint;
      edits?: TaskEditEvent[];
      payments?: TaskPaymentEvent[];
      progressSeries?: TaskProgressPoint[];
    }
  >;
};

export type TaskMeta = ProgressMetaStoreV1['tasks'][string];

const KEY_PREFIX = 'progress_meta_v1:';

function keyFor(projectId: string) {
  return `${KEY_PREFIX}${projectId}`;
}

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function loadProgressMeta(projectId: string): Promise<ProgressMetaStoreV1> {
  const raw = await AsyncStorage.getItem(keyFor(projectId));
  if (!raw) {
    return { version: 1, projectId, updatedAt: nowIso(), tasks: {} };
  }

  try {
    const parsed = JSON.parse(raw) as ProgressMetaStoreV1;
    if (parsed?.version !== 1 || parsed.projectId !== projectId || !parsed.tasks) {
      return { version: 1, projectId, updatedAt: nowIso(), tasks: {} };
    }
    return parsed;
  } catch {
    return { version: 1, projectId, updatedAt: nowIso(), tasks: {} };
  }
}

export async function saveProgressMeta(store: ProgressMetaStoreV1): Promise<void> {
  const next: ProgressMetaStoreV1 = { ...store, updatedAt: nowIso() };
  await AsyncStorage.setItem(keyFor(store.projectId), JSON.stringify(next));
}

export async function getTaskMeta(projectId: string, taskId: string) {
  const store = await loadProgressMeta(projectId);
  return store.tasks[taskId] ?? null;
}

export async function setTaskPosition(params: {
  projectId: string;
  taskId: string;
  position: MiniMapPoint;
  actor: { id: string; name: string; role: UserRole };
  from?: MiniMapPoint;
}): Promise<void> {
  const store = await loadProgressMeta(params.projectId);
  const prev = store.tasks[params.taskId] ?? {};

  const edits: TaskEditEvent[] = [...(prev.edits ?? [])];
  edits.unshift({
    id: uid('edit'),
    taskId: params.taskId,
    ts: nowIso(),
    actor: params.actor,
    kind: 'position',
    field: 'position',
    from: params.from,
    to: params.position,
  });

  store.tasks[params.taskId] = {
    ...prev,
    position: params.position,
    edits,
  };

  await saveProgressMeta(store);
}

export async function appendStatusEdit(params: {
  projectId: string;
  taskId: string;
  actor: { id: string; name: string; role: UserRole };
  fromStatus: ProgressStatus;
  toStatus: ProgressStatus;
  progressAfter?: number;
}): Promise<void> {
  const store = await loadProgressMeta(params.projectId);
  const prev = store.tasks[params.taskId] ?? {};

  const edits: TaskEditEvent[] = [...(prev.edits ?? [])];
  edits.unshift({
    id: uid('edit'),
    taskId: params.taskId,
    ts: nowIso(),
    actor: params.actor,
    kind: 'status',
    field: 'status',
    from: params.fromStatus,
    to: params.toStatus,
    progressAfter: params.progressAfter,
  });

  const progressSeries: TaskProgressPoint[] = [...(prev.progressSeries ?? [])];
  if (typeof params.progressAfter === 'number') {
    progressSeries.push({ ts: nowIso(), value: Math.max(0, Math.min(100, params.progressAfter)) });
  }

  store.tasks[params.taskId] = {
    ...prev,
    edits,
    progressSeries,
  };

  await saveProgressMeta(store);
}

export async function addTaskPayment(params: {
  projectId: string;
  taskId: string;
  actor: { id: string; name: string; role: UserRole };
  amount: number;
  note?: string;
  method?: string;
  status?: 'pending' | 'paid' | 'cancelled';
}): Promise<void> {
  const store = await loadProgressMeta(params.projectId);
  const prev = store.tasks[params.taskId] ?? {};

  const payments: TaskPaymentEvent[] = [...(prev.payments ?? [])];
  payments.unshift({
    id: uid('pay'),
    taskId: params.taskId,
    ts: nowIso(),
    actor: params.actor,
    amount: params.amount,
    currency: 'VND',
    note: params.note,
    method: params.method,
    status: params.status ?? 'paid',
  });

  const edits: TaskEditEvent[] = [...(prev.edits ?? [])];
  edits.unshift({
    id: uid('edit'),
    taskId: params.taskId,
    ts: nowIso(),
    actor: params.actor,
    kind: 'payment',
    field: 'payment',
    to: { amount: params.amount, note: params.note, method: params.method, status: params.status ?? 'paid' },
  });

  store.tasks[params.taskId] = {
    ...prev,
    payments,
    edits,
  };

  await saveProgressMeta(store);
}

export async function exportTaskAsJson(params: {
  projectId: string;
  task: ProgressTask;
}): Promise<string> {
  const meta = await getTaskMeta(params.projectId, params.task.id);
  const payload = {
    schema: 'progress_task_export_v1',
    exportedAt: nowIso(),
    projectId: params.projectId,
    task: params.task,
    meta: meta ?? {},
  };
  return JSON.stringify(payload, null, 2);
}
