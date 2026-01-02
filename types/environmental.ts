/**
 * Environmental Management Types
 * Environmental monitoring, waste, emissions, and compliance
 */

// ============================================================================
// Enums
// ============================================================================

export enum MonitoringType {
  AIR_QUALITY = 'AIR_QUALITY',
  WATER_QUALITY = 'WATER_QUALITY',
  SOIL_QUALITY = 'SOIL_QUALITY',
  NOISE_LEVEL = 'NOISE_LEVEL',
  VIBRATION = 'VIBRATION',
  DUST = 'DUST',
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  RADIATION = 'RADIATION',
  LIGHT = 'LIGHT',
}

export enum MonitoringStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  OVERDUE = 'OVERDUE',
}

export enum WasteType {
  GENERAL = 'GENERAL',
  RECYCLABLE = 'RECYCLABLE',
  HAZARDOUS = 'HAZARDOUS',
  CONSTRUCTION = 'CONSTRUCTION',
  DEMOLITION = 'DEMOLITION',
  EXCAVATION = 'EXCAVATION',
  ELECTRONIC = 'ELECTRONIC',
  ORGANIC = 'ORGANIC',
  LIQUID = 'LIQUID',
  CHEMICAL = 'CHEMICAL',
  MEDICAL = 'MEDICAL',
  ASBESTOS = 'ASBESTOS',
}

export enum WasteDisposalMethod {
  LANDFILL = 'LANDFILL',
  RECYCLING = 'RECYCLING',
  INCINERATION = 'INCINERATION',
  COMPOSTING = 'COMPOSTING',
  REUSE = 'REUSE',
  TREATMENT = 'TREATMENT',
  SPECIALIST_DISPOSAL = 'SPECIALIST_DISPOSAL',
  EXPORT = 'EXPORT',
}

export enum WasteStatus {
  GENERATED = 'GENERATED',
  STORED = 'STORED',
  COLLECTED = 'COLLECTED',
  IN_TRANSIT = 'IN_TRANSIT',
  DISPOSED = 'DISPOSED',
  RECYCLED = 'RECYCLED',
  PENDING = 'PENDING',
}

export enum EmissionType {
  GREENHOUSE_GAS = 'GREENHOUSE_GAS',
  CARBON_DIOXIDE = 'CARBON_DIOXIDE',
  METHANE = 'METHANE',
  NITROUS_OXIDE = 'NITROUS_OXIDE',
  PARTICULATE_MATTER = 'PARTICULATE_MATTER',
  SULFUR_DIOXIDE = 'SULFUR_DIOXIDE',
  NITROGEN_OXIDES = 'NITROGEN_OXIDES',
  VOLATILE_ORGANIC = 'VOLATILE_ORGANIC',
  CARBON_MONOXIDE = 'CARBON_MONOXIDE',
}

export enum EmissionSource {
  VEHICLES = 'VEHICLES',
  EQUIPMENT = 'EQUIPMENT',
  GENERATORS = 'GENERATORS',
  HEATING = 'HEATING',
  MANUFACTURING = 'MANUFACTURING',
  WELDING = 'WELDING',
  PAINTING = 'PAINTING',
  DEMOLITION = 'DEMOLITION',
  EXCAVATION = 'EXCAVATION',
  OTHER = 'OTHER',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  MONITORING = 'MONITORING',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
}

export enum IncidentSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
  CATASTROPHIC = 'CATASTROPHIC',
}

export enum PermitStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
  RENEWED = 'RENEWED',
}

// ============================================================================
// Environmental Monitoring
// ============================================================================

export interface EnvironmentalMonitoring {
  id: string;
  monitoringNumber: string;
  monitoringType: MonitoringType;
  status: MonitoringStatus;

  // Project/Location
  projectId: string;
  projectName: string;
  location: string;
  area?: string;
  specificLocation?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Scheduling
  scheduledDate: string;
  scheduledTime?: string;
  frequency?: string; // e.g., "Daily", "Weekly", "Monthly"
  actualDate?: string;
  actualTime?: string;

  // Monitoring Details
  parameter: string;
  unit: string;
  regulatoryLimit?: number;
  targetValue?: number;
  measuredValue?: number;
  result?: 'PASS' | 'FAIL' | 'WARNING';

  // Multiple Measurements
  measurements?: Measurement[];

  // Equipment
  equipment?: {
    name: string;
    model?: string;
    serialNumber?: string;
    calibrationDate?: string;
    calibrationDue?: string;
  };

