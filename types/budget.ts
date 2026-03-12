// Budget & Cost Management Types

export enum BudgetCategory {
  LABOR = 'LABOR',
  MATERIALS = 'MATERIALS',
  EQUIPMENT = 'EQUIPMENT',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  PERMITS = 'PERMITS',
  UTILITIES = 'UTILITIES',
  INSURANCE = 'INSURANCE',
  OVERHEAD = 'OVERHEAD',
  CONTINGENCY = 'CONTINGENCY',
  OTHER = 'OTHER',
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
}

export interface Budget {
  id: string;
  projectId: string;
  name: string;
  description: string;
  category: BudgetCategory;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  approvedBy?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostEstimate {
  id: string;
  projectId: string;
  phaseId?: string;
  name: string;
  description: string;
  category: BudgetCategory;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  markupPercentage: number;
  finalPrice: number;
  vendor?: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  projectId: string;
  budgetId?: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  date: Date;
  status: ExpenseStatus;
  paymentMethod: PaymentMethod;
  vendor?: string;
  receiptUrl?: string;
  notes: string;
  submittedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  sentAt?: Date;
  viewedAt?: Date;
  paidAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  reference: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  percentageUsed: number;
  byCategory: Record<BudgetCategory, {
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
  overBudgetCategories: string[];
  nearLimitCategories: string[];
}

export interface CostReport {
  projectId: string;
  periodStart: Date;
  periodEnd: Date;
  totalEstimated: number;
  totalActual: number;
  variance: number;
  variancePercentage: number;
  byCategory: Record<BudgetCategory, {
    estimated: number;
    actual: number;
    variance: number;
  }>;
  topExpenses: Expense[];
  recentExpenses: Expense[];
}

export interface CashFlowProjection {
  month: string;
  expectedIncome: number;
  expectedExpenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

// Request Types

export interface CreateBudgetRequest {
  projectId: string;
  name: string;
  description?: string;
  category: BudgetCategory;
  allocatedAmount: number;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export interface UpdateBudgetRequest {
  name?: string;
  description?: string;
  allocatedAmount?: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

export interface CreateCostEstimateRequest {
  projectId: string;
  phaseId?: string;
  name: string;
  description?: string;
  category: BudgetCategory;
  quantity: number;
  unit: string;
  unitPrice: number;
  markupPercentage?: number;
  vendor?: string;
  notes?: string;
}

export interface UpdateCostEstimateRequest {
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  markupPercentage?: number;
  vendor?: string;
  notes?: string;
}

export interface CreateExpenseRequest {
  projectId: string;
  budgetId?: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  date: Date;
  paymentMethod: PaymentMethod;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  category?: BudgetCategory;
  description?: string;
  amount?: number;
  date?: Date;
  paymentMethod?: PaymentMethod;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface ApproveExpenseRequest {
  expenseId: string;
  notes?: string;
}

export interface RejectExpenseRequest {
  expenseId: string;
  reason: string;
}

export interface CreateInvoiceRequest {
  projectId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  total?: number;
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceRequest {
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  issueDate?: Date;
  dueDate?: Date;
  items?: InvoiceItem[];
  taxRate?: number;
  discount?: number;
  notes?: string;
  terms?: string;
}

export interface RecordPaymentRequest {
  invoiceId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  reference: string;
  notes?: string;
}
