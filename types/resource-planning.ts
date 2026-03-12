/**
 * Resource Planning & Allocation Types
 */

// Enums
export enum ResourceType {
  LABOR = 'LABOR',
  EQUIPMENT = 'EQUIPMENT',
  MATERIAL = 'MATERIAL',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  CONSULTANT = 'CONSULTANT',
  TOOL = 'TOOL',
  VEHICLE = 'VEHICLE',
  FACILITY = 'FACILITY',
  OTHER = 'OTHER',
}

export enum AllocationStatus {
  PLANNED = 'PLANNED',
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  ALLOCATED = 'ALLOCATED',
  IN_USE = 'IN_USE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RELEASED = 'RELEASED',
}

export enum ResourceAvailability {
  AVAILABLE = 'AVAILABLE',
  PARTIALLY_AVAILABLE = 'PARTIALLY_AVAILABLE',
  ALLOCATED = 'ALLOCATED',
  OVERALLOCATED = 'OVERALLOCATED',
  UNAVAILABLE = 'UNAVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum ResourcePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum UtilizationLevel {
  UNDERUTILIZED = 'UNDERUTILIZED', // < 60%
  OPTIMAL = 'OPTIMAL', // 60-85%
  HIGH = 'HIGH', // 85-95%
  OVERUTILIZED = 'OVERUTILIZED', // > 95%
}

export enum ConflictSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
}

// Resource Pool
export interface ResourcePool {
  id: string;
  name: string;
  type: ResourceType;
  description?: string;
  location: string;
  department?: string;
  manager: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  resources: Resource[];
  totalCapacity: number;
  availableCapacity: number;
  utilization: number; // percentage
  status: ResourceAvailability;
  costCenter?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Resource
export interface Resource {
  id: string;
  poolId: string;
  resourceNumber: string;
  name: string;
  type: ResourceType;
  category?: string;
  description?: string;
  
  // Capacity & Availability
  capacity: number;
  unit: string; // hours, pieces, m2, m3, etc.
  availability: ResourceAvailability;
  availableFrom?: string;
  availableUntil?: string;
  
  // Cost Information
  costPerUnit: number;
  currency: string;
  setupCost?: number;
  demobilizationCost?: number;
  
  // Location & Assignment
  location: string;
  currentProjectId?: string;
  currentActivityId?: string;
  homeLocation?: string;
  
  // Skills & Qualifications (for labor)
  skills?: string[];
  certifications?: string[];
  experience?: number; // years
  
  // Equipment Specific
  model?: string;
  serialNumber?: string;
  registrationNumber?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  
  // Performance Metrics
  utilizationRate: number; // percentage
  productivity: number; // units per hour/day
  qualityRating?: number; // 1-5
  reliability?: number; // percentage
  
  // Constraints
  minBookingDuration?: number; // hours/days
  maxContinuousUse?: number; // hours/days
  requiresOperator?: boolean;
  operatorSkillRequired?: string;
  
  // Allocation History
  allocations?: ResourceAllocation[];
  totalAllocatedHours?: number;
  totalAvailableHours?: number;
  
  // Metadata
  attributes?: Record<string, any>;
  documents?: string[];
  photos?: string[];
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Resource Allocation
export interface ResourceAllocation {
  id: string;
  allocationNumber: string;
  projectId: string;
  projectName: string;
  activityId?: string;
  activityName?: string;
  taskId?: string;
  taskName?: string;
  
  // Resource Details
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  
  // Allocation Details
  status: AllocationStatus;
  priority: ResourcePriority;
  quantity: number;
  unit: string;
  
  // Timing
  requestedDate: string;
  approvedDate?: string;
  startDate: string;
  endDate: string;
  duration: number; // days or hours
  actualStartDate?: string;
  actualEndDate?: string;
  actualDuration?: number;
  
  // Cost
  estimatedCost: number;
  actualCost?: number;
  costVariance?: number;
  currency: string;
  
  // Utilization
  plannedUtilization: number; // hours per day or percentage
  actualUtilization?: number;
  utilizationVariance?: number;
  
  // Requestor & Approver
  requestedBy: {
    id: string;
    name: string;
    department: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    date: string;
  };
  
  // Constraints & Requirements
  deliveryLocation?: string;
  specialRequirements?: string[];
  prerequisites?: string[];
  dependencies?: string[];
  
  // Performance
  performanceRating?: number; // 1-5
  productivityAchieved?: number;
  issuesReported?: number;
  
  // Conflicts
  hasConflict?: boolean;
  conflicts?: AllocationConflict[];
  
  // Notes & Attachments
  purpose?: string;
  notes?: string;
  attachments?: string[];
  
