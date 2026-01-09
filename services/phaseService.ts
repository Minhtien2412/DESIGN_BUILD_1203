/**
 * Phase Service
 * Handle project phases/milestones via Perfex CRM
 */

import { BackendResult, deleteReq, getJson, patchJson, postJson } from './backendClient';
import { PerfexTask, PerfexTasksService } from './perfexCRM';

// Types
export interface Phase {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  color?: string;
  projectId?: string;
  order?: number;
  tasks?: PhaseTask[];
}

export interface PhaseTask {
  id: string;
  title: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  assignedTo?: string;
}

export interface PhaseListResponse {
  phases: Phase[];
  total: number;
}

export interface CreatePhaseInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  projectId: string;
  color?: string;
}

// API Endpoints
const ENDPOINTS = {
  projectPhases: (projectId: string) => `/api/projects/${projectId}/phases`,
  phase: (id: string) => `/api/phases/${id}`,
  create: '/api/phases',
  update: (id: string) => `/api/phases/${id}`,
  delete: (id: string) => `/api/phases/${id}`,
};

/**
 * Get phases for a project
 * Uses Perfex milestones or backend API
 */
export async function getProjectPhases(
  projectId: string
): Promise<BackendResult<PhaseListResponse>> {
  try {
    // Try backend API first
    const result = await getJson<PhaseListResponse>(ENDPOINTS.projectPhases(projectId), { retry: 2 });
    if (result.ok && result.data?.phases) {
      return result;
    }
  } catch (error) {
    console.log('Backend phases not available, trying Perfex');
  }

  // Fallback to Perfex Tasks grouped as phases
  try {
    const tasksResult = await PerfexTasksService.getByProject(projectId);
    if (tasksResult.data && Array.isArray(tasksResult.data)) {
      const phases = groupTasksIntoPhases(tasksResult.data);
      return { ok: true, data: { phases, total: phases.length } };
    }
  } catch (error) {
    console.error('Error fetching from Perfex:', error);
  }

  return { ok: false, error: { message: 'Could not fetch phases' } };
}

/**
 * Get a single phase by ID
 */
export async function getPhaseById(id: string): Promise<BackendResult<Phase>> {
  return getJson<Phase>(ENDPOINTS.phase(id), { retry: 2 });
}

/**
 * Create a new phase
 */
export async function createPhase(
  input: CreatePhaseInput
): Promise<BackendResult<Phase>> {
  return postJson<Phase>(ENDPOINTS.create, input);
}

/**
 * Update an existing phase
 */
export async function updatePhase(
  id: string,
  input: Partial<CreatePhaseInput>
): Promise<BackendResult<Phase>> {
  return patchJson<Phase>(ENDPOINTS.update(id), input);
}

/**
 * Delete a phase
 */
export async function deletePhase(
  id: string
): Promise<BackendResult<{ success: boolean }>> {
  return deleteReq(ENDPOINTS.delete(id));
}

/**
 * Helper: Group tasks into phases based on milestone or tags
 */
function groupTasksIntoPhases(tasks: PerfexTask[]): Phase[] {
  // Group by milestone_id or create default phases
  const phaseMap = new Map<string, Phase>();
  
  tasks.forEach(task => {
    const milestoneId = task.milestone_id?.toString() || 'default';
    
    if (!phaseMap.has(milestoneId)) {
      phaseMap.set(milestoneId, {
        id: milestoneId,
        name: `Giai đoạn ${phaseMap.size + 1}`,
        description: '',
        startDate: task.startdate || new Date().toISOString().split('T')[0],
        endDate: task.duedate || new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'in_progress',
        tasks: [],
      });
    }
    
    const phase = phaseMap.get(milestoneId)!;
    phase.tasks = phase.tasks || [];
    phase.tasks.push({
      id: task.id.toString(),
      title: task.name,
      progress: task.progress || 0,
      status: mapTaskStatus(task.status),
      dueDate: task.duedate,
    });
  });

  // Calculate phase progress
  phaseMap.forEach(phase => {
    if (phase.tasks && phase.tasks.length > 0) {
      const totalProgress = phase.tasks.reduce((sum, t) => sum + t.progress, 0);
      phase.progress = Math.round(totalProgress / phase.tasks.length);
      
      const allCompleted = phase.tasks.every(t => t.status === 'completed');
      const anyInProgress = phase.tasks.some(t => t.status === 'in_progress');
      
      if (allCompleted) phase.status = 'completed';
      else if (anyInProgress) phase.status = 'in_progress';
      else phase.status = 'pending';
    }
  });

  return Array.from(phaseMap.values());
}

function mapTaskStatus(status?: number | string): 'pending' | 'in_progress' | 'completed' {
  const statusNum = typeof status === 'string' ? parseInt(status) : status;
  if (statusNum === 5) return 'completed';
  if (statusNum === 2 || statusNum === 3 || statusNum === 4) return 'in_progress';
  return 'pending';
}

// Mock data fallback
export const MOCK_PHASE: Phase = {
  id: '1',
  name: 'Giai đoạn 1: Thiết kế',
  description: 'Hoàn thành toàn bộ hồ sơ thiết kế',
  startDate: '2024-01-01',
  endDate: '2024-02-15',
  progress: 65,
  status: 'in_progress',
  tasks: [
    { id: '1', title: 'Thiết kế kiến trúc', progress: 100, status: 'completed' },
    { id: '2', title: 'Thiết kế kết cấu', progress: 80, status: 'in_progress' },
    { id: '3', title: 'Thiết kế MEP', progress: 50, status: 'in_progress' },
    { id: '4', title: 'Dự toán chi phí', progress: 20, status: 'pending' },
  ],
};

export const MOCK_PHASES: Phase[] = [
  MOCK_PHASE,
  {
    id: '2',
    name: 'Giai đoạn 2: Thi công phần thô',
    description: 'Thi công móng, khung, mái',
    startDate: '2024-02-16',
    endDate: '2024-05-15',
    progress: 30,
    status: 'in_progress',
    tasks: [
      { id: '5', title: 'Đào móng', progress: 100, status: 'completed' },
      { id: '6', title: 'Đổ bê tông móng', progress: 50, status: 'in_progress' },
      { id: '7', title: 'Xây tường', progress: 0, status: 'pending' },
    ],
  },
  {
    id: '3',
    name: 'Giai đoạn 3: Hoàn thiện',
    description: 'Sơn, lát gạch, lắp đặt thiết bị',
    startDate: '2024-05-16',
    endDate: '2024-07-15',
    progress: 0,
    status: 'pending',
    tasks: [],
  },
];

export default {
  getProjectPhases,
  getPhaseById,
  createPhase,
  updatePhase,
  deletePhase,
  MOCK_PHASE,
  MOCK_PHASES,
};
