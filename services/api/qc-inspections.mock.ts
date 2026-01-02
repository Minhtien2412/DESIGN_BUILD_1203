/**
 * QC/QA Inspection Service - Mock Data
 * Quality Control and Quality Assurance system
 */

export type InspectionStatus = 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
export type InspectionType = 'foundation' | 'structure' | 'electrical' | 'plumbing' | 'finishing' | 'safety' | 'final';
export type CheckItemStatus = 'pass' | 'fail' | 'na' | 'pending';
export type DefectSeverity = 'critical' | 'major' | 'minor';
export type DefectStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface ChecklistItem {
  id: string;
  description: string;
  category: string;
  status: CheckItemStatus;
  notes?: string;
  photos?: string[];
  required: boolean;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  type: InspectionType;
  description: string;
  checklistItems: Omit<ChecklistItem, 'status' | 'notes' | 'photos'>[];
  estimatedDuration: number; // minutes
}

export interface Inspection {
  id: string;
  projectId: string;
  templateId: string;
  templateName: string;
  type: InspectionType;
  title: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  status: InspectionStatus;
  inspector: string;
  location?: string;
  phase?: string;
  checklist: ChecklistItem[];
  overallResult?: 'pass' | 'fail';
  passRate?: number;
  defectsFound?: number;
  notes?: string;
  photos?: string[];
  signature?: string;
}

export interface Defect {
  id: string;
  projectId: string;
  inspectionId?: string;
  title: string;
  description: string;
  severity: DefectSeverity;
  status: DefectStatus;
  location: string;
  discoveredBy: string;
  discoveredAt: string;
  assignedTo?: string;
  dueDate?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  photos: string[];
  category: string;
}

// Mock Templates
export const MOCK_INSPECTION_TEMPLATES: InspectionTemplate[] = [
  {
    id: 'tpl-foundation',
    name: 'Kiểm tra móng',
    type: 'foundation',
    description: 'Kiểm tra chất lượng móng công trình',
    estimatedDuration: 120,
    checklistItems: [
      {
        id: 'f1',
        description: 'Kích thước móng đúng bản vẽ',
        category: 'Kích thước',
        required: true,
      },
      {
        id: 'f2',
        description: 'Độ sâu móng đạt yêu cầu',
        category: 'Kích thước',
        required: true,
      },
      {
        id: 'f3',
        description: 'Đất nền được đầm chặt',
        category: 'Nền móng',
        required: true,
      },
      {
        id: 'f4',
        description: 'Cốt thép đúng quy cách',
        category: 'Cốt thép',
        required: true,
      },
      {
        id: 'f5',
        description: 'Khoảng cách cốt thép đúng thiết kế',
        category: 'Cốt thép',
        required: true,
      },
      {
        id: 'f6',
        description: 'Lớp bê tông lót đạt yêu cầu',
        category: 'Bê tông',
        required: true,
      },
    ],
  },
  {
    id: 'tpl-structure',
    name: 'Kiểm tra kết cấu',
    type: 'structure',
    description: 'Kiểm tra kết cấu bê tông cốt thép',
    estimatedDuration: 180,
    checklistItems: [
      {
        id: 's1',
        description: 'Kích thước cột, dầm đúng bản vẽ',
        category: 'Kích thước',
        required: true,
      },
      {
        id: 's2',
        description: 'Cốt thép đúng đường kính, số lượng',
        category: 'Cốt thép',
        required: true,
      },
      {
        id: 's3',
        description: 'Độ che phủ bê tông đạt yêu cầu',
        category: 'Cốt thép',
        required: true,
      },
      {
        id: 's4',
        description: 'Ván khuôn kín khít, không rò rỉ',
        category: 'Ván khuôn',
        required: true,
      },
      {
        id: 's5',
        description: 'Bê tông đạt cường độ thiết kế',
        category: 'Bê tông',
        required: true,
      },
      {
        id: 's6',
        description: 'Bề mặt bê tông không nứt, tổ ong',
        category: 'Bê tông',
        required: true,
      },
    ],
  },
  {
    id: 'tpl-electrical',
    name: 'Kiểm tra điện',
    type: 'electrical',
    description: 'Kiểm tra hệ thống điện',
    estimatedDuration: 90,
    checklistItems: [
      {
        id: 'e1',
        description: 'Tủ điện đúng vị trí, quy cách',
        category: 'Tủ điện',
        required: true,
      },
      {
        id: 'e2',
        description: 'Aptomat, CB đúng dung lượng',
        category: 'Thiết bị',
        required: true,
      },
      {
        id: 'e3',
        description: 'Dây điện đúng tiết diện',
        category: 'Dây dẫn',
        required: true,
      },
      {
        id: 'e4',
        description: 'Hệ thống nối đất đạt yêu cầu',
        category: 'An toàn',
        required: true,
      },
      {
        id: 'e5',
        description: 'Ổ cắm, công tắc lắp đúng cao độ',
        category: 'Thiết bị',
        required: true,
      },
    ],
  },
];

