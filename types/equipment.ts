/**
 * Equipment & Machinery Management Types
 * Heavy equipment, tools, and machinery tracking
 */

// Enums
export enum EquipmentType {
  EXCAVATOR = 'EXCAVATOR',
  BULLDOZER = 'BULLDOZER',
  CRANE = 'CRANE',
  FORKLIFT = 'FORKLIFT',
  CONCRETE_MIXER = 'CONCRETE_MIXER',
  CONCRETE_PUMP = 'CONCRETE_PUMP',
  LOADER = 'LOADER',
  BACKHOE = 'BACKHOE',
  DUMP_TRUCK = 'DUMP_TRUCK',
  GRADER = 'GRADER',
  ROLLER = 'ROLLER',
  PILING_RIG = 'PILING_RIG',
  TOWER_CRANE = 'TOWER_CRANE',
  MOBILE_CRANE = 'MOBILE_CRANE',
  SCAFFOLDING = 'SCAFFOLDING',
  GENERATOR = 'GENERATOR',
  COMPRESSOR = 'COMPRESSOR',
  WELDING_MACHINE = 'WELDING_MACHINE',
  CUTTING_MACHINE = 'CUTTING_MACHINE',
  DRILLING_MACHINE = 'DRILLING_MACHINE',
  POWER_TOOLS = 'POWER_TOOLS',
  HAND_TOOLS = 'HAND_TOOLS',
  SAFETY_EQUIPMENT = 'SAFETY_EQUIPMENT',
  SURVEYING_EQUIPMENT = 'SURVEYING_EQUIPMENT',
  TESTING_EQUIPMENT = 'TESTING_EQUIPMENT',
  OTHER = 'OTHER',
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  RESERVED = 'RESERVED',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  RETIRED = 'RETIRED',
}

export enum EquipmentCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL',
}

export enum OwnershipType {
  OWNED = 'OWNED',
  RENTED = 'RENTED',
  LEASED = 'LEASED',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  EMERGENCY = 'EMERGENCY',
  INSPECTION = 'INSPECTION',
  CALIBRATION = 'CALIBRATION',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum UsageLogType {
  ASSIGNMENT = 'ASSIGNMENT',
  RETURN = 'RETURN',
  TRANSFER = 'TRANSFER',
  INSPECTION = 'INSPECTION',
  FUEL_REFILL = 'FUEL_REFILL',
  DAMAGE_REPORT = 'DAMAGE_REPORT',
}

export enum FuelType {
  DIESEL = 'DIESEL',
  GASOLINE = 'GASOLINE',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  LPG = 'LPG',
  CNG = 'CNG',
  NONE = 'NONE',
}

// Interfaces
export interface Equipment {
  id: string;
  projectId: string;
  equipmentNumber: string; // e.g., "EXC-001"
  type: EquipmentType;
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  yearOfManufacture?: number;
  
  // Status & Condition
  status: EquipmentStatus;
  condition: EquipmentCondition;
  ownershipType: OwnershipType;
  
  // Specifications
  specifications?: {
    capacity?: string; // e.g., "5 tons", "200 HP"
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      weight?: number;
    };
    enginePower?: string;
    fuelType?: FuelType;
    fuelCapacity?: number; // liters
    workingPressure?: string;
    voltage?: string;
    [key: string]: any;
  };
  
  // Location & Assignment
  currentLocation?: string;
  assignedTo?: string; // User/Worker ID
  assignedToName?: string;
  assignedProject?: string;
  assignedAt?: string;
  expectedReturnDate?: string;
  
  // Financial
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  depreciationRate?: number; // percentage per year
  rentalRate?: number; // per day/hour
  rentalPeriod?: {
    startDate: string;
    endDate: string;
    cost: number;
    vendor?: string;
    contractNumber?: string;
  };
  
  // Operational Data
  operatingHours?: number;
  lastUsedAt?: string;
  nextMaintenanceDue?: string;
  nextInspectionDue?: string;
  warrantyExpiryDate?: string;
  insuranceExpiryDate?: string;
  certificationExpiryDate?: string;
  
  // Documentation
  photos?: string[];
  documents?: string[];
  qrCode?: string;
  barcodeNumber?: string;
  
  // Compliance & Safety
  operatorLicenseRequired?: boolean;
  safetyInspectionRequired?: boolean;
  certificationRequired?: boolean;
  certifications?: string[];
  
  // Notes
  description?: string;
  notes?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  
  // Schedule
  scheduledDate: string;
  scheduledBy: string;
  startedAt?: string;
  completedAt?: string;
  
  // Details
  title: string;
  description: string;
  workPerformed?: string;
  partsReplaced?: {
    partName: string;
    partNumber?: string;
    quantity: number;
    unitCost?: number;
    supplier?: string;
  }[];
  
  // Personnel
  technician?: string;
  technicianName?: string;
  supervisor?: string;
  
  // Costs
  laborCost?: number;
  partsCost?: number;
  otherCosts?: number;
  totalCost?: number;
  
  // Metrics
  downtimeHours?: number;
  nextMaintenanceDate?: string;
  meterReading?: number; // Operating hours at time of maintenance
  
  // Documentation
  photos?: string[];
  documents?: string[];
  checklistCompleted?: boolean;
  checklist?: {
    item: string;
    status: 'PASS' | 'FAIL' | 'N/A';
    notes?: string;
  }[];
  
