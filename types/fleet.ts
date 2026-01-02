/**
 * Fleet Management Types
 */

// ============================================================================
// Enums
// ============================================================================

export enum VehicleType {
  CAR = 'CAR',
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  PICKUP = 'PICKUP',
  CRANE = 'CRANE',
  EXCAVATOR = 'EXCAVATOR',
  BULLDOZER = 'BULLDOZER',
  LOADER = 'LOADER',
  FORKLIFT = 'FORKLIFT',
  DUMP_TRUCK = 'DUMP_TRUCK',
  CONCRETE_MIXER = 'CONCRETE_MIXER',
  TRAILER = 'TRAILER',
  MOTORCYCLE = 'MOTORCYCLE',
  OTHER = 'OTHER',
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  IN_REPAIR = 'IN_REPAIR',
  RESERVED = 'RESERVED',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  RETIRED = 'RETIRED',
}

export enum OwnershipType {
  OWNED = 'OWNED',
  LEASED = 'LEASED',
  RENTED = 'RENTED',
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  LPG = 'LPG',
  CNG = 'CNG',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  EMERGENCY = 'EMERGENCY',
  INSPECTION = 'INSPECTION',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum TripStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum FuelEntryType {
  REFUEL = 'REFUEL',
  TANK_DRAIN = 'TANK_DRAIN',
  CORRECTION = 'CORRECTION',
}

export enum InspectionType {
  PRE_TRIP = 'PRE_TRIP',
  POST_TRIP = 'POST_TRIP',
  PERIODIC = 'PERIODIC',
  SAFETY = 'SAFETY',
  EMISSIONS = 'EMISSIONS',
  ANNUAL = 'ANNUAL',
}

export enum InspectionStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  REQUIRES_ATTENTION = 'REQUIRES_ATTENTION',
}

// ============================================================================
// Vehicle Types
// ============================================================================

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  
  // Identification
  vin?: string; // Vehicle Identification Number
  licensePlate: string;
  registrationNumber?: string;
  
  // Ownership
  ownershipType: OwnershipType;
  purchaseDate?: Date;
  purchasePrice?: number;
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  leaseProvider?: string;
  
  // Specifications
  fuelType: FuelType;
  fuelCapacity?: number; // liters
  engineCapacity?: number; // cc
  color?: string;
  seats?: number;
  loadCapacity?: number; // kg or tonnes
  
  // Current Stats
  currentOdometer: number; // km
  currentEngineHours?: number; // for heavy equipment
  averageFuelConsumption?: number; // km/liter or liters/hour
  
  // Assignment
  assignedTo?: string; // driver ID
  assignedDriverName?: string;
  assignedProject?: string;
  assignedProjectName?: string;
  location?: string;
  
  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: Date;
  
  // Registration
  registrationExpiryDate?: Date;
  
  // Maintenance
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  nextMaintenanceOdometer?: number;
  
  // Documents
  documents?: VehicleDocument[];
  photos?: string[];
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface VehicleDocument {
  id: string;
  type: 'REGISTRATION' | 'INSURANCE' | 'INSPECTION' | 'LEASE' | 'OTHER';
  name: string;
  url: string;
  expiryDate?: Date;
  uploadedAt: Date;
  uploadedBy: string;
}

// ============================================================================
// Maintenance Types
// ============================================================================

export interface MaintenanceRecord {
  id: string;
  maintenanceNumber: string;
  vehicleId: string;
  vehicleNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  
  // Scheduling
  scheduledDate: Date;
  scheduledOdometer?: number;
  scheduledEngineHours?: number;
  
  // Actual
  startDate?: Date;
  completionDate?: Date;
  actualOdometer?: number;
  actualEngineHours?: number;
  
  // Details
  title: string;
  description: string;
  workPerformed?: string;
  
  // Service Provider
  serviceProvider?: string;
  mechanic?: string;
  workshopLocation?: string;
  
  // Parts
  parts?: MaintenancePart[];
  
  // Costs
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  currency?: string;
  
  // Downtime
  downtimeHours?: number;
  
  // Next Service
  nextServiceDate?: Date;
  nextServiceOdometer?: number;
  
  // Documents
  invoices?: string[];
  photos?: string[];
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface MaintenancePart {
  id: string;
  partNumber?: string;
  partName: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  supplier?: string;
}

// ============================================================================
// Trip Types
// ============================================================================

export interface Trip {
  id: string;
  tripNumber: string;
  vehicleId: string;
  vehicleNumber?: string;
  
  driverId: string;
  driverName?: string;
  
  status: TripStatus;
  
  // Route
  origin: string;
  destination: string;
  purpose: string;
  
  // Scheduling
  plannedStartDate: Date;
  plannedEndDate: Date;
  
  // Actual
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Odometer
  startOdometer?: number;
  endOdometer?: number;
  distance?: number; // km
  
  // Fuel
  startFuelLevel?: number; // percentage
  endFuelLevel?: number; // percentage
  
  // Passengers/Cargo
  passengers?: number;
  cargoWeight?: number; // kg
  cargoDescription?: string;
  
  // Project
  projectId?: string;
  projectName?: string;
  
