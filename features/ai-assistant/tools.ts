/**
 * AI Sales Chat — Tool Layer
 * Isolated service functions the orchestrator can call.
 * Each tool searches local data or calls the API.
 * Mock implementations are clearly marked — swap for real API when ready.
 */

import {
    getProductById,
    getProductsByCategory,
    searchProducts as localSearch,
} from "@/data/products";
import { matchSkillToCategory } from "@/services/workerCategories";
import {
    getWorkerById,
    getWorkers,
    type Worker,
    type WorkerQueryParams,
    WorkerType,
} from "@/services/workers.api";
import { BOOKING_SERVICES } from "@/types/booking";
import { aiLog } from "./aiLogger";
import {
    getRecommendationQueries,
    getWorkerRecommendationType,
} from "./architectState";
import type {
    BookingPayload,
    LeadPayload,
    ProductCardData,
    ProductSearchParams,
    WorkerCardData,
    WorkerSearchParams,
} from "./types";

// ═══════════════════════════════════════════════════════════════
// PRODUCT TOOLS
// ═══════════════════════════════════════════════════════════════

/** Map internal Product → ProductCardData for the chat UI */
function toProductCard(p: {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: any;
  category?: string;
  rating?: number;
  reviewCount?: number;
  discountPercent?: number;
  flashSale?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  stock?: number;
}): ProductCardData {
  let badge: string | undefined;
  if (p.flashSale) badge = "Flash Sale";
  else if (p.isBestseller) badge = "Best Seller";
  else if (p.isNew) badge = "Mới";

  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    imageUri:
      typeof p.image === "object" && p.image?.uri ? p.image.uri : undefined,
    category: p.category,
    rating: p.rating,
    reviewCount: p.reviewCount,
    discount: p.discountPercent,
    badge,
    inStock: p.stock == null || p.stock > 0,
  };
}

export async function toolSearchProducts(
  params: ProductSearchParams,
): Promise<ProductCardData[]> {
  const start = Date.now();
  aiLog.toolCall("searchProducts", params);

  let results = localSearch(params.query);

  if (params.category) {
    results = results.filter((p) => p.category === params.category);
  }
  if (params.minPrice != null) {
    results = results.filter((p) => p.price >= params.minPrice!);
  }
  if (params.maxPrice != null) {
    results = results.filter((p) => p.price <= params.maxPrice!);
  }

  const limit = params.limit ?? 6;
  const cards = results.slice(0, limit).map(toProductCard);
  aiLog.toolResult("searchProducts", cards.length, Date.now() - start);
  return cards;
}

export async function toolGetRelatedProducts(
  productId: string,
): Promise<ProductCardData[]> {
  const start = Date.now();
  aiLog.toolCall("getRelatedProducts", { productId });

  const product = getProductById(productId);
  if (!product) {
    aiLog.toolResult("getRelatedProducts", 0, Date.now() - start);
    return [];
  }

  const related = getProductsByCategory(product.category as any)
    .filter((p) => p.id !== productId)
    .slice(0, 4)
    .map(toProductCard);

  aiLog.toolResult("getRelatedProducts", related.length, Date.now() - start);
  return related;
}

// ═══════════════════════════════════════════════════════════════
// WORKER TOOLS — Real API via services/workers.api.ts
// ═══════════════════════════════════════════════════════════════

/** Map Worker (from real API) → WorkerCardData for the chat UI */
function toWorkerCard(w: Worker): WorkerCardData {
  return {
    id: w.id,
    name: w.name,
    avatarUri: w.avatar,
    specialty: w.workerType,
    rating: w.rating,
    reviewCount: w.reviewCount,
    completedJobs: w.completedJobs,
    pricePerHour: w.dailyRate,
    distance: w.location,
    estimatedArrival: undefined,
    verified: w.verified,
    online: w.availability === "available",
    skills: w.skills,
    yearsExperience: w.experience,
  };
}

/** Resolve WorkerSearchParams → WorkerQueryParams for the real API */
function buildWorkerQuery(params: WorkerSearchParams): WorkerQueryParams {
  const query: WorkerQueryParams = {
    limit: params.limit ?? 5,
    sortBy: "rating",
    sortOrder: "desc",
  };

  // Direct category or workerType take priority
  if (params.category) {
    query.category = params.category;
  } else if (params.workerType) {
    query.workerType = params.workerType as WorkerType;
  } else if (params.skill) {
    // Infer category from natural language skill
    const cat = matchSkillToCategory(params.skill);
    if (cat) {
      query.category = cat;
    } else {
      // Fall back to free-text search
      query.search = params.skill;
    }
  }

  if (params.area) {
    query.location = params.area;
  }

  return query;
}

