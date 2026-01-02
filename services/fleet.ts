/**
 * Fleet Management Services
 * DEPRECATED: Use @/services/api/fleet.service instead
 * This file proxies to new service for backward compatibility
 * 
 * NOTE: Only basic vehicle CRUD implemented in mock service
 * Other features (maintenance, trips, fuel) need backend implementation
 */

import type {
    FleetSummary,
    Vehicle,
    VehicleFilters,
    VehicleStatus,
} from '@/types/fleet';
import fleetService from './api/fleet.service';

// ============================================================================
// Vehicles - Proxied to new mock service
// ============================================================================

export async function getVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
  return fleetService.getVehicles(filters);
}

export async function getVehicle(id: string): Promise<Vehicle> {
  return fleetService.getVehicle(id);
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  return fleetService.createVehicle(data);
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
  return fleetService.updateVehicle(id, data);
}

export async function deleteVehicle(id: string): Promise<void> {
  return fleetService.deleteVehicle(id);
}

export async function updateVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
  return fleetService.updateVehicleStatus(id, status);
}

export async function assignVehicle(
  id: string,
  driverId?: string,
  projectId?: string
): Promise<Vehicle> {
  return fleetService.updateVehicle(id, {
    assignedTo: driverId,
    assignedProject: projectId,
  });
}

export async function updateOdometer(id: string, odometer: number): Promise<Vehicle> {
  return fleetService.updateVehicle(id, { currentOdometer: odometer });
}

// Fleet Summary
export async function getFleetSummary(): Promise<FleetSummary> {
  return fleetService.getFleetSummary();
}

// ============================================================================
// Maintenance - TODO: Implement when backend ready
// ============================================================================

export async function getMaintenanceRecords(filters?: any): Promise<any[]> {
  console.warn('[Fleet] Maintenance records not implemented yet', filters);
  return [];
}

export async function createMaintenanceRecord(data?: any): Promise<any> {
  console.warn('[Fleet] Maintenance create not implemented yet', data);
  return { id: 'maintenance-temp', ...data };
}

export async function updateMaintenanceRecord(id: string, data?: any): Promise<any> {
  console.warn('[Fleet] Maintenance update not implemented yet', id, data);
  return { id, ...data };
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  console.warn('[Fleet] Maintenance delete not implemented yet', id);
}

export async function updateMaintenanceStatus(id: string, status: any): Promise<any> {
  console.warn('[Fleet] Maintenance status update not implemented yet', id, status);
  return { id, status };
}

export async function completeMaintenance(
  id: string,
  completionDate?: string,
  workPerformed?: string,
  totalCost?: number
): Promise<any> {
  console.warn('[Fleet] Maintenance completion not implemented yet', id, completionDate, workPerformed, totalCost);
  return { id, completionDate, workPerformed, totalCost };
}

export async function getMaintenanceRecord(id: string): Promise<any> {
  console.warn('[Fleet] Maintenance record not implemented yet', id);
  return { id };
}

// ============================================================================
// Trips - TODO: Implement when backend ready
// ============================================================================

export async function getTrips(filters?: any): Promise<any[]> {
  console.warn('[Fleet] Trips not implemented yet', filters);
  return [];
}

export async function createTrip(data?: any): Promise<any> {
  console.warn('[Fleet] Trip create not implemented yet', data);
  return { id: 'trip-temp', ...data };
}

export async function updateTrip(id: string, data?: any): Promise<any> {
  console.warn('[Fleet] Trip update not implemented yet', id, data);
  return { id, ...data };
}

export async function deleteTrip(id: string): Promise<void> {
  console.warn('[Fleet] Trip delete not implemented yet', id);
}

export async function startTrip(id: string, startOdometer?: number, startFuelLevel?: number): Promise<any> {
  console.warn('[Fleet] Trip start not implemented yet', id, startOdometer, startFuelLevel);
  return { id, startOdometer, startFuelLevel };
}

export async function endTrip(
  id: string,
  endOdometer?: number,
  endFuelLevel?: number,
  notes?: string
): Promise<any> {
  console.warn('[Fleet] Trip end not implemented yet', id, endOdometer, endFuelLevel, notes);
  return { id, endOdometer, endFuelLevel, notes };
}

export async function updateTripStatus(id: string, status?: any): Promise<any> {
  console.warn('[Fleet] Trip status update not implemented yet', id, status);
  return { id, status };
}

export async function getTrip(id: string): Promise<any> {
  console.warn('[Fleet] Trip fetch not implemented yet', id);
  return { id };
}

// ============================================================================
// Fuel - TODO: Implement when backend ready
// ============================================================================

export async function getFuelEntries(filters?: any): Promise<any[]> {
  console.warn('[Fleet] Fuel entries not implemented yet', filters);
  return [];
}

export async function createFuelEntry(data?: any): Promise<any> {
  console.warn('[Fleet] Fuel entry create not implemented yet', data);
  return { id: 'fuel-temp', ...data };
}

export async function updateFuelEntry(id: string, data?: any): Promise<any> {
  console.warn('[Fleet] Fuel entry update not implemented yet', id, data);
  return { id, ...data };
}

export async function deleteFuelEntry(id: string): Promise<void> {
  console.warn('[Fleet] Fuel entry delete not implemented yet', id);
}

export async function getFuelEntry(id: string): Promise<any> {
  console.warn('[Fleet] Fuel entry fetch not implemented yet', id);
  return { id };
}

// ============================================================================
// Analytics - TODO: Implement when backend ready
// ============================================================================

export async function getFleetAnalytics(dateFrom?: any, dateTo?: any): Promise<any> {
  console.warn('[Fleet] Analytics not implemented yet', dateFrom, dateTo);
  return null;
}

// ============================================================================
// Drivers - TODO: Implement when backend ready
// ============================================================================

export async function getDrivers(): Promise<any[]> {
  console.warn('[Fleet] Drivers not implemented yet');
  return [];
}

export async function createDriver(data?: any): Promise<any> {
  console.warn('[Fleet] Driver create not implemented yet', data);
  return { id: 'driver-temp', ...data };
}

export async function updateDriver(id: string, data?: any): Promise<any> {
  console.warn('[Fleet] Driver update not implemented yet', id, data);
  return { id, ...data };
}

export async function deleteDriver(id: string): Promise<void> {
  console.warn('[Fleet] Driver delete not implemented yet', id);
}

export async function getDriver(id: string): Promise<any> {
  console.warn('[Fleet] Driver fetch not implemented yet', id);
  return { id };
}

// ============================================================================
// Inspections - TODO: Implement when backend ready
// ============================================================================

export async function getInspections(vehicleId?: string): Promise<any[]> {
  console.warn('[Fleet] Inspections not implemented yet', vehicleId);
  return [];
}

export async function createInspection(data?: any): Promise<any> {
  console.warn('[Fleet] Inspection create not implemented yet', data);
  return { id: 'inspection-temp', ...data };
}

export async function updateInspection(id: string, data?: any): Promise<any> {
  console.warn('[Fleet] Inspection update not implemented yet', id, data);
  return { id, ...data };
}

export async function deleteInspection(id: string): Promise<void> {
  console.warn('[Fleet] Inspection delete not implemented yet', id);
}

export async function getInspection(id: string): Promise<any> {
  console.warn('[Fleet] Inspection fetch not implemented yet', id);
  return { id };
}
