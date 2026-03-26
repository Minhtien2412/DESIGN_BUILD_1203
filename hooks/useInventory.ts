import * as inventoryService from "@/services/inventory";
import type {
    AdjustStockRequest,
    CreateHandoverRequest,
    CreateMaterialOrderRequest,
    CreateMaterialRequest,
    CreateSupplierRequest,
    CreateTransferOrderRequest,
    HandoverRecord,
    InventorySummary,
    Material,
    MaterialManager,
    MaterialOrder,
    RecordStockTransactionRequest,
    StockAlert,
    StockSnapshot,
    StockTransaction,
    Supplier,
    TransferOrder,
    UpdateMaterialOrderRequest,
    UpdateMaterialRequest,
    UpdateSupplierRequest,
    Warehouse,
    WarehouseStockSummary,
} from "@/types/inventory";
import { useCallback, useEffect, useState } from "react";

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

  const createMaterial = useCallback(async (data: CreateMaterialRequest) => {
    const newMaterial = await inventoryService.createMaterial(data);
    setMaterials((prev) => [...prev, newMaterial]);
    return newMaterial;
  }, []);

  const updateMaterial = useCallback(
    async (materialId: string, data: UpdateMaterialRequest) => {
      const updated = await inventoryService.updateMaterial(materialId, data);
      setMaterials((prev) =>
        prev.map((m) => (m.id === materialId ? updated : m)),
      );
      return updated;
    },
    [],
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

  const createSupplier = useCallback(async (data: CreateSupplierRequest) => {
    const newSupplier = await inventoryService.createSupplier(data);
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback(
    async (supplierId: string, data: UpdateSupplierRequest) => {
      const updated = await inventoryService.updateSupplier(supplierId, data);
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplierId ? updated : s)),
      );
      return updated;
    },
    [],
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

  const createOrder = useCallback(async (data: CreateMaterialOrderRequest) => {
    const newOrder = await inventoryService.createMaterialOrder(data);
    setOrders((prev) => [...prev, newOrder]);
    return newOrder;
  }, []);

  const updateOrder = useCallback(
    async (orderId: string, data: UpdateMaterialOrderRequest) => {
      const updated = await inventoryService.updateMaterialOrder(orderId, data);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return updated;
    },
    [],
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
export const useStockTransactions = (
  projectId: string,
  materialId?: string,
) => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getStockTransactions(
        projectId,
        materialId,
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
      const newTransaction =
        await inventoryService.recordStockTransaction(data);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    },
    [],
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

// ============================================================================
// Advanced Inventory Hooks — Transfers, Handovers, Stock Snapshots, Managers
// ============================================================================

// Warehouses Hook
export const useWarehouses = (projectId?: string) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getWarehouses(projectId);
      setWarehouses(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return { warehouses, loading, error, refetch: fetchWarehouses };
};

// Transfer Orders Hook
export const useTransferOrders = (projectId: string) => {
  const [transfers, setTransfers] = useState<TransferOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getTransferOrders(projectId);
      setTransfers(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const createTransfer = useCallback(
    async (data: CreateTransferOrderRequest) => {
      const newTransfer = await inventoryService.createTransferOrder(data);
      setTransfers((prev) => [newTransfer, ...prev]);
      return newTransfer;
    },
    [],
  );

  const approveTransfer = useCallback(async (transferId: string) => {
    const updated = await inventoryService.approveTransferOrder(transferId);
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? updated : t)),
    );
    return updated;
  }, []);

  const cancelTransfer = useCallback(async (transferId: string) => {
    const updated = await inventoryService.cancelTransferOrder(transferId);
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? updated : t)),
    );
    return updated;
  }, []);

  return {
    transfers,
    loading,
    error,
    refetch: fetchTransfers,
    createTransfer,
    approveTransfer,
    cancelTransfer,
  };
};

// Handover Records Hook
export const useHandoverRecords = (projectId: string) => {
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHandovers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getHandoverRecords(projectId);
      setHandovers(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchHandovers();
  }, [fetchHandovers]);

  const createHandover = useCallback(async (data: CreateHandoverRequest) => {
    const newHandover = await inventoryService.createHandoverRecord(data);
    setHandovers((prev) => [newHandover, ...prev]);
    return newHandover;
  }, []);

  const confirmHandover = useCallback(
    async (handoverId: string, signatureTo: string) => {
      const updated = await inventoryService.confirmHandoverRecord({
        handoverId,
        signatureTo,
      });
      setHandovers((prev) =>
        prev.map((h) => (h.id === handoverId ? updated : h)),
      );
      return updated;
    },
    [],
  );

  const cancelHandover = useCallback(async (handoverId: string) => {
    const updated = await inventoryService.cancelHandoverRecord(handoverId);
    setHandovers((prev) =>
      prev.map((h) => (h.id === handoverId ? updated : h)),
    );
    return updated;
  }, []);

  return {
    handovers,
    loading,
    error,
    refetch: fetchHandovers,
    createHandover,
    confirmHandover,
    cancelHandover,
  };
};

// Stock Snapshots Hook
export const useStockSnapshots = (projectId: string, warehouseId?: string) => {
  const [snapshots, setSnapshots] = useState<StockSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSnapshots = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getStockSnapshots(
        projectId,
        warehouseId,
      );
      setSnapshots(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId, warehouseId]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  return { snapshots, loading, error, refetch: fetchSnapshots };
};

// Warehouse Stock Summaries Hook
export const useWarehouseStockSummaries = (projectId: string) => {
  const [summaries, setSummaries] = useState<WarehouseStockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummaries = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getWarehouseStockSummaries(projectId);
      setSummaries(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return { summaries, loading, error, refetch: fetchSummaries };
};

// Material Managers Hook
export const useMaterialManagers = (
  projectId: string,
  warehouseId?: string,
) => {
  const [managers, setManagers] = useState<MaterialManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchManagers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await inventoryService.getMaterialManagers(
        projectId,
        warehouseId,
      );
      setManagers(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId, warehouseId]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const removeManager = useCallback(async (managerId: string) => {
    await inventoryService.removeManager(managerId);
    setManagers((prev) => prev.filter((m) => m.id !== managerId));
  }, []);

  return { managers, loading, error, refetch: fetchManagers, removeManager };
};