  // Workflow
  workflow?: AllocationWorkflowStep[];
  currentStep?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// Allocation Request
export interface AllocationRequest {
  id: string;
  requestNumber: string;
  projectId: string;
  activityId?: string;
  
  resourceType: ResourceType;
  category?: string;
  requiredQuantity: number;
  unit: string;
  
  startDate: string;
  endDate: string;
  priority: ResourcePriority;
  
  justification: string;
  specialRequirements?: string[];
  
  requestedBy: {
    id: string;
    name: string;
    department: string;
    email: string;
    phone: string;
  };
  requestedAt: string;
  
  status: AllocationStatus;
  approvals: ApprovalStep[];
  
  suggestedResources?: Resource[];
  selectedResourceId?: string;
  allocationId?: string;
  
  estimatedCost: number;
  budgetCode?: string;
  
  notes?: string;
  attachments?: string[];
}

// Allocation Conflict
export interface AllocationConflict {
  id: string;
  severity: ConflictSeverity;
  type: 'DOUBLE_BOOKING' | 'OVERALLOCATION' | 'SKILL_MISMATCH' | 'LOCATION_CONFLICT' | 'MAINTENANCE' | 'AVAILABILITY' | 'OTHER';
  
  resourceId: string;
  resourceName: string;
  
  conflictingAllocations: {
    allocationId: string;
    projectName: string;
    activityName?: string;
    startDate: string;
    endDate: string;
    priority: ResourcePriority;
  }[];
  
  overlapPeriod: {
    startDate: string;
    endDate: string;
    overlapHours: number;
  };
  
  impact: {
    affectedProjects: string[];
    affectedActivities: string[];
    estimatedDelay?: number;
    estimatedCost?: number;
    criticalPath?: boolean;
  };
  
  description: string;
  recommendations?: string[];
  
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ACCEPTED';
  resolution?: {
    method: 'RESCHEDULE' | 'SUBSTITUTE' | 'SPLIT' | 'HIRE_EXTERNAL' | 'OTHER';
    description: string;
    resolvedBy: string;
    resolvedAt: string;
  };
  
  detectedAt: string;
  detectedBy?: string;
}

// Resource Calendar
export interface ResourceCalendar {
  resourceId: string;
  resourceName: string;
  type: ResourceType;
  
  workingHours: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  
  allocations: {
    allocationId: string;
    projectName: string;
    activityName?: string;
    startDate: string;
    endDate: string;
    hoursPerDay: number;
    status: AllocationStatus;
    priority: ResourcePriority;
  }[];
  
  blockedPeriods: {
    id: string;
    reason: 'MAINTENANCE' | 'LEAVE' | 'TRAINING' | 'RESERVED' | 'OTHER';
    startDate: string;
    endDate: string;
    description?: string;
  }[];
  
  availability: {
    date: string;
    totalHours: number;
    allocatedHours: number;
    availableHours: number;
    utilizationRate: number;
    status: ResourceAvailability;
  }[];
}

// Resource Leveling
export interface ResourceLeveling {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  
  scope: {
    startDate: string;
    endDate: string;
    activities?: string[];
    resources?: string[];
  };
  
  objectives: {
    minimizeOverallocation: boolean;
    smoothUtilization: boolean;
    minimizeDelay: boolean;
    respectPriorities: boolean;
  };
  
  constraints: {
    maxDelay: number; // days
    respectCriticalPath: boolean;
    respectDependencies: boolean;
    allowSplitting: boolean;
  };
  
  currentState: {
    overallocatedResources: number;
    peakUtilization: number;
    averageUtilization: number;
    totalFloat: number;
  };
  
  proposedChanges: {
    activityId: string;
    activityName: string;
    originalStartDate: string;
    proposedStartDate: string;
    delay: number;
    impactOnCriticalPath: boolean;
    reason: string;
  }[];
  
  projectedOutcome: {
    overallocatedResources: number;
    peakUtilization: number;
    averageUtilization: number;
    projectDelay: number;
    improvement: number; // percentage
  };
  
  status: 'DRAFT' | 'SIMULATED' | 'APPROVED' | 'APPLIED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
  appliedAt?: string;
}

// Resource Forecast
export interface ResourceForecast {
  projectId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  
  resourceType: ResourceType;
  category?: string;
  
  demand: {
    date: string;
    plannedDemand: number;
    forecastedDemand: number;
    confidence: number; // percentage
    peakDemand: number;
    unit: string;
  }[];
  
  supply: {
    date: string;
    availableSupply: number;
    committedSupply: number;
    reservedSupply: number;
    unit: string;
  }[];
  
