/**
 * Project Mindmap API Service
 * CRUD operations for mindmap nodes, connections, todos
 * Role-based filtering and authorization
 */

import {
    CreateConnectionDto,
    CreateNodeDto,
    CreateTodoDto,
    Customer,
    CustomerProject,
    MindmapData,
    MindmapNode,
    MindmapRole,
    NodeConnection,
    ProjectTodo,
    UpdateNodeDto,
    UpdateTodoDto,
} from '@/types/project-mindmap';
import { apiFetch } from './api';

const API_BASE = '/projects/mindmap';

// ==================== CUSTOMER APIs ====================

/**
 * Get all customers (Manager/Admin only)
 */
export async function getCustomers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ customers: Customer[]; total: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await apiFetch(`${API_BASE}/customers?${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer> {
  try {
    const response = await apiFetch(`${API_BASE}/customers/${customerId}`);
    return response;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}

/**
 * Get projects by customer ID
 */
export async function getCustomerProjects(
  customerId: string,
  params?: {
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ projects: CustomerProject[]; total: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await apiFetch(
      `${API_BASE}/customers/${customerId}/projects?${queryParams}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching customer projects:', error);
    throw error;
  }
}

// ==================== PROJECT APIs ====================

/**
 * Get all projects (filtered by role)
 * - Manager/Admin: All projects
 * - Contractor: Assigned projects
 * - Client: Own projects
 */
export async function getProjects(params?: {
  status?: string;
  search?: string;
  customerId?: string;
  role?: MindmapRole;
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<{ projects: CustomerProject[]; total: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await apiFetch(`${API_BASE}/projects?${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * Get project by ID with full mindmap data
 */
export async function getProjectById(projectId: string): Promise<CustomerProject> {
  try {
    const response = await apiFetch(`${API_BASE}/projects/${projectId}`);
    return response;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

/**
 * Get full mindmap data for a project (nodes, connections, todos)
 */
export async function getProjectMindmap(projectId: string): Promise<MindmapData> {
  try {
    const response = await apiFetch(`${API_BASE}/projects/${projectId}/mindmap`);
    return response;
  } catch (error) {
    console.error('Error fetching project mindmap:', error);
    throw error;
  }
}

/**
 * Create new project
 */
export async function createProject(data: {
  customerId: string;
  name: string;
  description?: string;
  address: string;
  projectType: string;
  estimatedBudget: number;
  plannedStartDate: string;
  plannedEndDate: string;
}): Promise<CustomerProject> {
  try {
    const response = await apiFetch(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  data: Partial<CustomerProject>
): Promise<CustomerProject> {
  try {
    const response = await apiFetch(`${API_BASE}/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await apiFetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// ==================== MINDMAP NODE APIs ====================

/**
 * Get all nodes for a project
 */
export async function getProjectNodes(
  projectId: string,
  params?: {
    layer?: string;
    status?: string;
  }
): Promise<MindmapNode[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.layer) queryParams.append('layer', params.layer);
    if (params?.status) queryParams.append('status', params.status);
    
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/nodes?${queryParams}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching nodes:', error);
    throw error;
  }
}

/**
 * Get node by ID
 */
export async function getNodeById(
  projectId: string,
  nodeId: string
): Promise<MindmapNode> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/nodes/${nodeId}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching node:', error);
    throw error;
  }
}

/**
 * Create new node
 */
export async function createNode(data: CreateNodeDto): Promise<MindmapNode> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${data.projectId}/nodes`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error('Error creating node:', error);
    throw error;
  }
}

/**
 * Update node
 */
export async function updateNode(
  projectId: string,
  nodeId: string,
  data: UpdateNodeDto
): Promise<MindmapNode> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/nodes/${nodeId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating node:', error);
    throw error;
  }
}

/**
 * Update node position (drag-drop)
 */
export async function updateNodePosition(
  projectId: string,
  nodeId: string,
  position: { x: number; y: number }
): Promise<MindmapNode> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/nodes/${nodeId}/position`,
      {
        method: 'PATCH',
        body: JSON.stringify({ position }),
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating node position:', error);
    throw error;
  }
}

/**
 * Update node status
 */
export async function updateNodeStatus(
  projectId: string,
  nodeId: string,
  status: string,
  note?: string
): Promise<MindmapNode> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/nodes/${nodeId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating node status:', error);
    throw error;
  }
}

/**
 * Delete node
 */
export async function deleteNode(
  projectId: string,
  nodeId: string
): Promise<void> {
  try {
    await apiFetch(
      `${API_BASE}/projects/${projectId}/nodes/${nodeId}`,
      {
        method: 'DELETE',
      }
    );
  } catch (error) {
    console.error('Error deleting node:', error);
    throw error;
  }
}

/**
 * Batch update nodes (for multiple position updates)
 */
export async function batchUpdateNodes(
  projectId: string,
  updates: { nodeId: string; data: UpdateNodeDto }[]
): Promise<MindmapNode[]> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/nodes/batch`,
      {
        method: 'PATCH',
        body: JSON.stringify({ updates }),
      }
    );
    return response;
  } catch (error) {
    console.error('Error batch updating nodes:', error);
    throw error;
  }
}

// ==================== CONNECTION APIs ====================

/**
 * Get all connections for a project
 */
export async function getProjectConnections(
  projectId: string
): Promise<NodeConnection[]> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/connections`
    );
    return response;
  } catch (error) {
    console.error('Error fetching connections:', error);
    throw error;
  }
}

/**
 * Create new connection
 */
