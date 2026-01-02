/**
 * Fleet Management Service (MOCK - Backend Not Implemented Yet)
 * 
 * TODO: Backend needs to implement these endpoints:
 * - GET /fleet/vehicles - List all vehicles
 * - POST /fleet/vehicles - Create vehicle
 * - GET /fleet/vehicles/{id} - Get vehicle details
 * - PATCH /fleet/vehicles/{id} - Update vehicle
 * - DELETE /fleet/vehicles/{id} - Delete vehicle
 * - PATCH /fleet/vehicles/{id}/status - Update vehicle status
 * - POST /fleet/maintenance - Create maintenance record
 * - GET /fleet/maintenance - List maintenance records
 * - POST /fleet/fuel - Create fuel entry
 * - GET /fleet/fuel - List fuel entries
 * - GET /fleet/summary - Get fleet summary stats
 * 
 * For now, using local mock data until backend is ready.
 */

import type {
    FleetSummary,
    Vehicle,
    VehicleFilters,
} from '@/types/fleet';
import { FuelType, VehicleStatus, VehicleType } from '@/types/fleet';

// Mock data - remove when backend ready
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    vehicleNumber: 'VH-001',
    licensePlate: '29A-12345',
    make: 'Toyota',
    model: 'Hilux',
    year: 2022,
    type: VehicleType.PICKUP,
    status: VehicleStatus.ACTIVE,
    ownershipType: 'OWNED' as any,
    fuelType: FuelType.DIESEL,
    currentOdometer: 45230,
    lastMaintenanceDate: new Date('2025-10-15'),
    nextMaintenanceDate: new Date('2025-12-15'),
    assignedDriverName: 'Nguyễn Văn A',
    assignedProject: 'Dự án ABC',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-11-20'),
    createdBy: 'system',
  },
  {
    id: 'v2',
    vehicleNumber: 'VH-002',
    licensePlate: '51G-67890',
    make: 'Hino',
    model: '500',
    year: 2021,
    type: VehicleType.TRUCK,
    status: VehicleStatus.IN_MAINTENANCE,
    ownershipType: 'OWNED' as any,
    fuelType: FuelType.DIESEL,
    currentOdometer: 87560,
    lastMaintenanceDate: new Date('2025-11-01'),
    nextMaintenanceDate: new Date('2026-01-01'),
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2025-11-25'),
    createdBy: 'system',
  },
  {
    id: 'v3',
    vehicleNumber: 'VH-003',
    licensePlate: '59C-33333',
    make: 'Komatsu',
    model: 'PC200',
    year: 2020,
    type: VehicleType.EXCAVATOR,
    status: VehicleStatus.ACTIVE,
    ownershipType: 'OWNED' as any,
    fuelType: FuelType.DIESEL,
    currentOdometer: 12340,
    lastMaintenanceDate: new Date('2025-09-20'),
    nextMaintenanceDate: new Date('2025-12-20'),
    assignedProject: 'Dự án XYZ',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2025-11-18'),
    createdBy: 'system',
  },
];

const MOCK_SUMMARY: FleetSummary = {
  totalVehicles: 3,
  activeVehicles: 2,
  inMaintenanceVehicles: 1,
  availableVehicles: 2,
  vehiclesByType: {
    [VehicleType.PICKUP]: 1,
    [VehicleType.TRUCK]: 1,
    [VehicleType.EXCAVATOR]: 1,
  } as Record<VehicleType, number>,
  vehiclesByStatus: {
    [VehicleStatus.ACTIVE]: 2,
    [VehicleStatus.IN_MAINTENANCE]: 1,
  } as Record<VehicleStatus, number>,
  utilizationRate: 66.7,
  averageAge: 3,
  upcomingMaintenance: 1,
  overdueMaintenance: 0,
  maintenanceCostThisMonth: 5000000,
  fuelConsumptionThisMonth: 500,
  fuelCostThisMonth: 12500000,
  averageFuelEfficiency: 12.5,
  tripsThisMonth: 25,
  distanceThisMonth: 2500,
  totalCostThisMonth: 18000000,
  currency: 'VND',
};

