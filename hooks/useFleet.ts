/**
 * Fleet Management Hooks
 */

import * as fleetService from '@/services/fleet';
import type {
    Driver,
    FleetAnalytics,
    FleetSummary,
    FuelEntry,
    FuelFilters,
    Inspection,
    MaintenanceFilters,
    MaintenanceRecord,
    MaintenanceStatus,
    Trip,
    TripFilters,
    TripStatus,
    Vehicle,
    VehicleFilters,
    VehicleStatus,
} from '@/types/fleet';
import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// Vehicles
// ============================================================================

export function useVehicles(filters?: VehicleFilters) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getVehicles(filters);
      setVehicles(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const createVehicle = async (data: Partial<Vehicle>) => {
    const newVehicle = await fleetService.createVehicle(data);
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  };

  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    const updated = await fleetService.updateVehicle(id, data);
    setVehicles(prev => prev.map(v => v.id === id ? updated : v));
    return updated;
  };

  const deleteVehicle = async (id: string) => {
    await fleetService.deleteVehicle(id);
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const updateStatus = async (id: string, status: VehicleStatus) => {
    const updated = await fleetService.updateVehicleStatus(id, status);
    setVehicles(prev => prev.map(v => v.id === id ? updated : v));
    return updated;
  };

  const assignVehicle = async (id: string, driverId?: string, projectId?: string) => {
    const updated = await fleetService.assignVehicle(id, driverId, projectId);
    setVehicles(prev => prev.map(v => v.id === id ? updated : v));
    return updated;
  };

  const updateOdometer = async (id: string, odometer: number) => {
    const updated = await fleetService.updateOdometer(id, odometer);
    setVehicles(prev => prev.map(v => v.id === id ? updated : v));
    return updated;
  };

  return {
    vehicles,
    loading,
    error,
    refresh: fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateStatus,
    assignVehicle,
    updateOdometer,
  };
}

export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVehicle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getVehicle(id);
      setVehicle(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  return { vehicle, loading, error, refresh: fetchVehicle };
}

// ============================================================================
// Maintenance
// ============================================================================

export function useMaintenanceRecords(filters?: MaintenanceFilters) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getMaintenanceRecords(filters);
      setRecords(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const createRecord = async (data: Partial<MaintenanceRecord>) => {
    const newRecord = await fleetService.createMaintenanceRecord(data);
    setRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const updateRecord = async (id: string, data: Partial<MaintenanceRecord>) => {
    const updated = await fleetService.updateMaintenanceRecord(id, data);
    setRecords(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const deleteRecord = async (id: string) => {
    await fleetService.deleteMaintenanceRecord(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const updateStatus = async (id: string, status: MaintenanceStatus) => {
    const updated = await fleetService.updateMaintenanceStatus(id, status);
    setRecords(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const completeMaintenance = async (
    id: string,
    completionDate: Date,
    workPerformed: string,
    totalCost?: number
  ) => {
    const updated = await fleetService.completeMaintenance(
      id,
      typeof completionDate === 'string' ? completionDate : completionDate.toISOString(),
      workPerformed,
      totalCost
    );
    setRecords(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  return {
    records,
    loading,
    error,
    refresh: fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    updateStatus,
    completeMaintenance,
  };
}

export function useMaintenanceRecord(id: string) {
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getMaintenanceRecord(id);
      setRecord(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  return { record, loading, error, refresh: fetchRecord };
}

// ============================================================================
// Trips
// ============================================================================

export function useTrips(filters?: TripFilters) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getTrips(filters);
      setTrips(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = async (data: Partial<Trip>) => {
    const newTrip = await fleetService.createTrip(data);
    setTrips(prev => [newTrip, ...prev]);
    return newTrip;
  };

  const updateTrip = async (id: string, data: Partial<Trip>) => {
    const updated = await fleetService.updateTrip(id, data);
    setTrips(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTrip = async (id: string) => {
    await fleetService.deleteTrip(id);
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  const startTrip = async (id: string, startOdometer: number, startFuelLevel?: number) => {
    const updated = await fleetService.startTrip(id, startOdometer, startFuelLevel);
    setTrips(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const endTrip = async (id: string, endOdometer: number, endFuelLevel?: number, notes?: string) => {
    const updated = await fleetService.endTrip(id, endOdometer, endFuelLevel, notes);
    setTrips(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const updateStatus = async (id: string, status: TripStatus) => {
    const updated = await fleetService.updateTripStatus(id, status);
    setTrips(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  return {
    trips,
    loading,
    error,
    refresh: fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    startTrip,
    endTrip,
    updateStatus,
  };
}

export function useTrip(id: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrip = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getTrip(id);
      setTrip(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  return { trip, loading, error, refresh: fetchTrip };
}

// ============================================================================
// Fuel Entries
// ============================================================================

export function useFuelEntries(filters?: FuelFilters) {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getFuelEntries(filters);
      setEntries(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (data: Partial<FuelEntry>) => {
    const newEntry = await fleetService.createFuelEntry(data);
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateEntry = async (id: string, data: Partial<FuelEntry>) => {
    const updated = await fleetService.updateFuelEntry(id, data);
    setEntries(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  const deleteEntry = async (id: string) => {
    await fleetService.deleteFuelEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return {
    entries,
    loading,
    error,
    refresh: fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}

export function useFuelEntry(id: string) {
  const [entry, setEntry] = useState<FuelEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntry = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getFuelEntry(id);
      setEntry(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  return { entry, loading, error, refresh: fetchEntry };
}

// ============================================================================
// Inspections
// ============================================================================

export function useInspections(vehicleId?: string) {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getInspections(vehicleId);
      setInspections(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const createInspection = async (data: Partial<Inspection>) => {
    const newInspection = await fleetService.createInspection(data);
    setInspections(prev => [newInspection, ...prev]);
    return newInspection;
  };

  const updateInspection = async (id: string, data: Partial<Inspection>) => {
    const updated = await fleetService.updateInspection(id, data);
    setInspections(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  const deleteInspection = async (id: string) => {
    await fleetService.deleteInspection(id);
    setInspections(prev => prev.filter(i => i.id !== id));
  };

  return {
    inspections,
    loading,
    error,
    refresh: fetchInspections,
    createInspection,
    updateInspection,
    deleteInspection,
  };
}

export function useInspection(id: string) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInspection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getInspection(id);
      setInspection(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInspection();
  }, [fetchInspection]);

  return { inspection, loading, error, refresh: fetchInspection };
}

// ============================================================================
// Drivers
// ============================================================================

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getDrivers();
      setDrivers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const createDriver = async (data: Partial<Driver>) => {
    const newDriver = await fleetService.createDriver(data);
    setDrivers(prev => [newDriver, ...prev]);
    return newDriver;
  };

  const updateDriver = async (id: string, data: Partial<Driver>) => {
    const updated = await fleetService.updateDriver(id, data);
    setDrivers(prev => prev.map(d => d.id === id ? updated : d));
    return updated;
  };

  const deleteDriver = async (id: string) => {
    await fleetService.deleteDriver(id);
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  return {
    drivers,
    loading,
    error,
    refresh: fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
  };
}

export function useDriver(id: string) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDriver = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getDriver(id);
      setDriver(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  return { driver, loading, error, refresh: fetchDriver };
}

// ============================================================================
// Analytics
// ============================================================================

export function useFleetSummary() {
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getFleetSummary();
      setSummary(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refresh: fetchSummary };
}

export function useFleetAnalytics(dateFrom?: Date, dateTo?: Date) {
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getFleetAnalytics(dateFrom, dateTo);
      setAnalytics(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refresh: fetchAnalytics };
}
