// Material & Inventory Management Types

export enum MaterialCategory {
  CEMENT = 'CEMENT',
  STEEL = 'STEEL',
  SAND = 'SAND',
  GRAVEL = 'GRAVEL',
  BRICK = 'BRICK',
  TILE = 'TILE',
  PAINT = 'PAINT',
  WOOD = 'WOOD',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  TOOLS = 'TOOLS',
  SAFETY_EQUIPMENT = 'SAFETY_EQUIPMENT',
  OTHER = 'OTHER',
}

export enum MaterialUnit {
  KG = 'KG',
  TON = 'TON',
  M = 'M',
  M2 = 'M2',
  M3 = 'M3',
  PIECE = 'PIECE',
  BOX = 'BOX',
  BAG = 'BAG',
  LITER = 'LITER',
  SET = 'SET',
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ORDERED = 'ORDERED',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  USAGE = 'USAGE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

// Core Interfaces

export interface Material {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  totalValue: number;
  supplierId?: string;
  supplier?: Supplier;
  warehouseLocation?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  projectId?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialOrder {
  id: string;
  projectId: string;
  orderNumber: string;
  orderNo: string;
  supplierId: string;
  supplier?: Supplier;
  status: OrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  items: MaterialOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  notes?: string;
  orderedBy: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialOrderItem {
  id: string;
  materialId: string;
  material?: Material;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  amount: number;
}

export interface StockTransaction {
  id: string;
  projectId: string;
  materialId: string;
  material?: Material;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  date: string;
  orderId?: string;
  order?: MaterialOrder;
  phaseId?: string;
  usedBy?: {
    id: string;
    name: string;
  };
  notes?: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  byCategory: {
    [key in MaterialCategory]?: {
      itemCount: number;
      totalValue: number;
      stockStatus: StockStatus;
    };
  };
}

export interface StockAlert {
  id: string;
  materialId: string;
  material: Material;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'OVERSTOCK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  createdAt: string;
}

export interface StockMovement {
  date: string;
  purchases: number;
  usage: number;
  returns: number;
  adjustments: number;
  closingStock: number;
}

// Request Types

export interface CreateMaterialRequest {
  projectId: string;
  name: string;
  description?: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  supplierId?: string;
  warehouseLocation?: string;
}

export interface UpdateMaterialRequest {
  name?: string;
  description?: string;
  category?: MaterialCategory;
  unit?: MaterialUnit;
  minStock?: number;
  maxStock?: number;
  unitPrice?: number;
  supplierId?: string;
  warehouseLocation?: string;
}

export interface CreateSupplierRequest {
  projectId?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
}

export interface CreateMaterialOrderRequest {
  projectId: string;
  supplierId: string;
  orderDate: string;
  deliveryDate: string;
  expectedDeliveryDate: string;
  items: {
    materialId: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal?: number;
  taxRate: number;
  taxAmount?: number;
  shippingCost: number;
  notes?: string;
}

export interface UpdateMaterialOrderRequest {
  supplierId?: string;
  expectedDeliveryDate?: string;
  items?: {
    materialId: string;
    quantity: number;
    unitPrice: number;
  }[];
  taxRate?: number;
  shippingCost?: number;
  notes?: string;
}

export interface ReceiveMaterialRequest {
  orderId: string;
  items: {
    materialId: string;
    receivedQuantity: number;
  }[];
  actualDeliveryDate: string;
  notes?: string;
}

export interface RecordStockTransactionRequest {
  projectId: string;
  materialId: string;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  date: string;
  orderId?: string;
  phaseId?: string;
  notes?: string;
}

export interface AdjustStockRequest {
  materialId: string;
  newQuantity: number;
  reason: string;
}

export interface TransferStockRequest {
  fromProjectId: string;
  toProjectId: string;
  materialId: string;
  quantity: number;
  notes?: string;
}
