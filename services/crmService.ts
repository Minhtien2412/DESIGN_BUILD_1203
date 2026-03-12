/**
 * CRM Service with Mock Fallback
 * Provides CRM data (leads, clients, deals, activities)
 * Falls back to mock data when API is unavailable
 */

import { apiFetch } from "./api";
import {
    mockCrmActivities,
    mockCrmClients,
    mockCrmDeals,
    mockCrmLeads,
} from "./mockDataService";

// ============================================
// Types
// ============================================

export interface CrmLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";
  value: number;
  assignedTo: string;
  createdAt: string;
  notes?: string;
}

export interface CrmClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "business" | "individual";
  totalProjects: number;
  totalValue: number;
  status: "active" | "inactive";
  address?: string;
}

export interface CrmDeal {
  id: string;
  title: string;
  client: string;
  value: number;
  stage:
    | "lead"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost";
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
}

export interface CrmActivity {
  id: string;
  type: "call" | "meeting" | "email" | "task" | "note";
  subject: string;
  description?: string;
  relatedTo: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  assignedTo: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all leads
 */
export async function getLeads(): Promise<CrmLead[]> {
  try {
    const response = await apiFetch<CrmLead[]>("/crm/leads");
    return response;
  } catch (error) {
    console.log("[CRM] Leads API unavailable, using mock data");
    return mockCrmLeads as CrmLead[];
  }
}

/**
 * Get lead by ID
 */
export async function getLeadById(id: string): Promise<CrmLead | null> {
  try {
    const response = await apiFetch<CrmLead>(`/crm/leads/${id}`);
    return response;
  } catch (error) {
    const mockLead = mockCrmLeads.find((l) => l.id === id);
    return (mockLead as CrmLead) || null;
  }
}

/**
 * Create new lead
 */
export async function createLead(data: Partial<CrmLead>): Promise<CrmLead> {
  try {
    const response = await apiFetch<CrmLead>("/crm/leads", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    // Return mock response for development
    return {
      id: String(Date.now()),
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      source: data.source || "Manual",
      status: "new",
      value: data.value || 0,
      assignedTo: data.assignedTo || "Unassigned",
      createdAt: new Date().toISOString(),
      notes: data.notes,
    };
  }
}

/**
 * Update lead
 */
export async function updateLead(
  id: string,
  data: Partial<CrmLead>,
): Promise<CrmLead> {
  try {
    const response = await apiFetch<CrmLead>(`/crm/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    const existing = mockCrmLeads.find((l) => l.id === id);
    return { ...existing, ...data } as CrmLead;
  }
}

/**
 * Get all clients
 */
export async function getClients(): Promise<CrmClient[]> {
  try {
    const response = await apiFetch<CrmClient[]>("/crm/clients");
    return response;
  } catch (error) {
    console.log("[CRM] Clients API unavailable, using mock data");
    return mockCrmClients as CrmClient[];
  }
}

/**
 * Get client by ID
 */
export async function getClientById(id: string): Promise<CrmClient | null> {
  try {
    const response = await apiFetch<CrmClient>(`/crm/clients/${id}`);
    return response;
  } catch (error) {
    const mockClient = mockCrmClients.find((c) => c.id === id);
    return (mockClient as CrmClient) || null;
  }
}

/**
 * Get all deals
 */
export async function getDeals(): Promise<CrmDeal[]> {
  try {
    const response = await apiFetch<CrmDeal[]>("/crm/deals");
    return response;
  } catch (error) {
    console.log("[CRM] Deals API unavailable, using mock data");
    return mockCrmDeals as CrmDeal[];
  }
}

/**
 * Get deal by ID
 */
export async function getDealById(id: string): Promise<CrmDeal | null> {
  try {
    const response = await apiFetch<CrmDeal>(`/crm/deals/${id}`);
    return response;
  } catch (error) {
    const mockDeal = mockCrmDeals.find((d) => d.id === id);
    return (mockDeal as CrmDeal) || null;
  }
}

/**
 * Create new deal
 */
export async function createDeal(data: Partial<CrmDeal>): Promise<CrmDeal> {
  try {
    const response = await apiFetch<CrmDeal>("/crm/deals", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    return {
      id: String(Date.now()),
      title: data.title || "",
      client: data.client || "",
      value: data.value || 0,
      stage: "lead",
      probability: data.probability || 10,
      expectedCloseDate: data.expectedCloseDate || new Date().toISOString(),
      assignedTo: data.assignedTo || "Unassigned",
    };
  }
}

/**
 * Get all activities
 */
export async function getActivities(): Promise<CrmActivity[]> {
  try {
    const response = await apiFetch<CrmActivity[]>("/crm/activities");
    return response;
  } catch (error) {
    console.log("[CRM] Activities API unavailable, using mock data");
    return mockCrmActivities as CrmActivity[];
  }
}

/**
 * Get upcoming activities
 */
export async function getUpcomingActivities(
  limit = 10,
): Promise<CrmActivity[]> {
  const activities = await getActivities();
  const now = new Date();
  return activities
    .filter((a) => a.status === "scheduled" && new Date(a.scheduledAt) > now)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    .slice(0, limit);
}

/**
 * Create new activity
 */
export async function createActivity(
  data: Partial<CrmActivity>,
): Promise<CrmActivity> {
  try {
    const response = await apiFetch<CrmActivity>("/crm/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    return {
      id: String(Date.now()),
      type: data.type || "task",
      subject: data.subject || "",
      description: data.description,
      relatedTo: data.relatedTo || "",
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      status: "scheduled",
      assignedTo: data.assignedTo || "Unassigned",
    };
  }
}

/**
 * Complete an activity
 */
export async function completeActivity(id: string): Promise<CrmActivity> {
  try {
    const response = await apiFetch<CrmActivity>(
      `/crm/activities/${id}/complete`,
      {
        method: "POST",
      },
    );
    return response;
  } catch (error) {
    const existing = mockCrmActivities.find((a) => a.id === id);
    return { ...existing, status: "completed" } as CrmActivity;
  }
}

// ============================================
// Dashboard Stats
// ============================================

export interface CrmDashboardStats {
  totalLeads: number;
  newLeadsThisWeek: number;
  totalClients: number;
  activeClients: number;
  totalDeals: number;
  dealsPipeline: number;
  upcomingActivities: number;
  overdueActivities: number;
  conversionRate: number;
}

export async function getCrmDashboardStats(): Promise<CrmDashboardStats> {
  try {
    const response = await apiFetch<CrmDashboardStats>("/crm/dashboard/stats");
    return response;
  } catch (error) {
    // Calculate from mock data
    const leads = mockCrmLeads;
    const clients = mockCrmClients;
    const deals = mockCrmDeals;
    const activities = mockCrmActivities;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalLeads: leads.length,
      newLeadsThisWeek: leads.filter((l) => new Date(l.createdAt) > weekAgo)
        .length,
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "active").length,
      totalDeals: deals.length,
      dealsPipeline: deals.reduce(
        (sum, d) => sum + (d.value * d.probability) / 100,
        0,
      ),
      upcomingActivities: activities.filter(
        (a) => a.status === "scheduled" && new Date(a.scheduledAt) > now,
      ).length,
      overdueActivities: activities.filter(
        (a) => a.status === "scheduled" && new Date(a.scheduledAt) < now,
      ).length,
      conversionRate: 25, // Mock value
    };
  }
}

export default {
  // Leads
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  // Clients
  getClients,
  getClientById,
  // Deals
  getDeals,
  getDealById,
  createDeal,
  // Activities
  getActivities,
  getUpcomingActivities,
  createActivity,
  completeActivity,
  // Dashboard
  getCrmDashboardStats,
};
