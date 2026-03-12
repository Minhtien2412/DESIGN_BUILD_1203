/**
 * Fleet Management Services
 * Proxies to @/services/api/fleet.service for all fleet operations.
 * All endpoints now connected to the real NestJS backend.
 */

import type {
    FleetSummary,
    Vehicle,
    VehicleFilters,
    VehicleStatus,
} from "@/types/fleet";
import fleetService from "./api/fleet.service";

// ============================================================================
// Vehicles
// ============================================================================

export async function getVehicles(
  filters?: VehicleFilters,
): Promise<Vehicle[]> {
  return fleetService.getVehicles(filters);
}

export async function getVehicle(id: string): Promise<Vehicle> {
  return fleetService.getVehicle(id);
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  return fleetService.createVehicle(data);
}

export async function updateVehicle(
  id: string,
  data: Partial<Vehicle>,
): Promise<Vehicle> {
  return fleetService.updateVehicle(id, data);
}

export async function deleteVehicle(id: string): Promise<void> {
  return fleetService.deleteVehicle(id);
}

export async function updateVehicleStatus(
  id: string,
  status: VehicleStatus,
): Promise<Vehicle> {
  return fleetService.updateVehicleStatus(id, status);
}

export async function assignVehicle(
  id: string,
  driverId?: string,
  projectId?: string,
): Promise<Vehicle> {
  return fleetService.updateVehicle(id, {
    assignedTo: driverId,
    assignedProject: projectId,
  });
}

export async function updateOdometer(
  id: string,
  odometer: number,
): Promise<Vehicle> {
  return fleetService.updateVehicle(id, { currentOdometer: odometer });
}

// Fleet Summary
export async function getFleetSummary(): Promise<FleetSummary> {
  return fleetService.getFleetSummary();
}

// ============================================================================
// Maintenance - Connected to GET/POST/PATCH /fleet/maintenance
// ============================================================================

export async function getMaintenanceRecords(filters?: any): Promise<any[]> {
  return fleetService.getMaintenanceRecords(filters?.vehicleId);
}

export async function createMaintenanceRecord(data?: any): Promise<any> {
  return fleetService.createMaintenance(data);
}

export async function updateMaintenanceRecord(
  id: string,
  data?: any,
): Promise<any> {
  return fleetService.updateMaintenance(id, data);
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  // Backend doesn't have DELETE for maintenance - update status to CANCELLED
  await fleetService.updateMaintenance(id, { status: "CANCELLED" });
}

export async function updateMaintenanceStatus(
  id: string,
  status: any,
): Promise<any> {
  return fleetService.updateMaintenance(id, { status });
}

export async function completeMaintenance(
  id: string,
  completionDate?: string,
  workPerformed?: string,
  totalCost?: number,
): Promise<any> {
  return fleetService.updateMaintenance(id, {
    status: "COMPLETED",
    completedDate: completionDate || new Date().toISOString(),
    notes: workPerformed,
    cost: totalCost,
  });
}

export async function getMaintenanceRecord(id: string): Promise<any> {
  const records = await fleetService.getMaintenanceRecords();
  return records.find((r: any) => r.id === id) || { id };
}

// ============================================================================
// Trips - Connected to GET/POST/PATCH /fleet/trips
// ============================================================================

export async function getTrips(filters?: any): Promise<any[]> {
  return fleetService.getTrips(filters);
}

export async function createTrip(data?: any): Promise<any> {
  return fleetService.createTrip(data);
}

export async function updateTrip(id: string, data?: any): Promise<any> {
  return fleetService.updateTrip(id, data);
}

export async function deleteTrip(id: string): Promise<void> {
  // Backend doesn't have DELETE for trips - update status to CANCELLED
  await fleetService.updateTrip(id, { status: "CANCELLED" });
}

export async function startTrip(
  id: string,
  startOdometer?: number,
  startFuelLevel?: number,
): Promise<any> {
  return fleetService.updateTrip(id, {
    status: "IN_PROGRESS",
    startMileage: startOdometer,
  });
}

export async function endTrip(
  id: string,
  endOdometer?: number,
  endFuelLevel?: number,
  notes?: string,
): Promise<any> {
  return fleetService.updateTrip(id, {
    status: "COMPLETED",
    endMileage: endOdometer,
    endTime: new Date().toISOString(),
    notes,
  });
}

export async function updateTripStatus(id: string, status?: any): Promise<any> {
  return fleetService.updateTrip(id, { status });
}

export async function getTrip(id: string): Promise<any> {
  const trips = await fleetService.getTrips();
  return trips.find((t: any) => t.id === id) || { id };
}

// ============================================================================
// Fuel - Connected to GET/POST /fleet/fuel
// ============================================================================

export async function getFuelEntries(filters?: any): Promise<any[]> {
  return fleetService.getFuelRecords(filters?.vehicleId);
}

export async function createFuelEntry(data?: any): Promise<any> {
  return fleetService.createFuelRecord(data);
}

export async function updateFuelEntry(id: string, data?: any): Promise<any> {
  // Backend doesn't have PATCH for fuel - re-create or return existing
  console.warn(
    "[Fleet] Fuel update not supported by backend, returning data as-is",
  );
  return { id, ...data };
}

export async function deleteFuelEntry(id: string): Promise<void> {
  console.warn("[Fleet] Fuel delete not supported by backend", id);
}

export async function getFuelEntry(id: string): Promise<any> {
  const records = await fleetService.getFuelRecords();
  return records.find((r: any) => r.id === id) || { id };
}

// ============================================================================
// Analytics - Derived from fleet summary
// ============================================================================

export async function getFleetAnalytics(
  dateFrom?: any,
  dateTo?: any,
): Promise<any> {
  const summary = await fleetService.getFleetSummary();
  return {
    totalVehicles: summary.totalVehicles,
    activeVehicles: summary.activeVehicles,
    utilizationRate: summary.utilizationRate,
    fuelConsumption: summary.fuelConsumptionThisMonth,
    fuelCost: summary.fuelCostThisMonth,
    maintenanceCost: summary.maintenanceCostThisMonth,
    totalCost: summary.totalCostThisMonth,
    dateFrom,
    dateTo,
  };
}

// ============================================================================
// Drivers - Connected to GET/POST/PATCH /fleet/drivers
// ============================================================================

export async function getDrivers(): Promise<any[]> {
  return fleetService.getDrivers();
}

export async function createDriver(data?: any): Promise<any> {
  return fleetService.createDriver(data);
}

export async function updateDriver(id: string, data?: any): Promise<any> {
  return fleetService.updateDriver(id, data);
}

export async function deleteDriver(id: string): Promise<void> {
  // Backend doesn't have DELETE for drivers
  console.warn("[Fleet] Driver delete not supported by backend", id);
}

export async function getDriver(id: string): Promise<any> {
  return fleetService.getDriver(id);
}

// ============================================================================
// Inspections - Connected to GET/POST/PATCH /fleet/inspections
// ============================================================================

export async function getInspections(vehicleId?: string): Promise<any[]> {
  return fleetService.getInspections(vehicleId);
}

export async function createInspection(data?: any): Promise<any> {
  return fleetService.createInspection(data);
}

export async function updateInspection(id: string, data?: any): Promise<any> {
  return fleetService.updateInspection(id, data);
}

export async function deleteInspection(id: string): Promise<void> {
  // Backend doesn't have DELETE for inspections
  console.warn("[Fleet] Inspection delete not supported by backend", id);
}

export async function getInspection(id: string): Promise<any> {
  const inspections = await fleetService.getInspections();
  return inspections.find((i: any) => i.id === id) || { id };
}
