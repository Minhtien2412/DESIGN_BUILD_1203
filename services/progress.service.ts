/**
 * Construction Progress Service
 * API service for managing construction progress with CRUD operations
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { apiFetch } from '@/services/api';
import {
    AddCommentInput,
    AddPhotoInput,
    CreateTaskInput,
    ProgressComment,
    ProgressFilter,
    ProgressPhoto,
    ProgressStage,
    ProgressStatus,
    ProgressTask,
    ProjectProgress,
    ROLE_PERMISSIONS,
    StageType,
    UpdateTaskInput,
    UserRole,
} from '@/types/progress';

// ==================== MOCK DATA ====================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const MOCK_STAGES: ProgressStage[] = [
  {
    id: 'stage-1',
    projectId: 'project-1',
    name: 'Chuẩn bị & Móng',
    type: StageType.FOUNDATION,
    order: 1,
    description: 'Chuẩn bị mặt bằng, ép cọc, đào móng',
    status: ProgressStatus.COMPLETED,
    progress: 100,
    tasksTotal: 4,
    tasksCompleted: 4,
    plannedStartDate: '2025-01-01',
    plannedEndDate: '2025-02-15',
    actualStartDate: '2025-01-05',
    actualEndDate: '2025-02-20',
    tasks: [],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'stage-2',
    projectId: 'project-1',
    name: 'Kết cấu',
    type: StageType.STRUCTURE,
    order: 2,
    description: 'Đổ cột, dầm, sàn các tầng',
    status: ProgressStatus.IN_PROGRESS,
    progress: 65,
    tasksTotal: 6,
    tasksCompleted: 4,
    plannedStartDate: '2025-02-16',
    plannedEndDate: '2025-05-15',
    tasks: [],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'stage-3',
    projectId: 'project-1',
    name: 'Điện nước (MEP)',
    type: StageType.MEP,
    order: 3,
    description: 'Lắp đặt hệ thống điện, nước, PCCC',
    status: ProgressStatus.PENDING,
    progress: 0,
    tasksTotal: 5,
    tasksCompleted: 0,
    plannedStartDate: '2025-05-16',
    plannedEndDate: '2025-07-15',
    tasks: [],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'stage-4',
    projectId: 'project-1',
    name: 'Hoàn thiện',
    type: StageType.FINISHING,
    order: 4,
    description: 'Tô trát, ốp lát, sơn bả, nội thất',
    status: ProgressStatus.PENDING,
    progress: 0,
    tasksTotal: 8,
    tasksCompleted: 0,
    plannedStartDate: '2025-07-16',
    plannedEndDate: '2025-10-15',
    tasks: [],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'stage-5',
    projectId: 'project-1',
    name: 'Bàn giao',
    type: StageType.HANDOVER,
    order: 5,
    description: 'Vệ sinh, kiểm tra, bàn giao',
    status: ProgressStatus.PENDING,
    progress: 0,
    tasksTotal: 3,
    tasksCompleted: 0,
    plannedStartDate: '2025-10-16',
    plannedEndDate: '2025-11-15',
    tasks: [],
    createdAt: '2025-01-01T00:00:00Z',
  },
];

let MOCK_TASKS: ProgressTask[] = [
  {
    id: 'task-1',
    projectId: 'project-1',
    stageId: 'stage-2',
    stageName: 'Kết cấu',
    title: 'Đổ cột tầng 1',
    description: 'Đổ bê tông cột tầng 1, tổng 12 cột',
    status: ProgressStatus.COMPLETED,
    priority: 'high',
    progress: 100,
    estimatedHours: 16,
    actualHours: 18,
    plannedStartDate: '2025-02-16',
    plannedEndDate: '2025-02-20',
    actualStartDate: '2025-02-16',
    actualEndDate: '2025-02-21',
    assignedTo: ['user-1', 'user-2'],
    assignedToNames: ['Nguyễn Văn A', 'Trần Văn B'],
    supervisorId: 'user-3',
    supervisorName: 'Lê Văn C',
    photos: [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200',
        caption: 'Cột tầng 1 sau khi đổ',
        takenAt: '2025-02-21T10:30:00Z',
        uploadedBy: 'user-3',
        uploadedByName: 'Lê Văn C',
      },
    ],
    comments: [
      {
        id: 'comment-1',
        text: 'Hoàn thành đúng tiến độ, chất lượng tốt',
        authorId: 'user-3',
        authorName: 'Lê Văn C',
        authorRole: UserRole.ENGINEER,
        createdAt: '2025-02-21T15:00:00Z',
      },
    ],
    createdBy: 'admin-1',
    createdByName: 'Admin',
    createdByRole: UserRole.ADMIN,
    createdAt: '2025-02-15T08:00:00Z',
    updatedBy: 'user-3',
    updatedByName: 'Lê Văn C',
    updatedByRole: UserRole.ENGINEER,
    updatedAt: '2025-02-21T15:00:00Z',
    tags: ['bê tông', 'cột'],
  },
  {
    id: 'task-2',
    projectId: 'project-1',
    stageId: 'stage-2',
    stageName: 'Kết cấu',
    title: 'Đổ dầm sàn tầng 2',
    description: 'Đổ bê tông dầm và sàn tầng 2',
    status: ProgressStatus.IN_PROGRESS,
    priority: 'high',
    progress: 60,
    estimatedHours: 24,
    plannedStartDate: '2025-02-22',
    plannedEndDate: '2025-03-05',
    actualStartDate: '2025-02-23',
    assignedTo: ['user-1', 'user-2', 'user-4'],
    assignedToNames: ['Nguyễn Văn A', 'Trần Văn B', 'Phạm Văn D'],
    supervisorId: 'user-3',
    supervisorName: 'Lê Văn C',
    photos: [
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200',
        caption: 'Cốt thép dầm tầng 2',
        takenAt: '2025-02-25T14:00:00Z',
        uploadedBy: 'user-3',
        uploadedByName: 'Lê Văn C',
      },
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1590644365607-1c5a13db78a8?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1590644365607-1c5a13db78a8?w=200',
        caption: 'Đang đổ bê tông',
        takenAt: '2025-02-28T09:00:00Z',
        uploadedBy: 'user-1',
        uploadedByName: 'Nguyễn Văn A',
      },
    ],
    comments: [
      {
        id: 'comment-2',
        text: 'Tiến độ đang tốt, dự kiến hoàn thành đúng hạn',
        authorId: 'user-3',
        authorName: 'Lê Văn C',
        authorRole: UserRole.ENGINEER,
        createdAt: '2025-02-28T16:00:00Z',
      },
    ],
    createdBy: 'admin-1',
    createdByName: 'Admin',
    createdByRole: UserRole.ADMIN,
    createdAt: '2025-02-20T08:00:00Z',
    tags: ['bê tông', 'dầm', 'sàn'],
  },
  {
    id: 'task-3',
    projectId: 'project-1',
    stageId: 'stage-2',
    stageName: 'Kết cấu',
    title: 'Xây tường tầng 1',
    description: 'Xây tường gạch tầng 1',
    status: ProgressStatus.DELAYED,
    priority: 'medium',
    progress: 30,
    estimatedHours: 40,
    plannedStartDate: '2025-02-25',
    plannedEndDate: '2025-03-10',
    actualStartDate: '2025-03-01',
    assignedTo: ['user-5', 'user-6'],
    assignedToNames: ['Hoàng Văn E', 'Vũ Văn F'],
    supervisorId: 'user-3',
    supervisorName: 'Lê Văn C',
    photos: [],
    comments: [
      {
        id: 'comment-3',
        text: 'Thiếu nhân công, cần điều động thêm',
        authorId: 'user-3',
        authorName: 'Lê Văn C',
        authorRole: UserRole.ENGINEER,
        createdAt: '2025-03-05T10:00:00Z',
      },
    ],
    createdBy: 'user-3',
    createdByName: 'Lê Văn C',
    createdByRole: UserRole.ENGINEER,
    createdAt: '2025-02-24T08:00:00Z',
    issues: ['Thiếu nhân công', 'Vật liệu chậm'],
    tags: ['tường', 'gạch'],
  },
  {
    id: 'task-4',
    projectId: 'project-1',
    stageId: 'stage-2',
    stageName: 'Kết cấu',
    title: 'Lắp cốt thép cầu thang',
    description: 'Lắp đặt cốt thép cầu thang tầng 1-2',
    status: ProgressStatus.PENDING,
    priority: 'medium',
    progress: 0,
    estimatedHours: 16,
    plannedStartDate: '2025-03-06',
    plannedEndDate: '2025-03-12',
    assignedTo: ['user-1'],
    assignedToNames: ['Nguyễn Văn A'],
    supervisorId: 'user-3',
    supervisorName: 'Lê Văn C',
    photos: [],
    comments: [],
    createdBy: 'user-3',
    createdByName: 'Lê Văn C',
    createdByRole: UserRole.ENGINEER,
    createdAt: '2025-03-01T08:00:00Z',
    tags: ['cốt thép', 'cầu thang'],
  },
];

// ==================== API FUNCTIONS ====================

/**
 * Get project progress overview
 */