  // Personnel
  monitoredBy?: {
    id: string;
    name: string;
    company?: string;
    certification?: string;
  };

  // Weather Conditions
  weatherConditions?: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    windDirection?: string;
    precipitation?: string;
  };

  // Results
  complianceStatus?: ComplianceStatus;
  exceedancePercentage?: number;
  trendAnalysis?: 'IMPROVING' | 'STABLE' | 'WORSENING';

  // Actions
  correctiveActions?: CorrectiveAction[];
  recommendations?: string[];

  // Documentation
  photos?: MonitoringPhoto[];
  reportUrl?: string;
  certificateUrl?: string;
  attachments?: Attachment[];

  // Links
  previousMonitoringId?: string;
  nextMonitoringId?: string;

  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  lastUpdatedAt: string;
}

export interface Measurement {
  parameter: string;
  value: number;
  unit: string;
  limit?: number;
  compliant: boolean;
  timestamp?: string;
  location?: string;
}

export interface MonitoringPhoto {
  photoUrl: string;
  caption?: string;
  location?: string;
  takenBy?: string;
  takenAt: string;
}

// ============================================================================
// Waste Management
// ============================================================================

export interface WasteRecord {
  id: string;
  wasteNumber: string;
  wasteType: WasteType;
  status: WasteStatus;

  // Project/Location
  projectId: string;
  projectName: string;
  generationLocation: string;
  storageLocation?: string;

  // Waste Details
  description: string;
  materialComposition?: string[];
  hazardousComponents?: string[];
  unNumber?: string; // UN number for hazardous materials

  // Quantity
  quantity: number;
  unit: 'KG' | 'TONNES' | 'CUBIC_METERS' | 'LITERS' | 'UNITS';
  estimatedQuantity?: number;
  actualQuantity?: number;

  // Dates
  generatedDate: string;
  collectedDate?: string;
  disposedDate?: string;

  // Storage
  storageDuration?: number; // days
  storageConditions?: string;
  containerType?: string;
  containerQuantity?: number;

  // Disposal
  disposalMethod?: WasteDisposalMethod;
  disposalFacility?: {
    name: string;
    address?: string;
    licenseNumber?: string;
    contactPerson?: string;
    contactNumber?: string;
  };

  // Transport
  transporter?: {
    company: string;
    licenseNumber?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverLicense?: string;
  };
  transportDate?: string;
  manifestNumber?: string;

  // Costs
  disposalCost?: number;
  transportCost?: number;
  totalCost?: number;
  currency?: string;

  // Recycling
  recyclablePercentage?: number;
  recycledQuantity?: number;
  recyclingFacility?: string;

  // Compliance
  permitRequired: boolean;
  permitNumber?: string;
  regulatoryReporting: boolean;
  reportSubmitted?: boolean;
  reportDate?: string;

  // Documentation
  weighbridgeTickets?: string[];
  transferNotes?: string[];
  disposalCertificates?: string[];
  photos?: WastePhoto[];
  attachments?: Attachment[];

  // Tracking
  generatedBy: {
    id: string;
    name: string;
    company?: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  lastUpdatedAt: string;
}

export interface WastePhoto {
  photoUrl: string;
  caption?: string;
  photoType?: 'GENERATION' | 'STORAGE' | 'COLLECTION' | 'DISPOSAL';
  takenBy?: string;
  takenAt: string;
}

// ============================================================================
// Emissions Tracking
// ============================================================================

export interface EmissionRecord {
  id: string;
  recordNumber: string;
  emissionType: EmissionType;
  emissionSource: EmissionSource;

  // Project
  projectId: string;
  projectName: string;
  location: string;

  // Period
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };

  // Source Details
  sourceDescription: string;
  equipmentId?: string;
  equipmentType?: string;
  fuelType?: string;

  // Activity Data
  fuelConsumed?: number;
  fuelUnit?: 'LITERS' | 'CUBIC_METERS' | 'KG' | 'TONNES';
  hoursOperated?: number;
  distanceTraveled?: number; // for vehicles
  energyConsumed?: number; // kWh

  // Emissions Calculation
  emissionFactor?: number;
  calculationMethod?: string;
  emissionsQuantity: number;
  emissionsUnit: 'KG' | 'TONNES' | 'KG_CO2E' | 'TONNES_CO2E';

