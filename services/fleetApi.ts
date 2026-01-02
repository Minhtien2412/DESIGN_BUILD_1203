/**
 * Fleet Management API
 * Equipment tracking and maintenance management
 */

import { apiFetch } from './api';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: string;
  };
  assignedTo?: {
    projectId: string;
    projectName: string;
    operatorId?: string;
    operatorName?: string;
  };
  specifications?: Record<string, any>;
  purchaseDate: string;
  purchasePrice: number;
  currentValue?: number;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'inspection';
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  cost?: number;
  technician?: string;
  notes?: string;
}

export interface FuelLog {
  id: string;
  equipmentId: string;
  date: string;
  quantity: number;
  unit: 'liters' | 'gallons';
  cost: number;
  odometer?: number;
  location: string;
  operator: string;
}

export interface UsageLog {
  id: string;
  equipmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  operator: string;
  projectId: string;
  taskDescription: string;
  odometer?: number;
}

export interface FleetStatistics {
  totalEquipment: number;
  availableEquipment: number;
  inUseEquipment: number;
  maintenanceEquipment: number;
  utilizationRate: number;
  totalValue: number;
  monthlyMaintenanceCost: number;
  monthlyFuelCost: number;
  upcomingMaintenance: number;
}

class FleetService {
  /**
   * Get all equipment
   */
  async getEquipment(filters?: {
    status?: string;
    type?: string;
    projectId?: string;
    search?: string;
  }): Promise<{ equipment: Equipment[]; total: number }> {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await apiFetch(`/fleet/equipment?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load equipment: ${error.message}`);
    }
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(id: string): Promise<Equipment> {
    try {
      const response = await apiFetch(`/fleet/equipment/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load equipment: ${error.message}`);
    }
  }

  /**
   * Create new equipment
   */
  async createEquipment(data: Partial<Equipment>): Promise<Equipment> {
    try {
      const response = await apiFetch('/fleet/equipment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to create equipment: ${error.message}`);
    }
  }

  /**
   * Update equipment
   */
  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment> {
    try {
      const response = await apiFetch(`/fleet/equipment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to update equipment: ${error.message}`);
    }
  }

  /**
   * Get equipment location
   */
  async getEquipmentLocation(id: string): Promise<{
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: string;
  }> {
    try {
      const response = await apiFetch(`/fleet/equipment/${id}/location`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load location: ${error.message}`);
    }
  }

  /**
   * Update equipment location
   */
  async updateLocation(
    id: string,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      await apiFetch(`/fleet/equipment/${id}/location`, {
        method: 'PUT',
        body: JSON.stringify(location),
      });
    } catch (error: any) {
      throw new Error(`Failed to update location: ${error.message}`);
    }
  }

  /**
   * Get maintenance schedules
   */
  async getMaintenanceSchedules(filters?: {
    equipmentId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ schedules: MaintenanceSchedule[]; total: number }> {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await apiFetch(`/fleet/maintenance?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load maintenance schedules: ${error.message}`);
    }
  }

  /**
   * Create maintenance schedule
   */
  async createMaintenanceSchedule(
    data: Partial<MaintenanceSchedule>
  ): Promise<MaintenanceSchedule> {
    try {
      const response = await apiFetch('/fleet/maintenance', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to create maintenance schedule: ${error.message}`);
    }
  }

  /**
   * Update maintenance schedule
   */
  async updateMaintenanceSchedule(
    id: string,
    data: Partial<MaintenanceSchedule>
  ): Promise<MaintenanceSchedule> {
    try {
      const response = await apiFetch(`/fleet/maintenance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to update maintenance schedule: ${error.message}`);
    }
  }

  /**
   * Get fuel logs
   */
  async getFuelLogs(filters?: {
    equipmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: FuelLog[]; total: number; totalCost: number }> {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await apiFetch(`/fleet/fuel-logs?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load fuel logs: ${error.message}`);
    }
  }

  /**
   * Create fuel log
   */
  async createFuelLog(data: Partial<FuelLog>): Promise<FuelLog> {
    try {
      const response = await apiFetch('/fleet/fuel-logs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to create fuel log: ${error.message}`);
    }
  }

  /**
   * Get usage logs
   */
  async getUsageLogs(filters?: {
    equipmentId?: string;
    projectId?: string;
    operatorId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: UsageLog[]; total: number; totalDuration: number }> {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await apiFetch(`/fleet/usage-logs?${params}`);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load usage logs: ${error.message}`);
    }
  }

  /**
   * Create usage log
   */
  async createUsageLog(data: Partial<UsageLog>): Promise<UsageLog> {
    try {
      const response = await apiFetch('/fleet/usage-logs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to create usage log: ${error.message}`);
    }
  }

  /**
   * Get fleet statistics
   */
  async getStatistics(): Promise<FleetStatistics> {
    try {
      const response = await apiFetch('/fleet/statistics');
      return response;
    } catch (error: any) {
      throw new Error(`Failed to load statistics: ${error.message}`);
    }
  }

  /**
   * Assign equipment to project
   */
  async assignToProject(
    equipmentId: string,
    projectId: string,
    operatorId?: string
  ): Promise<void> {
    try {
      await apiFetch(`/fleet/equipment/${equipmentId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ projectId, operatorId }),
      });
    } catch (error: any) {
      throw new Error(`Failed to assign equipment: ${error.message}`);
    }
  }

  /**
   * Release equipment from project
   */
  async releaseFromProject(equipmentId: string): Promise<void> {
    try {
      await apiFetch(`/fleet/equipment/${equipmentId}/release`, {
        method: 'POST',
      });
    } catch (error: any) {
      throw new Error(`Failed to release equipment: ${error.message}`);
    }
  }
}

export const fleetService = new FleetService();
