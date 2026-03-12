/**
 * Project Detail Service
 * Service để quản lý chi tiết dự án: workflow, team, documents
 */

import { API_CONFIG, createApiConfig } from '@/config/api';

const config = createApiConfig(API_CONFIG.BACKEND.BASE_URL);

// ============== TYPES ==============
export interface WorkflowPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
  startDate: string;
  endDate: string;
  tasks: number;
  completedTasks: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  avatar?: string;
  joinedAt: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'contract' | 'design' | 'report' | 'permit' | 'invoice' | 'other';
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];
}

// ============== MOCK DATA ==============
export const MOCK_WORKFLOW: WorkflowPhase[] = [
  {
    id: '1',
    name: 'Khảo sát & Thiết kế',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-01',
    endDate: '2024-02-15',
    tasks: 12,
    completedTasks: 12,
  },
  {
    id: '2',
    name: 'Chuẩn bị mặt bằng',
    status: 'completed',
    progress: 100,
    startDate: '2024-02-16',
    endDate: '2024-03-10',
    tasks: 8,
    completedTasks: 8,
  },
  {
    id: '3',
    name: 'Đổ móng & Kết cấu',
    status: 'active',
    progress: 65,
    startDate: '2024-03-11',
    endDate: '2024-05-20',
    tasks: 15,
    completedTasks: 10,
  },
  {
    id: '4',
    name: 'Xây tường & Trát',
    status: 'pending',
    progress: 0,
    startDate: '2024-05-21',
    endDate: '2024-07-15',
    tasks: 20,
    completedTasks: 0,
  },
  {
    id: '5',
    name: 'Lắp đặt điện nước',
    status: 'pending',
    progress: 0,
    startDate: '2024-07-16',
    endDate: '2024-08-30',
    tasks: 18,
    completedTasks: 0,
  },
  {
    id: '6',
    name: 'Hoàn thiện & Bàn giao',
    status: 'pending',
    progress: 0,
    startDate: '2024-09-01',
    endDate: '2024-10-15',
    tasks: 10,
    completedTasks: 0,
  },
];

export const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    role: 'Giám đốc dự án',
    phone: '0901234567',
    email: 'nguyenvana@example.com',
    joinedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    role: 'Kiến trúc sư',
    phone: '0907654321',
    email: 'tranthib@example.com',
    joinedAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    role: 'Kỹ sư thi công',
    phone: '0909876543',
    email: 'levanc@example.com',
    joinedAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    role: 'Kỹ thuật viên',
    phone: '0908765432',
    joinedAt: '2024-02-01',
  },
];

export const MOCK_DOCUMENTS: ProjectDocument[] = [
  {
    id: '1',
    name: 'Hợp đồng thi công.pdf',
    type: 'contract',
    size: 2457600,
    mimeType: 'application/pdf',
    url: '/documents/contract.pdf',
    uploadedBy: 'Nguyễn Văn A',
    uploadedAt: '2024-01-15',
    tags: ['hợp đồng', 'quan trọng'],
  },
  {
    id: '2',
    name: 'Bản vẽ thiết kế tổng thể.dwg',
    type: 'design',
    size: 8945000,
    mimeType: 'application/acad',
    url: '/documents/design-master.dwg',
    uploadedBy: 'Trần Thị B',
    uploadedAt: '2024-01-20',
    tags: ['thiết kế', 'bản vẽ'],
  },
  {
    id: '3',
    name: 'Báo cáo tiến độ tháng 3.docx',
    type: 'report',
    size: 1024000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/documents/report-mar.docx',
    uploadedBy: 'Lê Văn C',
    uploadedAt: '2024-03-31',
    tags: ['báo cáo', 'tháng 3'],
  },
  {
    id: '4',
    name: 'Giấy phép xây dựng.pdf',
    type: 'permit',
    size: 512000,
    mimeType: 'application/pdf',
    url: '/documents/building-permit.pdf',
    uploadedBy: 'Nguyễn Văn A',
    uploadedAt: '2024-01-10',
    tags: ['giấy phép', 'pháp lý'],
  },
  {
    id: '5',
    name: 'Hóa đơn vật tư tháng 3.xlsx',
    type: 'invoice',
    size: 768000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: '/documents/invoice-mar.xlsx',
    uploadedBy: 'Phạm Thị D',
    uploadedAt: '2024-03-15',
    tags: ['hóa đơn', 'vật tư'],
  },
  {
    id: '6',
    name: 'Bản vẽ móng.pdf',
    type: 'design',
    size: 3456000,
    mimeType: 'application/pdf',
    url: '/documents/foundation-plan.pdf',
    uploadedBy: 'Trần Thị B',
    uploadedAt: '2024-02-05',
    tags: ['thiết kế', 'móng'],
  },
  {
    id: '7',
    name: 'Báo cáo khảo sát địa chất.pdf',
    type: 'report',
    size: 5120000,
    mimeType: 'application/pdf',
    url: '/documents/geological-survey.pdf',
    uploadedBy: 'Lê Văn C',
    uploadedAt: '2024-01-25',
    tags: ['báo cáo', 'khảo sát'],
  },
];

