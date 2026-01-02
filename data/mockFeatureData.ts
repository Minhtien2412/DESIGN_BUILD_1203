/**
 * Mock Data cho các features chưa có Backend
 * Sử dụng tạm thời cho development và demo
 * Cập nhật: 29/12/2025
 */

// === DOCUMENTS MOCK DATA ===

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

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: 'doc_1',
    name: 'Hợp đồng xây dựng villa resort.pdf',
    type: 'pdf',
    category: 'contract',
    size: 2500000,
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2025-12-15T10:30:00Z',
    projectId: 'proj_1',
    projectName: 'Villa Resort Đà Nẵng',
    uploadedBy: 'Nguyễn Văn A',
    description: 'Hợp đồng thi công giai đoạn 1',
  },
  {
    id: 'doc_2',
    name: 'Bản vẽ thiết kế mặt bằng tầng 1.dwg',
    type: 'dwg',
    category: 'drawing',
    size: 15000000,
    createdAt: '2025-11-20T14:00:00Z',
    updatedAt: '2025-12-10T09:15:00Z',
    projectId: 'proj_1',
    projectName: 'Villa Resort Đà Nẵng',
    uploadedBy: 'KTS. Trần Văn B',
    description: 'Bản vẽ AutoCAD mặt bằng tầng 1',
  },
  {
    id: 'doc_3',
    name: 'Báo cáo tiến độ tháng 12.xlsx',
    type: 'xls',
    category: 'report',
    size: 850000,
    createdAt: '2025-12-25T16:00:00Z',
    updatedAt: '2025-12-25T16:00:00Z',
    projectId: 'proj_1',
    projectName: 'Villa Resort Đà Nẵng',
    uploadedBy: 'Nguyễn Thị C',
    description: 'Báo cáo tiến độ và khối lượng hoàn thành',
  },
  {
    id: 'doc_4',
    name: 'Giấy phép xây dựng.pdf',
    type: 'pdf',
    category: 'permit',
    size: 5000000,
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-01T10:00:00Z',
    projectId: 'proj_1',
    projectName: 'Villa Resort Đà Nẵng',
    uploadedBy: 'Admin',
    description: 'Giấy phép xây dựng đã được phê duyệt',
  },
  {
    id: 'doc_5',
    name: 'Hóa đơn vật liệu xây dựng.pdf',
    type: 'pdf',
    category: 'invoice',
    size: 320000,
    createdAt: '2025-12-20T11:30:00Z',
    updatedAt: '2025-12-20T11:30:00Z',
    projectId: 'proj_2',
    projectName: 'Nhà phố Quận 7',
    uploadedBy: 'Kế toán',
    description: 'Hóa đơn mua xi măng, sắt thép',
  },
];

// === BUDGET MOCK DATA ===

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

export const MOCK_BUDGET_CATEGORIES: MockBudgetCategory[] = [
  { id: 'cat_1', name: 'Vật liệu xây dựng', planned: 500000000, actual: 420000000, icon: '🧱' },
  { id: 'cat_2', name: 'Nhân công', planned: 300000000, actual: 280000000, icon: '👷' },
  { id: 'cat_3', name: 'Thiết bị máy móc', planned: 150000000, actual: 145000000, icon: '🔧' },
  { id: 'cat_4', name: 'Phí quản lý dự án', planned: 50000000, actual: 35000000, icon: '📊' },
  { id: 'cat_5', name: 'Chi phí khác', planned: 100000000, actual: 75000000, icon: '📦' },
];

export const MOCK_BUDGET_TRANSACTIONS: MockBudgetTransaction[] = [
  {
    id: 'trans_1',
    description: 'Thanh toán đợt 1 - Khách hàng',
    amount: 500000000,
    type: 'income',
    category: 'Thu từ khách hàng',
    date: '2025-12-01T00:00:00Z',
    projectId: 'proj_1',
    status: 'completed',
    paymentMethod: 'Chuyển khoản',
    reference: 'TT-001-2025',
  },
  {
    id: 'trans_2',
    description: 'Mua xi măng Holcim 200 tấn',
    amount: 120000000,
    type: 'expense',
    category: 'Vật liệu xây dựng',
    date: '2025-12-05T00:00:00Z',
    projectId: 'proj_1',
    status: 'completed',
    paymentMethod: 'Chuyển khoản',
    reference: 'MH-001-2025',
  },
  {
    id: 'trans_3',
    description: 'Thanh toán lương công nhân tháng 11',
    amount: 85000000,
    type: 'expense',
    category: 'Nhân công',
    date: '2025-12-10T00:00:00Z',
    projectId: 'proj_1',
    status: 'completed',
    paymentMethod: 'Tiền mặt',
    reference: 'LC-11-2025',
  },
  {
    id: 'trans_4',
    description: 'Thuê cẩu tháp tháng 12',
    amount: 45000000,
    type: 'expense',
    category: 'Thiết bị máy móc',
    date: '2025-12-15T00:00:00Z',
    projectId: 'proj_1',
    status: 'pending',
    paymentMethod: 'Chuyển khoản',
    reference: 'TT-002-2025',
  },
  {
    id: 'trans_5',
    description: 'Thanh toán đợt 2 - Khách hàng',
    amount: 300000000,
    type: 'income',
    category: 'Thu từ khách hàng',
    date: '2025-12-20T00:00:00Z',
    projectId: 'proj_1',
    status: 'completed',
    paymentMethod: 'Chuyển khoản',
    reference: 'TT-003-2025',
  },
];

export const MOCK_BUDGET_SUMMARY = {
  totalBudget: 1100000000,
  totalSpent: 955000000,
  totalIncome: 800000000,
  remaining: 145000000,
  percentUsed: 86.8,
};

