/**
 * Construction Progress Service
 * Service để quản lý tiến độ xây dựng dự án
 */

import { API_CONFIG, createApiConfig } from '@/config/api';
import { ConstructionProject, ConstructionTask } from '@/types/construction-progress';

const config = createApiConfig(API_CONFIG.BACKEND.BASE_URL);

// ============== MOCK DATA - Fallback when API unavailable ==============
export const MOCK_PROJECT: ConstructionProject = {
  id: '1',
  name: 'Biệt thự Vinhomes Grand Park',
  description: 'Xây dựng biệt thự 3 tầng phong cách hiện đại với đầy đủ nội thất cao cấp',
  address: 'Quận 9, TP.HCM',
  projectType: 'Biệt thự',
  totalArea: 450,
  totalFloors: 3,
  estimatedBudget: 5500000000,
  status: 'IN_PROGRESS',
  progressPercent: 65,
  plannedStartDate: '2024-01-15',
  plannedEndDate: '2024-12-31',
  actualStartDate: '2024-01-20',
  members: [
    { id: '1', userId: 'u1', userName: 'Nguyễn Văn A', userAvatar: undefined, role: 'MANAGER', assignedAt: '2024-01-15' },
    { id: '2', userId: 'u2', userName: 'Trần Văn B', userAvatar: undefined, role: 'ENGINEER', assignedAt: '2024-01-15' },
    { id: '3', userId: 'u3', userName: 'Lê Văn C', userAvatar: undefined, role: 'CONTRACTOR', assignedAt: '2024-01-15' },
    { id: '4', userId: 'u4', userName: 'Phạm Thị D', userAvatar: undefined, role: 'CLIENT', assignedAt: '2024-01-15' },
  ],
  ownerId: 'u4',
  tasks: [],
  totalTasks: 24,
  completedTasks: 15,
  coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  media: [],
  createdAt: '2024-01-10',
  updatedAt: '2024-12-20',
  createdBy: 'u1',
};

export const MOCK_TASKS: ConstructionTask[] = [
  {
    id: 't1',
    projectId: '1',
    name: 'Móng và nền',
    description: 'Đổ móng, làm nền tầng trệt',
    category: 'FOUNDATION',
    status: 'APPROVED',
    progressPercent: 100,
    priority: 'HIGH',
    plannedStartDate: '2024-01-20',
    plannedEndDate: '2024-03-15',
    actualStartDate: '2024-01-22',
    actualEndDate: '2024-03-10',
    assignedTo: [
      { id: 'a1', userId: 'u3', userName: 'Lê Văn C', role: 'CONTRACTOR', assignedAt: '2024-01-15' }
    ],
    confirmations: [
      { id: 'c1', type: 'CONTRACTOR_CONFIRM', status: 'CONFIRMED', userId: 'u3', userName: 'Lê Văn C', userRole: 'CONTRACTOR', confirmedAt: '2024-03-10' },
      { id: 'c2', type: 'ENGINEER_CHECK', status: 'CONFIRMED', userId: 'u2', userName: 'Trần Văn B', userRole: 'ENGINEER', confirmedAt: '2024-03-12', note: 'Đạt chất lượng' },
      { id: 'c3', type: 'CLIENT_APPROVE', status: 'CONFIRMED', userId: 'u4', userName: 'Phạm Thị D', userRole: 'CLIENT', confirmedAt: '2024-03-15' },
    ],
    media: [],
    comments: [],
    statusHistory: [],
    order: 1,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-15',
  },
  {
    id: 't2',
    projectId: '1',
    name: 'Khung kết cấu',
    description: 'Thi công khung bê tông cốt thép 3 tầng',
    category: 'STRUCTURE',
    status: 'APPROVED',
    progressPercent: 100,
    priority: 'HIGH',
    plannedStartDate: '2024-03-16',
    plannedEndDate: '2024-06-30',
    actualStartDate: '2024-03-16',
    actualEndDate: '2024-06-25',
    assignedTo: [
      { id: 'a2', userId: 'u3', userName: 'Lê Văn C', role: 'CONTRACTOR', assignedAt: '2024-01-15' }
    ],
    confirmations: [
      { id: 'c4', type: 'CONTRACTOR_CONFIRM', status: 'CONFIRMED', userId: 'u3', userName: 'Lê Văn C', userRole: 'CONTRACTOR', confirmedAt: '2024-06-25' },
      { id: 'c5', type: 'ENGINEER_CHECK', status: 'CONFIRMED', userId: 'u2', userName: 'Trần Văn B', userRole: 'ENGINEER', confirmedAt: '2024-06-27' },
      { id: 'c6', type: 'CLIENT_APPROVE', status: 'CONFIRMED', userId: 'u4', userName: 'Phạm Thị D', userRole: 'CLIENT', confirmedAt: '2024-06-30' },
    ],
    media: [],
    comments: [],
    statusHistory: [],
    order: 2,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-30',
  },
  {
    id: 't3',
    projectId: '1',
    name: 'Điện nước',
    description: 'Hệ thống điện, nước toàn nhà',
    category: 'MEP',
    status: 'PENDING_CHECK',
    progressPercent: 100,
    priority: 'HIGH',
    plannedStartDate: '2024-07-01',
    plannedEndDate: '2024-09-30',
    actualStartDate: '2024-07-05',
    actualEndDate: '2024-09-28',
    assignedTo: [
      { id: 'a3', userId: 'u3', userName: 'Lê Văn C', role: 'CONTRACTOR', assignedAt: '2024-01-15' }
    ],
    confirmations: [
      { id: 'c7', type: 'CONTRACTOR_CONFIRM', status: 'CONFIRMED', userId: 'u3', userName: 'Lê Văn C', userRole: 'CONTRACTOR', confirmedAt: '2024-09-28', note: 'Đã hoàn thành' },
    ],
    media: [],
    comments: [],
    statusHistory: [],
    order: 3,
    createdAt: '2024-01-15',
    updatedAt: '2024-09-28',
  },
  {
    id: 't4',
    projectId: '1',
    name: 'Hoàn thiện nội thất',
    description: 'Sơn, trần thạch cao, sàn gỗ',
    category: 'FINISHING',
    status: 'IN_PROGRESS',
    progressPercent: 45,
    priority: 'MEDIUM',
    plannedStartDate: '2024-10-01',
    plannedEndDate: '2024-11-30',
    actualStartDate: '2024-10-05',
    assignedTo: [
      { id: 'a4', userId: 'u3', userName: 'Lê Văn C', role: 'CONTRACTOR', assignedAt: '2024-01-15' }
    ],
    confirmations: [],
    media: [],
    comments: [],
    statusHistory: [],
    order: 4,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
  },
  {
    id: 't5',
    projectId: '1',
    name: 'Sân vườn & cảnh quan',
    description: 'Thiết kế sân vườn, bể bơi',
    category: 'LANDSCAPING',
    status: 'NOT_STARTED',
    progressPercent: 0,
    priority: 'LOW',
    plannedStartDate: '2024-12-01',
    plannedEndDate: '2024-12-20',
    assignedTo: [
      { id: 'a5', userId: 'u3', userName: 'Lê Văn C', role: 'CONTRACTOR', assignedAt: '2024-01-15' }
    ],
    confirmations: [],
    media: [],
    comments: [],
    statusHistory: [],
    order: 5,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
  },
];