  // CO2 Equivalent (for GHG)
  co2Equivalent?: number;
  gwp?: number; // Global Warming Potential

  // Scope (for GHG Protocol)
  scope?: 'SCOPE_1' | 'SCOPE_2' | 'SCOPE_3';

  // Monitoring
  measured: boolean;
  measuredValue?: number;
  estimatedValue?: number;
  uncertainty?: number; // percentage

  // Reduction Measures
  reductionMeasures?: ReductionMeasure[];
  reductionAchieved?: number;
  reductionPercentage?: number;

  // Compliance
  regulatoryLimit?: number;
  compliant: boolean;
  reportingRequired: boolean;
  reportSubmitted?: boolean;

  // Documentation
  calculationSheetUrl?: string;
  verificationReportUrl?: string;
  attachments?: Attachment[];

  calculatedBy: {
    id: string;
    name: string;
  };
  verifiedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  lastUpdatedAt: string;
}

export interface ReductionMeasure {
  id: string;
  measure: string;
  implementedDate?: string;
  reductionPotential?: number;
  reductionUnit?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'VERIFIED';
  cost?: number;
}

// ============================================================================
// Environmental Incident
// ============================================================================

export interface EnvironmentalIncident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: 'REPORTED' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

  // Project/Location
  projectId: string;
  projectName: string;
  location: string;
  area?: string;

  // Timing
  incidentDate: string;
  incidentTime?: string;
  reportedDate: string;
  discoveredBy?: {
    id: string;
    name: string;
  };

  // Incident Details
  incidentType: 'SPILL' | 'RELEASE' | 'CONTAMINATION' | 'POLLUTION' | 'HABITAT_DAMAGE' | 'OTHER';
  substanceInvolved?: string;
  quantityReleased?: number;
  releaseUnit?: string;
  areaAffected?: number; // square meters
  environmentalCompartment?: ('AIR' | 'WATER' | 'SOIL' | 'GROUNDWATER')[];

  // Impact Assessment
  impactAssessment?: {
    waterContamination: boolean;
    soilContamination: boolean;
    airPollution: boolean;
    wildlifeImpact: boolean;
    vegetationImpact: boolean;
    humanHealthRisk: boolean;
    propertyDamage: boolean;
  };

  // Response
  immediateActions?: string;
  cleanupRequired: boolean;
  cleanupCompleted?: boolean;
  cleanupDate?: string;
  cleanupCost?: number;

  // Regulatory
  reportableToAuthority: boolean;
  authorityNotified?: boolean;
  authorityNotificationDate?: string;
  authorityReference?: string;
  penaltyIssued?: boolean;
  penaltyAmount?: number;

  // Investigation
  investigation?: {
    investigator: {
      id: string;
      name: string;
    };
    findings: string;
    rootCause?: string;
    contributingFactors?: string[];
    investigationCompletedDate?: string;
  };

  // Corrective Actions
  correctiveActions?: CorrectiveAction[];
  preventiveMeasures?: string[];

  // Documentation
  photos?: IncidentPhoto[];
  reportUrl?: string;
  attachments?: Attachment[];

  reportedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  lastUpdatedAt: string;
}

export interface IncidentPhoto {
  photoUrl: string;
  caption?: string;
  photoType?: 'BEFORE' | 'DURING' | 'AFTER' | 'DAMAGE' | 'CLEANUP';
  takenBy?: string;
  takenAt: string;
}

// ============================================================================
// Environmental Permit
// ============================================================================

export interface EnvironmentalPermit {
  id: string;
  permitNumber: string;
  permitType: string;
  status: PermitStatus;

  // Project
  projectId: string;
  projectName: string;

  // Permit Details
  permitName: string;
  description?: string;
  issuingAuthority: string;
  authorityContact?: string;

  // Validity
  issueDate: string;
  effectiveDate: string;
  expiryDate: string;
  renewalRequired: boolean;
  renewalDate?: string;

  // Conditions
  conditions?: PermitCondition[];
  limitations?: PermitLimitation[];
  monitoringRequirements?: MonitoringRequirement[];

  // Compliance
  complianceStatus: ComplianceStatus;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  violations?: Violation[];

  // Renewal
  renewalInProgress?: boolean;
  renewalApplicationDate?: string;
  renewalStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

  // Documentation
  permitDocumentUrl?: string;
  applicationDocumentUrl?: string;
  technicalReportsUrl?: string[];
  attachments?: Attachment[];