export async function getProjectProgress(projectId: string): Promise<ProjectProgress> {
  try {
    return await apiFetch<ProjectProgress>(`/projects/${projectId}/progress`);
  } catch {
    // Return mock data
    const stages = MOCK_STAGES.map(s => ({
      ...s,
      tasks: MOCK_TASKS.filter(t => t.stageId === s.id),
    }));
    
    const tasksTotal = MOCK_TASKS.length;
    const tasksCompleted = MOCK_TASKS.filter(t => t.status === ProgressStatus.COMPLETED).length;
    const tasksInProgress = MOCK_TASKS.filter(t => t.status === ProgressStatus.IN_PROGRESS).length;
    const tasksDelayed = MOCK_TASKS.filter(t => t.status === ProgressStatus.DELAYED).length;
    
    const overallProgress = Math.round((tasksCompleted / tasksTotal) * 100);
    
    return {
      id: 'progress-1',
      projectId: 'project-1',
      projectName: 'Biệt thự Vinhomes Grand Park',
      projectCode: 'VGP-2025-001',
      overallProgress,
      status: overallProgress === 100 ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
      stages,
      stagesTotal: stages.length,
      stagesCompleted: stages.filter(s => s.status === ProgressStatus.COMPLETED).length,
      tasksTotal,
      tasksCompleted,
      tasksInProgress,
      tasksDelayed,
      startDate: '2025-01-01',
      estimatedEndDate: '2025-11-15',
      teamMembers: [
        { id: 'admin-1', name: 'Admin', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/100?img=1' },
        { id: 'user-3', name: 'Lê Văn C', role: UserRole.ENGINEER, avatar: 'https://i.pravatar.cc/100?img=3' },
        { id: 'user-1', name: 'Nguyễn Văn A', role: UserRole.WORKER, avatar: 'https://i.pravatar.cc/100?img=4' },
        { id: 'user-2', name: 'Trần Văn B', role: UserRole.WORKER, avatar: 'https://i.pravatar.cc/100?img=5' },
      ],
      lastUpdatedBy: 'user-3',
      lastUpdatedByName: 'Lê Văn C',
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Get tasks with filters
 */
export async function getTasks(filter?: ProgressFilter): Promise<ProgressTask[]> {
  try {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append('projectId', filter.projectId);
    if (filter?.stageId) params.append('stageId', filter.stageId);
    if (filter?.status?.length) params.append('status', filter.status.join(','));
    if (filter?.search) params.append('search', filter.search);
    
    return await apiFetch<ProgressTask[]>(`/progress/tasks?${params.toString()}`);
  } catch {
    let tasks = [...MOCK_TASKS];
    
    if (filter?.stageId) {
      tasks = tasks.filter(t => t.stageId === filter.stageId);
    }
    if (filter?.status?.length) {
      tasks = tasks.filter(t => filter.status!.includes(t.status));
    }
    if (filter?.search) {
      const search = filter.search.toLowerCase();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(search) || 
        t.description?.toLowerCase().includes(search)
      );
    }
    
    return tasks;
  }
}

/**
 * Get single task by ID
 */
export async function getTaskById(taskId: string): Promise<ProgressTask | null> {
  try {
    return await apiFetch<ProgressTask>(`/progress/tasks/${taskId}`);
  } catch {
    return MOCK_TASKS.find(t => t.id === taskId) || null;
  }
}

/**
 * Create new task
 */
export async function createTask(input: CreateTaskInput, currentUser: { id: string; name: string; role: UserRole }): Promise<ProgressTask> {
  // Check permission
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  if (!permissions.canCreate) {
    throw new Error('Bạn không có quyền tạo công việc mới');
  }
  
  try {
    return await apiFetch<ProgressTask>('/progress/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch {
    const stage = MOCK_STAGES.find(s => s.id === input.stageId);
    const newTask: ProgressTask = {
      id: generateId(),
      projectId: input.projectId,
      stageId: input.stageId,
      stageName: stage?.name || '',
      title: input.title,
      description: input.description,
      status: input.status || ProgressStatus.PENDING,
      priority: input.priority || 'medium',
      progress: 0,
      plannedStartDate: input.plannedStartDate,
      plannedEndDate: input.plannedEndDate,
      assignedTo: input.assignedTo,
      supervisorId: input.supervisorId,
      photos: [],
      comments: [],
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdByRole: currentUser.role,
      createdAt: new Date().toISOString(),
      notes: input.notes,
      tags: input.tags,
    };
    
    MOCK_TASKS.unshift(newTask);
    return newTask;
  }
}

/**
 * Update task
 */
export async function updateTask(
  taskId: string, 
  input: UpdateTaskInput, 
  currentUser: { id: string; name: string; role: UserRole }
): Promise<ProgressTask> {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  if (!permissions.canEdit) {
    throw new Error('Bạn không có quyền chỉnh sửa công việc');
  }
  
  try {
    return await apiFetch<ProgressTask>(`/progress/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  } catch {
    const index = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error('Không tìm thấy công việc');
    
    MOCK_TASKS[index] = {
      ...MOCK_TASKS[index],
      ...input,
      updatedBy: currentUser.id,
      updatedByName: currentUser.name,
      updatedByRole: currentUser.role,
      updatedAt: new Date().toISOString(),
    };
    
    return MOCK_TASKS[index];
  }
}

/**
 * Delete task
 */
export async function deleteTask(taskId: string, currentUser: { id: string; role: UserRole }): Promise<void> {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  if (!permissions.canDelete) {
    throw new Error('Bạn không có quyền xóa công việc');
  }
  
  try {
    await apiFetch(`/progress/tasks/${taskId}`, { method: 'DELETE' });
  } catch {
    const index = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (index !== -1) {
      MOCK_TASKS.splice(index, 1);
    }
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string, 
  status: ProgressStatus,
  currentUser: { id: string; name: string; role: UserRole }
): Promise<ProgressTask> {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  if (!permissions.canEdit) {
    throw new Error('Bạn không có quyền cập nhật trạng thái');
  }
  
  let progress = 0;
  let actualStartDate: string | undefined;
  let actualEndDate: string | undefined;
  
  switch (status) {
    case ProgressStatus.IN_PROGRESS:
      progress = 50;
      actualStartDate = new Date().toISOString();
      break;
    case ProgressStatus.COMPLETED:
      progress = 100;
      actualEndDate = new Date().toISOString();
      break;
    case ProgressStatus.DELAYED:
      progress = 30;
      break;
  }
  
  return updateTask(taskId, { status, progress, actualStartDate, actualEndDate }, currentUser);
}

/**
 * Add photo to task
 */
export async function addTaskPhoto(
  input: AddPhotoInput, 
  currentUser: { id: string; name: string; role: UserRole }
): Promise<ProgressPhoto> {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  if (!permissions.canEdit) {
    throw new Error('Bạn không có quyền thêm ảnh');
  }
  
  try {
    return await apiFetch<ProgressPhoto>(`/progress/tasks/${input.taskId}/photos`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch {
    const photo: ProgressPhoto = {
      id: generateId(),
      url: input.url,
      caption: input.caption,
      takenAt: new Date().toISOString(),
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name,
      location: input.location,
    };
    
    const task = MOCK_TASKS.find(t => t.id === input.taskId);
    if (task) {
      task.photos.push(photo);
      task.updatedAt = new Date().toISOString();
      task.updatedBy = currentUser.id;
      task.updatedByName = currentUser.name;
      task.updatedByRole = currentUser.role;
    }
    
    return photo;
  }
}

/**
 * Delete photo from task
 */
export async function deleteTaskPhoto(
  taskId: string, 
  photoId: string,
  currentUser: { id: string; role: UserRole }
): Promise<void> {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  if (!permissions.canEdit) {
    throw new Error('Bạn không có quyền xóa ảnh');
  }
  
  try {
    await apiFetch(`/progress/tasks/${taskId}/photos/${photoId}`, { method: 'DELETE' });
  } catch {
    const task = MOCK_TASKS.find(t => t.id === taskId);
    if (task) {
      task.photos = task.photos.filter(p => p.id !== photoId);
    }
  }
}

/**
 * Add comment to task
 */
export async function addTaskComment(
  input: AddCommentInput, 
  currentUser: { id: string; name: string; role: UserRole; avatar?: string }
): Promise<ProgressComment> {
  try {
    return await apiFetch<ProgressComment>(`/progress/tasks/${input.taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch {
    const comment: ProgressComment = {
      id: generateId(),
      text: input.text,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
    };
    
    const task = MOCK_TASKS.find(t => t.id === input.taskId);
    if (task) {
      task.comments.push(comment);
    }
    
    return comment;
  }
}

/**
 * Get stages for a project
 */
export async function getStages(projectId: string): Promise<ProgressStage[]> {
  try {
    return await apiFetch<ProgressStage[]>(`/projects/${projectId}/stages`);
  } catch {
    return MOCK_STAGES.map(s => ({
      ...s,
      tasks: MOCK_TASKS.filter(t => t.stageId === s.id),
    }));
  }
}

// Export service object
export const progressService = {
  getProjectProgress,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addTaskPhoto,
  deleteTaskPhoto,
  addTaskComment,
  getStages,
};
