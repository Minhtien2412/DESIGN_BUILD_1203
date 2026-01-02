/**
 * Fleet API Service Tests
 */

import { fleetService } from '@/services/fleetApi';

jest.mock('@/services/api', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@/services/api';
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('fleetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEquipment', () => {
    it('should fetch equipment list successfully', async () => {
      const mockData = {
        equipment: [
          {
            id: '1',
            name: 'Excavator',
            type: 'excavator',
            model: 'CAT 320',
            manufacturer: 'Caterpillar',
            serialNumber: 'EX123456',
            status: 'available' as const,
            condition: 'good' as const,
            purchaseDate: '2023-01-01',
            purchasePrice: 500000000,
          },
        ],
        total: 1,
      };

      mockApiFetch.mockResolvedValueOnce(mockData);

      const result = await fleetService.getEquipment();

      expect(mockApiFetch).toHaveBeenCalledWith('/fleet/equipment?');
      expect(result.equipment).toHaveLength(1);
      expect(result.equipment[0].name).toBe('Excavator');
    });

    it('should filter equipment by status', async () => {
      const mockData = {
        equipment: [],
        total: 0,
      };

      mockApiFetch.mockResolvedValueOnce(mockData);

      await fleetService.getEquipment({ status: 'in-use' });

      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=in-use')
      );
    });
  });

  describe('createMaintenanceSchedule', () => {
    it('should create a maintenance schedule', async () => {
      const mockSchedule = {
        id: '1',
        equipmentId: 'eq-1',
        type: 'preventive' as const,
        title: 'Oil Change',
        description: 'Regular oil change',
        scheduledDate: '2025-12-30',
        status: 'scheduled' as const,
      };

      mockApiFetch.mockResolvedValueOnce(mockSchedule);

      const result = await fleetService.createMaintenanceSchedule({
        equipmentId: 'eq-1',
        type: 'preventive',
        title: 'Oil Change',
        description: 'Regular oil change',
        scheduledDate: '2025-12-30',
      });

      expect(result.title).toBe('Oil Change');
      expect(result.type).toBe('preventive');
    });
  });

  describe('getStatistics', () => {
    it('should fetch fleet statistics', async () => {
      const mockStats = {
        totalEquipment: 10,
        availableEquipment: 6,
        inUseEquipment: 3,
        maintenanceEquipment: 1,
        utilizationRate: 70,
        totalValue: 5000000000,
        monthlyMaintenanceCost: 50000000,
        monthlyFuelCost: 30000000,
        upcomingMaintenance: 2,
      };

      mockApiFetch.mockResolvedValueOnce(mockStats);

      const result = await fleetService.getStatistics();

      expect(result.totalEquipment).toBe(10);
      expect(result.utilizationRate).toBe(70);
    });
  });

  describe('assignToProject', () => {
    it('should assign equipment to a project', async () => {
      mockApiFetch.mockResolvedValueOnce({});

      await fleetService.assignToProject('eq-1', 'proj-1', 'user-1');

      expect(mockApiFetch).toHaveBeenCalledWith('/fleet/equipment/eq-1/assign', {
        method: 'POST',
        body: JSON.stringify({
          projectId: 'proj-1',
          operatorId: 'user-1',
        }),
      });
    });
  });
});
