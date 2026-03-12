/**
 * Equipment Tracking Service - Mock Data
 * Mock data for equipment management until backend ready
 */

export type EquipmentCategory = 'heavy' | 'power' | 'lifting' | 'concrete' | 'welding' | 'measuring' | 'safety' | 'other';
export type EquipmentStatus = 'available' | 'in-use' | 'maintenance' | 'broken' | 'reserved';
export type MaintenanceType = 'routine' | 'repair' | 'inspection' | 'calibration';
export type BookingStatus = 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  model?: string;
  serialNumber?: string;
  status: EquipmentStatus;
  purchaseDate?: string;
  warranty?: string;
  location?: string;
  assignedTo?: string;
  currentProject?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  lastMaintenance?: string;
  nextMaintenance?: string;
  totalHours?: number;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: MaintenanceType;
  description: string;
  performedBy: string;
  performedAt: string;
  cost?: number;
  parts?: string[];
  nextDue?: string;
  notes?: string;
  attachments?: string[];
}

export interface EquipmentBooking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  projectId: string;
  projectName: string;
  bookedBy: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  purpose?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface UsageLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  projectId?: string;
  operator: string;
  startTime: string;
  endTime?: string;
  hours: number;
  fuelUsed?: number;
  location?: string;
  notes?: string;
}

// Mock data
export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1',
    name: 'Máy trộn bê tông 500L',
    category: 'concrete',
    model: 'CM-500',
    serialNumber: 'CM500-2023-001',
    status: 'in-use',
    purchaseDate: '2023-01-15',
    warranty: '2025-01-15',
    location: 'Công trình A',
    assignedTo: 'Nguyễn Văn A',
    currentProject: 'project-1',
    condition: 'good',
    lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    totalHours: 1250,
    notes: 'Hoạt động tốt, cần kiểm tra dây đai',
  },
  {
    id: 'eq-2',
    name: 'Cần trục tháp QTZ63',
    category: 'lifting',
    model: 'QTZ63',
    serialNumber: 'QTZ-2022-005',
    status: 'in-use',
    purchaseDate: '2022-06-20',
    warranty: '2024-06-20',
    location: 'Công trình A',
    currentProject: 'project-1',
    condition: 'excellent',
    lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    totalHours: 3420,
  },
  {
    id: 'eq-3',
    name: 'Máy hàn que 250A',
    category: 'welding',
    model: 'WD-250',
    serialNumber: 'WD250-2023-012',
    status: 'available',
    purchaseDate: '2023-03-10',
    location: 'Kho thiết bị',
    condition: 'excellent',
    lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000).toISOString(),
    totalHours: 820,
  },
  {
    id: 'eq-4',
    name: 'Máy đào Komatsu PC200',
    category: 'heavy',
    model: 'PC200-8',
    serialNumber: 'PC200-2021-008',
    status: 'maintenance',
    purchaseDate: '2021-09-05',
    location: 'Xưởng bảo trì',
    condition: 'fair',
    lastMaintenance: new Date().toISOString(),
    nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    totalHours: 5680,
    notes: 'Đang thay dầu và kiểm tra hệ thống thủy lực',
  },
  {
    id: 'eq-5',
    name: 'Máy bơm bê tông',
    category: 'concrete',
    model: 'BP-3000',
    serialNumber: 'BP3000-2022-003',
    status: 'reserved',
    purchaseDate: '2022-11-20',
    location: 'Kho thiết bị',
    condition: 'good',
    lastMaintenance: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
    totalHours: 1850,
  },
  {
    id: 'eq-6',
    name: 'Máy cắt sắt GQ50',
    category: 'power',
    model: 'GQ50',
    serialNumber: 'GQ50-2023-015',
    status: 'available',
    purchaseDate: '2023-02-15',
    location: 'Kho thiết bị',
    condition: 'excellent',
    totalHours: 450,
  },
  {
    id: 'eq-7',
    name: 'Máy thủy bình Leica',
    category: 'measuring',
    model: 'Leica NA730',
    serialNumber: 'NA730-2023-001',
    status: 'in-use',
    purchaseDate: '2023-04-10',
    location: 'Công trình A',
    assignedTo: 'Trần Văn B',
    currentProject: 'project-1',
    condition: 'excellent',
    lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    totalHours: 320,
  },
];