  // Financial
  applicationFee?: number;
  annualFee?: number;
  bondRequired: boolean;
  bondAmount?: number;
  currency?: string;

  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  lastUpdatedAt: string;
}

export interface PermitCondition {
  id: string;
  condition: string;
  category?: string;
  compliant: boolean;
  evidenceUrl?: string;
  lastCheckedDate?: string;
  nextCheckDate?: string;
}

export interface PermitLimitation {
  parameter: string;
  limit: number;
  unit: string;
  monitoringFrequency?: string;
  currentValue?: number;
  compliant: boolean;
}

export interface MonitoringRequirement {
  requirement: string;
  frequency: string;
  parameter?: string;
  method?: string;
  reportingRequired: boolean;
  lastCompleted?: string;
  nextDue?: string;
  status: 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';
}

export interface Violation {
  id: string;
  violationDate: string;
  description: string;
  severity: 'MINOR' | 'MODERATE' | 'MAJOR';
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  correctiveAction?: string;
  resolvedDate?: string;
  penaltyAmount?: number;
}

// ============================================================================
// Common Types
// ============================================================================

export interface CorrectiveAction {
  id: string;
  action: string;
  responsiblePerson: {
    id: string;
    name: string;
    company?: string;
  };
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  completedDate?: string;
  verifiedBy?: {
    id: string;
    name: string;
  };
  verifiedDate?: string;
  comments?: string;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedAt: string;
}

// ============================================================================
// Analytics & Reports
// ============================================================================

export interface EnvironmentalRegister {
  projectId: string;
  projectName: string;
  registerDate: string;

  // Monitoring Summary
  totalMonitoring: number;
  monitoringByType: Record<MonitoringType, number>;
  monitoringByStatus: Record<MonitoringStatus, number>;
  nonCompliantMonitoring: number;

  // Waste Summary
  totalWasteRecords: number;
  wasteByType: Record<WasteType, number>;
  totalWasteQuantity: number;
  wasteUnit: string;
  recycledPercentage: number;
  hazardousWasteQuantity: number;

  // Emissions Summary
  totalEmissions: number;
  emissionsByType: Record<EmissionType, number>;
  totalCO2Equivalent: number;
  emissionsUnit: string;

  // Incidents Summary
  totalIncidents: number;
  incidentsBySeverity: Record<IncidentSeverity, number>;
  reportableIncidents: number;

  // Permits Summary
  totalPermits: number;
  activePermits: number;
  expiringPermits: number;
  expiredPermits: number;
  violations: number;
}

export interface EnvironmentalSummary {
  // Period
  startDate: string;
  endDate: string;

  // Monitoring
  monitoringEvents: number;
  complianceRate: number;
  exceedances: number;

  // Waste
  wasteGenerated: number;
  wasteRecycled: number;
  wasteDiversionRate: number;
  hazardousWaste: number;

  // Emissions
  totalEmissions: number;
  emissionsReduction?: number;
  emissionsIntensity?: number; // per unit of production

  // Incidents
  incidents: number;
  spillsAndReleases: number;
  regulatoryReports: number;

  // Compliance
  permitCompliance: number;
  inspectionsPassed: number;
  violations: number;
  penalties?: number;

  // Performance Score
  environmentalScore?: number; // 0-100
  trend?: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface EnvironmentalAnalytics {
  // Trends (by month)
  monitoringTrends: MonthlyTrend[];
  wasteTrends: MonthlyTrend[];
  emissionTrends: MonthlyTrend[];
  incidentTrends: MonthlyTrend[];

  // Performance
  environmentalPerformance: {
    wasteRecyclingRate: number;
    targetRecyclingRate: number;
    emissionsReduction: number;
    targetEmissionsReduction: number;
    complianceRate: number;
    targetComplianceRate: number;
  };

  // Top Issues
  topWasteTypes: CategoryCount[];
  topEmissionSources: CategoryCount[];
  topNonCompliance: CategoryCount[];

  // Benchmarking
  industryBenchmarks?: {
    wasteIntensity: number;
    emissionsIntensity: number;
    recyclingRate: number;
  };
}

export interface MonthlyTrend {
  month: string;
  value: number;
  unit?: string;
  target?: number;
}

export interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

export interface EnvironmentalSearchFilters {
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
  complianceStatus?: string;
  search?: string;
}

export interface EnvironmentalExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV';
  includePhotos?: boolean;
  includeAttachments?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: EnvironmentalSearchFilters;
}
