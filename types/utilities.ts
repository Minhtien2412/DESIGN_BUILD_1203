/**
 * Utilities Data Types
 * TypeScript interfaces for Cost Estimator, Appointments, Quotes
 */

// ============================================
// COST ESTIMATOR TYPES
// ============================================
export interface CostEstimate {
  id: string;
  area: number;
  floors: number;
  category: 'basic' | 'standard' | 'premium';
  estimatedCost: number;
  createdAt: string;
  userId?: string;
  projectName?: string;
  notes?: string;
}

export interface CostEstimateInput {
  area: number;
  floors: number;
  category: 'basic' | 'standard' | 'premium';
  projectName?: string;
  notes?: string;
}

// ============================================
// APPOINTMENT TYPES
// ============================================
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string; // ISO date string
  timeSlot: string; // e.g., "08:00 - 09:00"
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  userId?: string;
}

export interface AppointmentInput {
  name: string;
  phone: string;
  email?: string;
  date: string;
  timeSlot: string;
  notes?: string;
}

// ============================================
// QUOTE REQUEST TYPES
// ============================================
export type QuoteStatus = 'pending' | 'in-review' | 'quoted' | 'accepted' | 'rejected';

export interface Quote {
  id: string;
  name: string;
  phone: string;
  email?: string;
  selectedService: string;
  description: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  quotedAmount?: number;
  quotedBy?: string;
  quotedAt?: string;
  responseMessage?: string;
}

export interface QuoteInput {
  name: string;
  phone: string;
  email?: string;
  selectedService: string;
  description: string;
}

// ============================================
// STORE TYPES
// ============================================
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isOpen: boolean;
  openingHours?: string;
  distance?: number; // in kilometers
}

// ============================================
// UTILITIES CONTEXT STATE
// ============================================
export interface UtilitiesState {
  costEstimates: CostEstimate[];
  appointments: Appointment[];
  quotes: Quote[];
  loading: boolean;
  error: string | null;
}
