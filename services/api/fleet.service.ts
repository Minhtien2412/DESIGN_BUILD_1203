/**
 * Fleet Management Service - Connected to Backend API
 *
 * Backend Endpoints (NestJS + Prisma):
 *   GET    /fleet              - Fleet overview (summary + top vehicles/drivers)
 *   POST   /fleet/vehicles     - Create vehicle
 *   GET    /fleet/vehicles     - List vehicles
 *   GET    /fleet/vehicles/:id - Get vehicle
 *   PATCH  /fleet/vehicles/:id - Update vehicle
 *   DELETE /fleet/vehicles/:id - Delete vehicle
 *   POST   /fleet/maintenance  - Create maintenance record
 *   GET    /fleet/maintenance  - List maintenance records
 *   PATCH  /fleet/maintenance/:id - Update maintenance
 *   POST   /fleet/trips        - Create trip
 *   GET    /fleet/trips        - List trips
 *   PATCH  /fleet/trips/:id    - Update trip
 *   POST   /fleet/fuel         - Create fuel record
 *   GET    /fleet/fuel         - List fuel records
 *   GET    /fleet/fuel/stats/:vehicleId - Fuel stats
 *   POST   /fleet/drivers      - Create driver
 *   GET    /fleet/drivers      - List drivers
 *   GET    /fleet/drivers/:id  - Get driver
 *   PATCH  /fleet/drivers/:id  - Update driver
 *   POST   /fleet/inspections  - Create inspection
 *   GET    /fleet/inspections  - List inspections
 *   PATCH  /fleet/inspections/:id - Update inspection
 */

import { del, get, patch, post } from "@/services/api";
import type { FleetSummary, Vehicle, VehicleFilters } from "@/types/fleet";
import { FuelType, VehicleStatus, VehicleType } from "@/types/fleet";

// ============================================================================
// Adapters: Backend ↔ Frontend field & enum mapping
// ============================================================================

/** Map backend VehicleStatus → frontend VehicleStatus */
const mapStatusFromBE = (beStatus: string): VehicleStatus => {
  const map: Record<string, VehicleStatus> = {
    ACTIVE: VehicleStatus.ACTIVE,
    INACTIVE: VehicleStatus.INACTIVE,
    MAINTENANCE: VehicleStatus.IN_MAINTENANCE,
    RETIRED: VehicleStatus.RETIRED,
  };
  return map[beStatus] || VehicleStatus.ACTIVE;
};

/** Map frontend VehicleStatus → backend VehicleStatus */
const mapStatusToBE = (feStatus: VehicleStatus): string => {
  const map: Record<string, string> = {
    [VehicleStatus.ACTIVE]: "ACTIVE",
    [VehicleStatus.INACTIVE]: "INACTIVE",
    [VehicleStatus.IN_MAINTENANCE]: "MAINTENANCE",
    [VehicleStatus.RESERVED]: "ACTIVE",
    [VehicleStatus.IN_REPAIR]: "MAINTENANCE",
    [VehicleStatus.RETIRED]: "RETIRED",
    [VehicleStatus.OUT_OF_SERVICE]: "INACTIVE",
  };
  return map[feStatus] || "ACTIVE";
};

/** Map backend VehicleType → frontend VehicleType */
const mapTypeFromBE = (beType: string): VehicleType => {
  const map: Record<string, VehicleType> = {
    TRUCK: VehicleType.TRUCK,
    VAN: VehicleType.VAN,
    CAR: VehicleType.CAR,
    MOTORCYCLE: VehicleType.MOTORCYCLE,
    EQUIPMENT: VehicleType.EXCAVATOR,
  };
  return map[beType] || VehicleType.CAR;
};

