/**
 * Environmental Service
 * Frontend service for environmental API endpoints
 * - Emission monitoring and recording
 * - Environmental monitoring schedules
 * - Waste management and disposal
 * - Environmental permits
 * - Environmental incidents
 */

import { get, patch, post, put } from "./api";

// ============ TYPES ============

export enum EmissionType {
  AIR = "AIR",
  WATER = "WATER",
  NOISE = "NOISE",
  DUST = "DUST",
  GHG = "GHG",
}

export enum MonitoringStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum WasteCategory {
  HAZARDOUS = "HAZARDOUS",
  NON_HAZARDOUS = "NON_HAZARDOUS",
  RECYCLABLE = "RECYCLABLE",
  ORGANIC = "ORGANIC",
  CONSTRUCTION = "CONSTRUCTION",
}

export enum PermitStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  SUSPENDED = "SUSPENDED",
  REVOKED = "REVOKED",
}

export enum ComplianceStatus {
  COMPLIANT = "COMPLIANT",
  NON_COMPLIANT = "NON_COMPLIANT",
  WARNING = "WARNING",
  PENDING_REVIEW = "PENDING_REVIEW",
}

export interface EmissionRecord {
  id: number;
  projectId: number;
  emissionType: EmissionType;
  source: string;
  value: number;
  unit: string;
  threshold: number;
  complianceStatus: ComplianceStatus;
  measuredAt: string;
  measuredById: number;
  measuredByName: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface MonitoringSchedule {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  monitoringType: string;
  status: MonitoringStatus;
  scheduledDate: string;
  frequency: string;
  location: string;
  assignedToId: number;
  assignedToName: string;
  parameters: string[];
  completedAt?: string;
  results?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WasteRecord {
  id: number;
  projectId: number;
  wasteCategory: WasteCategory;
  wasteType: string;
  quantity: number;
  unit: string;
  disposalMethod: string;
  disposalVendor?: string;
  manifestNumber?: string;
  disposedAt: string;
  disposedById: number;
  disposedByName: string;
  cost?: number;
  notes?: string;
  createdAt: string;
}

export interface EnvironmentalPermit {
  id: number;
  projectId: number;
  permitNumber: string;
  permitType: string;
  issuingAuthority: string;
  status: PermitStatus;
  issueDate: string;
  expiryDate: string;
  conditions?: string[];
  documents?: string[];
  renewalDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentalIncident {
  id: number;
  projectId: number;
  title: string;
  description: string;
  incidentType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  incidentDate: string;
  location: string;
  reportedById: number;
  reportedByName: string;
  status: "REPORTED" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
  rootCause?: string;
  correctiveActions?: string[];
  resolvedAt?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentalDashboard {
  totalEmissions: number;
  emissionsByType: { type: EmissionType; count: number; avgValue: number }[];
  complianceRate: number;
  activePermits: number;
  expiringPermits: EnvironmentalPermit[];
  pendingMonitorings: number;
  wasteByCategory: { category: WasteCategory; quantity: number }[];
  recentIncidents: EnvironmentalIncident[];
  upcomingMonitorings: MonitoringSchedule[];
}

// ============ DTOs ============

export interface QueryEmissionDto {
  projectId?: number;
  emissionType?: EmissionType;
  fromDate?: string;
  toDate?: string;
}

export interface CreateEmissionDto {
  projectId: number;
  emissionType: EmissionType;
  source: string;
  value: number;
  unit: string;
  threshold: number;
  measuredById: number;
  location?: string;
  notes?: string;
}

export interface CreateMonitoringDto {
  projectId: number;
  title: string;
  description?: string;
  monitoringType: string;
  scheduledDate: string;
  frequency: string;
  location: string;
  assignedToId: number;
  parameters: string[];
}

export interface UpdateMonitoringDto {
  status?: MonitoringStatus;
  scheduledDate?: string;
  location?: string;
  assignedToId?: number;
  parameters?: string[];
}

export interface CompleteMonitoringDto {
  completedById: number;
  results: Record<string, any>;
  notes?: string;
}

export interface QueryWasteDto {
  projectId?: number;
  wasteCategory?: WasteCategory;
  fromDate?: string;
  toDate?: string;
}

export interface CreateWasteDto {
  projectId: number;
  wasteCategory: WasteCategory;
  wasteType: string;
  quantity: number;
  unit: string;
  disposalMethod: string;
  disposalVendor?: string;
  manifestNumber?: string;
  disposedById: number;
  cost?: number;
  notes?: string;
}

export interface QueryPermitDto {
  projectId?: number;
  status?: PermitStatus;
  permitType?: string;
}

export interface CreatePermitDto {
  projectId: number;
  permitNumber: string;
  permitType: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  conditions?: string[];
  documents?: string[];
  notes?: string;
}

export interface UpdatePermitDto {
  status?: PermitStatus;
  expiryDate?: string;
  conditions?: string[];
  documents?: string[];
  renewalDate?: string;
  notes?: string;
}

export interface CreateIncidentDto {
  projectId: number;
  title: string;
  description: string;
  incidentType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  incidentDate: string;
  location: string;
  reportedById: number;
  photos?: string[];
}

export interface UpdateIncidentDto {
  status?: "REPORTED" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  rootCause?: string;
  correctiveActions?: string[];
}

// ============ API FUNCTIONS ============

const BASE_PATH = "/environmental";

/**
 * Get environmental dashboard metrics
 */
export async function getDashboard(
  projectId?: number
): Promise<EnvironmentalDashboard> {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", String(projectId));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/dashboard?${queryString}`
    : `${BASE_PATH}/dashboard`;

  return get<EnvironmentalDashboard>(url);
}

// ============ EMISSIONS ============

/**
 * Get emission records
 */
export async function getEmissions(
  query: QueryEmissionDto = {}
): Promise<EmissionRecord[]> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.emissionType) params.append("emissionType", query.emissionType);
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/emissions?${queryString}`
    : `${BASE_PATH}/emissions`;

  return get<EmissionRecord[]>(url);
}

/**
 * Record a new emission measurement
 */
export async function createEmission(
  dto: CreateEmissionDto
): Promise<EmissionRecord> {
  return post<EmissionRecord>(`${BASE_PATH}/emissions`, dto);
}

// ============ MONITORING ============

/**
 * Get monitoring schedules
 */
export async function getMonitorings(
  projectId?: number,
  status?: MonitoringStatus
): Promise<MonitoringSchedule[]> {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", String(projectId));
  if (status) params.append("status", status);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/monitoring?${queryString}`
    : `${BASE_PATH}/monitoring`;

  return get<MonitoringSchedule[]>(url);
}

/**
 * Get monitoring schedule by ID
 */
export async function getMonitoringById(
  id: number
): Promise<MonitoringSchedule> {
  return get<MonitoringSchedule>(`${BASE_PATH}/monitoring/${id}`);
}

/**
 * Create a monitoring schedule
 */
export async function createMonitoring(
  dto: CreateMonitoringDto
): Promise<MonitoringSchedule> {
  return post<MonitoringSchedule>(`${BASE_PATH}/monitoring`, dto);
}

/**
 * Update a monitoring schedule
 */
export async function updateMonitoring(
  id: number,
  dto: UpdateMonitoringDto
): Promise<MonitoringSchedule> {
  return put<MonitoringSchedule>(`${BASE_PATH}/monitoring/${id}`, dto);
}

/**
 * Mark monitoring as complete
 */
export async function completeMonitoring(
  id: number,
  dto: CompleteMonitoringDto
): Promise<MonitoringSchedule> {
  return patch<MonitoringSchedule>(
    `${BASE_PATH}/monitoring/${id}/complete`,
    dto
  );
}

// ============ WASTE ============

/**
 * Get waste records
 */
export async function getWastes(
  query: QueryWasteDto = {}
): Promise<WasteRecord[]> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.wasteCategory) params.append("wasteCategory", query.wasteCategory);
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/waste?${queryString}`
    : `${BASE_PATH}/waste`;

  return get<WasteRecord[]>(url);
}

/**
 * Record waste disposal
 */
export async function createWaste(dto: CreateWasteDto): Promise<WasteRecord> {
  return post<WasteRecord>(`${BASE_PATH}/waste`, dto);
}

// ============ PERMITS ============

/**
 * Get environmental permits
 */
export async function getPermits(
  query: QueryPermitDto = {}
): Promise<EnvironmentalPermit[]> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.status) params.append("status", query.status);
  if (query.permitType) params.append("permitType", query.permitType);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/permits?${queryString}`
    : `${BASE_PATH}/permits`;

