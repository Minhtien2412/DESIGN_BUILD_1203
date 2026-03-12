import * as inventoryService from '@/services/inventory';
import type {
    AdjustStockRequest,
    CreateMaterialOrderRequest,
    CreateMaterialRequest,
    CreateSupplierRequest,
    InventorySummary,
    Material,
    MaterialOrder,
    RecordStockTransactionRequest,
    StockAlert,
    StockTransaction,
    Supplier,
    UpdateMaterialOrderRequest,
    UpdateMaterialRequest,
    UpdateSupplierRequest,
} from '@/types/inventory';
import { useCallback, useEffect, useState } from 'react';

// Materials Hook
export const useMaterials = (projectId: string) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaterials = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getMaterials(projectId);
      setMaterials(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const createMaterial = useCallback(
    async (data: CreateMaterialRequest) => {
      const newMaterial = await inventoryService.createMaterial(data);
      setMaterials((prev) => [...prev, newMaterial]);
      return newMaterial;
    },
    []
  );

  const updateMaterial = useCallback(
    async (materialId: string, data: UpdateMaterialRequest) => {
      const updated = await inventoryService.updateMaterial(materialId, data);
      setMaterials((prev) =>
        prev.map((m) => (m.id === materialId ? updated : m))
      );
      return updated;
    },
    []
  );

  const deleteMaterial = useCallback(async (materialId: string) => {
    await inventoryService.deleteMaterial(materialId);
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
  }, []);

  return {
    materials,
    loading,
    error,
    refetch: fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
};

// Single Material Hook
export const useMaterial = (materialId: string) => {
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!materialId) return;
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        const data = await inventoryService.getMaterial(materialId);
        setMaterial(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [materialId]);

  return { material, loading, error };
};

// Suppliers Hook
export const useSuppliers = (projectId?: string) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getSuppliers(projectId);
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = useCallback(
    async (data: CreateSupplierRequest) => {
      const newSupplier = await inventoryService.createSupplier(data);
      setSuppliers((prev) => [...prev, newSupplier]);
      return newSupplier;
    },
    []
  );

  const updateSupplier = useCallback(
    async (supplierId: string, data: UpdateSupplierRequest) => {
      const updated = await inventoryService.updateSupplier(supplierId, data);
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplierId ? updated : s))
      );
      return updated;
    },
    []
  );

  const deleteSupplier = useCallback(async (supplierId: string) => {
    await inventoryService.deleteSupplier(supplierId);
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
  }, []);

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};

// Material Orders Hook
export const useMaterialOrders = (projectId: string) => {
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getMaterialOrders(projectId);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = useCallback(
    async (data: CreateMaterialOrderRequest) => {
      const newOrder = await inventoryService.createMaterialOrder(data);
      setOrders((prev) => [...prev, newOrder]);
      return newOrder;
    },
    []
  );

  const updateOrder = useCallback(
    async (orderId: string, data: UpdateMaterialOrderRequest) => {
      const updated = await inventoryService.updateMaterialOrder(orderId, data);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return updated;
    },
    []
  );

  const deleteOrder = useCallback(async (orderId: string) => {
    await inventoryService.deleteMaterialOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const approveOrder = useCallback(async (orderId: string) => {
    const approved = await inventoryService.approveMaterialOrder(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? approved : o)));
    return approved;
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    const cancelled = await inventoryService.cancelMaterialOrder(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? cancelled : o)));
    return cancelled;
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    approveOrder,
    cancelOrder,
  };
};

// Stock Transactions Hook
export const useStockTransactions = (projectId: string, materialId?: string) => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getStockTransactions(
        projectId,
        materialId
      );
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId, materialId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const recordTransaction = useCallback(
    async (data: RecordStockTransactionRequest) => {
      const newTransaction = await inventoryService.recordStockTransaction(data);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    },
    []
  );

  const adjustStock = useCallback(async (data: AdjustStockRequest) => {
    const adjustment = await inventoryService.adjustStock(data);
    setTransactions((prev) => [adjustment, ...prev]);
    return adjustment;
  }, []);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    recordTransaction,
    adjustStock,
  };
};

// Inventory Summary Hook
export const useInventorySummary = (projectId: string) => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getInventorySummary(projectId);
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};

// Stock Alerts Hook
export const useStockAlerts = (projectId: string) => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getStockAlerts(projectId);
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, error, refetch: fetchAlerts };
};

// Low Stock Materials Hook
export const useLowStockMaterials = (projectId: string) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLowStock = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getLowStockMaterials(projectId);
      setMaterials(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  return { materials, loading, error, refetch: fetchLowStock };
};