  gaps: {
    date: string;
    shortfall: number;
    surplus: number;
    unit: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendations: string[];
  }[];
  
  assumptions: string[];
  risks: {
    description: string;
    probability: number;
    impact: number;
    mitigation: string;
  }[];
  
  recommendations: {
    type: 'HIRE' | 'TRAIN' | 'PROCURE' | 'SUBCONTRACT' | 'RESCHEDULE' | 'OTHER';
    description: string;
    quantity: number;
    timeframe: string;
    estimatedCost: number;
    priority: ResourcePriority;
  }[];
  
  generatedAt: string;
  generatedBy?: string;
}

// Resource Analytics
export interface ResourceAnalytics {
  summary: {
    totalResources: number;
    activeAllocations: number;
    utilizationRate: number; // percentage
    availableCapacity: number;
    overallocatedResources: number;
    conflicts: number;
  };
  
  byType: {
    type: ResourceType;
    count: number;
    allocated: number;
    available: number;
    utilizationRate: number;
    averageCost: number;
  }[];
  
  byProject: {
    projectId: string;
    projectName: string;
    allocations: number;
    totalCost: number;
    utilizationRate: number;
    conflicts: number;
  }[];
  
  utilizationTrend: {
    date: string;
    totalCapacity: number;
    allocated: number;
    utilizationRate: number;
    resourceType?: ResourceType;
  }[];
  
  costTrend: {
    date: string;
    plannedCost: number;
    actualCost: number;
    variance: number;
    resourceType?: ResourceType;
  }[];
  
  topResources: {
    resourceId: string;
    resourceName: string;
    utilizationRate: number;
    totalAllocations: number;
    totalRevenue: number;
    performanceRating: number;
  }[];
  
  bottlenecks: {
    resourceType: ResourceType;
    category?: string;
    averageWaitTime: number; // days
    demandSupplyRatio: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  
  efficiency: {
    plannedVsActualUtilization: number; // percentage variance
    allocationAccuracy: number; // percentage
    onTimeAllocationRate: number; // percentage
    resourceTurnover: number; // percentage
  };
}

// Approval Step
export interface ApprovalStep {
  level: number;
  role: string;
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  approvedAt?: string;
  rejectedAt?: string;
  reason?: string;
  comments?: string;
}

// Allocation Workflow Step
export interface AllocationWorkflowStep {
  step: number;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  assignee?: string;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

// API Parameter Types
export interface GetResourcesParams {
  poolId?: string;
  type?: ResourceType;
  category?: string;
  availability?: ResourceAvailability;
  location?: string;
  skills?: string[];
  fromDate?: string;
  toDate?: string;
}

export interface GetAllocationsParams {
  projectId?: string;
  resourceId?: string;
  status?: AllocationStatus;
  priority?: ResourcePriority;
  type?: ResourceType;
  fromDate?: string;
  toDate?: string;
}

export interface CreateResourceParams {
  poolId: string;
  name: string;
  type: ResourceType;
  category?: string;
  description?: string;
  capacity: number;
  unit: string;
  costPerUnit: number;
  currency: string;
  location: string;
  skills?: string[];
  certifications?: string[];
  model?: string;
  serialNumber?: string;
  attributes?: Record<string, any>;
}

export interface CreateAllocationParams {
  projectId: string;
  activityId?: string;
  taskId?: string;
  resourceId: string;
  quantity: number;
  unit: string;
  startDate: string;
  endDate: string;
  priority: ResourcePriority;
  plannedUtilization: number;
  deliveryLocation?: string;
  specialRequirements?: string[];
  purpose?: string;
  notes?: string;
}

export interface UpdateAllocationParams {
  id: string;
  status?: AllocationStatus;
  quantity?: number;
  startDate?: string;
  endDate?: string;
  priority?: ResourcePriority;
  actualStartDate?: string;
  actualEndDate?: string;
  actualUtilization?: number;
  actualCost?: number;
  performanceRating?: number;
  notes?: string;
}

export interface CreateAllocationRequestParams {
  projectId: string;
  activityId?: string;
  resourceType: ResourceType;
  category?: string;
  requiredQuantity: number;
  unit: string;
  startDate: string;
  endDate: string;
  priority: ResourcePriority;
  justification: string;
  specialRequirements?: string[];
  estimatedCost: number;
  budgetCode?: string;
}

export interface ResourceLevelingParams {
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  activities?: string[];
  resources?: string[];
  objectives: {
    minimizeOverallocation: boolean;
    smoothUtilization: boolean;
    minimizeDelay: boolean;
  };
  constraints: {
    maxDelay: number;
    respectCriticalPath: boolean;
  };
}