  return get<EnvironmentalPermit[]>(url);
}

/**
 * Get permit by ID
 */
export async function getPermitById(id: number): Promise<EnvironmentalPermit> {
  return get<EnvironmentalPermit>(`${BASE_PATH}/permits/${id}`);
}

/**
 * Create an environmental permit
 */
export async function createPermit(
  dto: CreatePermitDto
): Promise<EnvironmentalPermit> {
  return post<EnvironmentalPermit>(`${BASE_PATH}/permits`, dto);
}

/**
 * Update an environmental permit
 */
export async function updatePermit(
  id: number,
  dto: UpdatePermitDto
): Promise<EnvironmentalPermit> {
  return put<EnvironmentalPermit>(`${BASE_PATH}/permits/${id}`, dto);
}

// ============ INCIDENTS ============

/**
 * Get environmental incidents
 */
export async function getIncidents(
  projectId?: number,
  status?: "REPORTED" | "INVESTIGATING" | "RESOLVED" | "CLOSED"
): Promise<EnvironmentalIncident[]> {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", String(projectId));
  if (status) params.append("status", status);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/incidents?${queryString}`
    : `${BASE_PATH}/incidents`;

  return get<EnvironmentalIncident[]>(url);
}

/**
 * Get incident by ID
 */
export async function getIncidentById(
  id: number
): Promise<EnvironmentalIncident> {
  return get<EnvironmentalIncident>(`${BASE_PATH}/incidents/${id}`);
}

/**
 * Report a new environmental incident
 */
export async function createIncident(
  dto: CreateIncidentDto
): Promise<EnvironmentalIncident> {
  return post<EnvironmentalIncident>(`${BASE_PATH}/incidents`, dto);
}

/**
 * Update an environmental incident
 */
export async function updateIncident(
  id: number,
  dto: UpdateIncidentDto
): Promise<EnvironmentalIncident> {
  return put<EnvironmentalIncident>(`${BASE_PATH}/incidents/${id}`, dto);
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{
  status: string;
  service: string;
  timestamp: string;
}> {
  return get(`${BASE_PATH}/health`);
}

export default {
  getDashboard,
  getEmissions,
  createEmission,
  getMonitorings,
  getMonitoringById,
  createMonitoring,
  updateMonitoring,
  completeMonitoring,
  getWastes,
  createWaste,
  getPermits,
  getPermitById,
  createPermit,
  updatePermit,
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  healthCheck,
};
