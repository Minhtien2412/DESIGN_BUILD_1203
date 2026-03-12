/**
 * Material Service - Quản lý CRUD vật liệu xây dựng
 * Thêm mới, sửa, xóa vật liệu tùy chỉnh
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";

const MATERIALS_STORAGE_KEY = "@custom_materials";
const MATERIAL_ID_COUNTER_KEY = "@material_id_counter";

// Material categories
export type MaterialCategory =
  | "brick"
  | "cement"
  | "sand"
  | "steel"
  | "stone"
  | "wood"
  | "paint"
  | "tile"
  | "electrical"
  | "plumbing"
  | "other";

export interface MaterialItem {
  id: string;
  localId: number;
  serverId?: string;
  category: MaterialCategory;
  name: string;
  description?: string;
  unit: string; // viên, kg, m³, m², bao, thùng, cái, bộ
  pricePerUnit: number;
  specs?: {
    // Thông số kỹ thuật tùy theo loại
    qtyPerM2?: number; // Số lượng/m² (gạch)
    qtyPerM3?: number; // Số lượng/m³
    kgPerM?: number; // kg/m (thép)
    kgPerM2?: number; // kg/m² (tôn)
    kgPerM3?: number; // kg/m³
    wastage?: number; // % hao hụt
    coverage?: number; // Độ phủ (sơn: m²/lít)
    size?: string; // Kích thước
    brand?: string; // Thương hiệu
    origin?: string; // Xuất xứ
    standard?: string; // Tiêu chuẩn (TCVN, ISO)
  };
  isDefault: boolean; // Vật liệu mặc định hay tùy chỉnh
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  isSynced: boolean;
  tags?: string[];
}

export interface CreateMaterialInput {
  category: MaterialCategory;
  name: string;
  description?: string;
  unit: string;
  pricePerUnit: number;
  specs?: MaterialItem["specs"];
  tags?: string[];
}

export interface UpdateMaterialInput {
  name?: string;
  description?: string;
  unit?: string;
  pricePerUnit?: number;
  specs?: MaterialItem["specs"];
  isActive?: boolean;
  tags?: string[];
}

// Category labels in Vietnamese
export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  brick: "Gạch xây",
  cement: "Xi măng",
  sand: "Cát",
  steel: "Sắt thép",
  stone: "Đá",
  wood: "Gỗ",
  paint: "Sơn",
  tile: "Gạch ốp lát",
  electrical: "Điện",
  plumbing: "Nước",
  other: "Khác",
};

// Category icons
export const CATEGORY_ICONS: Record<MaterialCategory, string> = {
  brick: "🧱",
  cement: "📦",
  sand: "⏳",
  steel: "🔩",
  stone: "🪨",
  wood: "🪵",
  paint: "🎨",
  tile: "🔲",
  electrical: "⚡",
  plumbing: "🚿",
  other: "📋",
};

// Category colors
export const CATEGORY_COLORS: Record<MaterialCategory, string> = {
  brick: "#ef4444",
  cement: "#6b7280",
  sand: "#f59e0b",
  steel: "#0D9488",
  stone: "#8b5cf6",
  wood: "#a3a314",
  paint: "#ec4899",
  tile: "#06b6d4",
  electrical: "#eab308",
  plumbing: "#0ea5e9",
  other: "#9ca3af",
};

// Unit options
export const UNIT_OPTIONS = [
  { value: "viên", label: "Viên" },
  { value: "kg", label: "Kg" },
  { value: "m³", label: "M³" },
  { value: "m²", label: "M²" },
  { value: "m", label: "Mét dài" },
  { value: "bao", label: "Bao (50kg)" },
  { value: "thùng", label: "Thùng" },
  { value: "lon", label: "Lon/Lít" },
  { value: "cái", label: "Cái" },
  { value: "bộ", label: "Bộ" },
  { value: "cuộn", label: "Cuộn" },
  { value: "tấm", label: "Tấm" },
  { value: "thanh", label: "Thanh" },
  { value: "cây", label: "Cây" },
];

// Default materials - built-in data
export const DEFAULT_MATERIALS: Omit<
  MaterialItem,
  "id" | "localId" | "createdAt" | "updatedAt" | "isSynced"
>[] = [
  // Brick
  {
    category: "brick",
    name: "Gạch 4 lỗ (4x8x18)",
    unit: "viên",
    pricePerUnit: 850,
    specs: { qtyPerM2: 68, wastage: 5, size: "4x8x18cm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "brick",
    name: "Gạch 6 lỗ (6x10x22)",
    unit: "viên",
    pricePerUnit: 1200,
    specs: { qtyPerM2: 45, wastage: 5, size: "6x10x22cm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "brick",
    name: "Gạch block D10",
    unit: "viên",
    pricePerUnit: 5500,
    specs: { qtyPerM2: 12.5, wastage: 3, size: "10x19x39cm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "brick",
    name: "Gạch block D15",
    unit: "viên",
    pricePerUnit: 7500,
    specs: { qtyPerM2: 12.5, wastage: 3, size: "15x19x39cm" },
    isDefault: true,
    isActive: true,
  },
  // Cement
  {
    category: "cement",
    name: "Xi măng PCB40",
    unit: "bao",
    pricePerUnit: 95000,
    specs: { wastage: 3, brand: "Hà Tiên/Nghi Sơn", standard: "TCVN 6260" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "cement",
    name: "Xi măng PC50",
    unit: "bao",
    pricePerUnit: 105000,
    specs: { wastage: 3, brand: "INSEE/Holcim", standard: "TCVN 2682" },
    isDefault: true,
    isActive: true,
  },
  // Sand
  {
    category: "sand",
    name: "Cát vàng (xây trát)",
    unit: "m³",
    pricePerUnit: 350000,
    specs: { wastage: 5 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "sand",
    name: "Cát bê tông",
    unit: "m³",
    pricePerUnit: 320000,
    specs: { wastage: 5 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "sand",
    name: "Cát san lấp",
    unit: "m³",
    pricePerUnit: 180000,
    specs: { wastage: 3 },
    isDefault: true,
    isActive: true,
  },
  // Stone
  {
    category: "stone",
    name: "Đá 1x2",
    unit: "m³",
    pricePerUnit: 380000,
    specs: { wastage: 5, size: "10-20mm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "stone",
    name: "Đá 2x4",
    unit: "m³",
    pricePerUnit: 350000,
    specs: { wastage: 5, size: "20-40mm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "stone",
    name: "Đá 4x6",
    unit: "m³",
    pricePerUnit: 320000,
    specs: { wastage: 5, size: "40-60mm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "stone",
    name: "Đá base",
    unit: "m³",
    pricePerUnit: 280000,
    specs: { wastage: 3 },
    isDefault: true,
    isActive: true,
  },
  // Steel
  {
    category: "steel",
    name: "Thép D6",
    unit: "kg",
    pricePerUnit: 17000,
    specs: { kgPerM: 0.222 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D8",
    unit: "kg",
    pricePerUnit: 17000,
    specs: { kgPerM: 0.395 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D10",
    unit: "kg",
    pricePerUnit: 16500,
    specs: { kgPerM: 0.617 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D12",
    unit: "kg",
    pricePerUnit: 16500,
    specs: { kgPerM: 0.888 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D14",
    unit: "kg",
    pricePerUnit: 16000,
    specs: { kgPerM: 1.21 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D16",
    unit: "kg",
    pricePerUnit: 16000,
    specs: { kgPerM: 1.58 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D18",
    unit: "kg",
    pricePerUnit: 15500,
    specs: { kgPerM: 2.0 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D20",
    unit: "kg",
    pricePerUnit: 15500,
    specs: { kgPerM: 2.47 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D22",
    unit: "kg",
    pricePerUnit: 15500,
    specs: { kgPerM: 2.98 },
    isDefault: true,
    isActive: true,
  },
  {
    category: "steel",
    name: "Thép D25",
    unit: "kg",
    pricePerUnit: 15500,
    specs: { kgPerM: 3.85 },
    isDefault: true,
    isActive: true,
  },
  // Paint
  {
    category: "paint",
    name: "Sơn lót nội thất",
    unit: "lon",
    pricePerUnit: 450000,
    specs: { coverage: 12, brand: "Dulux/Jotun" },
    isDefault: true,
    isActive: true,
    description: "Lon 5 lít",
  },
  {
    category: "paint",
    name: "Sơn phủ nội thất",
    unit: "lon",
    pricePerUnit: 650000,
    specs: { coverage: 10, brand: "Dulux/Jotun" },
    isDefault: true,
    isActive: true,
    description: "Lon 5 lít",
  },
  {
    category: "paint",
    name: "Sơn ngoại thất",
    unit: "lon",
    pricePerUnit: 850000,
    specs: { coverage: 8, brand: "Dulux/Jotun" },
    isDefault: true,
    isActive: true,
    description: "Lon 5 lít",
  },
  // Tile
  {
    category: "tile",
    name: "Gạch lát nền 60x60",
    unit: "viên",
    pricePerUnit: 95000,
    specs: { qtyPerM2: 2.78, wastage: 5, size: "60x60cm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "tile",
    name: "Gạch ốp tường 30x60",
    unit: "viên",
    pricePerUnit: 75000,
    specs: { qtyPerM2: 5.56, wastage: 5, size: "30x60cm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "tile",
    name: "Gạch men 40x40",
    unit: "viên",
    pricePerUnit: 35000,
    specs: { qtyPerM2: 6.25, wastage: 5, size: "40x40cm" },
    isDefault: true,
    isActive: true,
  },
  // Wood
  {
    category: "wood",
    name: "Gỗ xẻ thông",
    unit: "m³",
    pricePerUnit: 8500000,
    specs: { standard: "Nhập khẩu" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "wood",
    name: "Ván ép 18mm",
    unit: "tấm",
    pricePerUnit: 350000,
    specs: { size: "1220x2440mm" },
    isDefault: true,
    isActive: true,
  },
  {
    category: "wood",
    name: "Gỗ MDF 18mm",
    unit: "tấm",
    pricePerUnit: 450000,
    specs: { size: "1220x2440mm" },
    isDefault: true,
    isActive: true,
  },
];

// Get next local ID
async function getNextLocalId(): Promise<number> {
  try {
    const counter = await AsyncStorage.getItem(MATERIAL_ID_COUNTER_KEY);
    const nextId = counter ? parseInt(counter) + 1 : 1;
    await AsyncStorage.setItem(MATERIAL_ID_COUNTER_KEY, nextId.toString());
    return nextId;
  } catch (error) {
    console.error("[MaterialService] Error getting next ID:", error);
    return Date.now();
  }
}

// Generate unique ID
function generateUniqueId(): string {
  return `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize default materials if not exists
export async function initializeDefaultMaterials(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(MATERIALS_STORAGE_KEY);
    if (existing) return; // Already initialized

    const materials: MaterialItem[] = [];
    for (const mat of DEFAULT_MATERIALS) {
      const localId = await getNextLocalId();
      materials.push({
        ...mat,
        id: generateUniqueId(),
        localId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSynced: false,
      });
    }

    await AsyncStorage.setItem(
      MATERIALS_STORAGE_KEY,
      JSON.stringify(materials),
    );
    console.log(
      "[MaterialService] Initialized default materials:",
      materials.length,
    );
  } catch (error) {
    console.error("[MaterialService] Error initializing defaults:", error);
  }
}

// Get all materials
export async function getAllMaterials(): Promise<MaterialItem[]> {
  try {
    await initializeDefaultMaterials();
    const data = await AsyncStorage.getItem(MATERIALS_STORAGE_KEY);
    if (!data) return [];
    const materials: MaterialItem[] = JSON.parse(data);
    return materials.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch (error) {
    console.error("[MaterialService] Error getting materials:", error);
    return [];
  }
}

// Get materials by category
export async function getMaterialsByCategory(
  category: MaterialCategory,
): Promise<MaterialItem[]> {
  const materials = await getAllMaterials();
  return materials.filter((m) => m.category === category && m.isActive);
}

// Get material by ID
export async function getMaterialById(
  id: string,
): Promise<MaterialItem | null> {
  const materials = await getAllMaterials();
  return materials.find((m) => m.id === id) || null;
}

// Create new material
export async function createMaterial(
  input: CreateMaterialInput,
): Promise<MaterialItem> {
  try {
    const materials = await getAllMaterials();
    const localId = await getNextLocalId();
    const now = new Date().toISOString();

    const newMaterial: MaterialItem = {
      id: generateUniqueId(),
      localId,
      category: input.category,
      name: input.name,
      description: input.description,
      unit: input.unit,
      pricePerUnit: input.pricePerUnit,
      specs: input.specs,
      tags: input.tags,
      isDefault: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      isSynced: false,
    };

    materials.unshift(newMaterial);
    await AsyncStorage.setItem(
      MATERIALS_STORAGE_KEY,
      JSON.stringify(materials),
    );
    console.log(
      "[MaterialService] Created material:",
      newMaterial.localId,
      newMaterial.name,
    );

    return newMaterial;
  } catch (error) {
    console.error("[MaterialService] Error creating material:", error);
    throw error;
  }
}

// Update material
export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput,
): Promise<MaterialItem | null> {
  try {
    const materials = await getAllMaterials();
    const index = materials.findIndex((m) => m.id === id);

    if (index === -1) {
      console.warn("[MaterialService] Material not found:", id);
      return null;
    }

    const updated: MaterialItem = {
      ...materials[index],
      ...input,
      specs: input.specs
        ? { ...materials[index].specs, ...input.specs }
        : materials[index].specs,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    };

    materials[index] = updated;
    await AsyncStorage.setItem(
      MATERIALS_STORAGE_KEY,
      JSON.stringify(materials),
    );
    console.log(
      "[MaterialService] Updated material:",
      updated.localId,
      updated.name,
    );

    return updated;
  } catch (error) {
    console.error("[MaterialService] Error updating material:", error);
    throw error;
  }
}

// Delete material
export async function deleteMaterial(id: string): Promise<boolean> {
  try {
    const materials = await getAllMaterials();
    const material = materials.find((m) => m.id === id);

    if (!material) {
      console.warn("[MaterialService] Material not found:", id);
      return false;
    }

    // Soft delete for default materials
    if (material.isDefault) {
      const index = materials.findIndex((m) => m.id === id);
      materials[index] = {
        ...material,
        isActive: false,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        MATERIALS_STORAGE_KEY,
        JSON.stringify(materials),
      );
      console.log(
        "[MaterialService] Soft deleted default material:",
        material.localId,
      );
      return true;
    }

    // Hard delete for custom materials
    const filtered = materials.filter((m) => m.id !== id);
    await AsyncStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(filtered));
    console.log("[MaterialService] Deleted custom material:", material.localId);
    return true;
  } catch (error) {
    console.error("[MaterialService] Error deleting material:", error);
    return false;
  }
}

// Restore deleted default material
export async function restoreMaterial(
  id: string,
): Promise<MaterialItem | null> {
  try {
    const materials = await getAllMaterials();
    const index = materials.findIndex((m) => m.id === id);

    if (index === -1) return null;

    const restored: MaterialItem = {
      ...materials[index],
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    materials[index] = restored;
    await AsyncStorage.setItem(
      MATERIALS_STORAGE_KEY,
      JSON.stringify(materials),
    );
    console.log("[MaterialService] Restored material:", restored.localId);
    return restored;
  } catch (error) {
    console.error("[MaterialService] Error restoring material:", error);
    return null;
  }
}

// Duplicate material
export async function duplicateMaterial(
  id: string,
): Promise<MaterialItem | null> {
  try {
    const material = await getMaterialById(id);
    if (!material) return null;

    return await createMaterial({
      category: material.category,
      name: `${material.name} (Copy)`,
      description: material.description,
      unit: material.unit,
      pricePerUnit: material.pricePerUnit,
      specs: material.specs,
      tags: material.tags,
    });
  } catch (error) {
    console.error("[MaterialService] Error duplicating material:", error);
    return null;
  }
}

// Search materials
export async function searchMaterials(query: string): Promise<MaterialItem[]> {
  const materials = await getAllMaterials();
  const searchLower = query.toLowerCase();

  return materials.filter(
    (m) =>
      m.isActive &&
      (m.name.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower) ||
        m.specs?.brand?.toLowerCase().includes(searchLower) ||
        m.tags?.some((t) => t.toLowerCase().includes(searchLower))),
  );
}

// Sync material to server
export async function syncMaterialToServer(
  material: MaterialItem,
): Promise<{ success: boolean; serverId?: string }> {
  try {
    const endpoint = material.serverId
      ? `/api/materials/${material.serverId}`
      : "/api/materials";
    const method = material.serverId ? "PUT" : "POST";

    const response = await apiFetch<{ id: string }>(endpoint, {
      method,
      body: JSON.stringify({
        category: material.category,
        name: material.name,
        description: material.description,
        unit: material.unit,
        pricePerUnit: material.pricePerUnit,
        specs: material.specs,
        tags: material.tags,
        localId: material.localId,
        isDefault: material.isDefault,
      }),
    });

    if (response) {
      // Update local with server ID
      const materials = await getAllMaterials();
      const index = materials.findIndex((m) => m.id === material.id);
      if (index !== -1) {
        materials[index] = {
          ...materials[index],
          serverId: response.id,
          syncedAt: new Date().toISOString(),
          isSynced: true,
        };
        await AsyncStorage.setItem(
          MATERIALS_STORAGE_KEY,
          JSON.stringify(materials),
        );
      }
      return { success: true, serverId: response.id };
    }
    return { success: false };
  } catch (error) {
    console.error("[MaterialService] Sync error:", error);
    return { success: false };
  }
}

// Get material stats
export async function getMaterialStats(): Promise<{
  total: number;
  byCategory: Record<MaterialCategory, number>;
  customCount: number;
  defaultCount: number;
}> {
  const materials = await getAllMaterials();
  const active = materials.filter((m) => m.isActive);

  const byCategory = {} as Record<MaterialCategory, number>;
  for (const cat of Object.keys(CATEGORY_LABELS) as MaterialCategory[]) {
    byCategory[cat] = active.filter((m) => m.category === cat).length;
  }

  return {
    total: active.length,
    byCategory,
    customCount: active.filter((m) => !m.isDefault).length,
    defaultCount: active.filter((m) => m.isDefault).length,
  };
}

// Export materials to JSON
export async function exportMaterials(): Promise<string> {
  const materials = await getAllMaterials();
  return JSON.stringify(materials, null, 2);
}

// Import materials from JSON
export async function importMaterials(json: string): Promise<number> {
  try {
    const imported: MaterialItem[] = JSON.parse(json);
    const existing = await getAllMaterials();
    let added = 0;

    for (const mat of imported) {
      // Skip if already exists
      if (
        existing.some((e) => e.name === mat.name && e.category === mat.category)
      ) {
        continue;
      }

      await createMaterial({
        category: mat.category,
        name: mat.name,
        description: mat.description,
        unit: mat.unit,
        pricePerUnit: mat.pricePerUnit,
        specs: mat.specs,
        tags: mat.tags,
      });
      added++;
    }

    return added;
  } catch (error) {
    console.error("[MaterialService] Import error:", error);
    return 0;
  }
}

// Reset to defaults
export async function resetToDefaults(): Promise<void> {
  try {
    await AsyncStorage.removeItem(MATERIALS_STORAGE_KEY);
    await AsyncStorage.removeItem(MATERIAL_ID_COUNTER_KEY);
    await initializeDefaultMaterials();
    console.log("[MaterialService] Reset to defaults");
  } catch (error) {
    console.error("[MaterialService] Reset error:", error);
  }
}

// Format price for display
export function formatMaterialPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(2)} triệu`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`;
  }
  return price.toLocaleString("vi-VN");
}

// Get unit label
export function getUnitLabel(unit: string): string {
  const found = UNIT_OPTIONS.find((u) => u.value === unit);
  return found?.label || unit;
}
