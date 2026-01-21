/**
 * Procurement & Vendor Management API Service
 */

import type {
    CreateGoodsReceiptParams,
    CreatePurchaseOrderParams,
    CreatePurchaseRequestParams,
    CreateQuotationRequestParams,
    CreateVendorParams,
    EvaluationCriteria,
    GetPurchaseOrdersParams,
    GetPurchaseRequestsParams,
    GetVendorsParams,
    GoodsReceipt,
    Invoice,
    PurchaseOrder,
    PurchaseRequest,
    Quotation,
    QuotationRequest,
    SubmitQuotationParams,
    UpdatePurchaseOrderParams,
    UpdatePurchaseRequestParams,
    UpdateVendorParams,
    Vendor,
    VendorEvaluation,
} from '@/types/procurement';
import { apiFetch } from './api';

const BASE_URL = '/procurement';

// Purchase Requests
export const getPurchaseRequests = async (params?: GetPurchaseRequestsParams): Promise<PurchaseRequest[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`${BASE_URL}/requests?${queryParams.toString()}`);
};

export const getPurchaseRequest = async (id: string): Promise<PurchaseRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}`);
};

export const createPurchaseRequest = async (params: CreatePurchaseRequestParams): Promise<PurchaseRequest> => {
  return apiFetch(`${BASE_URL}/requests`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updatePurchaseRequest = async (params: UpdatePurchaseRequestParams): Promise<PurchaseRequest> => {
  const { id, ...data } = params;
  return apiFetch(`${BASE_URL}/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deletePurchaseRequest = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/requests/${id}`, {
    method: 'DELETE',
  });
};

export const submitPurchaseRequest = async (id: string): Promise<PurchaseRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/submit`, {
    method: 'POST',
  });
};

