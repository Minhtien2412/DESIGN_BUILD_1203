/**
 * Contract API Service
 * 
 * Manages contracts, materials, quotations, and payments for construction projects.
 * 
 * Features:
 * - Contract CRUD operations
 * - Material management
 * - Quotation generation
 * - Payment tracking
 * - Invoice generation
 */

import { apiFetch } from './api';

// Types
export interface Contract {
  id: string;
  projectId: string;
  projectName?: string;
  contractNumber: string;
  title: string;
  description?: string;
  type: 'materials' | 'labor' | 'equipment' | 'service' | 'full';
  status: 'draft' | 'pending' | 'signed' | 'active' | 'completed' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate?: string;
  signedDate?: string;
  clientId: string;
  clientName?: string;
  vendorId?: string;
  vendorName?: string;
  terms?: string[];
  attachments?: ContractAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Material {
  id: string;
  name: string;
  description?: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  category: string;
  supplierId?: string;
  supplierName?: string;
  projectId?: string;
  status: 'requested' | 'ordered' | 'delivered' | 'in-use';
  imageUrl?: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  validUntil: string;
  clientId: string;
  clientName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  contractId: string;
  contractNumber?: string;
  invoiceNumber: string;
  amount: number;
  method: 'cash' | 'bank-transfer' | 'momo' | 'vnpay' | 'stripe' | 'check';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  projectId: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

// Contract API Service
class ContractApiService {
  /**
   * Get all contracts with filters
   */
  async getContracts(filters?: {
    projectId?: string;
    status?: string;
    type?: string;
    clientId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ contracts: Contract[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const query = params.toString();
      const response = await apiFetch(`/contracts${query ? `?${query}` : ''}`);
      return response as { contracts: Contract[]; total: number };
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      throw error;
    }
  }

  /**
   * Get single contract by ID
   */
  async getContract(id: string): Promise<Contract> {
    try {
      const response = await apiFetch(`/contracts/${id}`);
      return response as Contract;
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      throw error;
    }
  }

  /**
   * Create new contract
   */
  async createContract(data: Partial<Contract>): Promise<Contract> {
    try {
      const response = await apiFetch('/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Contract;
    } catch (error) {
      console.error('Failed to create contract:', error);
      throw error;
    }
  }

  /**
   * Update contract
   */
  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    try {
      const response = await apiFetch(`/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Contract;
    } catch (error) {
      console.error('Failed to update contract:', error);
      throw error;
    }
  }

  /**
   * Delete contract
   */
  async deleteContract(id: string): Promise<void> {
    try {
      await apiFetch(`/contracts/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete contract:', error);
      throw error;
    }
  }

  /**
   * Get materials
   */
  async getMaterials(filters?: {
    projectId?: string;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Material[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const query = params.toString();
      const response = await apiFetch(`/materials${query ? `?${query}` : ''}`);
      return response as Material[];
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      throw error;
    }
  }

  /**
   * Create material
   */
  async createMaterial(data: Partial<Material>): Promise<Material> {
    try {
      const response = await apiFetch('/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Material;
    } catch (error) {
      console.error('Failed to create material:', error);
      throw error;
    }
  }

  /**
   * Get quotations
   */
  async getQuotations(filters?: {
    projectId?: string;
    status?: string;
    clientId?: string;
  }): Promise<Quotation[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clientId) params.append('clientId', filters.clientId);

      const query = params.toString();
      const response = await apiFetch(`/quotations${query ? `?${query}` : ''}`);
      return response as Quotation[];
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      throw error;
    }
  }

  /**
   * Create quotation
   */
  async createQuotation(data: Partial<Quotation>): Promise<Quotation> {
    try {
      const response = await apiFetch('/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Quotation;
    } catch (error) {
      console.error('Failed to create quotation:', error);
      throw error;
    }
  }

  /**
   * Get payments
   */
  async getPayments(filters?: {
    contractId?: string;
    status?: string;
    method?: string;
  }): Promise<Payment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.contractId) params.append('contractId', filters.contractId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.method) params.append('method', filters.method);

      const query = params.toString();
      const response = await apiFetch(`/payments${query ? `?${query}` : ''}`);
      return response as Payment[];
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  }

  /**
   * Create payment
   */
  async createPayment(data: Partial<Payment>): Promise<Payment> {
    try {
      const response = await apiFetch('/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response as Payment;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  }

  /**
   * Process payment (for payment gateways)
   */
  async processPayment(paymentId: string, gateway: 'momo' | 'vnpay' | 'stripe'): Promise<{ paymentUrl: string }> {
    try {
      const response = await apiFetch(`/payments/${paymentId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateway }),
      });
      return response as { paymentUrl: string };
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw error;
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice(contractId: string): Promise<Invoice> {
    try {
      const response = await apiFetch(`/contracts/${contractId}/invoice`, {
        method: 'POST',
      });
      return response as Invoice;
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  }

  /**
   * Get contract PDF
   */
  async downloadContractPDF(contractId: string): Promise<{ url: string }> {
    try {
      const response = await apiFetch(`/contracts/${contractId}/pdf`);
      return response as { url: string };
    } catch (error) {
      console.error('Failed to download contract PDF:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contractApi = new ContractApiService();
