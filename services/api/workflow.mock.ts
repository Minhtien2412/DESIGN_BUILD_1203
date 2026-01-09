/**
 * Workflow Map Mock Service
 * 
 * Interactive workflow visualization like metro map
 * - Drag & drop nodes
 * - Create/Edit/Delete milestones
 * - Task dependencies
 * - Progress tracking
 */

// ==================== TYPES & INTERFACES ====================

export type NodeStatus = 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'blocked';
export type NodeType = 'milestone' | 'task' | 'phase' | 'checkpoint';
export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  status: NodeStatus;
  progress: number; // 0-100
  position: {
    x: number;
    y: number;
  };
  phase?: string;
  startDate?: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  assignedTo?: string[];
  dependencies: string[]; // array of node IDs
  color?: string;
  icon?: string;
}

export interface WorkflowConnection {
  id: string;
  from: string; // node ID
  to: string; // node ID
  type: DependencyType;
  lag?: number; // days
}

export interface WorkflowPhase {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface WorkflowMap {
  id: string;
  projectId: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  phases: WorkflowPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStats {
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  delayedNodes: number;
  overallProgress: number;
  criticalPathLength: number;
  estimatedCompletion: string;
}

// ==================== MOCK DATA ====================

const MOCK_PHASES: WorkflowPhase[] = [
  { id: 'phase-1', name: 'Chuẩn bị', color: '#3b82f6', order: 1 },
  { id: 'phase-2', name: 'Móng', color: '#666666', order: 2 },
  { id: 'phase-3', name: 'Kết cấu', color: '#0066CC', order: 3 },
  { id: 'phase-4', name: 'Hoàn thiện', color: '#0066CC', order: 4 },
  { id: 'phase-5', name: 'Bàn giao', color: '#000000', order: 5 }
];

const MOCK_NODES: WorkflowNode[] = [
  // Phase 1: Chuẩn bị
  {
    id: 'node-1',
    type: 'milestone',
    title: 'Khởi công',
    description: 'Lễ khởi công dự án',
    status: 'completed',
    progress: 100,
    position: { x: 50, y: 200 },
    phase: 'phase-1',
    startDate: '2025-10-01',
    endDate: '2025-10-01',
    actualStartDate: '2025-10-01',
    actualEndDate: '2025-10-01',
    assignedTo: ['Nguyễn Văn A'],
    dependencies: [],
    color: '#3b82f6',
    icon: 'flag'
  },
  {
    id: 'node-2',
    type: 'task',
    title: 'San lấp mặt bằng',
    description: 'San lấp và chuẩn bị mặt bằng thi công',
    status: 'completed',
    progress: 100,
    position: { x: 200, y: 150 },
    phase: 'phase-1',
    startDate: '2025-10-02',
    endDate: '2025-10-10',
    actualStartDate: '2025-10-02',
    actualEndDate: '2025-10-09',
    assignedTo: ['Trần Văn B'],
    dependencies: ['node-1'],
    color: '#3b82f6'
  },
  {
    id: 'node-3',
    type: 'task',
    title: 'Lập hàng rào',
    description: 'Lập hàng rào tôn bảo vệ công trường',
    status: 'completed',
    progress: 100,
    position: { x: 200, y: 250 },
    phase: 'phase-1',
    startDate: '2025-10-02',
    endDate: '2025-10-05',
    actualStartDate: '2025-10-02',
    actualEndDate: '2025-10-05',
    assignedTo: ['Lê Văn C'],
    dependencies: ['node-1'],
    color: '#3b82f6'
  },

  // Phase 2: Móng
  {
    id: 'node-4',
    type: 'milestone',
    title: 'Bắt đầu móng',
    status: 'completed',
    progress: 100,
    position: { x: 400, y: 200 },
    phase: 'phase-2',
    startDate: '2025-10-11',
    endDate: '2025-10-11',
    actualStartDate: '2025-10-11',
    actualEndDate: '2025-10-11',
    dependencies: ['node-2', 'node-3'],
    color: '#666666',
    icon: 'checkmark-circle'
  },
  {
    id: 'node-5',
    type: 'task',
    title: 'Đào móng',
    description: 'Đào móng theo bản vẽ thiết kế',
    status: 'completed',
    progress: 100,
    position: { x: 550, y: 150 },
    phase: 'phase-2',
    startDate: '2025-10-12',
    endDate: '2025-10-20',
    actualStartDate: '2025-10-12',
    actualEndDate: '2025-10-21',
    assignedTo: ['Phạm Văn D'],
    dependencies: ['node-4'],
    color: '#666666'
  },
  {
    id: 'node-6',
    type: 'task',
    title: 'Lót bê tông móng',
    status: 'completed',
    progress: 100,
    position: { x: 700, y: 150 },
    phase: 'phase-2',
    startDate: '2025-10-22',
    endDate: '2025-10-25',
    actualStartDate: '2025-10-22',
    actualEndDate: '2025-10-25',
    dependencies: ['node-5'],
    color: '#666666'
  },
  {
    id: 'node-7',
    type: 'task',
    title: 'Cốt thép móng',
    description: 'Gia công và lắp dựng cốt thép móng',
    status: 'completed',
    progress: 100,
    position: { x: 550, y: 250 },
    phase: 'phase-2',
    startDate: '2025-10-26',
    endDate: '2025-11-05',
    actualStartDate: '2025-10-26',
    actualEndDate: '2025-11-04',
    assignedTo: ['Hoàng Văn E'],
    dependencies: ['node-6'],
    color: '#666666'
  },
  {
    id: 'node-8',
    type: 'task',
    title: 'Đổ bê tông móng',
    status: 'completed',
    progress: 100,
    position: { x: 700, y: 250 },
    phase: 'phase-2',
    startDate: '2025-11-06',
    endDate: '2025-11-10',
    actualStartDate: '2025-11-06',
    actualEndDate: '2025-11-10',
    dependencies: ['node-7'],
    color: '#666666'
  },

  // Phase 3: Kết cấu
  {
    id: 'node-9',
    type: 'milestone',
    title: 'Hoàn thành móng',
    status: 'completed',
    progress: 100,
    position: { x: 850, y: 200 },
    phase: 'phase-3',
    startDate: '2025-11-11',
    endDate: '2025-11-11',
    actualStartDate: '2025-11-11',
    actualEndDate: '2025-11-11',
    dependencies: ['node-8'],
    color: '#0066CC',
    icon: 'checkmark-done'
  },
  {
    id: 'node-10',
    type: 'task',
    title: 'Cột tầng 1',
    description: 'Cốt thép và đổ bê tông cột tầng 1',
    status: 'in-progress',
    progress: 75,
    position: { x: 1000, y: 100 },
    phase: 'phase-3',
    startDate: '2025-11-12',
    endDate: '2025-11-20',
    actualStartDate: '2025-11-12',
    assignedTo: ['Vũ Văn F'],
    dependencies: ['node-9'],
    color: '#0066CC'
  },
  {
    id: 'node-11',
    type: 'task',
    title: 'Dầm sàn tầng 1',
    status: 'in-progress',
    progress: 60,
    position: { x: 1150, y: 100 },
    phase: 'phase-3',
    startDate: '2025-11-21',
    endDate: '2025-11-30',
    actualStartDate: '2025-11-21',
    dependencies: ['node-10'],
    color: '#0066CC'
  },
  {
    id: 'node-12',
    type: 'task',
    title: 'Cột tầng 2',
    status: 'not-started',
    progress: 0,
    position: { x: 1000, y: 200 },
    phase: 'phase-3',
    startDate: '2025-12-01',
    endDate: '2025-12-10',
    dependencies: ['node-11'],
    color: '#0066CC'
  },
  {
    id: 'node-13',
    type: 'task',
    title: 'Dầm sàn tầng 2',
    status: 'not-started',
    progress: 0,
    position: { x: 1150, y: 200 },
    phase: 'phase-3',
    startDate: '2025-12-11',
    endDate: '2025-12-20',
    dependencies: ['node-12'],
    color: '#0066CC'
  },
  {
    id: 'node-14',
    type: 'task',
    title: 'Cột tầng 3',
    status: 'not-started',
    progress: 0,
    position: { x: 1000, y: 300 },
    phase: 'phase-3',
    startDate: '2025-12-21',
    endDate: '2025-12-30',
    dependencies: ['node-13'],
    color: '#0066CC'
  },
  {
    id: 'node-15',
    type: 'task',
    title: 'Dầm sàn tầng 3',
    status: 'not-started',
    progress: 0,
    position: { x: 1150, y: 300 },
    phase: 'phase-3',
    startDate: '2025-12-31',
    endDate: '2026-01-10',
    dependencies: ['node-14'],
    color: '#0066CC'
  },

  // Phase 4: Hoàn thiện
  {
    id: 'node-16',
    type: 'milestone',
    title: 'Hoàn thành kết cấu',
    status: 'not-started',
    progress: 0,
    position: { x: 1300, y: 200 },
    phase: 'phase-4',
    startDate: '2026-01-11',
    endDate: '2026-01-11',
    dependencies: ['node-15'],
    color: '#0066CC',
    icon: 'build'
  },
  {
    id: 'node-17',
    type: 'task',
    title: 'Xây tường',
    status: 'not-started',
    progress: 0,
    position: { x: 1450, y: 100 },
    phase: 'phase-4',
    startDate: '2026-01-12',
    endDate: '2026-01-25',
    dependencies: ['node-16'],
    color: '#0066CC'
  },
  {
    id: 'node-18',
    type: 'task',
    title: 'Tô trát',
    status: 'not-started',
    progress: 0,
    position: { x: 1600, y: 100 },
    phase: 'phase-4',
    startDate: '2026-01-26',
    endDate: '2026-02-10',
    dependencies: ['node-17'],
    color: '#0066CC'
  },
  {
    id: 'node-19',
    type: 'task',
    title: 'Lắp điện nước',
    status: 'not-started',
    progress: 0,
    position: { x: 1450, y: 200 },
    phase: 'phase-4',
    startDate: '2026-01-20',
    endDate: '2026-02-05',
    dependencies: ['node-17'],
    color: '#0066CC'
  },
  {
    id: 'node-20',
    type: 'task',
    title: 'Sơn',
    status: 'not-started',
    progress: 0,
    position: { x: 1750, y: 150 },
    phase: 'phase-4',
    startDate: '2026-02-11',
    endDate: '2026-02-20',
    dependencies: ['node-18', 'node-19'],
    color: '#0066CC'
  },

  // Phase 5: Bàn giao
  {
    id: 'node-21',
    type: 'milestone',
    title: 'Hoàn thành',
    status: 'not-started',
    progress: 0,
    position: { x: 1900, y: 200 },
    phase: 'phase-5',
    startDate: '2026-02-25',
    endDate: '2026-02-25',
    dependencies: ['node-20'],
    color: '#000000',
    icon: 'trophy'
  }
];

const MOCK_CONNECTIONS: WorkflowConnection[] = [
  { id: 'conn-1', from: 'node-1', to: 'node-2', type: 'finish-to-start' },
  { id: 'conn-2', from: 'node-1', to: 'node-3', type: 'finish-to-start' },
  { id: 'conn-3', from: 'node-2', to: 'node-4', type: 'finish-to-start' },
  { id: 'conn-4', from: 'node-3', to: 'node-4', type: 'finish-to-start' },
  { id: 'conn-5', from: 'node-4', to: 'node-5', type: 'finish-to-start' },
  { id: 'conn-6', from: 'node-5', to: 'node-6', type: 'finish-to-start' },
  { id: 'conn-7', from: 'node-6', to: 'node-7', type: 'finish-to-start' },
  { id: 'conn-8', from: 'node-7', to: 'node-8', type: 'finish-to-start' },
  { id: 'conn-9', from: 'node-8', to: 'node-9', type: 'finish-to-start' },
  { id: 'conn-10', from: 'node-9', to: 'node-10', type: 'finish-to-start' },
  { id: 'conn-11', from: 'node-10', to: 'node-11', type: 'finish-to-start' },
  { id: 'conn-12', from: 'node-11', to: 'node-12', type: 'finish-to-start' },
  { id: 'conn-13', from: 'node-12', to: 'node-13', type: 'finish-to-start' },
  { id: 'conn-14', from: 'node-13', to: 'node-14', type: 'finish-to-start' },
  { id: 'conn-15', from: 'node-14', to: 'node-15', type: 'finish-to-start' },
  { id: 'conn-16', from: 'node-15', to: 'node-16', type: 'finish-to-start' },
  { id: 'conn-17', from: 'node-16', to: 'node-17', type: 'finish-to-start' },
  { id: 'conn-18', from: 'node-17', to: 'node-18', type: 'finish-to-start' },
  { id: 'conn-19', from: 'node-17', to: 'node-19', type: 'finish-to-start' },
  { id: 'conn-20', from: 'node-18', to: 'node-20', type: 'finish-to-start' },
  { id: 'conn-21', from: 'node-19', to: 'node-20', type: 'finish-to-start' },
  { id: 'conn-22', from: 'node-20', to: 'node-21', type: 'finish-to-start' }
];

let MOCK_WORKFLOW: WorkflowMap = {
  id: 'workflow-1',
  projectId: 'project-1',
  name: 'Quy trình xây dựng chính',
  nodes: [...MOCK_NODES],
  connections: [...MOCK_CONNECTIONS],
  phases: [...MOCK_PHASES],
  createdAt: '2025-10-01T00:00:00Z',
  updatedAt: new Date().toISOString()
};

// ==================== SERVICE CLASS ====================

export class WorkflowService {
  private static workflow = { ...MOCK_WORKFLOW };

