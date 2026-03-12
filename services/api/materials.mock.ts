/**
 * Materials Management Service - Mock Data
 * Mock data for materials management until backend ready
 */

export type MaterialCategory = 'concrete' | 'steel' | 'brick' | 'wood' | 'electrical' | 'plumbing' | 'finishing' | 'other';
export type MaterialUnit = 'kg' | 'tấn' | 'viên' | 'm3' | 'm2' | 'm' | 'cái' | 'bộ' | 'cuộn' | 'thùng';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered' | 'cancelled';
export type TransactionType = 'in' | 'out' | 'adjust';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier?: string;
  location?: string;
  lastUpdated: string;
  description?: string;
}

export interface MaterialRequest {
  id: string;
  projectId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: MaterialUnit;
  requestedBy: string;
  requestedAt: string;
  status: RequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  deliveryDate?: string;
  notes?: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  materialName: string;
  type: TransactionType;
  quantity: number;
  unit: MaterialUnit;
  fromLocation?: string;
  toLocation?: string;
  projectId?: string;
  reference?: string; // Request ID, delivery note, etc
  performedBy: string;
  performedAt: string;
  notes?: string;
  beforeStock: number;
  afterStock: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address: string;
  materials: MaterialCategory[];
  rating: number; // 1-5
  lastDelivery?: string;
}

// Mock data
export const MOCK_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    name: 'Bê tông M250',
    category: 'concrete',
    unit: 'm3',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unitPrice: 1850000,
    supplier: 'Công ty Xi măng Hoàng Thạch',
    location: 'Kho A - Khu vực 1',
    lastUpdated: new Date().toISOString(),
    description: 'Bê tông nhãn 250 dùng cho móng và cột',
  },
  {
    id: 'mat-2',
    name: 'Thép D16',
    category: 'steel',
    unit: 'kg',
    currentStock: 1250,
    minStock: 500,
    maxStock: 3000,
    unitPrice: 16500,
    supplier: 'Thép Việt Đức',
    location: 'Kho B - Khu vực 2',
    lastUpdated: new Date().toISOString(),
    description: 'Thép phi 16 dùng cho cốt thép cột và dầm',
  },
  {
    id: 'mat-3',
    name: 'Gạch Block 10x20x40',
    category: 'brick',
    unit: 'viên',
    currentStock: 8500,
    minStock: 3000,
    maxStock: 15000,
    unitPrice: 3200,
    supplier: 'Gạch Đồng Tâm',
    location: 'Kho C - Khu vực 3',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mat-4',
    name: 'Xi măng PCB40',
    category: 'concrete',
    unit: 'kg',
    currentStock: 2800,
    minStock: 1000,
    maxStock: 5000,
    unitPrice: 1850,
    supplier: 'Công ty Xi măng Hoàng Thạch',
    location: 'Kho A - Khu vực 1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mat-5',
    name: 'Ván khuôn',
    category: 'wood',
    unit: 'm2',
    currentStock: 180,
    minStock: 100,
    maxStock: 300,
    unitPrice: 65000,
    supplier: 'Go Sài Gòn',
    location: 'Kho D - Khu vực 4',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mat-6',
    name: 'Dây điện 2x2.5',
    category: 'electrical',
    unit: 'cuộn',
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unitPrice: 850000,
    supplier: 'Điện Cadivi',
    location: 'Kho E - Khu vực 5',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mat-7',
    name: 'Ống nước UPVC D90',
    category: 'plumbing',
    unit: 'cái',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unitPrice: 125000,
    supplier: 'Nhựa Tiền Phong',
    location: 'Kho F - Khu vực 6',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mat-8',
    name: 'Sơn ngoại thất',
    category: 'finishing',
    unit: 'thùng',
    currentStock: 12,
    minStock: 5,
    maxStock: 30,
    unitPrice: 1250000,
    supplier: 'Sơn Jotun',
    location: 'Kho G - Khu vực 7',
    lastUpdated: new Date().toISOString(),
  },
];

export const MOCK_REQUESTS: MaterialRequest[] = [
  {
    id: 'req-1',
    projectId: 'project-1',
    materialId: 'mat-1',
    materialName: 'Bê tông M250',
    quantity: 30,
    unit: 'm3',
    requestedBy: 'Nguyễn Văn A',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    approvedBy: 'Trần Thị B',
    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Dùng cho đổ bê tông tầng 3',
    urgency: 'high',
  },
  {
    id: 'req-2',
    projectId: 'project-1',
    materialId: 'mat-2',
    materialName: 'Thép D16',
    quantity: 500,
    unit: 'kg',
    requestedBy: 'Lê Văn C',
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    notes: 'Cần gấp cho cột tầng 2',
    urgency: 'medium',
  },
  {
    id: 'req-3',
    projectId: 'project-1',
    materialId: 'mat-3',
    materialName: 'Gạch Block 10x20x40',
    quantity: 2000,
    unit: 'viên',
    requestedBy: 'Phạm Văn D',
    requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    approvedBy: 'Trần Thị B',
    approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: 'low',
  },
];