export const approvePurchaseRequest = async (id: string, comments?: string): Promise<PurchaseRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const rejectPurchaseRequest = async (id: string, reason: string): Promise<PurchaseRequest> => {
  return apiFetch(`${BASE_URL}/requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// Vendors
export const getVendors = async (params?: GetVendorsParams): Promise<Vendor[]> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.rating) queryParams.append('rating', params.rating.toString());

  return apiFetch(`${BASE_URL}/vendors?${queryParams.toString()}`);
};

export const getVendor = async (id: string): Promise<Vendor> => {
  return apiFetch(`${BASE_URL}/vendors/${id}`);
};

export const createVendor = async (params: CreateVendorParams): Promise<Vendor> => {
  return apiFetch(`${BASE_URL}/vendors`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateVendor = async (params: UpdateVendorParams): Promise<Vendor> => {
  const { id, ...data } = params;
  return apiFetch(`${BASE_URL}/vendors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteVendor = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/vendors/${id}`, {
    method: 'DELETE',
  });
};

export const getVendorPerformance = async (vendorId: string): Promise<Vendor['performanceMetrics']> => {
  return apiFetch(`${BASE_URL}/vendors/${vendorId}/performance`);
};

// Quotation Requests
export const getQuotationRequests = async (projectId?: string): Promise<QuotationRequest[]> => {
  const queryParams = projectId ? `?projectId=${projectId}` : '';
  return apiFetch(`${BASE_URL}/quotations/requests${queryParams}`);
};

export const getQuotationRequest = async (id: string): Promise<QuotationRequest> => {
  return apiFetch(`${BASE_URL}/quotations/requests/${id}`);
};

export const createQuotationRequest = async (params: CreateQuotationRequestParams): Promise<QuotationRequest> => {
  return apiFetch(`${BASE_URL}/quotations/requests`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateQuotationRequest = async (
  id: string,
  data: Partial<CreateQuotationRequestParams>
): Promise<QuotationRequest> => {
  return apiFetch(`${BASE_URL}/quotations/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteQuotationRequest = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/quotations/requests/${id}`, {
    method: 'DELETE',
  });
};

export const sendQuotationRequest = async (id: string): Promise<QuotationRequest> => {
  return apiFetch(`${BASE_URL}/quotations/requests/${id}/send`, {
    method: 'POST',
  });
};

// Quotations
export const submitQuotation = async (params: SubmitQuotationParams): Promise<Quotation> => {
  return apiFetch(`${BASE_URL}/quotations`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateQuotation = async (
  id: string,
  data: Partial<Omit<SubmitQuotationParams, 'quotationRequestId' | 'vendorId'>>
): Promise<Quotation> => {
  return apiFetch(`${BASE_URL}/quotations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const acceptQuotation = async (id: string, notes?: string): Promise<Quotation> => {
  return apiFetch(`${BASE_URL}/quotations/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
};

export const rejectQuotation = async (id: string, reason: string): Promise<Quotation> => {
  return apiFetch(`${BASE_URL}/quotations/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const compareQuotations = async (requestId: string): Promise<{
  items: {
    itemName: string;
    vendors: {
      vendorName: string;
      unitPrice: number;
      total: number;
      deliveryTime: number;
    }[];
  }[];
  lowestTotal: {
    vendorName: string;
    total: number;
  };
  fastestDelivery: {
    vendorName: string;
    deliveryTime: number;
  };
}> => {
  return apiFetch(`${BASE_URL}/quotations/requests/${requestId}/compare`);
};

// Purchase Orders
export const getPurchaseOrders = async (params?: GetPurchaseOrdersParams): Promise<PurchaseOrder[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`${BASE_URL}/orders?${queryParams.toString()}`);
};

export const getPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}`);
};

export const createPurchaseOrder = async (params: CreatePurchaseOrderParams): Promise<PurchaseOrder> => {
  return apiFetch(`${BASE_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updatePurchaseOrder = async (params: UpdatePurchaseOrderParams): Promise<PurchaseOrder> => {
  const { id, ...data } = params;
  return apiFetch(`${BASE_URL}/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deletePurchaseOrder = async (id: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/orders/${id}`, {
    method: 'DELETE',
  });
};

export const sendPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/send`, {
    method: 'POST',
  });
};

export const confirmPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/confirm`, {
    method: 'POST',
  });
};

export const cancelPurchaseOrder = async (id: string, reason: string): Promise<PurchaseOrder> => {
  return apiFetch(`${BASE_URL}/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const exportPurchaseOrder = async (id: string): Promise<Blob> => {
  return apiFetch(`${BASE_URL}/orders/${id}/export`, {
    headers: {
      Accept: 'application/pdf',
    },
  });
};

// Goods Receipts
export const getGoodsReceipts = async (purchaseOrderId?: string): Promise<GoodsReceipt[]> => {
  const queryParams = purchaseOrderId ? `?purchaseOrderId=${purchaseOrderId}` : '';
  return apiFetch(`${BASE_URL}/receipts${queryParams}`);
};

export const getGoodsReceipt = async (id: string): Promise<GoodsReceipt> => {
  return apiFetch(`${BASE_URL}/receipts/${id}`);
};

export const createGoodsReceipt = async (params: CreateGoodsReceiptParams): Promise<GoodsReceipt> => {
  return apiFetch(`${BASE_URL}/receipts`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const updateGoodsReceipt = async (
  id: string,
  data: Partial<CreateGoodsReceiptParams>
): Promise<GoodsReceipt> => {
  return apiFetch(`${BASE_URL}/receipts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Invoices
export const getInvoices = async (purchaseOrderId?: string): Promise<Invoice[]> => {
  const queryParams = purchaseOrderId ? `?purchaseOrderId=${purchaseOrderId}` : '';
  return apiFetch(`${BASE_URL}/invoices${queryParams}`);
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  return apiFetch(`${BASE_URL}/invoices/${id}`);
};

export const createInvoice = async (data: {
  purchaseOrderId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
}): Promise<Invoice> => {
  return apiFetch(`${BASE_URL}/invoices`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateInvoiceStatus = async (
  id: string,
  status: Invoice['status'],
  notes?: string
): Promise<Invoice> => {
  return apiFetch(`${BASE_URL}/invoices/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });
};

export const recordPayment = async (
  id: string,
  data: {
    paidDate: string;
    paidAmount: number;
    paymentMethod: string;
    paymentReference: string;
  }
): Promise<Invoice> => {
  return apiFetch(`${BASE_URL}/invoices/${id}/payment`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Vendor Evaluations
export const getVendorEvaluations = async (vendorId?: string): Promise<VendorEvaluation[]> => {
  const queryParams = vendorId ? `?vendorId=${vendorId}` : '';
  return apiFetch(`${BASE_URL}/evaluations${queryParams}`);
};

export const createVendorEvaluation = async (data: {
  vendorId: string;
  projectId?: string;
  purchaseOrderId?: string;
  period: {
    startDate: string;
    endDate: string;
  };
  criteria: EvaluationCriteria[];
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  wouldRecommend: boolean;
}): Promise<VendorEvaluation> => {
  return apiFetch(`${BASE_URL}/evaluations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Analytics & Reports
export const getProcurementAnalytics = async (
  projectId?: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  totalOrders: number;
  totalValue: number;
  pendingOrders: number;
  completedOrders: number;
  topVendors: {
    vendorId: string;
    vendorName: string;
    orderCount: number;
    totalValue: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    value: number;
  }[];
  avgDeliveryTime: number;
  onTimeDeliveryRate: number;
}> => {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  if (fromDate) queryParams.append('fromDate', fromDate);
  if (toDate) queryParams.append('toDate', toDate);

  return apiFetch(`${BASE_URL}/analytics?${queryParams.toString()}`);
};

export const getVendorAnalytics = async (vendorId: string): Promise<{
  totalOrders: number;
  totalValue: number;
  completedOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  responsiveness: number;
  recentOrders: PurchaseOrder[];
  monthlyTrend: {
    month: string;
    orderCount: number;
    totalValue: number;
  }[];
}> => {
  return apiFetch(`${BASE_URL}/vendors/${vendorId}/analytics`);
};

export const getSpendAnalysis = async (
  projectId?: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  totalSpend: number;
  byCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  byVendor: {
    vendorId: string;
    vendorName: string;
    amount: number;
    percentage: number;
  }[];
  byMonth: {
    month: string;
    amount: number;
  }[];
  topPurchases: PurchaseOrder[];
}> => {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  if (fromDate) queryParams.append('fromDate', fromDate);
  if (toDate) queryParams.append('toDate', toDate);

  return apiFetch(`${BASE_URL}/analytics/spend?${queryParams.toString()}`);
};