export async function toolSearchWorkers(
  params: WorkerSearchParams,
): Promise<WorkerCardData[]> {
  const start = Date.now();
  aiLog.toolCall("searchWorkers", params);

  try {
    const query = buildWorkerQuery(params);
    const response = await getWorkers(query);
    const cards = (response.data || []).map(toWorkerCard);
    aiLog.toolResult("searchWorkers", cards.length, Date.now() - start);
    return cards;
  } catch (error) {
    console.warn("[AI tools] searchWorkers failed:", error);
    aiLog.toolResult("searchWorkers", 0, Date.now() - start);
    return [];
  }
}

export async function toolGetWorkerProfile(
  workerId: string,
): Promise<WorkerCardData | null> {
  const start = Date.now();
  aiLog.toolCall("getWorkerProfile", { workerId });

  try {
    const worker = await getWorkerById(workerId);
    aiLog.toolResult("getWorkerProfile", 1, Date.now() - start);
    return toWorkerCard(worker);
  } catch (error) {
    console.warn("[AI tools] getWorkerProfile failed:", error);
    aiLog.toolResult("getWorkerProfile", 0, Date.now() - start);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// LEAD & BOOKING TOOLS
// ═══════════════════════════════════════════════════════════════

/** MOCK — create a lead. Replace with real API call. */
export async function toolCreateLead(
  payload: LeadPayload,
): Promise<{ success: boolean; leadId?: string; error?: string }> {
  const start = Date.now();
  aiLog.toolCall("createLead", payload);

  // Validate minimum info
  if (!payload.serviceType || !payload.description) {
    aiLog.lead("failed");
    return {
      success: false,
      error: "Thiếu thông tin loại dịch vụ hoặc mô tả.",
    };
  }

  // MOCK: simulate success
  const leadId = `LEAD-${Date.now()}`;
  aiLog.lead("created", leadId);
  aiLog.toolResult("createLead", 1, Date.now() - start);

  return { success: true, leadId };
}

/** MOCK — create a booking. Replace with real API call. */
export async function toolCreateBooking(
  payload: BookingPayload,
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  const start = Date.now();
  aiLog.toolCall("createBooking", payload);

  if (!payload.serviceId || !payload.address) {
    return { success: false, error: "Thiếu thông tin dịch vụ hoặc địa chỉ." };
  }

  // MOCK: simulate success
  const bookingId = `BK-${Date.now()}`;
  aiLog.toolResult("createBooking", 1, Date.now() - start);
  return { success: true, bookingId };
}

// ═══════════════════════════════════════════════════════════════
// AVAILABLE SERVICES LOOKUP
// ═══════════════════════════════════════════════════════════════

export function getAvailableServices() {
  return BOOKING_SERVICES;
}

// ═══════════════════════════════════════════════════════════════
// ARCHITECT RECOMMENDATION TOOLS
// ═══════════════════════════════════════════════════════════════

/** Recommend materials/products based on architect consultation state */
export async function toolRecommendMaterials(): Promise<ProductCardData[]> {
  const start = Date.now();
  aiLog.toolCall("recommendMaterials", {});

  const queries = getRecommendationQueries();
  const allResults: ProductCardData[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    const results = localSearch(query);
    for (const p of results) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        allResults.push(toProductCard(p));
      }
      if (allResults.length >= 6) break;
    }
    if (allResults.length >= 6) break;
  }

  aiLog.toolResult("recommendMaterials", allResults.length, Date.now() - start);
  return allResults;
}

/** Recommend workers/architects based on project scope */
export async function toolRecommendArchitects(): Promise<WorkerCardData[]> {
  const start = Date.now();
  aiLog.toolCall("recommendArchitects", {});

  const workerType = getWorkerRecommendationType();
  const category = matchSkillToCategory(workerType || "kiến trúc") ?? "design";

  try {
    const response = await getWorkers({
      category,
      limit: 3,
      sortBy: "rating",
      sortOrder: "desc",
    });
    const workers = (response.data || []).map(toWorkerCard);
    aiLog.toolResult("recommendArchitects", workers.length, Date.now() - start);
    return workers;
  } catch (error) {
    console.warn("[AI tools] recommendArchitects failed:", error);
    aiLog.toolResult("recommendArchitects", 0, Date.now() - start);
    return [];
  }
}
