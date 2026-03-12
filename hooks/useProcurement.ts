/**
 * Procurement & Vendor Management Hooks
 */

import * as procurementService from '@/services/procurement';
import type {
    CreateGoodsReceiptParams,
    CreatePurchaseOrderParams,
    CreatePurchaseRequestParams,
    CreateQuotationRequestParams,
    CreateVendorParams,
    GetPurchaseOrdersParams,
    GetPurchaseRequestsParams,
    GetVendorsParams,
    GoodsReceipt,
    Invoice,
    PurchaseOrder,
    PurchaseRequest,
    QuotationRequest,
    SubmitQuotationParams,
    UpdatePurchaseOrderParams,
    UpdatePurchaseRequestParams,
    UpdateVendorParams,
    Vendor
} from '@/types/procurement';
import { useEffect, useState } from 'react';

// Purchase Requests Hook
export const usePurchaseRequests = (params?: GetPurchaseRequestsParams) => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procurementService.getPurchaseRequests(params);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [JSON.stringify(params)]);

  const createRequest = async (data: CreatePurchaseRequestParams) => {
    try {
      const newRequest = await procurementService.createPurchaseRequest(data);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      throw err;
    }
  };

  const updateRequest = async (data: UpdatePurchaseRequestParams) => {
    try {
      const updated = await procurementService.updatePurchaseRequest(data);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      await procurementService.deletePurchaseRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const submitRequest = async (id: string) => {
    try {
      const updated = await procurementService.submitPurchaseRequest(id);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const approveRequest = async (id: string, comments?: string) => {
    try {
      const updated = await procurementService.approvePurchaseRequest(id, comments);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const rejectRequest = async (id: string, reason: string) => {
    try {
      const updated = await procurementService.rejectPurchaseRequest(id, reason);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    refresh: fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    submitRequest,
    approveRequest,
    rejectRequest,
  };
};

// Single Purchase Request Hook
export const usePurchaseRequest = (id: string) => {
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await procurementService.getPurchaseRequest(id);
        setRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch purchase request');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequest();
    }
  }, [id]);

  return { request, loading, error };
};

// Vendors Hook
export const useVendors = (params?: GetVendorsParams) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procurementService.getVendors(params);
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [JSON.stringify(params)]);

  const createVendor = async (data: CreateVendorParams) => {
    try {
      const newVendor = await procurementService.createVendor(data);
      setVendors(prev => [newVendor, ...prev]);
      return newVendor;
    } catch (err) {
      throw err;
    }
  };

  const updateVendor = async (data: UpdateVendorParams) => {
    try {
      const updated = await procurementService.updateVendor(data);
      setVendors(prev => prev.map(v => (v.id === updated.id ? updated : v)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      await procurementService.deleteVendor(id);
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    vendors,
    loading,
    error,
    refresh: fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
  };
};

// Single Vendor Hook
export const useVendor = (id: string) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await procurementService.getVendor(id);
        setVendor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendor');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    }
  }, [id]);

  return { vendor, loading, error };
};

// Quotation Requests Hook
export const useQuotationRequests = (projectId?: string) => {
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procurementService.getQuotationRequests(projectId);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [projectId]);

  const createRequest = async (data: CreateQuotationRequestParams) => {
    try {
      const newRequest = await procurementService.createQuotationRequest(data);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      await procurementService.deleteQuotationRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const sendRequest = async (id: string) => {
    try {
      const updated = await procurementService.sendQuotationRequest(id);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const submitQuotation = async (data: SubmitQuotationParams) => {
    try {
      await procurementService.submitQuotation(data);
      // Refresh to get updated quotations
      await fetchRequests();
    } catch (err) {
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    refresh: fetchRequests,
    createRequest,
    deleteRequest,
    sendRequest,
    submitQuotation,
  };
};

// Purchase Orders Hook
export const usePurchaseOrders = (params?: GetPurchaseOrdersParams) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procurementService.getPurchaseOrders(params);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [JSON.stringify(params)]);

  const createOrder = async (data: CreatePurchaseOrderParams) => {
    try {
      const newOrder = await procurementService.createPurchaseOrder(data);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      throw err;
    }
  };

  const updateOrder = async (data: UpdatePurchaseOrderParams) => {
    try {
      const updated = await procurementService.updatePurchaseOrder(data);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await procurementService.deletePurchaseOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const sendOrder = async (id: string) => {
    try {
      const updated = await procurementService.sendPurchaseOrder(id);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const confirmOrder = async (id: string) => {
    try {
      const updated = await procurementService.confirmPurchaseOrder(id);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const cancelOrder = async (id: string, reason: string) => {
    try {
      const updated = await procurementService.cancelPurchaseOrder(id, reason);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    sendOrder,
    confirmOrder,
    cancelOrder,
  };
};

// Single Purchase Order Hook
export const usePurchaseOrder = (id: string) => {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await procurementService.getPurchaseOrder(id);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch purchase order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  return { order, loading, error };
};

// Goods Receipts Hook
export const useGoodsReceipts = (purchaseOrderId?: string) => {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procurementService.getGoodsReceipts(purchaseOrderId);
      setReceipts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goods receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [purchaseOrderId]);

  const createReceipt = async (data: CreateGoodsReceiptParams) => {
    try {
      const newReceipt = await procurementService.createGoodsReceipt(data);
      setReceipts(prev => [newReceipt, ...prev]);
      return newReceipt;
    } catch (err) {
      throw err;
    }
  };

  return {
    receipts,
    loading,
    error,
    refresh: fetchReceipts,
    createReceipt,
  };
};

// Invoices Hook
export const useInvoices = (purchaseOrderId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await procurementService.getInvoices(purchaseOrderId);
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [purchaseOrderId]);

  const updateStatus = async (id: string, status: Invoice['status'], notes?: string) => {
    try {
      const updated = await procurementService.updateInvoiceStatus(id, status, notes);
      setInvoices(prev => prev.map(inv => (inv.id === updated.id ? updated : inv)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const recordPayment = async (
    id: string,
    data: {
      paidDate: string;
      paidAmount: number;
      paymentMethod: string;
      paymentReference: string;
    }
  ) => {
    try {
      const updated = await procurementService.recordPayment(id, data);
      setInvoices(prev => prev.map(inv => (inv.id === updated.id ? updated : inv)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
    updateStatus,
    recordPayment,
  };
};

// Procurement Analytics Hook
export const useProcurementAnalytics = (projectId?: string, fromDate?: string, toDate?: string) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await procurementService.getProcurementAnalytics(projectId, fromDate, toDate);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId, fromDate, toDate]);

  return { analytics, loading, error };
};

// Vendor Analytics Hook
export const useVendorAnalytics = (vendorId: string) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await procurementService.getVendorAnalytics(vendorId);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendor analytics');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchAnalytics();
    }
  }, [vendorId]);

  return { analytics, loading, error };
};
