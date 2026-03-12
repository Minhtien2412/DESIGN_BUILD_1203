/**
 * Business Operations Service
 * Provides invoices, contracts, payments, equipment data
 * Falls back to mock data when API is unavailable
 */

import { apiFetch } from "./api";
import {
    mockCommunications,
    mockContracts,
    mockDocuments,
    mockEquipment,
    mockFiles,
    mockInvoices,
    mockPayments,
} from "./mockDataService";

// ============================================
// Types
// ============================================

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paidDate?: string | null;
  items: {
    description: string;
    amount: number;
  }[];
}

export interface Contract {
  id: string;
  title: string;
  client: string;
  value: number;
  status: "draft" | "pending" | "active" | "completed" | "terminated";
  startDate: string;
  endDate: string;
  signedDate?: string | null;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "bank_transfer" | "cash" | "card" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionDate: string;
  note?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: "available" | "in_use" | "maintenance" | "retired";
  location: string;
  lastMaintenance?: string;
  assignedTo?: string | null;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  projectId?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Document {
  id: string;
  title: string;
  category: string;
  files: number;
  lastModified: string;
  status: "active" | "archived";
  sharedWith: string[];
}

export interface Communication {
  id: string;
  type: "email" | "sms" | "notification" | "call";
  subject: string;
  from: string;
  to: string;
  content: string;
  sentAt: string;
  status: "sent" | "delivered" | "read" | "failed";
}

// ============================================
// Invoice Functions
// ============================================

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const response = await apiFetch<Invoice[]>("/invoices");
    return response;
  } catch (error) {
    console.log("[Business] Invoices API unavailable, using mock data");
    return mockInvoices as Invoice[];
  }
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const response = await apiFetch<Invoice>(`/invoices/${id}`);
    return response;
  } catch (error) {
    return (mockInvoices.find((i) => i.id === id) as Invoice) || null;
  }
}

export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  try {
    const response = await apiFetch<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    return {
      id: `INV-${Date.now()}`,
      client: data.client || "",
      amount: data.amount || 0,
      status: "draft",
      dueDate: data.dueDate || new Date().toISOString(),
      paidDate: null,
      items: data.items || [],
    };
  }
}

export async function getPendingInvoices(): Promise<Invoice[]> {
  const invoices = await getInvoices();
  return invoices.filter(
    (i) => i.status === "pending" || i.status === "overdue",
  );
}

// ============================================
// Contract Functions
// ============================================

export async function getContracts(): Promise<Contract[]> {
  try {
    const response = await apiFetch<Contract[]>("/contracts");
    return response;
  } catch (error) {
    console.log("[Business] Contracts API unavailable, using mock data");
    return mockContracts as Contract[];
  }
}

export async function getContractById(id: string): Promise<Contract | null> {
  try {
    const response = await apiFetch<Contract>(`/contracts/${id}`);
    return response;
  } catch (error) {
    return (mockContracts.find((c) => c.id === id) as Contract) || null;
  }
}

export async function createContract(
  data: Partial<Contract>,
): Promise<Contract> {
  try {
    const response = await apiFetch<Contract>("/contracts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    return {
      id: `CTR-${Date.now()}`,
      title: data.title || "",
      client: data.client || "",
      value: data.value || 0,
      status: "draft",
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date().toISOString(),
      signedDate: null,
    };
  }
}

export async function getActiveContracts(): Promise<Contract[]> {
  const contracts = await getContracts();
  return contracts.filter((c) => c.status === "active");
}

// ============================================
// Payment Functions
// ============================================

export async function getPayments(): Promise<Payment[]> {
  try {
    const response = await apiFetch<Payment[]>("/payments");
    return response;
  } catch (error) {
    console.log("[Business] Payments API unavailable, using mock data");
    return mockPayments as Payment[];
  }
}

export async function getPaymentsByInvoice(
  invoiceId: string,
): Promise<Payment[]> {
  const payments = await getPayments();
  return payments.filter((p) => p.invoiceId === invoiceId);
}

export async function createPayment(data: Partial<Payment>): Promise<Payment> {
  try {
    const response = await apiFetch<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    return {
      id: `PAY-${Date.now()}`,
      invoiceId: data.invoiceId || "",
      amount: data.amount || 0,
      method: data.method || "bank_transfer",
      status: "pending",
      transactionDate: new Date().toISOString(),
      note: data.note,
    };
  }
}

// ============================================
// Equipment Functions
// ============================================

export async function getEquipment(): Promise<Equipment[]> {
  try {
    const response = await apiFetch<Equipment[]>("/equipment");
    return response;
  } catch (error) {
    console.log("[Business] Equipment API unavailable, using mock data");
    return mockEquipment as Equipment[];
  }
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  try {
    const response = await apiFetch<Equipment>(`/equipment/${id}`);
    return response;
  } catch (error) {
    return (mockEquipment.find((e) => e.id === id) as Equipment) || null;
  }
}