export async function createConnection(
  data: CreateConnectionDto
): Promise<NodeConnection> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${data.projectId}/connections`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw error;
  }
}

/**
 * Update connection
 */
export async function updateConnection(
  projectId: string,
  connectionId: string,
  data: Partial<NodeConnection>
): Promise<NodeConnection> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/connections/${connectionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating connection:', error);
    throw error;
  }
}

/**
 * Delete connection
 */
export async function deleteConnection(
  projectId: string,
  connectionId: string
): Promise<void> {
  try {
    await apiFetch(
      `${API_BASE}/projects/${projectId}/connections/${connectionId}`,
      {
        method: 'DELETE',
      }
    );
  } catch (error) {
    console.error('Error deleting connection:', error);
    throw error;
  }
}

// ==================== TODO APIs ====================

/**
 * Get all todos for a project
 */
export async function getProjectTodos(
  projectId: string,
  params?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    nodeId?: string;
  }
): Promise<ProjectTodo[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params?.nodeId) queryParams.append('nodeId', params.nodeId);
    
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/todos?${queryParams}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

/**
 * Get todo by ID
 */
export async function getTodoById(
  projectId: string,
  todoId: string
): Promise<ProjectTodo> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/todos/${todoId}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching todo:', error);
    throw error;
  }
}

/**
 * Create new todo (Manager/Admin creates, assigns to Contractor)
 */
export async function createTodo(data: CreateTodoDto): Promise<ProjectTodo> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${data.projectId}/todos`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
}

/**
 * Update todo
 */
export async function updateTodo(
  projectId: string,
  todoId: string,
  data: UpdateTodoDto
): Promise<ProjectTodo> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/todos/${todoId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
}

/**
 * Update todo status (Contractor marks complete)
 */
export async function updateTodoStatus(
  projectId: string,
  todoId: string,
  status: string
): Promise<ProjectTodo> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/todos/${todoId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating todo status:', error);
    throw error;
  }
}

/**
 * Toggle todo checklist item
 */
export async function toggleTodoChecklistItem(
  projectId: string,
  todoId: string,
  checklistItemId: string,
  completed: boolean
): Promise<ProjectTodo> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/todos/${todoId}/checklist/${checklistItemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      }
    );
    return response;
  } catch (error) {
    console.error('Error toggling checklist item:', error);
    throw error;
  }
}

/**
 * Delete todo
 */
export async function deleteTodo(
  projectId: string,
  todoId: string
): Promise<void> {
  try {
    await apiFetch(
      `${API_BASE}/projects/${projectId}/todos/${todoId}`,
      {
        method: 'DELETE',
      }
    );
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

// ==================== ASSIGNMENT APIs ====================

/**
 * Assign contractor to project
 */
export async function assignContractor(
  projectId: string,
  userId: string,
  role: MindmapRole
): Promise<void> {
  try {
    await apiFetch(
      `${API_BASE}/projects/${projectId}/assign`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      }
    );
  } catch (error) {
    console.error('Error assigning contractor:', error);
    throw error;
  }
}

/**
 * Remove contractor from project
 */
export async function removeContractor(
  projectId: string,
  userId: string
): Promise<void> {
  try {
    await apiFetch(
      `${API_BASE}/projects/${projectId}/assign/${userId}`,
      {
        method: 'DELETE',
      }
    );
  } catch (error) {
    console.error('Error removing contractor:', error);
    throw error;
  }
}

/**
 * Assign user to node
 */
export async function assignUserToNode(
  projectId: string,
  nodeId: string,
  userId: string,
  role: MindmapRole
): Promise<MindmapNode> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/nodes/${nodeId}/assign`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      }
    );
    return response;
  } catch (error) {
    console.error('Error assigning user to node:', error);
    throw error;
  }
}

// ==================== STATISTICS APIs ====================

/**
 * Get project statistics
 */
export async function getProjectStats(projectId: string): Promise<{
  totalNodes: number;
  completedNodes: number;
  totalTodos: number;
  completedTodos: number;
  progressPercent: number;
  nodesByStatus: Record<string, number>;
  todosByStatus: Record<string, number>;
}> {
  try {
    const response = await apiFetch(
      `${API_BASE}/projects/${projectId}/stats`
    );
    return response;
  } catch (error) {
    console.error('Error fetching project stats:', error);
    throw error;
  }
}

/**
 * Get user's dashboard statistics
 */
export async function getDashboardStats(
  userId: string,
  role: MindmapRole
): Promise<{
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingTodos: number;
  overdueTodos: number;
}> {
  try {
    const response = await apiFetch(
      `${API_BASE}/dashboard/stats?userId=${userId}&role=${role}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export default {
  // Customers
  getCustomers,
  getCustomerById,
  getCustomerProjects,
  
  // Projects
  getProjects,
  getProjectById,
  getProjectMindmap,
  createProject,
  updateProject,
  deleteProject,
  
  // Nodes
  getProjectNodes,
  getNodeById,
  createNode,
  updateNode,
  updateNodePosition,
  updateNodeStatus,
  deleteNode,
  batchUpdateNodes,
  
  // Connections
  getProjectConnections,
  createConnection,
  updateConnection,
  deleteConnection,
  
  // Todos
  getProjectTodos,
  getTodoById,
  createTodo,
  updateTodo,
  updateTodoStatus,
  toggleTodoChecklistItem,
  deleteTodo,
  
  // Assignments
  assignContractor,
  removeContractor,
  assignUserToNode,
  
  // Statistics
  getProjectStats,
  getDashboardStats,
};
