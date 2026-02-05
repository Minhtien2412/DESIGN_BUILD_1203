/**
 * Estimate Service - Quản lý CRUD bản dự toán
 * Lưu trữ, chỉnh sửa, xóa các bản dự toán với ID
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";

const ESTIMATES_STORAGE_KEY = "@saved_estimates";
const ESTIMATE_ID_COUNTER_KEY = "@estimate_id_counter";

// Estimate types
export type EstimateType =
  | "total"
  | "structure"
  | "materials"
  | "finishing"
  | "mep"
  | "interior"
  | "concrete"
  | "steel"
  | "paint";

export type EstimateStatus = "draft" | "completed" | "archived";

export interface EstimateItem {
  id: string;
  localId: number; // Local auto-increment ID
  serverId?: string; // Server database ID (if synced)
  type: EstimateType;
  name: string;
  description?: string;
  data: Record<string, any>; // Full calculation data
  results: {
    totalCost: number;
    breakdown?: Record<string, number>;
    unit?: string;
    quantity?: number;
  };
  status: EstimateStatus;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  isSynced: boolean;
  tags?: string[];
  projectName?: string;
  location?: string;
}

export interface CreateEstimateInput {
  type: EstimateType;
  name: string;
  description?: string;
  data: Record<string, any>;
  results: EstimateItem["results"];
  status?: EstimateStatus;
  tags?: string[];
  projectName?: string;
  location?: string;
}

export interface UpdateEstimateInput {
  name?: string;
  description?: string;
  data?: Record<string, any>;
  results?: EstimateItem["results"];
  status?: EstimateStatus;
  tags?: string[];
  projectName?: string;
  location?: string;
}

// Get next local ID
async function getNextLocalId(): Promise<number> {
  try {
    const counter = await AsyncStorage.getItem(ESTIMATE_ID_COUNTER_KEY);
    const nextId = counter ? parseInt(counter) + 1 : 1;
    await AsyncStorage.setItem(ESTIMATE_ID_COUNTER_KEY, nextId.toString());
    return nextId;
  } catch (error) {
    console.error("[EstimateService] Error getting next ID:", error);
    return Date.now();
  }
}

// Generate unique ID
function generateUniqueId(): string {
  return `est_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get all estimates from local storage
export async function getAllEstimates(): Promise<EstimateItem[]> {
  try {
    const data = await AsyncStorage.getItem(ESTIMATES_STORAGE_KEY);
    if (!data) return [];
    const estimates: EstimateItem[] = JSON.parse(data);
    // Sort by updatedAt desc
    return estimates.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch (error) {
    console.error("[EstimateService] Error getting estimates:", error);
    return [];
  }
}

// Get estimates by type
export async function getEstimatesByType(
  type: EstimateType,
): Promise<EstimateItem[]> {
  const all = await getAllEstimates();
  return all.filter((e) => e.type === type);
}

// Get estimate by ID
export async function getEstimateById(
  id: string,
): Promise<EstimateItem | null> {
  const all = await getAllEstimates();
  return all.find((e) => e.id === id) || null;
}

// Get estimate by local ID
export async function getEstimateByLocalId(
  localId: number,
): Promise<EstimateItem | null> {
  const all = await getAllEstimates();
  return all.find((e) => e.localId === localId) || null;
}

// Create new estimate
export async function createEstimate(
  input: CreateEstimateInput,
): Promise<EstimateItem> {
  try {
    const localId = await getNextLocalId();
    const now = new Date().toISOString();

    const newEstimate: EstimateItem = {
      id: generateUniqueId(),
      localId,
      type: input.type,
      name: input.name,
      description: input.description,
      data: input.data,
      results: input.results,
      status: input.status || "draft",
      createdAt: now,
      updatedAt: now,
      isSynced: false,
      tags: input.tags,
      projectName: input.projectName,
      location: input.location,
    };

    const all = await getAllEstimates();
    all.unshift(newEstimate);
    await AsyncStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(all));

    console.log(
      `[EstimateService] Created estimate #${localId}: ${input.name}`,
    );

    // Try to sync to server
    syncEstimateToServer(newEstimate).catch(console.error);

    return newEstimate;
  } catch (error) {
    console.error("[EstimateService] Error creating estimate:", error);
    throw error;
  }
}

// Update estimate
export async function updateEstimate(
  id: string,
  input: UpdateEstimateInput,
): Promise<EstimateItem | null> {
  try {
    const all = await getAllEstimates();
    const index = all.findIndex((e) => e.id === id);

    if (index === -1) {
      console.warn(`[EstimateService] Estimate not found: ${id}`);
      return null;
    }

    const updated: EstimateItem = {
      ...all[index],
      ...input,
      updatedAt: new Date().toISOString(),
      isSynced: false, // Mark as needing sync
    };

    all[index] = updated;
    await AsyncStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(all));

    console.log(`[EstimateService] Updated estimate #${updated.localId}`);

    // Try to sync to server
    syncEstimateToServer(updated).catch(console.error);

    return updated;
  } catch (error) {
    console.error("[EstimateService] Error updating estimate:", error);
    throw error;
  }
}

// Delete estimate
export async function deleteEstimate(id: string): Promise<boolean> {
  try {
    const all = await getAllEstimates();
    const estimate = all.find((e) => e.id === id);

    if (!estimate) {
      console.warn(`[EstimateService] Estimate not found: ${id}`);
      return false;
    }

    const filtered = all.filter((e) => e.id !== id);
    await AsyncStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(filtered));

    console.log(`[EstimateService] Deleted estimate #${estimate.localId}`);

    // Try to delete from server
    if (estimate.serverId) {
      deleteEstimateFromServer(estimate.serverId).catch(console.error);
    }

    return true;
  } catch (error) {
    console.error("[EstimateService] Error deleting estimate:", error);
    throw error;
  }
}

// Duplicate estimate
export async function duplicateEstimate(
  id: string,
  newName?: string,
): Promise<EstimateItem | null> {
  try {
    const original = await getEstimateById(id);
    if (!original) return null;

    return createEstimate({
      type: original.type,
      name: newName || `${original.name} (Bản sao)`,
      description: original.description,
      data: { ...original.data },
      results: { ...original.results },
      status: "draft",
      tags: original.tags,
      projectName: original.projectName,
      location: original.location,
    });
  } catch (error) {
    console.error("[EstimateService] Error duplicating estimate:", error);
    throw error;
  }
}

// Change estimate status
export async function changeEstimateStatus(
  id: string,
  status: EstimateStatus,
): Promise<EstimateItem | null> {
  return updateEstimate(id, { status });
}

// Search estimates
export async function searchEstimates(query: string): Promise<EstimateItem[]> {
  const all = await getAllEstimates();
  const lowerQuery = query.toLowerCase();

  return all.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.description?.toLowerCase().includes(lowerQuery) ||
      e.projectName?.toLowerCase().includes(lowerQuery) ||
      e.location?.toLowerCase().includes(lowerQuery) ||
      e.tags?.some((t) => t.toLowerCase().includes(lowerQuery)),
  );
}

// Get estimates statistics
export async function getEstimatesStats(): Promise<{
  total: number;
  draft: number;
  completed: number;
  archived: number;
  totalValue: number;
  byType: Record<EstimateType, number>;
}> {
  const all = await getAllEstimates();

  const byType = {} as Record<EstimateType, number>;
  let totalValue = 0;
  let draft = 0;
  let completed = 0;
  let archived = 0;

  all.forEach((e) => {
    byType[e.type] = (byType[e.type] || 0) + 1;
    totalValue += e.results.totalCost || 0;

    if (e.status === "draft") draft++;
    else if (e.status === "completed") completed++;
    else if (e.status === "archived") archived++;
  });

  return {
    total: all.length,
    draft,
    completed,
    archived,
    totalValue,
    byType,
  };
}

// ============ Server Sync Functions ============

// Sync estimate to server
async function syncEstimateToServer(estimate: EstimateItem): Promise<void> {
  try {
    const endpoint = estimate.serverId
      ? `/api/estimates/${estimate.serverId}`
      : "/api/estimates";
    const method = estimate.serverId ? "PUT" : "POST";

    const response = await apiFetch(endpoint, {
      method,
      data: {
        type: estimate.type,
        name: estimate.name,
        description: estimate.description,
        data: estimate.data,
        results: estimate.results,
        status: estimate.status,
        tags: estimate.tags,
        projectName: estimate.projectName,
        location: estimate.location,
        localId: estimate.localId,
        createdAt: estimate.createdAt,
        updatedAt: estimate.updatedAt,
      },
    });

    if (response && response.id) {
      // Update local with server ID
      await updateEstimateServerId(estimate.id, response.id);
      console.log(
        `[EstimateService] Synced estimate #${estimate.localId} to server`,
      );
    }
  } catch (error) {
    console.warn("[EstimateService] Failed to sync to server:", error);
    // Keep local copy, will retry later
  }
}

// Delete estimate from server
async function deleteEstimateFromServer(serverId: string): Promise<void> {
  try {
    await apiFetch(`/api/estimates/${serverId}`, { method: "DELETE" });
    console.log(`[EstimateService] Deleted from server: ${serverId}`);
  } catch (error) {
    console.warn("[EstimateService] Failed to delete from server:", error);
  }
}

// Update server ID after sync
async function updateEstimateServerId(
  id: string,
  serverId: string,
): Promise<void> {
  const all = await getAllEstimates();
  const index = all.findIndex((e) => e.id === id);

  if (index !== -1) {
    all[index].serverId = serverId;
    all[index].isSynced = true;
    all[index].syncedAt = new Date().toISOString();
    await AsyncStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(all));
  }
}

// Sync all unsynced estimates
export async function syncAllEstimates(): Promise<number> {
  const all = await getAllEstimates();
  const unsynced = all.filter((e) => !e.isSynced);

  let syncedCount = 0;
  for (const estimate of unsynced) {
    try {
      await syncEstimateToServer(estimate);
      syncedCount++;
    } catch (error) {
      console.warn(
        `[EstimateService] Failed to sync estimate #${estimate.localId}`,
      );
    }
  }

  return syncedCount;
}

// Fetch estimates from server and merge
export async function fetchAndMergeFromServer(): Promise<number> {
  try {
    const response = await apiFetch("/api/estimates", { method: "GET" });

    if (!response || !Array.isArray(response.data)) {
      return 0;
    }

    const serverEstimates = response.data;
    const localEstimates = await getAllEstimates();
    let newCount = 0;

    for (const serverEst of serverEstimates) {
      // Check if already exists locally
      const exists = localEstimates.find(
        (e) => e.serverId === serverEst.id || e.localId === serverEst.localId,
      );

      if (!exists) {
        // Add new from server
        const localId = await getNextLocalId();
        const newEst: EstimateItem = {
          id: generateUniqueId(),
          localId,
          serverId: serverEst.id,
          type: serverEst.type,
          name: serverEst.name,
          description: serverEst.description,
          data: serverEst.data,
          results: serverEst.results,
          status: serverEst.status || "draft",
          createdAt: serverEst.createdAt,
          updatedAt: serverEst.updatedAt,
          syncedAt: new Date().toISOString(),
          isSynced: true,
          tags: serverEst.tags,
          projectName: serverEst.projectName,
          location: serverEst.location,
        };

        localEstimates.push(newEst);
        newCount++;
      }
    }

    if (newCount > 0) {
      await AsyncStorage.setItem(
        ESTIMATES_STORAGE_KEY,
        JSON.stringify(localEstimates),
      );
    }

    return newCount;
  } catch (error) {
    console.warn("[EstimateService] Failed to fetch from server:", error);
    return 0;
  }
}

// Export for backup
export async function exportEstimates(): Promise<string> {
  const all = await getAllEstimates();
  return JSON.stringify(all, null, 2);
}

// Import from backup
export async function importEstimates(jsonData: string): Promise<number> {
  try {
    const imported: EstimateItem[] = JSON.parse(jsonData);
    const existing = await getAllEstimates();
    const existingIds = new Set(existing.map((e) => e.id));

    let addedCount = 0;
    for (const est of imported) {
      if (!existingIds.has(est.id)) {
        existing.push({
          ...est,
          localId: await getNextLocalId(),
          isSynced: false,
        });
        addedCount++;
      }
    }

    await AsyncStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(existing));
    return addedCount;
  } catch (error) {
    console.error("[EstimateService] Error importing estimates:", error);
    throw error;
  }
}

// Clear all local estimates
export async function clearAllEstimates(): Promise<void> {
  await AsyncStorage.removeItem(ESTIMATES_STORAGE_KEY);
  await AsyncStorage.removeItem(ESTIMATE_ID_COUNTER_KEY);
  console.log("[EstimateService] Cleared all local estimates");
}

// Get type label
export function getEstimateTypeLabel(type: EstimateType): string {
  const labels: Record<EstimateType, string> = {
    total: "Dự toán Tổng hợp",
    structure: "Kết cấu",
    materials: "Vật liệu",
    finishing: "Hoàn thiện",
    mep: "Điện - Nước",
    interior: "Nội thất",
    concrete: "Bê tông",
    steel: "Thép",
    paint: "Sơn",
  };
  return labels[type] || type;
}

// Get type emoji
export function getEstimateTypeEmoji(type: EstimateType): string {
  const emojis: Record<EstimateType, string> = {
    total: "🏠",
    structure: "🧱",
    materials: "📦",
    finishing: "✨",
    mep: "⚡",
    interior: "🛋️",
    concrete: "🏗️",
    steel: "🔩",
    paint: "🎨",
  };
  return emojis[type] || "📋";
}

// Format currency
export function formatEstimateCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(2)} tỷ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} triệu`;
  }
  return `${amount.toLocaleString("vi-VN")} đ`;
}

// Format date
export function formatEstimateDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