export const MOCK_MAINTENANCE_RECORDS: MaintenanceRecord[] = [
  {
    id: 'maint-1',
    equipmentId: 'eq-1',
    equipmentName: 'Máy trộn bê tông 500L',
    type: 'routine',
    description: 'Bảo dưỡng định kỳ: thay dầu, kiểm tra dây đai',
    performedBy: 'Lê Văn C',
    performedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 2500000,
    parts: ['Dầu động cơ', 'Lọc dầu', 'Dây đai'],
    nextDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'maint-2',
    equipmentId: 'eq-2',
    equipmentName: 'Cần trục tháp QTZ63',
    type: 'inspection',
    description: 'Kiểm tra an toàn định kỳ',
    performedBy: 'Phạm Văn D',
    performedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 5000000,
    nextDue: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Tất cả các hệ thống hoạt động bình thường',
  },
  {
    id: 'maint-3',
    equipmentId: 'eq-4',
    equipmentName: 'Máy đào Komatsu PC200',
    type: 'repair',
    description: 'Sửa chữa hệ thống thủy lực',
    performedBy: 'Nguyễn Văn E',
    performedAt: new Date().toISOString(),
    cost: 15000000,
    parts: ['Piston thủy lực', 'Dầu thủy lực', 'Ống dẫn'],
    notes: 'Phát hiện rò rỉ dầu, đã thay thế piston',
  },
];

export const MOCK_BOOKINGS: EquipmentBooking[] = [
  {
    id: 'book-1',
    equipmentId: 'eq-5',
    equipmentName: 'Máy bơm bê tông',
    projectId: 'project-1',
    projectName: 'Dự án A',
    bookedBy: 'Nguyễn Văn A',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    purpose: 'Đổ bê tông tầng 3',
    approvedBy: 'Trần Thị B',
    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'book-2',
    equipmentId: 'eq-3',
    equipmentName: 'Máy hàn que 250A',
    projectId: 'project-2',
    projectName: 'Dự án B',
    bookedBy: 'Lê Văn C',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    purpose: 'Hàn kết cấu thép',
  },
];

export const MOCK_USAGE_LOGS: UsageLog[] = [
  {
    id: 'log-1',
    equipmentId: 'eq-1',
    equipmentName: 'Máy trộn bê tông 500L',
    projectId: 'project-1',
    operator: 'Nguyễn Văn A',
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    endTime: new Date().toISOString(),
    hours: 4,
    location: 'Công trình A - Tầng 3',
    notes: 'Trộn 15m3 bê tông',
  },
  {
    id: 'log-2',
    equipmentId: 'eq-2',
    equipmentName: 'Cần trục tháp QTZ63',
    projectId: 'project-1',
    operator: 'Trần Văn B',
    startTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    endTime: new Date().toISOString(),
    hours: 8,
    location: 'Công trình A',
    notes: 'Nâng vật liệu lên tầng cao',
  },
];

// Mock API Service
export class EquipmentService {
  private static equipment = [...MOCK_EQUIPMENT];
  private static maintenanceRecords = [...MOCK_MAINTENANCE_RECORDS];
  private static bookings = [...MOCK_BOOKINGS];
  private static usageLogs = [...MOCK_USAGE_LOGS];

  // Equipment
  static async getEquipment(filters?: {
    category?: EquipmentCategory;
    status?: EquipmentStatus;
    available?: boolean;
    search?: string;
  }): Promise<Equipment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.equipment;

    if (filters?.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }

    if (filters?.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    if (filters?.available) {
      filtered = filtered.filter(e => e.status === 'available');
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.model?.toLowerCase().includes(search) ||
        e.serialNumber?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  static async getEquipmentById(id: string): Promise<Equipment | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.equipment.find(e => e.id === id) || null;
  }

  static async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.equipment.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Equipment not found');

    this.equipment[index] = {
      ...this.equipment[index],
      ...data,
    };

    return this.equipment[index];
  }

  // Maintenance
  static async getMaintenanceRecords(equipmentId?: string): Promise<MaintenanceRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.maintenanceRecords;

    if (equipmentId) {
      filtered = filtered.filter(m => m.equipmentId === equipmentId);
    }

    return filtered.sort((a, b) => 
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }

  static async createMaintenanceRecord(
    data: Omit<MaintenanceRecord, 'id'>
  ): Promise<MaintenanceRecord> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newRecord: MaintenanceRecord = {
      ...data,
      id: `maint-${Date.now()}`,
    };

    this.maintenanceRecords.unshift(newRecord);

    // Update equipment
    const equipment = this.equipment.find(e => e.id === data.equipmentId);
    if (equipment) {
      equipment.lastMaintenance = data.performedAt;
      if (data.nextDue) {
        equipment.nextMaintenance = data.nextDue;
      }
    }

    return newRecord;
  }

  // Bookings
  static async getBookings(filters?: {
    equipmentId?: string;
    projectId?: string;
    status?: BookingStatus;
  }): Promise<EquipmentBooking[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.bookings;

    if (filters?.equipmentId) {
      filtered = filtered.filter(b => b.equipmentId === filters.equipmentId);
    }

    if (filters?.projectId) {
      filtered = filtered.filter(b => b.projectId === filters.projectId);
    }

    if (filters?.status) {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    return filtered.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  static async createBooking(
    data: Omit<EquipmentBooking, 'id'>
  ): Promise<EquipmentBooking> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newBooking: EquipmentBooking = {
      ...data,
      id: `book-${Date.now()}`,
    };

    this.bookings.unshift(newBooking);

    // Update equipment status
    if (data.status === 'approved') {
      const equipment = this.equipment.find(e => e.id === data.equipmentId);
      if (equipment) {
        equipment.status = 'reserved';
      }
    }

    return newBooking;
  }

  static async updateBooking(id: string, data: Partial<EquipmentBooking>): Promise<EquipmentBooking> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');

    this.bookings[index] = {
      ...this.bookings[index],
      ...data,
    };

    return this.bookings[index];
  }

  // Usage Logs
  static async getUsageLogs(equipmentId?: string, limit = 50): Promise<UsageLog[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.usageLogs;

    if (equipmentId) {
      filtered = filtered.filter(l => l.equipmentId === equipmentId);
    }

    return filtered
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  static async createUsageLog(data: Omit<UsageLog, 'id'>): Promise<UsageLog> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newLog: UsageLog = {
      ...data,
      id: `log-${Date.now()}`,
    };

    this.usageLogs.unshift(newLog);

    // Update equipment total hours
    const equipment = this.equipment.find(e => e.id === data.equipmentId);
    if (equipment) {
      equipment.totalHours = (equipment.totalHours || 0) + data.hours;
    }

    return newLog;
  }

  // Stats
  static async getStats(): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    needMaintenance: number;
    categoryBreakdown: Record<EquipmentCategory, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const total = this.equipment.length;
    const available = this.equipment.filter(e => e.status === 'available').length;
    const inUse = this.equipment.filter(e => e.status === 'in-use').length;
    const maintenance = this.equipment.filter(e => e.status === 'maintenance').length;

    const needMaintenance = this.equipment.filter(e => {
      if (!e.nextMaintenance) return false;
      const daysUntil = (new Date(e.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 7;
    }).length;

    const categoryBreakdown = this.equipment.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {} as Record<EquipmentCategory, number>);

    return {
      total,
      available,
      inUse,
      maintenance,
      needMaintenance,
      categoryBreakdown,
    };
  }
}