export async function getAvailableEquipment(): Promise<Equipment[]> {
  const equipment = await getEquipment();
  return equipment.filter((e) => e.status === "available");
}

export async function assignEquipment(
  id: string,
  assignTo: string,
): Promise<Equipment> {
  try {
    const response = await apiFetch<Equipment>(`/equipment/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ assignedTo: assignTo }),
    });
    return response;
  } catch (error) {
    const existing = mockEquipment.find((e) => e.id === id);
    return { ...existing, status: "in_use", assignedTo: assignTo } as Equipment;
  }
}

// ============================================
// File Functions
// ============================================

export async function getFiles(projectId?: string): Promise<FileItem[]> {
  try {
    const endpoint = projectId ? `/files?projectId=${projectId}` : "/files";
    const response = await apiFetch<FileItem[]>(endpoint);
    return response;
  } catch (error) {
    console.log("[Business] Files API unavailable, using mock data");
    if (projectId) {
      return mockFiles.filter((f) => f.projectId === projectId) as FileItem[];
    }
    return mockFiles as FileItem[];
  }
}

export async function uploadFile(file: FormData): Promise<FileItem> {
  try {
    const response = await apiFetch<FileItem>("/files/upload", {
      method: "POST",
      body: file,
    });
    return response;
  } catch (error) {
    // Return mock response
    return {
      id: String(Date.now()),
      name: "uploaded-file",
      type: "unknown",
      size: 0,
      url: "",
      uploadedBy: "User",
      uploadedAt: new Date().toISOString(),
    };
  }
}

// ============================================
// Document Functions
// ============================================

export async function getDocuments(): Promise<Document[]> {
  try {
    const response = await apiFetch<Document[]>("/documents");
    return response;
  } catch (error) {
    console.log("[Business] Documents API unavailable, using mock data");
    return mockDocuments as Document[];
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  try {
    const response = await apiFetch<Document>(`/documents/${id}`);
    return response;
  } catch (error) {
    return (mockDocuments.find((d) => d.id === id) as Document) || null;
  }
}

// ============================================
// Communication Functions
// ============================================

export async function getCommunications(): Promise<Communication[]> {
  try {
    const response = await apiFetch<Communication[]>("/communications");
    return response;
  } catch (error) {
    console.log("[Business] Communications API unavailable, using mock data");
    return mockCommunications as Communication[];
  }
}

export async function sendEmail(data: {
  to: string;
  subject: string;
  content: string;
}): Promise<Communication> {
  try {
    const response = await apiFetch<Communication>("/communications/email", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    return {
      id: String(Date.now()),
      type: "email",
      subject: data.subject,
      from: "system@thietkeresort.com",
      to: data.to,
      content: data.content,
      sentAt: new Date().toISOString(),
      status: "sent",
    };
  }
}

// ============================================
// Dashboard Stats
// ============================================

export interface BusinessDashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoicesAmount: number;
  overdueInvoicesAmount: number;
  activeContracts: number;
  equipmentInUse: number;
  equipmentAvailable: number;
}

export async function getBusinessDashboardStats(): Promise<BusinessDashboardStats> {
  try {
    const response = await apiFetch<BusinessDashboardStats>(
      "/business/dashboard/stats",
    );
    return response;
  } catch (error) {
    // Calculate from mock data
    const invoices = mockInvoices;
    const contracts = mockContracts;
    const equipment = mockEquipment;

    const paidInvoices = invoices.filter((i) => i.status === "paid");
    const pendingInvoices = invoices.filter((i) => i.status === "pending");
    const overdueInvoices = invoices.filter((i) => i.status === "overdue");

    return {
      totalRevenue: paidInvoices.reduce((sum, i) => sum + i.amount, 0),
      monthlyRevenue: paidInvoices.reduce((sum, i) => sum + i.amount, 0), // Simplified
      pendingInvoicesAmount: pendingInvoices.reduce(
        (sum, i) => sum + i.amount,
        0,
      ),
      overdueInvoicesAmount: overdueInvoices.reduce(
        (sum, i) => sum + i.amount,
        0,
      ),
      activeContracts: contracts.filter((c) => c.status === "active").length,
      equipmentInUse: equipment.filter((e) => e.status === "in_use").length,
      equipmentAvailable: equipment.filter((e) => e.status === "available")
        .length,
    };
  }
}

export default {
  // Invoices
  getInvoices,
  getInvoiceById,
  createInvoice,
  getPendingInvoices,
  // Contracts
  getContracts,
  getContractById,
  createContract,
  getActiveContracts,
  // Payments
  getPayments,
  getPaymentsByInvoice,
  createPayment,
  // Equipment
  getEquipment,
  getEquipmentById,
  getAvailableEquipment,
  assignEquipment,
  // Files
  getFiles,
  uploadFile,
  // Documents
  getDocuments,
  getDocumentById,
  // Communications
  getCommunications,
  sendEmail,
  // Dashboard
  getBusinessDashboardStats,
};
