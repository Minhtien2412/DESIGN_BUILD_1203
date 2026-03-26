import type {
    AdjustStockRequest,
    AssignManagerRequest,
    ConfirmHandoverRequest,
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
    ReceiveMaterialRequest,
    ReceiveTransferRequest,
    RecordStockTransactionRequest,
    StockAlert,
    StockMovement,
    StockSnapshot,
    StockTransaction,
    Supplier,
    TransferOrder,
    TransferStockRequest,
    UpdateMaterialOrderRequest,
    UpdateMaterialRequest,
    UpdateSupplierRequest,
    Warehouse,
    WarehouseStockSummary,
} from "@/types/inventory";
import { apiFetch } from "./api";

// Materials API

export const getMaterials = async (projectId: string): Promise<Material[]> => {
  return apiFetch(`/projects/${projectId}/materials`);
};

export const getMaterial = async (materialId: string): Promise<Material> => {
  return apiFetch(`/materials/${materialId}`);
};

export const createMaterial = async (
  data: CreateMaterialRequest,
): Promise<Material> => {
  return apiFetch(`/materials`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateMaterial = async (
  materialId: string,
  data: UpdateMaterialRequest,
): Promise<Material> => {
  return apiFetch(`/materials/${materialId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteMaterial = async (materialId: string): Promise<void> => {
  return apiFetch(`/materials/${materialId}`, {
    method: "DELETE",
  });
};

export const getLowStockMaterials = async (
  projectId: string,
): Promise<Material[]> => {
  return apiFetch(`/projects/${projectId}/materials/low-stock`);
};

// Suppliers API

export const getSuppliers = async (projectId?: string): Promise<Supplier[]> => {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  const query = params.toString();
  return apiFetch(`/suppliers${query ? `?${query}` : ""}`);
};

export const getSupplier = async (supplierId: string): Promise<Supplier> => {
  return apiFetch(`/suppliers/${supplierId}`);
};

export const createSupplier = async (
  data: CreateSupplierRequest,
): Promise<Supplier> => {
  return apiFetch(`/suppliers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateSupplier = async (
  supplierId: string,
  data: UpdateSupplierRequest,
): Promise<Supplier> => {
  return apiFetch(`/suppliers/${supplierId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteSupplier = async (supplierId: string): Promise<void> => {
  return apiFetch(`/suppliers/${supplierId}`, {
    method: "DELETE",
  });
};

export const getSupplierMaterials = async (
  supplierId: string,
): Promise<Material[]> => {
  return apiFetch(`/suppliers/${supplierId}/materials`);
};

// Material Orders API

export const getMaterialOrders = async (
  projectId: string,
): Promise<MaterialOrder[]> => {
  return apiFetch(`/projects/${projectId}/material-orders`);
};

export const getMaterialOrder = async (
  orderId: string,
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${orderId}`);
};

export const createMaterialOrder = async (
  data: CreateMaterialOrderRequest,
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateMaterialOrder = async (
  orderId: string,
  data: UpdateMaterialOrderRequest,
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteMaterialOrder = async (orderId: string): Promise<void> => {
  return apiFetch(`/material-orders/${orderId}`, {
    method: "DELETE",
  });
};

export const approveMaterialOrder = async (
  orderId: string,
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${orderId}/approve`, {
    method: "POST",
  });
};

export const receiveMaterials = async (
  data: ReceiveMaterialRequest,
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${data.orderId}/receive`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const cancelMaterialOrder = async (
  orderId: string,
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${orderId}/cancel`, {
    method: "POST",
  });
};

// Stock Transactions API

export const getStockTransactions = async (
  projectId: string,
  materialId?: string,
): Promise<StockTransaction[]> => {
  const params = new URLSearchParams();
  if (materialId) params.append("materialId", materialId);
  const query = params.toString();
  return apiFetch(
    `/projects/${projectId}/stock-transactions${query ? `?${query}` : ""}`,
  );
};

export const getStockTransaction = async (
  transactionId: string,
): Promise<StockTransaction> => {
  return apiFetch(`/stock-transactions/${transactionId}`);
};

export const recordStockTransaction = async (
  data: RecordStockTransactionRequest,
): Promise<StockTransaction> => {
  return apiFetch(`/stock-transactions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adjustStock = async (
  data: AdjustStockRequest,
): Promise<StockTransaction> => {
  return apiFetch(`/materials/${data.materialId}/adjust-stock`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const transferStock = async (
  data: TransferStockRequest,
): Promise<StockTransaction[]> => {
  return apiFetch(`/stock-transactions/transfer`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Inventory Analytics & Reports

export const getInventorySummary = async (
  projectId: string,
): Promise<InventorySummary> => {
  return apiFetch(`/projects/${projectId}/inventory/summary`);
};

export const getStockAlerts = async (
  projectId: string,
): Promise<StockAlert[]> => {
  return apiFetch(`/projects/${projectId}/inventory/alerts`);
};

export const getStockMovements = async (
  projectId: string,
  startDate: string,
  endDate: string,
  materialId?: string,
): Promise<StockMovement[]> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });
  if (materialId) params.append("materialId", materialId);
  return apiFetch(
    `/projects/${projectId}/inventory/movements?${params.toString()}`,
  );
};

export const exportInventoryReport = async (
  projectId: string,
  format: "PDF" | "EXCEL",
): Promise<Blob> => {
  const params = new URLSearchParams({ format });
  return apiFetch(
    `/projects/${projectId}/inventory/export?${params.toString()}`,
  );
};

export const exportStockTransactionReport = async (
  projectId: string,
  startDate: string,
  endDate: string,
  format: "PDF" | "EXCEL",
): Promise<Blob> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
    format,
  });
  return apiFetch(
    `/projects/${projectId}/stock-transactions/export?${params.toString()}`,
  );
};
// ============================================================================
// Advanced Inventory — Transfers, Handovers, Stock Snapshots, Managers
// ============================================================================

// Warehouses API

export const getWarehouses = async (
  projectId?: string,
): Promise<Warehouse[]> => {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  const query = params.toString();
  return apiFetch(`/warehouses${query ? `?${query}` : ""}`);
};

export const getWarehouse = async (warehouseId: string): Promise<Warehouse> => {
  return apiFetch(`/warehouses/${warehouseId}`);
};

// Transfer Orders API

export const getTransferOrders = async (
  projectId: string,
): Promise<TransferOrder[]> => {
  return apiFetch(`/projects/${projectId}/transfer-orders`);
};

export const getTransferOrder = async (
  transferId: string,
): Promise<TransferOrder> => {
  return apiFetch(`/transfer-orders/${transferId}`);
};

export const createTransferOrder = async (
  data: CreateTransferOrderRequest,
): Promise<TransferOrder> => {
  return apiFetch(`/transfer-orders`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const approveTransferOrder = async (
  transferId: string,
): Promise<TransferOrder> => {
  return apiFetch(`/transfer-orders/${transferId}/approve`, { method: "POST" });
};

export const rejectTransferOrder = async (
  transferId: string,
  reason: string,
): Promise<TransferOrder> => {
  return apiFetch(`/transfer-orders/${transferId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
};

export const shipTransferOrder = async (
  transferId: string,
): Promise<TransferOrder> => {
  return apiFetch(`/transfer-orders/${transferId}/ship`, { method: "POST" });
};

export const receiveTransferOrder = async (
  data: ReceiveTransferRequest,
): Promise<TransferOrder> => {
  return apiFetch(`/transfer-orders/${data.transferId}/receive`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const cancelTransferOrder = async (
  transferId: string,
): Promise<TransferOrder> => {
  return apiFetch(`/transfer-orders/${transferId}/cancel`, { method: "POST" });
};

// Handover Records API

export const getHandoverRecords = async (
  projectId: string,
): Promise<HandoverRecord[]> => {
  return apiFetch(`/projects/${projectId}/handover-records`);
};

export const getHandoverRecord = async (
  handoverId: string,
): Promise<HandoverRecord> => {
  return apiFetch(`/handover-records/${handoverId}`);
};

export const createHandoverRecord = async (
  data: CreateHandoverRequest,
): Promise<HandoverRecord> => {
  return apiFetch(`/handover-records`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const confirmHandoverRecord = async (
  data: ConfirmHandoverRequest,
): Promise<HandoverRecord> => {
  return apiFetch(`/handover-records/${data.handoverId}/confirm`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const rejectHandoverRecord = async (
  handoverId: string,
  reason: string,
): Promise<HandoverRecord> => {
  return apiFetch(`/handover-records/${handoverId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
};

export const cancelHandoverRecord = async (
  handoverId: string,
): Promise<HandoverRecord> => {
  return apiFetch(`/handover-records/${handoverId}/cancel`, { method: "POST" });
};

// Stock Snapshots API

export const getStockSnapshots = async (
  projectId: string,
  warehouseId?: string,
): Promise<StockSnapshot[]> => {
  const params = new URLSearchParams();
  if (warehouseId) params.append("warehouseId", warehouseId);
  const query = params.toString();
  return apiFetch(
    `/projects/${projectId}/stock-snapshots${query ? `?${query}` : ""}`,
  );
};

export const getWarehouseStockSummaries = async (
  projectId: string,
): Promise<WarehouseStockSummary[]> => {
  return apiFetch(`/projects/${projectId}/warehouse-stock-summaries`);
};

// Material Managers API

export const getMaterialManagers = async (
  projectId: string,
  warehouseId?: string,
): Promise<MaterialManager[]> => {
  const params = new URLSearchParams();
  if (warehouseId) params.append("warehouseId", warehouseId);
  const query = params.toString();
  return apiFetch(
    `/projects/${projectId}/material-managers${query ? `?${query}` : ""}`,
  );
};

export const assignManager = async (
  data: AssignManagerRequest,
): Promise<MaterialManager> => {
  return apiFetch(`/material-managers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const removeManager = async (managerId: string): Promise<void> => {
  return apiFetch(`/material-managers/${managerId}`, { method: "DELETE" });
};
