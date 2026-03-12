/**
 * Procurement & Vendor Management Types
 * Purchase orders, vendor management, and procurement workflow
 */

// Purchase request status
export enum PurchaseRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Purchase order status
export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

// Vendor status
export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED',
}

// Vendor category
export enum VendorCategory {
  MATERIALS = 'MATERIALS',
  EQUIPMENT = 'EQUIPMENT',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  SERVICES = 'SERVICES',
  CONSULTING = 'CONSULTING',
  RENTAL = 'RENTAL',
  OTHER = 'OTHER',
}

// Quotation status
export enum QuotationStatus {
  REQUESTED = 'REQUESTED',
  RECEIVED = 'RECEIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// Payment terms
export enum PaymentTerms {
  NET_30 = 'NET_30', // 30 days
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  IMMEDIATE = 'IMMEDIATE',
  COD = 'COD', // Cash on delivery
  ADVANCE_50 = 'ADVANCE_50', // 50% advance
  MILESTONE = 'MILESTONE',
  CUSTOM = 'CUSTOM',
}

// Delivery terms
export enum DeliveryTerms {
  EXW = 'EXW', // Ex Works
  FOB = 'FOB', // Free on Board
  CIF = 'CIF', // Cost, Insurance, Freight
  DDP = 'DDP', // Delivered Duty Paid
  CUSTOM = 'CUSTOM',
}

// Purchase request
export interface PurchaseRequest {
  id: string;
  requestNumber: string; // e.g., "PR-2024-001"
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  category: VendorCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: PurchaseRequestStatus;
  items: PurchaseRequestItem[];
  totalAmount: number;
  currency: string;
  requestedBy: string;
  requestedByName: string;
  requestedDate: string;
  requiredDate: string;
  department?: string;
  budgetCode?: string;
  justification?: string;
  approvers: ApprovalFlow[];
  currentApprover?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  attachments?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Purchase request item
export interface PurchaseRequestItem {
  id: string;
  itemName: string;
  description?: string;
  specification?: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotal: number;
  category?: string;
  notes?: string;
}

// Approval flow
export interface ApprovalFlow {
  level: number;
  approverId: string;
  approverName: string;
  approverEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  approvedAt?: string;
  comments?: string;
}

// Vendor
export interface Vendor {
  id: string;
  vendorCode: string; // e.g., "VEN-001"
  name: string;
  legalName: string;
  category: VendorCategory;
  status: VendorStatus;
  contactPerson: {
    name: string;
    title: string;
    phone: string;
    email: string;
    mobile?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  businessLicense?: string;
  registrationNumber?: string;
  website?: string;
  phone: string;
  email: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode?: string;
    iban?: string;
  };
  paymentTerms: PaymentTerms;
  creditLimit?: number;
  rating: number; // 1-5
  certifications?: string[];
  products?: string[]; // Products/services offered
  leadTime?: number; // days
  minimumOrderValue?: number;
  deliveryTerms?: DeliveryTerms;
  notes?: string;
  contracts?: VendorContract[];
  performanceMetrics?: VendorPerformance;
  documents?: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  lastOrderDate?: string;
  totalOrders?: number;
  totalValue?: number;
}

// Vendor contract
export interface VendorContract {
  id: string;
  contractNumber: string;
  title: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  documentUrl?: string;
}

// Vendor performance
export interface VendorPerformance {
  onTimeDeliveryRate: number; // percentage
  qualityRating: number; // 1-5
  responsiveness: number; // 1-5
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalValue: number;
  averageDeliveryTime: number; // days
  lastEvaluationDate?: string;
}

// Quotation request
export interface QuotationRequest {
  id: string;
  requestNumber: string; // e.g., "RFQ-2024-001"
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  items: QuotationItem[];
  vendors: string[]; // Vendor IDs
  requiredDate: string;
  deliveryDate: string;
  deliveryLocation: string;
  paymentTerms?: PaymentTerms;
  deliveryTerms?: DeliveryTerms;
  status: QuotationStatus;
  quotations: Quotation[];
  requestedBy: string;
  requestedByName: string;
  requestedDate: string;
  expiryDate: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// Quotation item
export interface QuotationItem {
  id: string;
  itemName: string;
  description?: string;
  specification?: string;
  quantity: number;
  unit: string;
  notes?: string;
}

// Quotation
export interface Quotation {
  id: string;
  quotationNumber: string;
  vendorId: string;
  vendorName: string;
  items: QuotationItemPrice[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount?: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  total: number;
  currency: string;
  validUntil: string;
  deliveryTime: number; // days
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  warranty?: string;
  notes?: string;
  attachments?: string[];
  submittedAt: string;
  status: QuotationStatus;
  isSelected: boolean;
  evaluationScore?: number;
  evaluationNotes?: string;
}

// Quotation item price
export interface QuotationItemPrice {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  leadTime?: number; // days
  notes?: string;
}

// Purchase order
export interface PurchaseOrder {
  id: string;
  orderNumber: string; // e.g., "PO-2024-001"
  purchaseRequestId?: string;
  quotationId?: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  vendorContact: {
    name: string;
    phone: string;
    email: string;
  };
  status: PurchaseOrderStatus;
  orderDate: string;
  requiredDate: string;
  deliveryDate?: string;
  deliveryLocation: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount?: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  shippingCost?: number;
  total: number;
  currency: string;
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  internalNotes?: string;
  attachments?: string[];
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  sentDate?: string;
  confirmedDate?: string;
  receivedDate?: string;
  receipts: GoodsReceipt[];
  invoices: Invoice[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// Purchase order item
export interface PurchaseOrderItem {
  id: string;
  itemName: string;
  description?: string;
  specification?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  receivedQuantity: number;
  remainingQuantity: number;
  taxRate?: number;
  notes?: string;
}

// Goods receipt
export interface GoodsReceipt {
  id: string;
  receiptNumber: string; // e.g., "GR-2024-001"
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  items: GoodsReceiptItem[];
  receivedDate: string;
  receivedBy: string;
  receivedByName: string;
  inspectedBy?: string;
  inspectedByName?: string;
  inspectionStatus: 'PASSED' | 'FAILED' | 'PARTIAL' | 'PENDING';
  inspectionNotes?: string;
  storageLocation?: string;
  notes?: string;
  photos?: string[];
  createdAt: string;
}

// Goods receipt item
export interface GoodsReceiptItem {
  purchaseOrderItemId: string;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  condition: 'GOOD' | 'DAMAGED' | 'MISSING';
  notes?: string;
}

// Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  vendorId: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'OVERDUE' | 'DISPUTED';
  paidDate?: string;
  paidAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  attachments?: string[];
  notes?: string;
  createdAt: string;
}

// Vendor evaluation
export interface VendorEvaluation {
  id: string;
  vendorId: string;
  vendorName: string;
  projectId?: string;
  purchaseOrderId?: string;
  evaluatedBy: string;
  evaluatedByName: string;
  evaluationDate: string;
  period: {
    startDate: string;
    endDate: string;
  };
  criteria: EvaluationCriteria[];
  overallScore: number;
  rating: number; // 1-5
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  wouldRecommend: boolean;
  createdAt: string;
}

// Evaluation criteria
export interface EvaluationCriteria {
  criterion: string;
  weight: number; // percentage
  score: number; // 1-5
  comments?: string;
}

// API request/response types
export interface CreatePurchaseRequestParams {
  projectId: string;
  title: string;
  description: string;
  category: VendorCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  items: Omit<PurchaseRequestItem, 'id'>[];
  requiredDate: string;
  department?: string;
  budgetCode?: string;
  justification?: string;
  approvers?: string[];
}

export interface UpdatePurchaseRequestParams {
  id: string;
  title?: string;
  description?: string;
  category?: VendorCategory;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  items?: Omit<PurchaseRequestItem, 'id'>[];
  requiredDate?: string;
  notes?: string;
}

export interface CreateVendorParams {
  name: string;
  legalName: string;
  category: VendorCategory;
  contactPerson: Vendor['contactPerson'];
  address: Vendor['address'];
  phone: string;
  email: string;
  taxId?: string;
  businessLicense?: string;
  paymentTerms: PaymentTerms;
  bankDetails?: Vendor['bankDetails'];
}

export interface UpdateVendorParams {
  id: string;
  name?: string;
  legalName?: string;
  category?: VendorCategory;
  status?: VendorStatus;
  contactPerson?: Vendor['contactPerson'];
  address?: Vendor['address'];
  phone?: string;
  email?: string;
  paymentTerms?: PaymentTerms;
  rating?: number;
  notes?: string;
}

export interface CreateQuotationRequestParams {
  projectId: string;
  title: string;
  description: string;
  items: Omit<QuotationItem, 'id'>[];
  vendors: string[];
  requiredDate: string;
  deliveryDate: string;
  deliveryLocation: string;
  expiryDate: string;
}

export interface SubmitQuotationParams {
  quotationRequestId: string;
  vendorId: string;
  items: Omit<QuotationItemPrice, 'itemName'>[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount?: number;
  total: number;
  currency: string;
  validUntil: string;
  deliveryTime: number;
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  warranty?: string;
  notes?: string;
}

export interface CreatePurchaseOrderParams {
  purchaseRequestId?: string;
  quotationId?: string;
  projectId: string;
  vendorId: string;
  items: Omit<PurchaseOrderItem, 'id' | 'receivedQuantity' | 'remainingQuantity'>[];
  requiredDate: string;
  deliveryLocation: string;
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  notes?: string;
}

export interface UpdatePurchaseOrderParams {
  id: string;
  status?: PurchaseOrderStatus;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface CreateGoodsReceiptParams {
  purchaseOrderId: string;
  items: Omit<GoodsReceiptItem, 'itemName' | 'orderedQuantity' | 'unit'>[];
  receivedDate: string;
  inspectionStatus: 'PASSED' | 'FAILED' | 'PARTIAL' | 'PENDING';
  inspectionNotes?: string;
  storageLocation?: string;
  notes?: string;
}

export interface GetPurchaseRequestsParams {
  projectId?: string;
  status?: PurchaseRequestStatus;
  category?: VendorCategory;
  fromDate?: string;
  toDate?: string;
}

export interface GetVendorsParams {
  category?: VendorCategory;
  status?: VendorStatus;
  rating?: number;
}

export interface GetPurchaseOrdersParams {
  projectId?: string;
  vendorId?: string;
  status?: PurchaseOrderStatus;
  fromDate?: string;
  toDate?: string;
}