// Mock Inspections
export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-1',
    projectId: 'project-1',
    templateId: 'tpl-foundation',
    templateName: 'Kiểm tra móng',
    type: 'foundation',
    title: 'Kiểm tra móng M1-M5',
    description: 'Kiểm tra móng cột khối A',
    scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    inspector: 'Nguyễn Văn A',
    location: 'Khối A',
    phase: 'Móng',
    checklist: [
      {
        id: 'f1',
        description: 'Kích thước móng đúng bản vẽ',
        category: 'Kích thước',
        status: 'pass',
        required: true,
      },
      {
        id: 'f2',
        description: 'Độ sâu móng đạt yêu cầu',
        category: 'Kích thước',
        status: 'pass',
        required: true,
      },
      {
        id: 'f3',
        description: 'Đất nền được đầm chặt',
        category: 'Nền móng',
        status: 'pass',
        required: true,
      },
      {
        id: 'f4',
        description: 'Cốt thép đúng quy cách',
        category: 'Cốt thép',
        status: 'pass',
        required: true,
      },
      {
        id: 'f5',
        description: 'Khoảng cách cốt thép đúng thiết kế',
        category: 'Cốt thép',
        status: 'fail',
        notes: 'Khoảng cách sai lệch 2cm tại M3',
        required: true,
      },
      {
        id: 'f6',
        description: 'Lớp bê tông lót đạt yêu cầu',
        category: 'Bê tông',
        status: 'pass',
        required: true,
      },
    ],
    overallResult: 'fail',
    passRate: 83,
    defectsFound: 1,
  },
  {
    id: 'insp-2',
    projectId: 'project-1',
    templateId: 'tpl-structure',
    templateName: 'Kiểm tra kết cấu',
    type: 'structure',
    title: 'Kiểm tra cột tầng 1',
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    inspector: 'Trần Văn B',
    location: 'Tầng 1',
    phase: 'Kết cấu',
    checklist: [
      {
        id: 's1',
        description: 'Kích thước cột, dầm đúng bản vẽ',
        category: 'Kích thước',
        status: 'pass',
        required: true,
      },
      {
        id: 's2',
        description: 'Cốt thép đúng đường kính, số lượng',
        category: 'Cốt thép',
        status: 'pass',
        required: true,
      },
      {
        id: 's3',
        description: 'Độ che phủ bê tông đạt yêu cầu',
        category: 'Cốt thép',
        status: 'pass',
        required: true,
      },
      {
        id: 's4',
        description: 'Ván khuôn kín khít, không rò rỉ',
        category: 'Ván khuôn',
        status: 'pass',
        required: true,
      },
      {
        id: 's5',
        description: 'Bê tông đạt cường độ thiết kế',
        category: 'Bê tông',
        status: 'pass',
        required: true,
      },
      {
        id: 's6',
        description: 'Bề mặt bê tông không nứt, tổ ong',
        category: 'Bê tông',
        status: 'pass',
        required: true,
      },
    ],
    overallResult: 'pass',
    passRate: 100,
    defectsFound: 0,
  },
  {
    id: 'insp-3',
    projectId: 'project-1',
    templateId: 'tpl-electrical',
    templateName: 'Kiểm tra điện',
    type: 'electrical',
    title: 'Kiểm tra hệ thống điện tầng 1',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    inspector: 'Lê Văn C',
    location: 'Tầng 1',
    phase: 'Điện',
    checklist: MOCK_INSPECTION_TEMPLATES[2].checklistItems.map(item => ({
      ...item,
      status: 'pending' as CheckItemStatus,
    })),
  },
];

// Mock Defects
export const MOCK_DEFECTS: Defect[] = [
  {
    id: 'def-1',
    projectId: 'project-1',
    inspectionId: 'insp-1',
    title: 'Khoảng cách cốt thép móng M3 sai lệch',
    description: 'Khoảng cách cốt thép tại móng M3 sai lệch 2cm so với thiết kế',
    severity: 'major',
    status: 'in-progress',
    location: 'Móng M3, Khối A',
    discoveredBy: 'Nguyễn Văn A',
    discoveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Phạm Văn D',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    photos: [],
    category: 'Cốt thép',
  },
  {
    id: 'def-2',
    projectId: 'project-1',
    title: 'Bê tông tổ ong tại cột C5',
    description: 'Phát hiện tổ ong diện tích 10x15cm tại cột C5 tầng 2',
    severity: 'critical',
    status: 'open',
    location: 'Cột C5, Tầng 2',
    discoveredBy: 'Trần Văn B',
    discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Nguyễn Văn E',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    photos: [],
    category: 'Bê tông',
  },
  {
    id: 'def-3',
    projectId: 'project-1',
    title: 'Vết nứt tường T12',
    description: 'Vết nứt nhỏ dài 30cm trên tường phòng T12',
    severity: 'minor',
    status: 'resolved',
    location: 'Tường T12, Tầng 3',
    discoveredBy: 'Lê Văn C',
    discoveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Phạm Văn D',
    resolvedBy: 'Phạm Văn D',
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolution: 'Đã trám kín và sơn lại',
    photos: [],
    category: 'Hoàn thiện',
  },
];