export const MOCK_TRANSACTIONS: MaterialTransaction[] = [
  {
    id: 'trans-1',
    materialId: 'mat-1',
    materialName: 'Bê tông M250',
    type: 'in',
    quantity: 50,
    unit: 'm3',
    toLocation: 'Kho A - Khu vực 1',
    reference: 'PO-2024-001',
    performedBy: 'Nguyễn Văn A',
    performedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Nhập từ nhà cung cấp',
    beforeStock: 0,
    afterStock: 50,
  },
  {
    id: 'trans-2',
    materialId: 'mat-1',
    materialName: 'Bê tông M250',
    type: 'out',
    quantity: 5,
    unit: 'm3',
    fromLocation: 'Kho A - Khu vực 1',
    projectId: 'project-1',
    reference: 'req-1',
    performedBy: 'Lê Văn C',
    performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Xuất cho tầng 3',
    beforeStock: 50,
    afterStock: 45,
  },
  {
    id: 'trans-3',
    materialId: 'mat-2',
    materialName: 'Thép D16',
    type: 'in',
    quantity: 1500,
    unit: 'kg',
    toLocation: 'Kho B - Khu vực 2',
    reference: 'PO-2024-002',
    performedBy: 'Nguyễn Văn A',
    performedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    beforeStock: 0,
    afterStock: 1500,
  },
  {
    id: 'trans-4',
    materialId: 'mat-2',
    materialName: 'Thép D16',
    type: 'out',
    quantity: 250,
    unit: 'kg',
    fromLocation: 'Kho B - Khu vực 2',
    projectId: 'project-1',
    performedBy: 'Phạm Văn D',
    performedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Xuất cho cột tầng 2',
    beforeStock: 1500,
    afterStock: 1250,
  },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Công ty Xi măng Hoàng Thạch',
    contact: 'Nguyễn Văn X',
    phone: '0901234567',
    email: 'contact@hoangthach.com',
    address: 'KCN Sóng Thần, Bình Dương',
    materials: ['concrete'],
    rating: 4.5,
    lastDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sup-2',
    name: 'Thép Việt Đức',
    contact: 'Trần Thị Y',
    phone: '0907654321',
    email: 'sales@vietduc.com',
    address: 'Quận 9, TP.HCM',
    materials: ['steel'],
    rating: 4.8,
    lastDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sup-3',
    name: 'Gạch Đồng Tâm',
    contact: 'Lê Văn Z',
    phone: '0912345678',
    address: 'Bình Dương',
    materials: ['brick'],
    rating: 4.2,
  },
];

// Mock API Service
export class MaterialsService {
  private static materials = [...MOCK_MATERIALS];
  private static requests = [...MOCK_REQUESTS];
  private static transactions = [...MOCK_TRANSACTIONS];
  private static suppliers = [...MOCK_SUPPLIERS];

  // Materials
  static async getMaterials(filters?: {
    category?: MaterialCategory;
    lowStock?: boolean;
    search?: string;
  }): Promise<Material[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.materials;

    if (filters?.category) {
      filtered = filtered.filter(m => m.category === filters.category);
    }

    if (filters?.lowStock) {
      filtered = filtered.filter(m => m.currentStock <= m.minStock);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  static async getMaterial(id: string): Promise<Material | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.materials.find(m => m.id === id) || null;
  }

  static async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.materials.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Material not found');

    this.materials[index] = {
      ...this.materials[index],
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    return this.materials[index];
  }

  // Requests
  static async getRequests(projectId: string, filters?: {
    status?: RequestStatus;
  }): Promise<MaterialRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.requests.filter(r => r.projectId === projectId);

    if (filters?.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    return filtered.sort((a, b) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  static async createRequest(data: Omit<MaterialRequest, 'id' | 'requestedAt'>): Promise<MaterialRequest> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newRequest: MaterialRequest = {
      ...data,
      id: `req-${Date.now()}`,
      requestedAt: new Date().toISOString(),
    };

    this.requests.unshift(newRequest);
    return newRequest;
  }

  static async updateRequest(id: string, data: Partial<MaterialRequest>): Promise<MaterialRequest> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    this.requests[index] = {
      ...this.requests[index],
      ...data,
    };

    return this.requests[index];
  }

  // Transactions
  static async getTransactions(materialId?: string, limit = 50): Promise<MaterialTransaction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.transactions;

    if (materialId) {
      filtered = filtered.filter(t => t.materialId === materialId);
    }

    return filtered
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
      .slice(0, limit);
  }

  static async createTransaction(data: Omit<MaterialTransaction, 'id' | 'performedAt'>): Promise<MaterialTransaction> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newTransaction: MaterialTransaction = {
      ...data,
      id: `trans-${Date.now()}`,
      performedAt: new Date().toISOString(),
    };

    this.transactions.unshift(newTransaction);

    // Update material stock
    const materialIndex = this.materials.findIndex(m => m.id === data.materialId);
    if (materialIndex !== -1) {
      this.materials[materialIndex].currentStock = data.afterStock;
      this.materials[materialIndex].lastUpdated = new Date().toISOString();
    }

    return newTransaction;
  }

  // Suppliers
  static async getSuppliers(): Promise<Supplier[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.suppliers;
  }

  // Stats
  static async getStats(): Promise<{
    totalValue: number;
    lowStockCount: number;
    pendingRequests: number;
    recentTransactions: number;
    categoryBreakdown: Record<MaterialCategory, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const totalValue = this.materials.reduce(
      (sum, m) => sum + m.currentStock * m.unitPrice,
      0
    );

    const lowStockCount = this.materials.filter(
      m => m.currentStock <= m.minStock
    ).length;

    const pendingRequests = this.requests.filter(
      r => r.status === 'pending'
    ).length;

    const recentTransactions = this.transactions.filter(
      t => new Date(t.performedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;

    const categoryBreakdown = this.materials.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<MaterialCategory, number>);

    return {
      totalValue,
      lowStockCount,
      pendingRequests,
      recentTransactions,
      categoryBreakdown,
    };
  }
}