/** Map frontend VehicleType → backend VehicleType */
const mapTypeToBE = (feType: VehicleType): string => {
  const direct: Record<string, string> = {
    [VehicleType.TRUCK]: "TRUCK",
    [VehicleType.VAN]: "VAN",
    [VehicleType.CAR]: "CAR",
    [VehicleType.MOTORCYCLE]: "MOTORCYCLE",
  };
  if (direct[feType]) return direct[feType];
  return "EQUIPMENT";
};

/** Map frontend TripStatus → backend TripStatus */
const mapTripStatusToBE = (feStatus: string): string => {
  if (feStatus === "SCHEDULED") return "PLANNED";
  return feStatus;
};

/** Map backend TripStatus → frontend equivalent */
const mapTripStatusFromBE = (beStatus: string): string => {
  if (beStatus === "PLANNED") return "SCHEDULED";
  return beStatus;
};

/** Format duration between two dates */
function formatDuration(start: Date, end: Date): string {
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ============================================================================
// Record Mappers: Backend → Frontend
// ============================================================================

/** Convert a backend vehicle record to frontend Vehicle type */
const mapVehicleFromBE = (be: any): Vehicle => ({
  id: String(be.id),
  vehicleNumber: be.name || "",
  licensePlate: be.licensePlate || "",
  make: be.brand || "",
  model: be.model || "",
  year: be.year || new Date().getFullYear(),
  type: mapTypeFromBE(be.type),
  status: mapStatusFromBE(be.status),
  ownershipType: "OWNED" as any,
  fuelType: (be.fuelType?.toUpperCase() === "DIESEL"
    ? FuelType.DIESEL
    : be.fuelType?.toUpperCase() === "ELECTRIC"
      ? FuelType.ELECTRIC
      : FuelType.GASOLINE) as any,
  currentOdometer: be.currentMileage || 0,
  color: be.color,
  vin: be.vin,
  notes: be.notes,
  assignedProject:
    be.project?.name || (be.projectId ? `Project #${be.projectId}` : undefined),
  createdAt: be.createdAt ? new Date(be.createdAt) : new Date(),
  updatedAt: be.updatedAt ? new Date(be.updatedAt) : new Date(),
  createdBy: "system",
});

/** Convert frontend Vehicle → backend create/update payload */
const mapVehicleToBE = (fe: Partial<Vehicle>): Record<string, any> => {
  const payload: Record<string, any> = {};
  if (fe.vehicleNumber !== undefined) payload.name = fe.vehicleNumber;
  if (fe.licensePlate !== undefined) payload.licensePlate = fe.licensePlate;
  if (fe.make !== undefined) payload.brand = fe.make;
  if (fe.model !== undefined) payload.model = fe.model;
  if (fe.year !== undefined) payload.year = fe.year;
  if (fe.type !== undefined) payload.type = mapTypeToBE(fe.type);
  if (fe.status !== undefined) payload.status = mapStatusToBE(fe.status);
  if (fe.currentOdometer !== undefined)
    payload.currentMileage = fe.currentOdometer;
  if (fe.fuelType !== undefined) payload.fuelType = fe.fuelType;
  if ((fe as any).color !== undefined) payload.color = (fe as any).color;
  if ((fe as any).vin !== undefined) payload.vin = (fe as any).vin;
  if ((fe as any).notes !== undefined) payload.notes = (fe as any).notes;
  return payload;
};

/** Convert backend maintenance record to frontend shape */
const mapMaintenanceFromBE = (be: any): any => ({
  id: String(be.id),
  vehicleId: String(be.vehicleId),
  vehicleNumber: be.vehicle?.name || `Vehicle #${be.vehicleId}`,
  type: be.type,
  status: be.status,
  description: be.description,
  service: be.description,
  date: be.scheduledDate
    ? new Date(be.scheduledDate).toLocaleDateString("vi-VN")
    : "",
  scheduledDate: be.scheduledDate ? new Date(be.scheduledDate) : undefined,
  completedDate: be.completedDate ? new Date(be.completedDate) : undefined,
  cost: be.cost || 0,
  mileage: be.mileage,
  mechanic: be.performedBy || "",
  performedBy: be.performedBy,
  location: be.location,
  notes: be.notes,
  parts: be.parts,
  createdAt: be.createdAt ? new Date(be.createdAt) : new Date(),
  updatedAt: be.updatedAt ? new Date(be.updatedAt) : new Date(),
});

/** Convert backend trip to frontend shape */
const mapTripFromBE = (be: any): any => ({
  id: String(be.id),
  vehicleId: String(be.vehicleId),
  vehicleNumber: be.vehicle?.name || `Vehicle #${be.vehicleId}`,
  driverId: be.driverId ? String(be.driverId) : undefined,
  driver: be.driver?.name || (be.driverId ? `Driver #${be.driverId}` : ""),
  status: mapTripStatusFromBE(be.status),
  from: be.startLocation || "",
  to: be.endLocation || "",
  startLocation: be.startLocation,
  endLocation: be.endLocation,
  startTime: be.startTime ? new Date(be.startTime) : undefined,
  endTime: be.endTime ? new Date(be.endTime) : undefined,
  date: be.startTime ? new Date(be.startTime).toLocaleDateString("vi-VN") : "",
  distance: be.distance || 0,
  duration:
    be.startTime && be.endTime
      ? formatDuration(new Date(be.startTime), new Date(be.endTime))
      : "",
  fuelUsed: be.fuelUsed,
  purpose: be.purpose,
  notes: be.notes,
  createdAt: be.createdAt ? new Date(be.createdAt) : new Date(),
  updatedAt: be.updatedAt ? new Date(be.updatedAt) : new Date(),
});

/** Convert backend fuel record to frontend shape */
const mapFuelFromBE = (be: any): any => ({
  id: String(be.id),
  vehicleId: String(be.vehicleId),
  vehicleNumber: be.vehicle?.name || `Vehicle #${be.vehicleId}`,
  date: be.date ? new Date(be.date).toLocaleDateString("vi-VN") : "",
  fuelDate: be.date ? new Date(be.date) : undefined,
  liters: be.quantity || 0,
  quantity: be.quantity || 0,
  unitPrice: be.unitPrice || 0,
  cost: be.totalCost || 0,
  totalCost: be.totalCost || 0,
  odometer: be.mileage || 0,
  mileage: be.mileage,
  station: be.fuelStation || "",
  fuelStation: be.fuelStation,
  receiptUrl: be.receiptUrl,
  notes: be.notes,
  createdAt: be.createdAt ? new Date(be.createdAt) : new Date(),
  updatedAt: be.updatedAt ? new Date(be.updatedAt) : new Date(),
});

/** Convert backend driver to frontend shape */
const mapDriverFromBE = (be: any): any => ({
  id: String(be.id),
  name: be.name || "",
  phone: be.phone || "",
  email: be.email,
  licenseNumber: be.licenseNumber,
  licenseType: be.licenseType,
  licenseExpiry: be.licenseExpiry ? new Date(be.licenseExpiry) : undefined,
  status: be.status || "ACTIVE",
  assignedVehicleId: be.assignedVehicleId
    ? String(be.assignedVehicleId)
    : undefined,
  notes: be.notes,
  createdAt: be.createdAt ? new Date(be.createdAt) : new Date(),
  updatedAt: be.updatedAt ? new Date(be.updatedAt) : new Date(),
});

/** Convert backend inspection to frontend shape */
const mapInspectionFromBE = (be: any): any => ({
  id: String(be.id),
  vehicleId: String(be.vehicleId),
  vehicleNumber: be.vehicle?.name || `Vehicle #${be.vehicleId}`,
  type: be.type,
  status: be.status,
  date: be.inspectionDate
    ? new Date(be.inspectionDate).toLocaleDateString("vi-VN")
    : "",
  inspectionDate: be.inspectionDate ? new Date(be.inspectionDate) : undefined,
  inspector: be.inspector || "",
  notes: be.notes,
  items: be.items,
  overallScore: be.overallScore,
  createdAt: be.createdAt ? new Date(be.createdAt) : new Date(),
  updatedAt: be.updatedAt ? new Date(be.updatedAt) : new Date(),
});

// ============================================================================
// Vehicle CRUD
// ============================================================================

export const fleetService = {
  /**
   * Get all vehicles from backend
   * GET /fleet/vehicles
   */
  getVehicles: async (filters?: VehicleFilters): Promise<Vehicle[]> => {
    console.log("[FleetService] Fetching vehicles from API");
    try {
      const params: Record<string, string> = {};
      if (filters?.assignedProject)
        params.projectId = String(filters.assignedProject);

      const response = await get<any[]>(
        "/fleet/vehicles",
        Object.keys(params).length ? params : undefined,
      );
      const vehicles = (Array.isArray(response) ? response : []).map(
        mapVehicleFromBE,
      );

      // Client-side filtering for fields not supported by backend query
      let filtered = vehicles;
      if (filters?.status?.length) {
        filtered = filtered.filter((v) => filters.status!.includes(v.status));
      }
      if (filters?.type?.length) {
        filtered = filtered.filter((v) => filters.type!.includes(v.type));
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.licensePlate.toLowerCase().includes(search) ||
            v.make.toLowerCase().includes(search) ||
            v.model.toLowerCase().includes(search) ||
            v.vehicleNumber.toLowerCase().includes(search),
        );
      }

      console.log("[FleetService] Vehicles fetched:", filtered.length);
      return filtered;
    } catch (err) {
      console.error("[FleetService] Error fetching vehicles:", err);
      return [];
    }
  },

  /**
   * Get vehicle by ID
   * GET /fleet/vehicles/:id
   */
  getVehicle: async (id: string): Promise<Vehicle> => {
    console.log("[FleetService] Fetching vehicle:", id);
    const response = await get<any>(`/fleet/vehicles/${id}`);
    return mapVehicleFromBE(response);
  },

  /**
   * Create a new vehicle
   * POST /fleet/vehicles
   */
  createVehicle: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    console.log("[FleetService] Creating vehicle");
    const payload = mapVehicleToBE(data);
    const response = await post<any>("/fleet/vehicles", payload);
    return mapVehicleFromBE(response);
  },

  /**
   * Update a vehicle
   * PATCH /fleet/vehicles/:id
   */
  updateVehicle: async (
    id: string,
    data: Partial<Vehicle>,
  ): Promise<Vehicle> => {
    console.log("[FleetService] Updating vehicle:", id);
    const payload = mapVehicleToBE(data);
    const response = await patch<any>(`/fleet/vehicles/${id}`, payload);
    return mapVehicleFromBE(response);
  },

  /**
   * Delete a vehicle
   * DELETE /fleet/vehicles/:id
   */
  deleteVehicle: async (id: string): Promise<void> => {
    console.log("[FleetService] Deleting vehicle:", id);
    await del(`/fleet/vehicles/${id}`);
  },

  /**
   * Update vehicle status
   * PATCH /fleet/vehicles/:id (with status field)
   */
  updateVehicleStatus: async (
    id: string,
    status: VehicleStatus,
  ): Promise<Vehicle> => {
    console.log("[FleetService] Updating vehicle status:", id, status);
    const response = await patch<any>(`/fleet/vehicles/${id}`, {
      status: mapStatusToBE(status),
    });
    return mapVehicleFromBE(response);
  },

  // ==========================================================================
  // Fleet Summary (derived from overview endpoint)
  // ==========================================================================

  /**
   * Get fleet summary stats
   * GET /fleet (overview) + GET /fleet/vehicles (for counts)
   */
  getFleetSummary: async (): Promise<FleetSummary> => {
    console.log("[FleetService] Fetching fleet summary");
    try {
      const [overview, vehicles] = await Promise.all([
        get<any>("/fleet").catch(() => ({ summary: {} })),
        get<any[]>("/fleet/vehicles").catch(() => []),
      ]);

      const vehicleList = Array.isArray(vehicles) ? vehicles : [];
      const mapped = vehicleList.map(mapVehicleFromBE);
      const totalVehicles = mapped.length;
      const activeVehicles = mapped.filter(
        (v) => v.status === VehicleStatus.ACTIVE,
      ).length;
      const inMaintenanceVehicles = mapped.filter(
        (v) => v.status === VehicleStatus.IN_MAINTENANCE,
      ).length;

      const vehiclesByType = mapped.reduce(
        (acc, v) => {
          acc[v.type] = (acc[v.type] || 0) + 1;
          return acc;
        },
        {} as Record<VehicleType, number>,
      );

      const vehiclesByStatus = mapped.reduce(
        (acc, v) => {
          acc[v.status] = (acc[v.status] || 0) + 1;
          return acc;
        },
        {} as Record<VehicleStatus, number>,
      );

      const summary: FleetSummary = {
        totalVehicles,
        activeVehicles,
        inMaintenanceVehicles,
        availableVehicles: activeVehicles,
        vehiclesByType,
        vehiclesByStatus,
        utilizationRate:
          totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0,
        averageAge:
          totalVehicles > 0
            ? mapped.reduce(
                (sum, v) => sum + (new Date().getFullYear() - v.year),
                0,
              ) / totalVehicles
            : 0,
        upcomingMaintenance: overview?.summary?.upcomingMaintenance || 0,
        overdueMaintenance: overview?.summary?.overdueMaintenance || 0,
        maintenanceCostThisMonth:
          overview?.summary?.maintenanceCostThisMonth || 0,
        fuelConsumptionThisMonth:
          overview?.summary?.fuelConsumptionThisMonth || 0,
        fuelCostThisMonth: overview?.summary?.fuelCostThisMonth || 0,
        averageFuelEfficiency: overview?.summary?.averageFuelEfficiency || 0,
        tripsThisMonth: overview?.summary?.tripsThisMonth || 0,
        distanceThisMonth: overview?.summary?.distanceThisMonth || 0,
        totalCostThisMonth: overview?.summary?.totalCostThisMonth || 0,
        currency: "VND",
      };

      console.log("[FleetService] Summary fetched:", totalVehicles, "vehicles");
      return summary;
    } catch (err) {
      console.error("[FleetService] Error fetching summary:", err);
      return {
        totalVehicles: 0,
        activeVehicles: 0,
        inMaintenanceVehicles: 0,
        availableVehicles: 0,
        vehiclesByType: {} as Record<VehicleType, number>,
        vehiclesByStatus: {} as Record<VehicleStatus, number>,
        utilizationRate: 0,
        averageAge: 0,
        upcomingMaintenance: 0,
        overdueMaintenance: 0,
        maintenanceCostThisMonth: 0,
        fuelConsumptionThisMonth: 0,
        fuelCostThisMonth: 0,
        averageFuelEfficiency: 0,
        tripsThisMonth: 0,
        distanceThisMonth: 0,
        totalCostThisMonth: 0,
        currency: "VND",
      };
    }
  },

  // ==========================================================================
  // Maintenance
  // ==========================================================================

  /** GET /fleet/maintenance?vehicleId= */
  getMaintenanceRecords: async (vehicleId?: string): Promise<any[]> => {
    console.log("[FleetService] Fetching maintenance records");
    try {
      const params: Record<string, string> = {};
      if (vehicleId) params.vehicleId = vehicleId;
      const response = await get<any[]>(
        "/fleet/maintenance",
        Object.keys(params).length ? params : undefined,
      );
      return (Array.isArray(response) ? response : []).map(
        mapMaintenanceFromBE,
      );
    } catch (err) {
      console.error("[FleetService] Error fetching maintenance:", err);
      return [];
    }
  },

  /** POST /fleet/maintenance */
  createMaintenance: async (data: any): Promise<any> => {
    console.log("[FleetService] Creating maintenance record");
    const payload: any = {
      vehicleId: parseInt(data.vehicleId, 10),
      type: data.type || "CORRECTIVE",
      description: data.description || data.service || "",
      scheduledDate: data.scheduledDate || new Date().toISOString(),
      cost: data.cost || 0,
    };
    if (data.status) payload.status = data.status;
    if (data.performedBy || data.mechanic)
      payload.performedBy = data.performedBy || data.mechanic;
    if (data.location) payload.location = data.location;
    if (data.notes) payload.notes = data.notes;
    if (data.mileage) payload.mileage = data.mileage;

    const response = await post<any>("/fleet/maintenance", payload);
    return mapMaintenanceFromBE(response);
  },

  /** PATCH /fleet/maintenance/:id */
  updateMaintenance: async (id: string, data: any): Promise<any> => {
    console.log("[FleetService] Updating maintenance:", id);
    const response = await patch<any>(`/fleet/maintenance/${id}`, data);
    return mapMaintenanceFromBE(response);
  },

  // ==========================================================================
  // Trips
  // ==========================================================================

  /** GET /fleet/trips?vehicleId=&projectId= */
  getTrips: async (filters?: {
    vehicleId?: string;
    projectId?: string;
  }): Promise<any[]> => {
    console.log("[FleetService] Fetching trips");
    try {
      const params: Record<string, string> = {};
      if (filters?.vehicleId) params.vehicleId = filters.vehicleId;
      if (filters?.projectId) params.projectId = filters.projectId;
      const response = await get<any[]>(
        "/fleet/trips",
        Object.keys(params).length ? params : undefined,
      );
      return (Array.isArray(response) ? response : []).map(mapTripFromBE);
    } catch (err) {
      console.error("[FleetService] Error fetching trips:", err);
      return [];
    }
  },

  /** POST /fleet/trips */
  createTrip: async (data: any): Promise<any> => {
    console.log("[FleetService] Creating trip");
    const payload: any = {
      vehicleId: parseInt(data.vehicleId, 10),
      startLocation: data.startLocation || data.from || "",
      endLocation: data.endLocation || data.to || "",
      startTime: data.startTime || new Date().toISOString(),
    };
    if (data.driverId) payload.driverId = parseInt(data.driverId, 10);
    if (data.projectId) payload.projectId = parseInt(data.projectId, 10);
    if (data.status) payload.status = mapTripStatusToBE(data.status);
    if (data.endTime) payload.endTime = data.endTime;
    if (data.distance) payload.distance = data.distance;
    if (data.fuelUsed) payload.fuelUsed = data.fuelUsed;
    if (data.purpose) payload.purpose = data.purpose;
    if (data.notes) payload.notes = data.notes;

    const response = await post<any>("/fleet/trips", payload);
    return mapTripFromBE(response);
  },

  /** PATCH /fleet/trips/:id */
  updateTrip: async (id: string, data: any): Promise<any> => {
    console.log("[FleetService] Updating trip:", id);
    const payload = { ...data };
    if (payload.status) payload.status = mapTripStatusToBE(payload.status);
    const response = await patch<any>(`/fleet/trips/${id}`, payload);
    return mapTripFromBE(response);
  },

  // ==========================================================================
  // Fuel Records
  // ==========================================================================

  /** GET /fleet/fuel?vehicleId= */
  getFuelRecords: async (vehicleId?: string): Promise<any[]> => {
    console.log("[FleetService] Fetching fuel records");
    try {
      const params: Record<string, string> = {};
      if (vehicleId) params.vehicleId = vehicleId;
      const response = await get<any[]>(
        "/fleet/fuel",
        Object.keys(params).length ? params : undefined,
      );
      return (Array.isArray(response) ? response : []).map(mapFuelFromBE);
    } catch (err) {
      console.error("[FleetService] Error fetching fuel records:", err);
      return [];
    }
  },

  /** POST /fleet/fuel */
  createFuelRecord: async (data: any): Promise<any> => {
    console.log("[FleetService] Creating fuel record");
    const payload: any = {
      vehicleId: parseInt(data.vehicleId, 10),
      date: data.date || data.fuelDate || new Date().toISOString(),
      quantity: data.quantity || data.liters || 0,
      unitPrice: data.unitPrice || 0,
      totalCost: data.totalCost || data.cost || 0,
    };
    if (data.mileage || data.odometer)
      payload.mileage = data.mileage || data.odometer;
    if (data.fuelStation || data.station)
      payload.fuelStation = data.fuelStation || data.station;
    if (data.receiptUrl) payload.receiptUrl = data.receiptUrl;
    if (data.notes) payload.notes = data.notes;

    const response = await post<any>("/fleet/fuel", payload);
    return mapFuelFromBE(response);
  },

  /** GET /fleet/fuel/stats/:vehicleId */
  getFuelStats: async (
    vehicleId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> => {
    console.log("[FleetService] Fetching fuel stats:", vehicleId);
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      return await get<any>(
        `/fleet/fuel/stats/${vehicleId}`,
        Object.keys(params).length ? params : undefined,
      );
    } catch (err) {
      console.error("[FleetService] Error fetching fuel stats:", err);
      return null;
    }
  },

  // ==========================================================================
  // Drivers
  // ==========================================================================

  /** GET /fleet/drivers */
  getDrivers: async (): Promise<any[]> => {
    console.log("[FleetService] Fetching drivers");
    try {
      const response = await get<any[]>("/fleet/drivers");
      return (Array.isArray(response) ? response : []).map(mapDriverFromBE);
    } catch (err) {
      console.error("[FleetService] Error fetching drivers:", err);
      return [];
    }
  },

  /** GET /fleet/drivers/:id */
  getDriver: async (id: string): Promise<any> => {
    console.log("[FleetService] Fetching driver:", id);
    const response = await get<any>(`/fleet/drivers/${id}`);
    return mapDriverFromBE(response);
  },

  /** POST /fleet/drivers */
  createDriver: async (data: any): Promise<any> => {
    console.log("[FleetService] Creating driver");
    const response = await post<any>("/fleet/drivers", data);
    return mapDriverFromBE(response);
  },

  /** PATCH /fleet/drivers/:id */
  updateDriver: async (id: string, data: any): Promise<any> => {
    console.log("[FleetService] Updating driver:", id);
    const response = await patch<any>(`/fleet/drivers/${id}`, data);
    return mapDriverFromBE(response);
  },

  // ==========================================================================
  // Inspections
  // ==========================================================================

  /** GET /fleet/inspections?vehicleId= */
  getInspections: async (vehicleId?: string): Promise<any[]> => {
    console.log("[FleetService] Fetching inspections");
    try {
      const params: Record<string, string> = {};
      if (vehicleId) params.vehicleId = vehicleId;
      const response = await get<any[]>(
        "/fleet/inspections",
        Object.keys(params).length ? params : undefined,
      );
      return (Array.isArray(response) ? response : []).map(mapInspectionFromBE);
    } catch (err) {
      console.error("[FleetService] Error fetching inspections:", err);
      return [];
    }
  },

  /** POST /fleet/inspections */
  createInspection: async (data: any): Promise<any> => {
    console.log("[FleetService] Creating inspection");
    const response = await post<any>("/fleet/inspections", data);
    return mapInspectionFromBE(response);
  },

  /** PATCH /fleet/inspections/:id */
  updateInspection: async (id: string, data: any): Promise<any> => {
    console.log("[FleetService] Updating inspection:", id);
    const response = await patch<any>(`/fleet/inspections/${id}`, data);
    return mapInspectionFromBE(response);
  },
};

export default fleetService;
