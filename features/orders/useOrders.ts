import { createOrder, listOrders, Order } from '@/services/orders';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseOrdersState { orders: Order[]; loading: boolean; error?: string | null; creating: boolean; }
export interface UseOrdersApi { reload(): Promise<void>; add(o: Parameters<typeof createOrder>[0]): Promise<Order | null>; }

export function useOrders(): UseOrdersState & UseOrdersApi {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const list = await listOrders();
      if (mounted.current) setOrders(list);
    } catch (e: any) {
      if (mounted.current) setError(e?.message || 'Tải đơn hàng thất bại');
    } finally { if (mounted.current) setLoading(false); }
  }, []);

  const add = useCallback(async (input: Parameters<typeof createOrder>[0]) => {
    setCreating(true); setError(null);
    try {
      const order = await createOrder(input);
      if (mounted.current) setOrders(prev => [order, ...prev]);
      return order;
    } catch (e: any) {
      if (mounted.current) setError('Tạo đơn hàng thất bại');
      return null;
    } finally { if (mounted.current) setCreating(false); }
  }, []);

  useEffect(() => { reload(); return () => { mounted.current = false; }; }, [reload]);

  return { orders, loading, error, creating, reload, add };
}