// ============== API FUNCTIONS ==============

interface GetWorkflowResponse {
  phases: WorkflowPhase[];
  dataSource: 'api' | 'empty';
}

/**
 * Get workflow phases for a project
 */
async function getProjectWorkflow(projectId: string): Promise<GetWorkflowResponse> {
  try {
    const response = await fetch(`${config.baseUrl}/projects/${projectId}/workflow`, {
      method: 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      phases: data.phases || [],
      dataSource: 'api',
    };
  } catch (error) {
    console.warn('[ProjectDetailService] Failed to fetch workflow:', error);
    return {
      phases: [],
      dataSource: 'empty',
    };
  }
}

interface GetTeamResponse {
  members: TeamMember[];
  dataSource: 'api' | 'empty';
}

/**
 * Get team members for a project
 */
async function getProjectTeam(projectId: string): Promise<GetTeamResponse> {
  try {
    const response = await fetch(`${config.baseUrl}/projects/${projectId}/team`, {
      method: 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      members: data.members || [],
      dataSource: 'api',
    };
  } catch (error) {
    console.warn('[ProjectDetailService] Failed to fetch team:', error);
    return {
      members: [],
      dataSource: 'empty',
    };
  }
}

interface GetDocumentsResponse {
  documents: ProjectDocument[];
  dataSource: 'api' | 'empty';
}

/**
 * Get documents for a project
 */
async function getProjectDocuments(projectId: string): Promise<GetDocumentsResponse> {
  try {
    const response = await fetch(`${config.baseUrl}/projects/${projectId}/documents`, {
      method: 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      documents: data.documents || [],
      dataSource: 'api',
    };
  } catch (error) {
    console.warn('[ProjectDetailService] Failed to fetch documents:', error);
    return {
      documents: [],
      dataSource: 'empty',
    };
  }
}

/**
 * Add team member to project
 */
async function addTeamMember(projectId: string, member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  try {
    const response = await fetch(`${config.baseUrl}/projects/${projectId}/team`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(member),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[ProjectDetailService] Failed to add team member:', error);
    throw error;
  }
}

/**
 * Remove team member from project
 */
async function removeTeamMember(projectId: string, memberId: string): Promise<void> {
  try {
    const response = await fetch(`${config.baseUrl}/projects/${projectId}/team/${memberId}`, {
      method: 'DELETE',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.warn('[ProjectDetailService] Failed to remove team member:', error);
    throw error;
  }
}

/**
 * Upload document to project
 */
async function uploadDocument(
  projectId: string, 
  file: { uri: string; name: string; type: string }
): Promise<ProjectDocument> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);

    const response = await fetch(`${config.baseUrl}/projects/${projectId}/documents`, {
      method: 'POST',
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[ProjectDetailService] Failed to upload document:', error);
    throw error;
  }
}

/**
 * Delete document from project
 */
async function deleteDocument(projectId: string, documentId: string): Promise<void> {
  try {
    const response = await fetch(`${config.baseUrl}/projects/${projectId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.warn('[ProjectDetailService] Failed to delete document:', error);
    throw error;
  }
}

/**
 * Update workflow phase status
 */
async function updateWorkflowPhase(
  projectId: string, 
  phaseId: string, 
  updates: Partial<WorkflowPhase>
): Promise<WorkflowPhase> {
  try {
    const response = await fetch(`${config.baseUrl}/projects/${projectId}/workflow/${phaseId}`, {
      method: 'PATCH',
      headers: config.headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[ProjectDetailService] Failed to update workflow phase:', error);
    throw error;
  }
}

export const ProjectDetailService = {
  getProjectWorkflow,
  getProjectTeam,
  getProjectDocuments,
  addTeamMember,
  removeTeamMember,
  uploadDocument,
  deleteDocument,
  updateWorkflowPhase,
};

export default ProjectDetailService;
