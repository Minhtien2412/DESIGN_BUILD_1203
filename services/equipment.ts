/**
 * Equipment & Machinery Management Service
 * API integration for equipment tracking
 */

import type {
    CreateEquipmentParams,
    CreateInspectionParams,
    CreateMaintenanceRecordParams,
    CreateUsageLogParams,
    Equipment,
    EquipmentInspection,
    EquipmentStats,
    GetEquipmentParams,
    GetEquipmentStatsParams,
    GetMaintenanceRecordsParams,
    MaintenanceRecord,
    UpdateEquipmentParams,
    UpdateMaintenanceRecordParams,
    UpdateUsageLogParams,
    UsageLog,
} from '@/types/equipment';
import { apiFetch } from './api';

// Equipment CRUD
export async function getEquipment(params: GetEquipmentParams): Promise<Equipment[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', params.projectId);
  if (params.status) queryParams.append('status', params.status);
  if (params.type) queryParams.append('type', params.type);
  if (params.condition) queryParams.append('condition', params.condition);
  if (params.ownershipType) queryParams.append('ownershipType', params.ownershipType);
  if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
  if (params.search) queryParams.append('search', params.search);

  return apiFetch(`/equipment?${queryParams.toString()}`);
}

export async function getEquipmentById(id: string): Promise<Equipment> {
  return apiFetch(`/equipment/${id}`);
}

export async function createEquipment(params: CreateEquipmentParams): Promise<Equipment> {
  return apiFetch('/equipment', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateEquipment(params: UpdateEquipmentParams): Promise<Equipment> {
  const { id, ...data } = params;
  return apiFetch(`/equipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEquipment(id: string): Promise<void> {
  return apiFetch(`/equipment/${id}`, {
    method: 'DELETE',
  });
}

// Equipment Assignment
export async function assignEquipment(
  equipmentId: string,
  assignedTo: string,
  projectId: string,
  location?: string,
  expectedReturnDate?: string
): Promise<Equipment> {
  return apiFetch(`/equipment/${equipmentId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assignedTo, projectId, location, expectedReturnDate }),
  });
}

export async function returnEquipment(
  equipmentId: string,
  condition: string,
  meterReading?: number,
  notes?: string
): Promise<Equipment> {
  return apiFetch(`/equipment/${equipmentId}/return`, {
    method: 'POST',
    body: JSON.stringify({ condition, meterReading, notes }),
  });
}

export async function transferEquipment(
  equipmentId: string,
  newAssignee: string,
  newLocation?: string
): Promise<Equipment> {
  return apiFetch(`/equipment/${equipmentId}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ newAssignee, newLocation }),
  });
}

// Maintenance Records
export async function getMaintenanceRecords(
  params: GetMaintenanceRecordsParams
): Promise<MaintenanceRecord[]> {
  const queryParams = new URLSearchParams();
  if (params.equipmentId) queryParams.append('equipmentId', params.equipmentId);
  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`/equipment/maintenance?${queryParams.toString()}`);
}

export async function getMaintenanceRecord(id: string): Promise<MaintenanceRecord> {
  return apiFetch(`/equipment/maintenance/${id}`);
}

export async function createMaintenanceRecord(
  params: CreateMaintenanceRecordParams
): Promise<MaintenanceRecord> {
  return apiFetch('/equipment/maintenance', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateMaintenanceRecord(
  params: UpdateMaintenanceRecordParams
): Promise<MaintenanceRecord> {
  const { id, ...data } = params;
  return apiFetch(`/equipment/maintenance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  return apiFetch(`/equipment/maintenance/${id}`, {
    method: 'DELETE',
  });
}

export async function completeMaintenanceRecord(
  id: string,
  workPerformed: string,
  partsReplaced?: MaintenanceRecord['partsReplaced'],
  totalCost?: number,
  nextMaintenanceDate?: string
): Promise<MaintenanceRecord> {
  return apiFetch(`/equipment/maintenance/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ workPerformed, partsReplaced, totalCost, nextMaintenanceDate }),
  });
}

// Usage Logs
export async function getUsageLogs(equipmentId: string): Promise<UsageLog[]> {
  return apiFetch(`/equipment/${equipmentId}/usage-logs`);
}

export async function createUsageLog(params: CreateUsageLogParams): Promise<UsageLog> {
  return apiFetch('/equipment/usage-logs', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateUsageLog(params: UpdateUsageLogParams): Promise<UsageLog> {
  const { id, ...data } = params;
  return apiFetch(`/equipment/usage-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUsageLog(id: string): Promise<void> {
  return apiFetch(`/equipment/usage-logs/${id}`, {
    method: 'DELETE',
  });
}

// Inspections
export async function getInspections(equipmentId: string): Promise<EquipmentInspection[]> {
  return apiFetch(`/equipment/${equipmentId}/inspections`);
}

export async function getInspection(id: string): Promise<EquipmentInspection> {
  return apiFetch(`/equipment/inspections/${id}`);
}

export async function createInspection(params: CreateInspectionParams): Promise<EquipmentInspection> {
  return apiFetch('/equipment/inspections', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateInspection(
  id: string,
  data: Partial<EquipmentInspection>
): Promise<EquipmentInspection> {
  return apiFetch(`/equipment/inspections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteInspection(id: string): Promise<void> {
  return apiFetch(`/equipment/inspections/${id}`, {
    method: 'DELETE',
  });
}

// Statistics & Analytics
export async function getEquipmentStats(params: GetEquipmentStatsParams): Promise<EquipmentStats> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', params.projectId);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);

  return apiFetch(`/equipment/stats?${queryParams.toString()}`);
}

export async function getUtilizationReport(
  projectId: string,
  fromDate: string,
  toDate: string
): Promise<any> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', projectId);
  queryParams.append('fromDate', fromDate);
  queryParams.append('toDate', toDate);

  return apiFetch(`/equipment/reports/utilization?${queryParams.toString()}`);
}

export async function getMaintenanceCostReport(
  projectId: string,
  fromDate: string,
  toDate: string
): Promise<any> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', projectId);
  queryParams.append('fromDate', fromDate);
  queryParams.append('toDate', toDate);

  return apiFetch(`/equipment/reports/maintenance-cost?${queryParams.toString()}`);
}

export async function getFuelConsumptionReport(
  projectId: string,
  fromDate: string,
  toDate: string
): Promise<any> {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', projectId);
  queryParams.append('fromDate', fromDate);
  queryParams.append('toDate', toDate);

  return apiFetch(`/equipment/reports/fuel-consumption?${queryParams.toString()}`);
}

// QR Code & Barcode
export async function generateEquipmentQR(equipmentId: string): Promise<{ qrCode: string }> {
  return apiFetch(`/equipment/${equipmentId}/generate-qr`, {
    method: 'POST',
  });
}

export async function getEquipmentByQR(qrCode: string): Promise<Equipment> {
  return apiFetch(`/equipment/qr/${qrCode}`);
}

export async function getEquipmentByBarcode(barcode: string): Promise<Equipment> {
  return apiFetch(`/equipment/barcode/${barcode}`);
}