  // Get workflow map
  static async getWorkflow(projectId: string): Promise<WorkflowMap> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...this.workflow };
  }

  // Update node position (drag & drop)
  static async updateNodePosition(nodeId: string, position: { x: number; y: number }): Promise<WorkflowNode> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const nodeIndex = this.workflow.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) throw new Error('Node not found');

    this.workflow.nodes[nodeIndex].position = position;
    this.workflow.updatedAt = new Date().toISOString();

    return { ...this.workflow.nodes[nodeIndex] };
  }

  // Create new node
  static async createNode(node: Omit<WorkflowNode, 'id'>): Promise<WorkflowNode> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newNode: WorkflowNode = {
      ...node,
      id: `node-${Date.now()}`
    };

    this.workflow.nodes.push(newNode);
    this.workflow.updatedAt = new Date().toISOString();

    return { ...newNode };
  }

  // Update node
  static async updateNode(nodeId: string, data: Partial<WorkflowNode>): Promise<WorkflowNode> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const nodeIndex = this.workflow.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) throw new Error('Node not found');

    this.workflow.nodes[nodeIndex] = {
      ...this.workflow.nodes[nodeIndex],
      ...data
    };
    this.workflow.updatedAt = new Date().toISOString();

    return { ...this.workflow.nodes[nodeIndex] };
  }

  // Delete node
  static async deleteNode(nodeId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Remove node
    this.workflow.nodes = this.workflow.nodes.filter(n => n.id !== nodeId);

    // Remove connections
    this.workflow.connections = this.workflow.connections.filter(
      c => c.from !== nodeId && c.to !== nodeId
    );

    // Remove dependencies from other nodes
    this.workflow.nodes.forEach(node => {
      node.dependencies = node.dependencies.filter(dep => dep !== nodeId);
    });

    this.workflow.updatedAt = new Date().toISOString();
  }

  // Create connection
  static async createConnection(connection: Omit<WorkflowConnection, 'id'>): Promise<WorkflowConnection> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newConnection: WorkflowConnection = {
      ...connection,
      id: `conn-${Date.now()}`
    };

    this.workflow.connections.push(newConnection);

    // Update node dependencies
    const toNode = this.workflow.nodes.find(n => n.id === connection.to);
    if (toNode && !toNode.dependencies.includes(connection.from)) {
      toNode.dependencies.push(connection.from);
    }

    this.workflow.updatedAt = new Date().toISOString();

    return { ...newConnection };
  }

  // Delete connection
  static async deleteConnection(connectionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const connection = this.workflow.connections.find(c => c.id === connectionId);
    if (!connection) throw new Error('Connection not found');

    // Remove from connections
    this.workflow.connections = this.workflow.connections.filter(c => c.id !== connectionId);

    // Remove from node dependencies
    const toNode = this.workflow.nodes.find(n => n.id === connection.to);
    if (toNode) {
      toNode.dependencies = toNode.dependencies.filter(dep => dep !== connection.from);
    }

    this.workflow.updatedAt = new Date().toISOString();
  }

  // Get statistics
  static async getStats(projectId: string): Promise<WorkflowStats> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const nodes = this.workflow.nodes;
    const totalNodes = nodes.length;
    const completedNodes = nodes.filter(n => n.status === 'completed').length;
    const inProgressNodes = nodes.filter(n => n.status === 'in-progress').length;
    const delayedNodes = nodes.filter(n => n.status === 'delayed').length;

    const overallProgress = totalNodes > 0
      ? Math.round(nodes.reduce((sum, n) => sum + n.progress, 0) / totalNodes)
      : 0;

    // Simple critical path calculation (just count nodes in longest path)
    const criticalPathLength = nodes.length;

    // Estimate completion based on last node
    const lastNode = nodes[nodes.length - 1];
    const estimatedCompletion = lastNode?.endDate || new Date().toISOString();

    return {
      totalNodes,
      completedNodes,
      inProgressNodes,
      delayedNodes,
      overallProgress,
      criticalPathLength,
      estimatedCompletion
    };
  }

  // Mark node as completed
  static async completeNode(nodeId: string): Promise<WorkflowNode> {
    return this.updateNode(nodeId, {
      status: 'completed',
      progress: 100,
      actualEndDate: new Date().toISOString()
    });
  }

  // Reset workflow to original state
  static async resetWorkflow(): Promise<WorkflowMap> {
    this.workflow = {
      ...MOCK_WORKFLOW,
      nodes: [...MOCK_NODES],
      connections: [...MOCK_CONNECTIONS],
      phases: [...MOCK_PHASES]
    };
    return { ...this.workflow };
  }
}
