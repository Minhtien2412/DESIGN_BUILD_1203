import type {
    AdjustStockRequest,
    CreateMaterialOrderRequest,
    CreateMaterialRequest,
    CreateSupplierRequest,
    InventorySummary,
    Material,
    MaterialOrder,
    ReceiveMaterialRequest,
    RecordStockTransactionRequest,
    StockAlert,
    StockMovement,
    StockTransaction,
    Supplier,
    TransferStockRequest,
    UpdateMaterialOrderRequest,
    UpdateMaterialRequest,
    UpdateSupplierRequest,
} from '@/types/inventory';
import { apiFetch } from './api';

// Materials API

export const getMaterials = async (projectId: string): Promise<Material[]> => {
  return apiFetch(`/projects/${projectId}/materials`);
};

export const getMaterial = async (materialId: string): Promise<Material> => {
  return apiFetch(`/materials/${materialId}`);
};

export const createMaterial = async (
  data: CreateMaterialRequest
): Promise<Material> => {
  return apiFetch(`/materials`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMaterial = async (
  materialId: string,
  data: UpdateMaterialRequest
): Promise<Material> => {
  return apiFetch(`/materials/${materialId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteMaterial = async (materialId: string): Promise<void> => {
  return apiFetch(`/materials/${materialId}`, {
    method: 'DELETE',
  });
};

export const getLowStockMaterials = async (
  projectId: string
): Promise<Material[]> => {
  return apiFetch(`/projects/${projectId}/materials/low-stock`);
};

// Suppliers API

export const getSuppliers = async (projectId?: string): Promise<Supplier[]> => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  const query = params.toString();
  return apiFetch(`/suppliers${query ? `?${query}` : ''}`);
};

export const getSupplier = async (supplierId: string): Promise<Supplier> => {
  return apiFetch(`/suppliers/${supplierId}`);
};

export const createSupplier = async (
  data: CreateSupplierRequest
): Promise<Supplier> => {
  return apiFetch(`/suppliers`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateSupplier = async (
  supplierId: string,
  data: UpdateSupplierRequest
): Promise<Supplier> => {
  return apiFetch(`/suppliers/${supplierId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteSupplier = async (supplierId: string): Promise<void> => {
  return apiFetch(`/suppliers/${supplierId}`, {
    method: 'DELETE',
  });
};

export const getSupplierMaterials = async (
  supplierId: string
): Promise<Material[]> => {
  return apiFetch(`/suppliers/${supplierId}/materials`);
};

// Material Orders API

export const getMaterialOrders = async (
  projectId: string
): Promise<MaterialOrder[]> => {
  return apiFetch(`/projects/${projectId}/material-orders`);
};

export const getMaterialOrder = async (
  orderId: string
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${orderId}`);
};

export const createMaterialOrder = async (
  data: CreateMaterialOrderRequest
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMaterialOrder = async (
  orderId: string,
  data: UpdateMaterialOrderRequest
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteMaterialOrder = async (orderId: string): Promise<void> => {
  return apiFetch(`/material-orders/${orderId}`, {
    method: 'DELETE',
  });
};

export const approveMaterialOrder = async (orderId: string): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${orderId}/approve`, {
    method: 'POST',
  });
};

export const receiveMaterials = async (
  data: ReceiveMaterialRequest
): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${data.orderId}/receive`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const cancelMaterialOrder = async (orderId: string): Promise<MaterialOrder> => {
  return apiFetch(`/material-orders/${orderId}/cancel`, {
    method: 'POST',
  });
};

// Stock Transactions API

export const getStockTransactions = async (
  projectId: string,
  materialId?: string
): Promise<StockTransaction[]> => {
  const params = new URLSearchParams();
  if (materialId) params.append('materialId', materialId);
  const query = params.toString();
  return apiFetch(
    `/projects/${projectId}/stock-transactions${query ? `?${query}` : ''}`
  );
};

export const getStockTransaction = async (
  transactionId: string
): Promise<StockTransaction> => {
  return apiFetch(`/stock-transactions/${transactionId}`);
};

export const recordStockTransaction = async (
  data: RecordStockTransactionRequest
): Promise<StockTransaction> => {
  return apiFetch(`/stock-transactions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const adjustStock = async (
  data: AdjustStockRequest
): Promise<StockTransaction> => {
  return apiFetch(`/materials/${data.materialId}/adjust-stock`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const transferStock = async (
  data: TransferStockRequest
): Promise<StockTransaction[]> => {
  return apiFetch(`/stock-transactions/transfer`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Inventory Analytics & Reports

export const getInventorySummary = async (
  projectId: string
): Promise<InventorySummary> => {
  return apiFetch(`/projects/${projectId}/inventory/summary`);
};

export const getStockAlerts = async (projectId: string): Promise<StockAlert[]> => {
  return apiFetch(`/projects/${projectId}/inventory/alerts`);
};

export const getStockMovements = async (
  projectId: string,
  startDate: string,
  endDate: string,
  materialId?: string
): Promise<StockMovement[]> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });
  if (materialId) params.append('materialId', materialId);
  return apiFetch(`/projects/${projectId}/inventory/movements?${params.toString()}`);
};

export const exportInventoryReport = async (
  projectId: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  const params = new URLSearchParams({ format });
  return apiFetch(`/projects/${projectId}/inventory/export?${params.toString()}`);
};

export const exportStockTransactionReport = async (
  projectId: string,
  startDate: string,
  endDate: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
    format,
  });
  return apiFetch(
    `/projects/${projectId}/stock-transactions/export?${params.toString()}`
  );
};