// Mock API Service
export class QCInspectionService {
  private static templates = [...MOCK_INSPECTION_TEMPLATES];
  private static inspections = [...MOCK_INSPECTIONS];
  private static defects = [...MOCK_DEFECTS];

  // Templates
  static async getTemplates(type?: InspectionType): Promise<InspectionTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.templates;

    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }

    return filtered;
  }

  static async getTemplate(id: string): Promise<InspectionTemplate | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.templates.find(t => t.id === id) || null;
  }

  // Inspections
  static async getInspections(filters?: {
    projectId?: string;
    status?: InspectionStatus;
    type?: InspectionType;
  }): Promise<Inspection[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.inspections;

    if (filters?.projectId) {
      filtered = filtered.filter(i => i.projectId === filters.projectId);
    }

    if (filters?.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }

    if (filters?.type) {
      filtered = filtered.filter(i => i.type === filters.type);
    }

    return filtered.sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  }

  static async getInspection(id: string): Promise<Inspection | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.inspections.find(i => i.id === id) || null;
  }

  static async createInspection(
    data: Omit<Inspection, 'id' | 'checklist' | 'passRate' | 'defectsFound'>
  ): Promise<Inspection> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const template = await this.getTemplate(data.templateId);
    if (!template) throw new Error('Template not found');

    const newInspection: Inspection = {
      ...data,
      id: `insp-${Date.now()}`,
      checklist: template.checklistItems.map(item => ({
        ...item,
        status: 'pending' as CheckItemStatus,
      })),
    };

    this.inspections.unshift(newInspection);
    return newInspection;
  }

  static async updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.inspections.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Inspection not found');

    // Calculate pass rate if checklist updated
    if (data.checklist) {
      const total = data.checklist.length;
      const passed = data.checklist.filter(item => item.status === 'pass').length;
      const failed = data.checklist.filter(item => item.status === 'fail').length;
      
      data.passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
      data.overallResult = failed > 0 ? 'fail' : 'pass';
      data.defectsFound = failed;
    }

    this.inspections[index] = {
      ...this.inspections[index],
      ...data,
    };

    return this.inspections[index];
  }

  // Defects
  static async getDefects(filters?: {
    projectId?: string;
    inspectionId?: string;
    status?: DefectStatus;
    severity?: DefectSeverity;
  }): Promise<Defect[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.defects;

    if (filters?.projectId) {
      filtered = filtered.filter(d => d.projectId === filters.projectId);
    }

    if (filters?.inspectionId) {
      filtered = filtered.filter(d => d.inspectionId === filters.inspectionId);
    }

    if (filters?.status) {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    if (filters?.severity) {
      filtered = filtered.filter(d => d.severity === filters.severity);
    }

    return filtered.sort((a, b) => 
      new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime()
    );
  }

  static async createDefect(data: Omit<Defect, 'id'>): Promise<Defect> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newDefect: Defect = {
      ...data,
      id: `def-${Date.now()}`,
    };

    this.defects.unshift(newDefect);
    return newDefect;
  }

  static async updateDefect(id: string, data: Partial<Defect>): Promise<Defect> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.defects.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Defect not found');

    this.defects[index] = {
      ...this.defects[index],
      ...data,
    };

    return this.defects[index];
  }

  // Stats
  static async getStats(projectId?: string): Promise<{
    totalInspections: number;
    completedInspections: number;
    scheduledInspections: number;
    passRate: number;
    totalDefects: number;
    openDefects: number;
    criticalDefects: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let inspections = this.inspections;
    let defects = this.defects;

    if (projectId) {
      inspections = inspections.filter(i => i.projectId === projectId);
      defects = defects.filter(d => d.projectId === projectId);
    }

    const completed = inspections.filter(i => i.status === 'completed');
    const totalPass = completed.filter(i => i.overallResult === 'pass').length;
    const passRate = completed.length > 0 ? Math.round((totalPass / completed.length) * 100) : 0;

    return {
      totalInspections: inspections.length,
      completedInspections: completed.length,
      scheduledInspections: inspections.filter(i => i.status === 'scheduled').length,
      passRate,
      totalDefects: defects.length,
      openDefects: defects.filter(d => d.status === 'open' || d.status === 'in-progress').length,
      criticalDefects: defects.filter(d => d.severity === 'critical' && d.status !== 'closed').length,
    };
  }
}