export const fleetService = {
  /**
   * Get all vehicles (MOCK)
   * TODO: Replace with GET /fleet/vehicles
   */
  getVehicles: async (filters?: VehicleFilters): Promise<Vehicle[]> => {
    console.log('[FleetService] 🚗 Fetching vehicles (MOCK)');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...MOCK_VEHICLES];
    
    if (filters?.status?.length) {
      filtered = filtered.filter(v => filters.status!.includes(v.status));
    }
    
    if (filters?.type?.length) {
      filtered = filtered.filter(v => filters.type!.includes(v.type));
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(v =>
        v.licensePlate.toLowerCase().includes(search) ||
        v.make.toLowerCase().includes(search) ||
        v.model.toLowerCase().includes(search)
      );
    }
    
    console.log('[FleetService] ✅ Vehicles fetched (MOCK):', filtered.length);
    return filtered;
  },

  /**
   * Get vehicle by ID (MOCK)
   * TODO: Replace with GET /fleet/vehicles/{id}
   */
  getVehicle: async (id: string): Promise<Vehicle> => {
    console.log('[FleetService] 🚗 Fetching vehicle (MOCK):', id);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const vehicle = MOCK_VEHICLES.find(v => v.id === id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    return vehicle;
  },

  /**
   * Create vehicle (MOCK)
   * TODO: Replace with POST /fleet/vehicles
   */
  createVehicle: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    console.log('[FleetService] ➕ Creating vehicle (MOCK)');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newVehicle: Vehicle = {
      id: `v${Date.now()}`,
      vehicleNumber: data.vehicleNumber || `VH-${Date.now()}`,
      licensePlate: data.licensePlate || '',
      make: data.make || '',
      model: data.model || '',
      year: data.year || new Date().getFullYear(),
      type: data.type || VehicleType.CAR,
      status: data.status || VehicleStatus.ACTIVE,
      ownershipType: data.ownershipType || 'OWNED' as any,
      fuelType: data.fuelType || FuelType.GASOLINE,
      currentOdometer: data.currentOdometer || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
    };
    
    MOCK_VEHICLES.push(newVehicle);
    
    console.log('[FleetService] ✅ Vehicle created (MOCK):', newVehicle.id);
    return newVehicle;
  },

  /**
   * Update vehicle (MOCK)
   * TODO: Replace with PATCH /fleet/vehicles/{id}
   */
  updateVehicle: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    console.log('[FleetService] ✏️ Updating vehicle (MOCK):', id);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = MOCK_VEHICLES.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Vehicle not found');
    }
    
    MOCK_VEHICLES[index] = {
      ...MOCK_VEHICLES[index],
      ...data,
      updatedAt: new Date(),
    };
    
    console.log('[FleetService] ✅ Vehicle updated (MOCK)');
    return MOCK_VEHICLES[index];
  },

  /**
   * Delete vehicle (MOCK)
   * TODO: Replace with DELETE /fleet/vehicles/{id}
   */
  deleteVehicle: async (id: string): Promise<void> => {
    console.log('[FleetService] 🗑️ Deleting vehicle (MOCK):', id);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = MOCK_VEHICLES.findIndex(v => v.id === id);
    if (index !== -1) {
      MOCK_VEHICLES.splice(index, 1);
    }
    
    console.log('[FleetService] ✅ Vehicle deleted (MOCK)');
  },

  /**
   * Update vehicle status (MOCK)
   * TODO: Replace with PATCH /fleet/vehicles/{id}/status
   */
  updateVehicleStatus: async (id: string, status: VehicleStatus): Promise<Vehicle> => {
    console.log('[FleetService] 🔄 Updating vehicle status (MOCK):', id, status);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = MOCK_VEHICLES.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Vehicle not found');
    }
    
    MOCK_VEHICLES[index] = {
      ...MOCK_VEHICLES[index],
      status,
      updatedAt: new Date(),
    };
    
    return MOCK_VEHICLES[index];
  },

  /**
   * Get fleet summary (MOCK)
   * TODO: Replace with GET /fleet/summary
   */
  getFleetSummary: async (): Promise<FleetSummary> => {
    console.log('[FleetService] 📊 Fetching fleet summary (MOCK)');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Recalculate from current vehicles
    const summary: FleetSummary = {
      totalVehicles: MOCK_VEHICLES.length,
      activeVehicles: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.ACTIVE).length,
      inMaintenanceVehicles: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.IN_MAINTENANCE).length,
      availableVehicles: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.ACTIVE).length,
      vehiclesByType: MOCK_VEHICLES.reduce((acc, v) => ({ ...acc, [v.type]: (acc[v.type] || 0) + 1 }), {} as Record<VehicleType, number>),
      vehiclesByStatus: MOCK_VEHICLES.reduce((acc, v) => ({ ...acc, [v.status]: (acc[v.status] || 0) + 1 }), {} as Record<VehicleStatus, number>),
      utilizationRate: (MOCK_VEHICLES.filter(v => v.status === VehicleStatus.ACTIVE).length / MOCK_VEHICLES.length) * 100,
      averageAge: 3,
      upcomingMaintenance: 1,
      overdueMaintenance: 0,
      maintenanceCostThisMonth: 5000000,
      fuelConsumptionThisMonth: 500,
      fuelCostThisMonth: 12500000,
      averageFuelEfficiency: 12.5,
      tripsThisMonth: 25,
      distanceThisMonth: 2500,
      totalCostThisMonth: 18000000,
      currency: 'VND',
    };
    
    console.log('[FleetService] ✅ Fleet summary fetched (MOCK)');
    return summary;
  },
};

export default fleetService;
