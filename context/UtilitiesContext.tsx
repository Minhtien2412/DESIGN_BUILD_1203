/**
 * Utilities Context Provider
 * Global state management for Cost Estimates, Appointments, and Quotes
 */
import { getStorageItem, setStorageItem } from "@/utils/storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    Appointment,
    AppointmentInput,
    CostEstimate,
    CostEstimateInput,
    Quote,
    QuoteInput,
    UtilitiesState,
} from "../types/utilities";

// ============================================
// CONTEXT TYPE
// ============================================
interface UtilitiesContextType extends UtilitiesState {
  // Cost Estimator
  addCostEstimate: (input: CostEstimateInput) => Promise<CostEstimate>;
  deleteCostEstimate: (id: string) => Promise<void>;
  getCostEstimateById: (id: string) => CostEstimate | undefined;

  // Appointments
  createAppointment: (input: AppointmentInput) => Promise<Appointment>;
  updateAppointmentStatus: (
    id: string,
    status: Appointment["status"],
  ) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getAppointmentById: (id: string) => Appointment | undefined;
  getUpcomingAppointments: () => Appointment[];

  // Quotes
  createQuote: (input: QuoteInput) => Promise<Quote>;
  updateQuoteStatus: (id: string, status: Quote["status"]) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  getQuoteById: (id: string) => Quote | undefined;
  getPendingQuotes: () => Quote[];

  // General
  refreshData: () => Promise<void>;
}

// ============================================
// CONTEXT CREATION
// ============================================
const UtilitiesContext = createContext<UtilitiesContextType | undefined>(
  undefined,
);

// Storage keys
const STORAGE_KEYS = {
  COST_ESTIMATES: "utilities_cost_estimates",
  APPOINTMENTS: "utilities_appointments",
  QUOTES: "utilities_quotes",
};

// ============================================
// PROVIDER COMPONENT
// ============================================
export function UtilitiesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UtilitiesState>({
    costEstimates: [],
    appointments: [],
    quotes: [],
    loading: true,
    error: null,
  });

  // ============================================
  // LOAD DATA FROM STORAGE
  // ============================================
  const loadData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [estimates, appointments, quotes] = await Promise.all([
        getStorageItem<CostEstimate[]>(STORAGE_KEYS.COST_ESTIMATES),
        getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS),
        getStorageItem<Quote[]>(STORAGE_KEYS.QUOTES),
      ]);

      setState({
        costEstimates: estimates || [],
        appointments: appointments || [],
        quotes: quotes || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to load utilities data:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Không thể tải dữ liệu",
      }));
    }
  };

  // DEFERRED - Load data after first frame renders
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      loadData();
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // ============================================
  // COST ESTIMATOR FUNCTIONS
  // ============================================
  const addCostEstimate = async (
    input: CostEstimateInput,
  ): Promise<CostEstimate> => {
    const pricePerSqm = {
      basic: 3500000,
      standard: 5000000,
      premium: 8000000,
    };

    const estimate: CostEstimate = {
      id: Date.now().toString(),
      ...input,
      estimatedCost: input.area * input.floors * pricePerSqm[input.category],
      createdAt: new Date().toISOString(),
    };

    const newEstimates = [estimate, ...state.costEstimates];
    await setStorageItem(STORAGE_KEYS.COST_ESTIMATES, newEstimates);
    setState((prev) => ({ ...prev, costEstimates: newEstimates }));

    return estimate;
  };

  const deleteCostEstimate = async (id: string) => {
    const newEstimates = state.costEstimates.filter((e) => e.id !== id);
    await setStorageItem(STORAGE_KEYS.COST_ESTIMATES, newEstimates);
    setState((prev) => ({ ...prev, costEstimates: newEstimates }));
  };

  const getCostEstimateById = (id: string) => {
    return state.costEstimates.find((e) => e.id === id);
  };

  // ============================================
  // APPOINTMENT FUNCTIONS
  // ============================================
  const createAppointment = async (
    input: AppointmentInput,
  ): Promise<Appointment> => {
    const appointment: Appointment = {
      id: Date.now().toString(),
      ...input,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const newAppointments = [appointment, ...state.appointments];
    await setStorageItem(STORAGE_KEYS.APPOINTMENTS, newAppointments);
    setState((prev) => ({ ...prev, appointments: newAppointments }));

    return appointment;
  };

  const updateAppointmentStatus = async (
    id: string,
    status: Appointment["status"],
  ) => {
    const newAppointments = state.appointments.map((a) =>
      a.id === id ? { ...a, status } : a,
    );
    await setStorageItem(STORAGE_KEYS.APPOINTMENTS, newAppointments);
    setState((prev) => ({ ...prev, appointments: newAppointments }));
  };

  const deleteAppointment = async (id: string) => {
    const newAppointments = state.appointments.filter((a) => a.id !== id);
    await setStorageItem(STORAGE_KEYS.APPOINTMENTS, newAppointments);
    setState((prev) => ({ ...prev, appointments: newAppointments }));
  };

  const getAppointmentById = (id: string) => {
    return state.appointments.find((a) => a.id === id);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return state.appointments
      .filter((a) => {
        const appointmentDate = new Date(a.date);
        return appointmentDate >= now && a.status !== "cancelled";
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // ============================================
  // QUOTE FUNCTIONS
  // ============================================
  const createQuote = async (input: QuoteInput): Promise<Quote> => {
    const quote: Quote = {
      id: Date.now().toString(),
      ...input,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newQuotes = [quote, ...state.quotes];
    await setStorageItem(STORAGE_KEYS.QUOTES, newQuotes);
    setState((prev) => ({ ...prev, quotes: newQuotes }));

    // TODO: Send to API/backend
    // await apiFetch('/quotes', { method: 'POST', body: JSON.stringify(quote) });

    return quote;
  };

  const updateQuoteStatus = async (id: string, status: Quote["status"]) => {
    const newQuotes = state.quotes.map((q) =>
      q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q,
    );
    await setStorageItem(STORAGE_KEYS.QUOTES, newQuotes);
    setState((prev) => ({ ...prev, quotes: newQuotes }));
  };

  const deleteQuote = async (id: string) => {
    const newQuotes = state.quotes.filter((q) => q.id !== id);
    await setStorageItem(STORAGE_KEYS.QUOTES, newQuotes);
    setState((prev) => ({ ...prev, quotes: newQuotes }));
  };

  const getQuoteById = (id: string) => {
    return state.quotes.find((q) => q.id === id);
  };

  const getPendingQuotes = () => {
    return state.quotes.filter(
      (q) => q.status === "pending" || q.status === "in-review",
    );
  };

  // ============================================
  // GENERAL FUNCTIONS
  // ============================================
  const refreshData = async () => {
    await loadData();
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: UtilitiesContextType = {
    ...state,
    addCostEstimate,
    deleteCostEstimate,
    getCostEstimateById,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    getAppointmentById,
    getUpcomingAppointments,
    createQuote,
    updateQuoteStatus,
    deleteQuote,
    getQuoteById,
    getPendingQuotes,
    refreshData,
  };

  return (
    <UtilitiesContext.Provider value={value}>
      {children}
    </UtilitiesContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================
export function useUtilities() {
  const context = useContext(UtilitiesContext);
  if (context === undefined) {
    throw new Error("useUtilities must be used within UtilitiesProvider");
  }
  return context;
}
