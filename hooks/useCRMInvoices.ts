/**
 * useCRMInvoices Hook
 * Fetch invoices từ Perfex CRM
 * 
 * Features:
 * - Fetch all invoices or by project/customer
 * - Filter by status (unpaid, paid, overdue)
 * - Payment tracking
 * - Support fallback to mock data
 * 
 * @author Auto-generated
 * @updated 2026-01-03
 */

import {
    PerfexInvoice,
    PerfexInvoicesService,
} from '@/services/perfexCRM';
import { useCallback, useEffect, useState } from 'react';

// ==================== TYPES ====================

export interface CRMInvoice {
  id: string;
  number: string;
  clientId: string;
  clientName?: string;
  projectId?: string;
  date: string;
  dueDate?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'unpaid' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'draft';
  paidAmount?: number;
  sentDate?: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoicesStats {
  total: number;
  unpaid: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
}

export interface UseCRMInvoicesReturn {
  invoices: CRMInvoice[];
  stats: InvoicesStats;
  loading: boolean;
  error: string | null;
  dataSource: 'crm' | 'mock';
  refresh: () => Promise<void>;
  getByProject: (projectId: string) => CRMInvoice[];
  markAsPaid: (id: string, amount: number) => Promise<boolean>;
}

// ==================== MOCK DATA ====================
// Dữ liệu mẫu dựa trên cấu trúc thực từ Perfex CRM
// Real Invoice: INV-000001, Total: 305,000,000 VND, Client: Lê Nguyên Thảo

const MOCK_INVOICES: CRMInvoice[] = [
  {
    id: '1',
    number: 'INV-000001',
    clientId: '4',
    clientName: 'Lê Nguyên Thảo',
    projectId: undefined,
    date: '2026-01-03',
    dueDate: '2026-02-02',
    subtotal: 305000000,
    tax: 0,
    total: 305000000,
    status: 'unpaid',
    paidAmount: 0,
  },
  {
    id: '2',
    number: 'INV-000002',
    clientId: '1',
    clientName: 'Anh Khương Q9',
    projectId: '1',
    date: '2026-01-05',
    dueDate: '2026-02-05',
    subtotal: 1500000000,
    tax: 150000000,
    total: 1650000000,
    status: 'unpaid',
    paidAmount: 0,
  },
  {
    id: '3',
    number: 'INV-000003',
    clientId: '3',
    clientName: 'Anh Tiến',
    projectId: '2',
    date: '2026-01-02',
    dueDate: '2026-02-15',
    subtotal: 1000000000,
    tax: 100000000,
    total: 1100000000,
    status: 'paid',
    paidAmount: 1100000000,
  },
];

// ==================== HELPERS ====================

function mapPerfexStatus(status: number, dueDate?: string): CRMInvoice['status'] {
  // 1=Unpaid, 2=Paid, 3=Partially Paid, 4=Overdue, 5=Cancelled, 6=Draft
  switch (status) {
    case 1:
      // Check if overdue
      if (dueDate && new Date(dueDate) < new Date()) return 'overdue';
      return 'unpaid';
    case 2: return 'paid';
    case 3: return 'partial';
    case 4: return 'overdue';
    case 5: return 'cancelled';
    case 6: return 'draft';
    default: return 'unpaid';
  }
}

function mapPerfexInvoice(invoice: PerfexInvoice): CRMInvoice {
  return {
    id: invoice.id,
    number: `${invoice.prefix || 'INV'}-${invoice.number}`,
    clientId: invoice.clientid,
    projectId: invoice.project_id ? String(invoice.project_id) : undefined,
    date: invoice.date,
    dueDate: invoice.duedate,
    subtotal: parseFloat(invoice.subtotal) || 0,
    tax: parseFloat(invoice.total_tax) || 0,
    total: parseFloat(invoice.total) || 0,
    status: mapPerfexStatus(invoice.status, invoice.duedate),
    sentDate: invoice.datesend,
  };
}

// ==================== HOOK ====================

export function useCRMInvoices(options?: {
  clientId?: string;
  projectId?: string;
  status?: number;
}): UseCRMInvoicesReturn {
  const [invoices, setInvoices] = useState<CRMInvoice[]>(MOCK_INVOICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'crm' | 'mock'>('mock');

  const calculateStats = useCallback((invoiceList: CRMInvoice[]): InvoicesStats => {
    const totalAmount = invoiceList.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoiceList.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    
    return {
      total: invoiceList.length,
      unpaid: invoiceList.filter(i => i.status === 'unpaid').length,
      paid: invoiceList.filter(i => i.status === 'paid').length,
      overdue: invoiceList.filter(i => i.status === 'overdue').length,
      totalAmount,
      totalPaid,
      totalDue: totalAmount - totalPaid,
    };
  }, []);

  const [stats, setStats] = useState<InvoicesStats>(calculateStats(MOCK_INVOICES));

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { limit: 100 };
      if (options?.clientId) params.clientid = options.clientId;
      if (options?.projectId) params.project_id = parseInt(options.projectId);
      if (options?.status) params.status = options.status;

      const response = await PerfexInvoicesService.getAll(params);
      
      if (response?.data && response.data.length > 0) {
        const mappedInvoices = response.data.map(mapPerfexInvoice);
        setInvoices(mappedInvoices);
        setStats(calculateStats(mappedInvoices));
        setDataSource('crm');
        console.log('[useCRMInvoices] Loaded from CRM:', mappedInvoices.length);
      } else {
        // Filter mock data if options provided
        let filteredMock = [...MOCK_INVOICES];
        if (options?.clientId) {
          filteredMock = filteredMock.filter(i => i.clientId === options.clientId);
        }
        if (options?.projectId) {
          filteredMock = filteredMock.filter(i => i.projectId === options.projectId);
        }
        
        setInvoices(filteredMock);
        setStats(calculateStats(filteredMock));
        setDataSource('mock');
      }
    } catch (err) {
      console.error('[useCRMInvoices] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  }, [options?.clientId, options?.projectId, options?.status, calculateStats]);

  const getByProject = useCallback((projectId: string): CRMInvoice[] => {
    return invoices.filter(inv => inv.projectId === projectId);
  }, [invoices]);

  const markAsPaid = useCallback(async (id: string, amount: number): Promise<boolean> => {
    try {
      await PerfexInvoicesService.markPaid(id, {
        amount,
        paymentmode: 'bank_transfer',
        date: new Date().toISOString().split('T')[0],
      });
      
      setInvoices(prev => prev.map(inv => 
        inv.id === id 
          ? { 
              ...inv, 
              status: 'paid' as const, 
              paidAmount: inv.total 
            } 
          : inv
      ));
      
      setStats(prev => ({
        ...prev,
        paid: prev.paid + 1,
        unpaid: Math.max(0, prev.unpaid - 1),
        totalPaid: prev.totalPaid + amount,
        totalDue: Math.max(0, prev.totalDue - amount),
      }));
      
      return true;
    } catch (err) {
      console.error('[useCRMInvoices] Mark paid error:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    stats,
    loading,
    error,
    dataSource,
    refresh: fetchInvoices,
    getByProject,
    markAsPaid,
  };
}

export default useCRMInvoices;
