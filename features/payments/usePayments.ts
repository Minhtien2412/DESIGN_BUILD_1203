import { useCart } from '@/context/cart-context';
import { cartItemsToOrderItems, createOrder } from '@/services/orders';
import { addPaymentMethod, createPaymentIntent, deletePaymentMethod, listPaymentMethods, PaymentIntent, PaymentMethod, setPrimaryPaymentMethod, togglePaymentMethodEnabled, updatePaymentMethod } from '@/services/payments';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UsePaymentsState {
  methods: PaymentMethod[];
  loading: boolean;
  error?: string | null;
  selected?: PaymentMethod | null;
  intent?: PaymentIntent | null;
  processing: boolean;
  orderId?: string | null;
}

export interface UsePaymentsApi {
  reload(force?: boolean): Promise<void>;
  select(id: string): void;
  checkout(): Promise<PaymentIntent | null>;
  addMethod(data: Parameters<typeof addPaymentMethod>[0]): Promise<PaymentMethod | null>;
  updateMethod(data: Parameters<typeof updatePaymentMethod>[0]): Promise<PaymentMethod | null>;
  removeMethod(id: string): Promise<boolean>;
  setPrimary(id: string): Promise<void>;
  toggleEnabled(id: string, enabled: boolean): Promise<void>;
}

export function usePayments(): UsePaymentsState & UsePaymentsApi {
  // Capture cart state once per render; do NOT call useCart inside inner callbacks (Rules of Hooks)
  const { totalPrice, items: cartItems } = useCart();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const mounted = useRef(true);

  const reload = useCallback(async (force = false) => {
    setLoading(true); setError(null);
    try {
      const data = await listPaymentMethods(force);
      if (!mounted.current) return;
      setMethods(data);
      if (!selected && data.length) setSelected(data.find(m => m.primary) || data[0]);
    } catch (e: any) {
      if (mounted.current) setError(e?.message || 'Tải phương thức thanh toán thất bại');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [selected]);

  const select = useCallback((id: string) => {
    setSelected(prev => (prev?.id === id ? prev : methods.find(m => m.id === id) || prev));
  }, [methods]);

  const checkout = useCallback(async () => {
    if (!selected) return null;
    setProcessing(true);
    try {
      const newIntent = await createPaymentIntent({
        amount: totalPrice,
        currency: 'VND',
        methodId: selected.id,
        metadata: { cartTotal: totalPrice },
      });
      if (mounted.current) setIntent(newIntent);
      // Auto create Order if intent succeeded immediately (e.g. COD / wallet auto approve)
      if (newIntent.status === 'succeeded') {
        // Auto-create order using the cart snapshot captured at checkout time
        try {
          const order = await createOrder({
            items: cartItemsToOrderItems(cartItems),
            total: totalPrice,
            currency: 'VND',
            paymentIntentId: newIntent.id,
            paymentMethodId: selected.id,
            metadata: { auto: true },
          });
          if (mounted.current) setOrderId(order.id);
        } catch {
          // Silently ignore order creation failure for now (could surface toast later)
        }
      }
      return newIntent;
    } catch (e) {
      if (mounted.current) setError('Tạo giao dịch thất bại');
      return null;
    } finally {
      if (mounted.current) setProcessing(false);
    }
  }, [selected, totalPrice, cartItems]);

  useEffect(() => { reload(); return () => { mounted.current = false; }; }, [reload]);

  const addMethod: UsePaymentsApi['addMethod'] = useCallback(async (input) => {
    try {
      const created = await addPaymentMethod(input);
      setMethods(prev => [...prev, created]);
      return created;
    } catch (e) { setError('Thêm phương thức thất bại'); return null; }
  }, []);

  const updateMethod: UsePaymentsApi['updateMethod'] = useCallback(async (patch) => {
    try {
      const updated = await updatePaymentMethod(patch);
      if (!updated) return null;
      setMethods(prev => prev.map(m => m.id === updated.id ? updated! : m));
      if (selected?.id === updated.id) setSelected(updated);
      return updated;
    } catch { setError('Cập nhật phương thức thất bại'); return null; }
  }, [selected]);

  const removeMethod: UsePaymentsApi['removeMethod'] = useCallback(async (id) => {
    const removed = await deletePaymentMethod(id);
    if (removed) {
      setMethods(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    }
    return removed;
  }, [selected]);

  const setPrimary: UsePaymentsApi['setPrimary'] = useCallback(async (id) => {
    await setPrimaryPaymentMethod(id);
    setMethods(prev => prev.map(m => ({ ...m, primary: m.id === id })));
  }, []);

  const toggleEnabled: UsePaymentsApi['toggleEnabled'] = useCallback(async (id, enabled) => {
    await togglePaymentMethodEnabled(id, enabled);
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled } : m));
  }, []);

  return { methods, loading, error, selected, intent, processing, orderId, reload, select, checkout, addMethod, updateMethod, removeMethod, setPrimary, toggleEnabled };
}
