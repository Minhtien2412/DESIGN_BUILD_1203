/**
 * Feature Data Types & Helpers
 * Dữ liệu thực tế từ API/CRM - không còn mock data
 * Cập nhật: Cleaned for production
 */

// === DOCUMENTS TYPES ===

export interface MockDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'dwg' | 'image' | 'other';
  category: 'contract' | 'drawing' | 'report' | 'permit' | 'invoice' | 'other';
  size: number;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  projectName?: string;
  uploadedBy: string;
  url?: string;
  thumbnail?: string;
  description?: string;
}

// Empty - data from API only
export const MOCK_DOCUMENTS: MockDocument[] = [];

// === BUDGET TYPES ===

export interface MockBudgetCategory {
  id: string;
  name: string;
  planned: number;
  actual: number;
  icon: string;
}

export interface MockBudgetTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  projectId?: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod?: string;
  reference?: string;
}

// Empty arrays - data from API only
export const MOCK_BUDGET_CATEGORIES: MockBudgetCategory[] = [];
export const MOCK_BUDGET_TRANSACTIONS: MockBudgetTransaction[] = [];

export const MOCK_BUDGET_SUMMARY = {
  totalBudget: 0,
  totalSpent: 0,
  totalIncome: 0,
  remaining: 0,
  percentUsed: 0,
};

// === CONTRACTS TYPES ===

export interface MockContract {
  id: string;
  contractNumber: string;
  title: string;
  type: 'construction' | 'supply' | 'service' | 'lease' | 'other';
  parties: {
    name: string;
    role: 'client' | 'contractor' | 'supplier' | 'consultant';
    contact?: string;
  }[];
  value: number;
  currency: string;
  status: 'draft' | 'pending_approval' | 'active' | 'completed' | 'terminated' | 'expired';
  startDate: string;
  endDate: string;
  signedDate?: string;
  projectId?: string;
  projectName?: string;
  description?: string;
  terms?: string[];
  attachments?: string[];
}

// Empty - data from API only
export const MOCK_CONTRACTS: MockContract[] = [];

// === ANALYTICS TYPES ===

export interface MockAnalyticsSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
}

export interface MockAnalyticsChart {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

// Empty analytics - data from API only
export const MOCK_ANALYTICS_SUMMARY: MockAnalyticsSummary = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  profit: 0,
  profitMargin: 0,
};

export const MOCK_ANALYTICS_REVENUE_BY_MONTH: MockAnalyticsChart[] = [];
export const MOCK_ANALYTICS_PROJECT_STATUS: MockAnalyticsChart[] = [];
export const MOCK_ANALYTICS_EXPENSE_BY_CATEGORY: MockAnalyticsChart[] = [];

// === HELPER FUNCTIONS (Keep these - useful for formatting) ===

export function formatCurrency(amount: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getDocumentIcon(type: string): string {
  const icons: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    xls: '📊',
    dwg: '📐',
    image: '🖼️',
    other: '📁',
  };
  return icons[type] || icons.other;
}

export function getContractStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: '#999999',
    pending_approval: '#0066CC',
    active: '#0066CC',
    completed: '#0066CC',
    terminated: '#F44336',
    expired: '#FF5722',
  };
  return colors[status] || colors.draft;
}

export function getContractStatusText(status: string): string {
  const texts: Record<string, string> = {
    draft: 'Bản nháp',
    pending_approval: 'Chờ duyệt',
    active: 'Đang hiệu lực',
    completed: 'Hoàn thành',
    terminated: 'Đã chấm dứt',
    expired: 'Hết hạn',
  };
  return texts[status] || status;
}

export default {
  documents: MOCK_DOCUMENTS,
  budgetCategories: MOCK_BUDGET_CATEGORIES,
  budgetTransactions: MOCK_BUDGET_TRANSACTIONS,
  budgetSummary: MOCK_BUDGET_SUMMARY,
  contracts: MOCK_CONTRACTS,
  analyticsSummary: MOCK_ANALYTICS_SUMMARY,
  analyticsRevenueByMonth: MOCK_ANALYTICS_REVENUE_BY_MONTH,
  analyticsProjectStatus: MOCK_ANALYTICS_PROJECT_STATUS,
  analyticsExpenseByCategory: MOCK_ANALYTICS_EXPENSE_BY_CATEGORY,
};
