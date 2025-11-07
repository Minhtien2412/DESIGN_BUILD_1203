import { getJson, postJson } from '@/services/backendClient';
import { getItem, setItem } from '@/utils/storage';

export type PaymentMethodType = 'cod' | 'bank_transfer' | 'momo' | 'zalopay' | 'visa' | 'mastercard';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  displayName: string;
  last4?: string; // for cards
  provider?: string; // bank / wallet provider name
  currency: string;
  enabled: boolean;
  createdAt: string;
  primary?: boolean;
}

export interface CreatePaymentMethodInput {
  type: PaymentMethodType;
  displayName: string;
  last4?: string;
  provider?: string;
  currency?: string; // default VND
  enabled?: boolean;
  primary?: boolean;
}

export interface UpdatePaymentMethodInput extends Partial<CreatePaymentMethodInput> { id: string; }

export interface CreatePaymentIntentInput {
  amount: number; // smallest currency unit (e.g. VND no decimals)
  currency: string;
  methodId: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  status: 'requires_action' | 'pending' | 'succeeded' | 'failed' | 'canceled';
  amount: number;
  currency: string;
  clientSecret?: string;
  methodId: string;
  createdAt: string;
  nextAction?: { type: 'redirect' | 'otp' | 'none'; url?: string; message?: string };
  errorMessage?: string;
}

// Simple local cache (session)
let _methodsCache: PaymentMethod[] | null = null;
let _methodsAt = 0;
const METHODS_TTL = 60_000; // 60s
const STORAGE_KEY = 'payment_methods_v1';

function fresh() { return Date.now() - _methodsAt < METHODS_TTL; }

// Mock fallback when backend not ready
function mockMethods(): PaymentMethod[] {
  return [
    { id: 'cod', type: 'cod', displayName: 'Thanh toán khi nhận hàng (COD)', currency: 'VND', enabled: true, createdAt: new Date().toISOString(), primary: true },
    { id: 'bank_vcb', type: 'bank_transfer', displayName: 'Chuyển khoản Vietcombank', provider: 'VCB', currency: 'VND', enabled: true, createdAt: new Date().toISOString() },
    { id: 'momo_default', type: 'momo', displayName: 'Ví MoMo', currency: 'VND', enabled: true, createdAt: new Date().toISOString() },
    { id: 'zalo_default', type: 'zalopay', displayName: 'ZaloPay', currency: 'VND', enabled: true, createdAt: new Date().toISOString() },
  ];
}

async function loadPersistedCustomMethods(): Promise<PaymentMethod[]> {
  try {
    const raw = await getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as PaymentMethod[];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

async function persistCustomMethods(methods: PaymentMethod[]) {
  try {
    await setItem(STORAGE_KEY, JSON.stringify(methods));
  } catch {}
}

export async function listPaymentMethods(force = false): Promise<PaymentMethod[]> {
  if (!force && _methodsCache && fresh()) return _methodsCache;
  const res = await getJson<{ methods?: PaymentMethod[] }>('/payments/methods', { retry: 1 });
  let base: PaymentMethod[] | undefined;
  if (res.ok && res.data?.methods?.length) {
    base = res.data.methods;
  } else {
    base = mockMethods();
  }
  // Merge with persisted custom user-defined methods (avoid id collisions by preferring custom set for same id)
  const custom = await loadPersistedCustomMethods();
  const map: Record<string, PaymentMethod> = {};
  for (const m of base) map[m.id] = m;
  for (const c of custom) map[c.id] = c;
  const merged = Object.values(map).sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0));
  _methodsCache = merged; _methodsAt = Date.now();
  return _methodsCache;
}

function updateCache(mutator: (list: PaymentMethod[]) => PaymentMethod[]): PaymentMethod[] {
  _methodsCache = mutator(_methodsCache || []);
  _methodsAt = Date.now();
  return _methodsCache;
}

function splitBuiltInAndCustom(list: PaymentMethod[]): { builtIn: PaymentMethod[]; custom: PaymentMethod[] } {
  // Treat mock/built-in as those with specific known ids or provider defaults; custom ones start with 'pm_' prefix
  const custom: PaymentMethod[] = []; const builtIn: PaymentMethod[] = [];
  for (const m of list) {
    if (m.id.startsWith('pm_')) custom.push(m); else builtIn.push(m);
  }
  return { builtIn, custom };
}

async function persistFromCache() {
  if (!_methodsCache) return;
  const { custom } = splitBuiltInAndCustom(_methodsCache);
  await persistCustomMethods(custom);
}

export async function addPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
  const method: PaymentMethod = {
    id: 'pm_' + Date.now().toString(36),
    type: input.type,
    displayName: input.displayName,
    last4: input.last4,
    provider: input.provider,
    currency: input.currency || 'VND',
    enabled: input.enabled ?? true,
    createdAt: new Date().toISOString(),
    primary: input.primary || false,
  };
  updateCache(list => {
    const next = [...list];
    if (method.primary) {
      // remove primary from others
      for (const m of next) m.primary = false;
    }
    next.push(method);
    return next;
  });
  await persistFromCache();
  return method;
}

export async function updatePaymentMethod(patch: UpdatePaymentMethodInput): Promise<PaymentMethod | null> {
  let updated: PaymentMethod | null = null;
  updateCache(list => list.map(m => {
    if (m.id !== patch.id) return m;
    updated = { ...m, ...patch, id: m.id, primary: patch.primary ?? m.primary };
    return updated;
  }));
  if (patch.primary) {
    updateCache(list => list.map(m => m.id === patch.id ? m : { ...m, primary: false }));
  }
  await persistFromCache();
  return updated;
}

export async function deletePaymentMethod(id: string): Promise<boolean> {
  let removed = false;
  updateCache(list => list.filter(m => { if (m.id === id) { removed = true; return false; } return true; }));
  if (removed) await persistFromCache();
  return removed;
}

export async function setPrimaryPaymentMethod(id: string): Promise<void> {
  updateCache(list => list.map(m => ({ ...m, primary: m.id === id })));
  await persistFromCache();
}

export async function togglePaymentMethodEnabled(id: string, enabled: boolean): Promise<void> {
  updateCache(list => list.map(m => m.id === id ? { ...m, enabled } : m));
  await persistFromCache();
}

export async function createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
  const res = await postJson<PaymentIntent>('/payments/intents', input, { retry: 2 });
  if (res.ok && res.data) return res.data;
  // Fallback fake successful intent (demo)
  return {
    id: 'pi_demo_'+Date.now(),
    status: 'succeeded',
    amount: input.amount,
    currency: input.currency,
    methodId: input.methodId,
    createdAt: new Date().toISOString(),
  };
}

export async function simulateCapture(intentId: string): Promise<PaymentIntent> {
  const res = await postJson<PaymentIntent>(`/payments/intents/${intentId}/capture`, {}, { retry: 1 });
  if (res.ok && res.data) return res.data;
  return { id: intentId, status: 'succeeded', amount: 0, currency: 'VND', methodId: 'cod', createdAt: new Date().toISOString() };
}