  // Costs
  fuelCost?: number;
  tollsCost?: number;
  parkingCost?: number;
  otherCosts?: number;
  totalCost?: number;
  currency?: string;
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

// ============================================================================
// Fuel Types
// ============================================================================

export interface FuelEntry {
  id: string;
  entryNumber: string;
  vehicleId: string;
  vehicleNumber?: string;
  
  type: FuelEntryType;
  
  // Date & Location
  date: Date;
  location: string;
  stationName?: string;
  
  // Odometer
  odometer: number;
  
  // Fuel
  fuelType: FuelType;
  quantity: number; // liters
  unitPrice?: number;
  totalCost?: number;
  currency?: string;
  
  // Tank
  tankLevel?: number; // percentage before refuel
  
  // Driver
  driverId?: string;
  driverName?: string;
  
  // Trip
  tripId?: string;
  tripNumber?: string;
  
  // Fuel Efficiency
  distanceSinceLastFill?: number; // km
  fuelConsumption?: number; // km/liter
  
  // Payment
  paymentMethod?: string;
  receiptNumber?: string;
  receiptPhoto?: string;
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: Date;
  createdBy: string;
  updatedBy?: string;
}

// ============================================================================
// Inspection Types
// ============================================================================

export interface Inspection {
  id: string;
  inspectionNumber: string;
  vehicleId: string;
  vehicleNumber?: string;
  
  type: InspectionType;
  status: InspectionStatus;
  
  // Date & Odometer
  inspectionDate: Date;
  odometer?: number;
  
  // Inspector
  inspectorId: string;
  inspectorName?: string;
  
  // Checklist
  items: InspectionItem[];
  
  // Results
  overallStatus: InspectionStatus;
  defectsFound?: number;
  
  // Follow-up
  requiresRepair: boolean;
  repairDeadline?: Date;
  maintenanceRecordId?: string;
  
  // Documents
  photos?: string[];
  reportUrl?: string;
  
  // Notes
  notes?: string;
  recommendations?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectionItem {
  id: string;
  category: string; // e.g., 'Brakes', 'Tires', 'Lights', 'Engine'
  item: string; // e.g., 'Front brake pads', 'Left front tire'
  status: 'OK' | 'ATTENTION' | 'DEFECT' | 'N/A';
  notes?: string;
  photo?: string;
}

// ============================================================================
// Driver Types
// ============================================================================

export interface Driver {
  id: string;
  driverNumber: string;
  name: string;
  email?: string;
  phone?: string;
  
  // License
  licenseNumber: string;
  licenseType: string;
  licenseExpiryDate: Date;
  
  // Employment
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  hireDate?: Date;
  
  // Assigned Vehicle
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  
  // Performance
  totalTrips?: number;
  totalDistance?: number; // km
  safetyScore?: number; // 0-100
  violations?: number;
  
  // Documents
  licenseCopy?: string;
  medicalCertificate?: string;
  medicalCertificateExpiry?: Date;
  
  // Notes
  notes?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Summary & Analytics Types
// ============================================================================

export interface FleetSummary {
  // Vehicles
  totalVehicles: number;
  activeVehicles: number;
  inMaintenanceVehicles: number;
  availableVehicles: number;
  vehiclesByType: Record<VehicleType, number>;
  vehiclesByStatus: Record<VehicleStatus, number>;
  
  // Utilization
  utilizationRate: number; // percentage
  averageAge: number; // years
  
  // Maintenance
  upcomingMaintenance: number;
  overdueMaintenance: number;
  maintenanceCostThisMonth: number;
  
  // Fuel
  fuelConsumptionThisMonth: number; // liters
  fuelCostThisMonth: number;
  averageFuelEfficiency: number; // km/liter
  
  // Trips
  tripsThisMonth: number;
  distanceThisMonth: number; // km
  
  // Costs
  totalCostThisMonth: number;
  currency: string;
}

export interface FleetAnalytics {
  // Maintenance Trends
  maintenanceTrends: Array<{
    month: string;
    preventive: number;
    corrective: number;
    cost: number;
  }>;
  
  // Fuel Trends
  fuelTrends: Array<{
    month: string;
    consumption: number; // liters
    cost: number;
    efficiency: number; // km/liter
  }>;
  
  // Vehicle Performance
  vehiclePerformance: Array<{
    vehicleId: string;
    vehicleNumber: string;
    utilization: number; // percentage
    fuelEfficiency: number;
    maintenanceCost: number;
    downtime: number; // hours
  }>;
  
  // Cost Breakdown
  costBreakdown: {
    fuel: number;
    maintenance: number;
    insurance: number;
    leasing: number;
    other: number;
  };
  
  // Top Issues
  topIssues: Array<{
    issue: string;
    occurrences: number;
    totalCost: number;
  }>;
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface VehicleFilters {
  type?: VehicleType[];
  status?: VehicleStatus[];
  fuelType?: FuelType[];
  assignedProject?: string;
  assignedDriver?: string;
  search?: string;
}

export interface MaintenanceFilters {
  vehicleId?: string;
  type?: MaintenanceType[];
  status?: MaintenanceStatus[];
  priority?: MaintenancePriority[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface TripFilters {
  vehicleId?: string;
  driverId?: string;
  projectId?: string;
  status?: TripStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface FuelFilters {
  vehicleId?: string;
  driverId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// ============================================================================
// Export Options
// ============================================================================

export interface FleetExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV';
  includePhotos?: boolean;
  includeDocuments?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}