  // Notes
  notes?: string;
  recommendations?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface UsageLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: UsageLogType;
  
  // Assignment Details
  assignedTo?: string;
  assignedToName?: string;
  assignedBy?: string;
  assignedByName?: string;
  projectId?: string;
  location?: string;
  
  // Time
  startTime: string;
  endTime?: string;
  durationHours?: number;
  
  // Usage Data
  startMeterReading?: number; // Operating hours
  endMeterReading?: number;
  fuelConsumed?: number;
  distanceTraveled?: number;
  
  // Condition Check
  conditionAtStart?: EquipmentCondition;
  conditionAtEnd?: EquipmentCondition;
  
  // Damage/Issues
  damageReported?: boolean;
  damageDescription?: string;
  damagePhotos?: string[];
  repairRequired?: boolean;
  
  // Fuel Refill (if type is FUEL_REFILL)
  fuelType?: FuelType;
  fuelQuantity?: number; // liters
  fuelCost?: number;
  fuelStation?: string;
  receiptNumber?: string;
  
  // Inspection (if type is INSPECTION)
  inspectionPassed?: boolean;
  inspectionNotes?: string;
  inspectorName?: string;
  
  // Notes
  notes?: string;
  signature?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
}

export interface EquipmentInspection {
  id: string;
  equipmentId: string;
  equipmentName: string;
  
  inspectionType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL' | 'PRE_USE' | 'POST_USE' | 'REGULATORY';
  scheduledDate: string;
  inspectedAt?: string;
  inspectedBy: string;
  inspectorName: string;
  
  // Inspection Items
  checklist: {
    category: string;
    items: {
      item: string;
      requirement: string;
      status: 'PASS' | 'FAIL' | 'N/A';
      notes?: string;
      photo?: string;
    }[];
  }[];
  
  // Results
  overallResult: 'PASS' | 'FAIL' | 'CONDITIONAL';
  score?: number; // percentage
  
  // Issues Found
  issuesFound?: {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    correctiveAction?: string;
    dueDate?: string;
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  }[];
  
  // Certification
  certificationIssued?: boolean;
  certificateNumber?: string;
  validUntil?: string;
  
  // Recommendations
  recommendations?: string;
  nextInspectionDate?: string;
  
  // Documentation
  photos?: string[];
  signature?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
}

export interface EquipmentStats {
  totalEquipment: number;
  byStatus: Record<EquipmentStatus, number>;
  byType: Record<EquipmentType, number>;
  byCondition: Record<EquipmentCondition, number>;
  byOwnership: Record<OwnershipType, number>;
  
  utilization: {
    available: number;
    inUse: number;
    utilizationRate: number; // percentage
    avgDailyUsageHours: number;
  };
  
  maintenance: {
    dueThisWeek: number;
    dueThisMonth: number;
    overdue: number;
    completedThisMonth: number;
    avgMaintenanceCost: number;
  };
  
  financial: {
    totalValue: number;
    rentalCostThisMonth: number;
    maintenanceCostThisMonth: number;
    ownedEquipmentValue: number;
    rentedEquipmentCost: number;
  };
  
  issues: {
    needsRepair: number;
    outOfService: number;
    expiringCertifications: number;
    expiringInsurance: number;
  };
}

// API Request/Response Types
export interface GetEquipmentParams {
  projectId: string;
  status?: EquipmentStatus;
  type?: EquipmentType;
  condition?: EquipmentCondition;
  ownershipType?: OwnershipType;
  assignedTo?: string;
  search?: string;
}

export interface CreateEquipmentParams {
  projectId: string;
  equipmentNumber?: string;
  type: EquipmentType;
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  yearOfManufacture?: number;
  status?: EquipmentStatus;
  condition?: EquipmentCondition;
  ownershipType: OwnershipType;
  specifications?: Equipment['specifications'];
  currentLocation?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  rentalRate?: number;
  description?: string;
}

export interface UpdateEquipmentParams extends Partial<CreateEquipmentParams> {
  id: string;
}

export interface GetMaintenanceRecordsParams {
  equipmentId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  fromDate?: string;
  toDate?: string;
}

export interface CreateMaintenanceRecordParams {
  equipmentId: string;
  type: MaintenanceType;
  scheduledDate: string;
  title: string;
  description: string;
  technician?: string;
  estimatedCost?: number;
}

export interface UpdateMaintenanceRecordParams extends Partial<CreateMaintenanceRecordParams> {
  id: string;
  status?: MaintenanceStatus;
  workPerformed?: string;
  partsReplaced?: MaintenanceRecord['partsReplaced'];
  totalCost?: number;
}

export interface CreateUsageLogParams {
  equipmentId: string;
  type: UsageLogType;
  assignedTo?: string;
  projectId?: string;
  location?: string;
  startTime?: string;
  startMeterReading?: number;
  conditionAtStart?: EquipmentCondition;
  notes?: string;
}

export interface UpdateUsageLogParams {
  id: string;
  endTime?: string;
  endMeterReading?: number;
  conditionAtEnd?: EquipmentCondition;
  fuelConsumed?: number;
  damageReported?: boolean;
  damageDescription?: string;
  notes?: string;
}

export interface CreateInspectionParams {
  equipmentId: string;
  inspectionType: EquipmentInspection['inspectionType'];
  scheduledDate: string;
  inspectorName: string;
}

export interface GetEquipmentStatsParams {
  projectId: string;
  fromDate?: string;
  toDate?: string;
}