// ============== API FUNCTIONS ==============

interface GetProjectResponse {
  project: ConstructionProject;
  tasks: ConstructionTask[];
  dataSource: 'api' | 'mock';
}

/**
 * Get construction project by ID with tasks
 */
async function getProject(projectId: string): Promise<GetProjectResponse> {
  try {
    const response = await fetch(`${config.baseUrl}/construction-progress/${projectId}`, {
      method: 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      project: data.project || MOCK_PROJECT,
      tasks: data.tasks || MOCK_TASKS,
      dataSource: 'api',
    };
  } catch (error) {
    console.warn('[ConstructionProgressService] Failed to fetch from API, using mock data:', error);
    return {
      project: { ...MOCK_PROJECT, id: projectId },
      tasks: MOCK_TASKS.map(t => ({ ...t, projectId })),
      dataSource: 'mock',
    };
  }
}

/**
 * Get list of construction projects
 */
async function getProjects(): Promise<{ projects: ConstructionProject[]; dataSource: 'api' | 'mock' }> {
  try {
    const response = await fetch(`${config.baseUrl}/construction-progress`, {
      method: 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      projects: data.projects || [MOCK_PROJECT],
      dataSource: 'api',
    };
  } catch (error) {
    console.warn('[ConstructionProgressService] Failed to fetch projects, using mock data:', error);
    return {
      projects: [MOCK_PROJECT],
      dataSource: 'mock',
    };
  }
}

/**
 * Update task status/progress
 */
async function updateTask(
  projectId: string, 
  taskId: string, 
  data: Partial<ConstructionTask>
): Promise<ConstructionTask> {
  try {
    const response = await fetch(`${config.baseUrl}/construction-progress/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: config.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[ConstructionProgressService] Failed to update task:', error);
    throw error;
  }
}

/**
 * Confirm task completion
 */
async function confirmTask(
  projectId: string, 
  taskId: string, 
  confirmationType: 'CONTRACTOR_CONFIRM' | 'ENGINEER_CHECK' | 'CLIENT_APPROVE',
  note?: string
): Promise<void> {
  try {
    const response = await fetch(`${config.baseUrl}/construction-progress/${projectId}/tasks/${taskId}/confirm`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({ type: confirmationType, note }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.warn('[ConstructionProgressService] Failed to confirm task:', error);
    throw error;
  }
}

/**
 * Add comment to task
 */
async function addTaskComment(
  projectId: string, 
  taskId: string, 
  content: string
): Promise<void> {
  try {
    const response = await fetch(`${config.baseUrl}/construction-progress/${projectId}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.warn('[ConstructionProgressService] Failed to add comment:', error);
    throw error;
  }
}

/**
 * Upload media to task
 */
async function uploadTaskMedia(
  projectId: string, 
  taskId: string, 
  mediaUri: string,
  type: 'IMAGE' | 'VIDEO'
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', {
      uri: mediaUri,
      type: type === 'IMAGE' ? 'image/jpeg' : 'video/mp4',
      name: type === 'IMAGE' ? 'photo.jpg' : 'video.mp4',
    } as any);

    const response = await fetch(`${config.baseUrl}/construction-progress/${projectId}/tasks/${taskId}/media`, {
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
  } catch (error) {
    console.warn('[ConstructionProgressService] Failed to upload media:', error);
    throw error;
  }
}

export const ConstructionProgressService = {
  getProject,
  getProjects,
  updateTask,
  confirmTask,
  addTaskComment,
  uploadTaskMedia,
};

export default ConstructionProgressService;