// === CONTRACTS MOCK DATA ===

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

export const MOCK_CONTRACTS: MockContract[] = [
  {
    id: 'contract_1',
    contractNumber: 'HD-2025-001',
    title: 'Hợp đồng thi công xây dựng Villa Resort Đà Nẵng',
    type: 'construction',
    parties: [
      { name: 'Công ty ABC', role: 'client', contact: '0901234567' },
      { name: 'Công ty XYZ Construction', role: 'contractor', contact: '0907654321' },
    ],
    value: 15000000000,
    currency: 'VND',
    status: 'active',
    startDate: '2025-10-01T00:00:00Z',
    endDate: '2026-10-01T00:00:00Z',
    signedDate: '2025-09-25T00:00:00Z',
    projectId: 'proj_1',
    projectName: 'Villa Resort Đà Nẵng',
    description: 'Hợp đồng thi công trọn gói dự án Villa Resort',
    terms: [
      'Thanh toán theo tiến độ',
      'Bảo hành 24 tháng',
      'Phạt chậm tiến độ 0.05%/ngày',
    ],
  },
  {
    id: 'contract_2',
    contractNumber: 'HD-2025-002',
    title: 'Hợp đồng cung cấp vật liệu xây dựng',
    type: 'supply',
    parties: [
      { name: 'Công ty XYZ Construction', role: 'client' },
      { name: 'Công ty Vật liệu Miền Nam', role: 'supplier' },
    ],
    value: 500000000,
    currency: 'VND',
    status: 'active',
    startDate: '2025-10-15T00:00:00Z',
    endDate: '2026-04-15T00:00:00Z',
    signedDate: '2025-10-10T00:00:00Z',
    projectId: 'proj_1',
    description: 'Cung cấp xi măng, sắt thép, gạch',
  },
  {
    id: 'contract_3',
    contractNumber: 'HD-2025-003',
    title: 'Hợp đồng tư vấn thiết kế',
    type: 'service',
    parties: [
      { name: 'Công ty ABC', role: 'client' },
      { name: 'Công ty Kiến trúc Design Pro', role: 'consultant' },
    ],
    value: 200000000,
    currency: 'VND',
    status: 'completed',
    startDate: '2025-07-01T00:00:00Z',
    endDate: '2025-09-30T00:00:00Z',
    signedDate: '2025-06-25T00:00:00Z',
    projectId: 'proj_1',
    description: 'Tư vấn và thiết kế kiến trúc dự án',
  },
  {
    id: 'contract_4',
    contractNumber: 'HD-2025-004',
    title: 'Hợp đồng thuê thiết bị xây dựng',
    type: 'lease',
    parties: [
      { name: 'Công ty XYZ Construction', role: 'client' },
      { name: 'Công ty Cho thuê Thiết bị ABC', role: 'supplier' },
    ],
    value: 180000000,
    currency: 'VND',
    status: 'active',
    startDate: '2025-11-01T00:00:00Z',
    endDate: '2026-02-28T00:00:00Z',
    projectId: 'proj_1',
    description: 'Thuê cẩu tháp và xe nâng',
  },
];

// === ANALYTICS MOCK DATA ===

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

export const MOCK_ANALYTICS_SUMMARY: MockAnalyticsSummary = {
  totalProjects: 15,
  activeProjects: 8,
  completedProjects: 5,
  totalRevenue: 25000000000,
  totalExpenses: 18500000000,
  profit: 6500000000,
  profitMargin: 26,
};

export const MOCK_ANALYTICS_REVENUE_BY_MONTH: MockAnalyticsChart[] = [
  { label: 'T1', value: 1500000000, color: '#4CAF50' },
  { label: 'T2', value: 1800000000, color: '#4CAF50' },
  { label: 'T3', value: 2100000000, color: '#4CAF50' },
  { label: 'T4', value: 1900000000, color: '#4CAF50' },
  { label: 'T5', value: 2300000000, color: '#4CAF50' },
  { label: 'T6', value: 2500000000, color: '#4CAF50' },
  { label: 'T7', value: 2200000000, color: '#4CAF50' },
  { label: 'T8', value: 2400000000, color: '#4CAF50' },
  { label: 'T9', value: 2100000000, color: '#4CAF50' },
  { label: 'T10', value: 2300000000, color: '#4CAF50' },
  { label: 'T11', value: 2000000000, color: '#4CAF50' },
  { label: 'T12', value: 1900000000, color: '#4CAF50' },
];

export const MOCK_ANALYTICS_PROJECT_STATUS: MockAnalyticsChart[] = [
  { label: 'Đang thực hiện', value: 8, percentage: 53.3, color: '#2196F3' },
  { label: 'Hoàn thành', value: 5, percentage: 33.3, color: '#4CAF50' },
  { label: 'Tạm dừng', value: 1, percentage: 6.7, color: '#FFC107' },
  { label: 'Hủy bỏ', value: 1, percentage: 6.7, color: '#F44336' },
];

export const MOCK_ANALYTICS_EXPENSE_BY_CATEGORY: MockAnalyticsChart[] = [
  { label: 'Vật liệu', value: 8000000000, percentage: 43.2, color: '#FF5722' },
  { label: 'Nhân công', value: 5500000000, percentage: 29.7, color: '#2196F3' },
  { label: 'Thiết bị', value: 3000000000, percentage: 16.2, color: '#4CAF50' },
  { label: 'Quản lý', value: 1200000000, percentage: 6.5, color: '#9C27B0' },
  { label: 'Khác', value: 800000000, percentage: 4.4, color: '#607D8B' },
];

// === HELPER FUNCTIONS ===

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
    draft: '#9E9E9E',
    pending_approval: '#FFC107',
    active: '#4CAF50',
    completed: '#2196F3',
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
