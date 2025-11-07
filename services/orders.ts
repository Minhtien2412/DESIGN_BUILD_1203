import type { CartItem } from '@/context/cart-context';
import { getJson, postJson } from '@/services/backendClient';

export interface OrderItem { id: string; name: string; price: number; qty: number; }
export interface Order {
  id: string;
  status: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
  total: number;
  currency: string;
  items: OrderItem[];
  paymentIntentId?: string;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderInput {
  items: OrderItem[];
  total: number;
  currency: string;
  paymentIntentId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}

let _ordersCache: Order[] = [];

export async function listOrders(): Promise<Order[]> {
  const res = await getJson<{ orders?: Order[] }>('/orders', { retry: 1 });
  if (res.ok && res.data?.orders) { _ordersCache = res.data.orders; return _ordersCache; }
  return _ordersCache; // fallback stale
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const res = await postJson<Order>('/orders', input, { retry: 2 });
  if (res.ok && res.data) {
    _ordersCache = [res.data, ..._ordersCache].slice(0, 50);
    return res.data;
  }
  // Fallback mock order (successful) if backend not ready
  const mock: Order = {
    id: 'ord_'+Date.now(),
    status: input.paymentIntentId ? 'paid' : 'pending',
    total: input.total,
    currency: input.currency,
    items: input.items,
    paymentIntentId: input.paymentIntentId,
    paymentMethodId: input.paymentMethodId,
    createdAt: new Date().toISOString(),
  };
  _ordersCache = [mock, ..._ordersCache].slice(0, 50);
  return mock;
}

export function cartItemsToOrderItems(cart: CartItem[]): OrderItem[] {
  return cart.map(c => ({ 
    id: c.id, 
    name: c.product.name, 
    price: c.product.price, 
    qty: c.quantity 
  }));
}
