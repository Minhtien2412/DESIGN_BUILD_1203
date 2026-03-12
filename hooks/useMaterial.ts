/**
 * useMaterial Hook - Hook quản lý vật liệu tùy chỉnh
 * Sử dụng trong các màn hình calculator
 */

import {
    CATEGORY_COLORS,
    CATEGORY_ICONS,
    CATEGORY_LABELS,
    createMaterial,
    CreateMaterialInput,
    deleteMaterial,
    getAllMaterials,
    getMaterialsByCategory,
    MaterialCategory,
    MaterialItem,
    searchMaterials,
    updateMaterial,
    UpdateMaterialInput,
} from "@/services/materialService";
import { useCallback, useEffect, useState } from "react";

export interface UseMaterialOptions {
  category?: MaterialCategory;
  autoLoad?: boolean;
  searchQuery?: string;
}

export function useMaterial(options: UseMaterialOptions = {}) {
  const { category, autoLoad = true, searchQuery } = options;

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load materials
  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: MaterialItem[];
      if (searchQuery?.trim()) {
        data = await searchMaterials(searchQuery);
      } else if (category) {
        data = await getMaterialsByCategory(category);
      } else {
        data = await getAllMaterials();
      }

      // Filter active only
      data = data.filter((m) => m.isActive);

      setMaterials(data);
    } catch (err) {
      console.error("[useMaterial] Error loading:", err);
      setError("Không thể tải danh sách vật liệu");
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad) {
      loadMaterials();
    }
  }, [autoLoad, loadMaterials]);

  // Create material
  const addMaterial = useCallback(async (input: CreateMaterialInput) => {
    try {
      setLoading(true);
      const newMaterial = await createMaterial(input);
      setMaterials((prev) => [newMaterial, ...prev]);
      return newMaterial;
    } catch (err) {
      console.error("[useMaterial] Error creating:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update material
  const editMaterial = useCallback(
    async (id: string, input: UpdateMaterialInput) => {
      try {
        setLoading(true);
        const updated = await updateMaterial(id, input);
        if (updated) {
          setMaterials((prev) => prev.map((m) => (m.id === id ? updated : m)));
        }
        return updated;
      } catch (err) {
        console.error("[useMaterial] Error updating:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Delete material
  const removeMaterial = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      return true;
    } catch (err) {
      console.error("[useMaterial] Error deleting:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get material by ID
  const getMaterial = useCallback(
    (id: string) => {
      return materials.find((m) => m.id === id) || null;
    },
    [materials],
  );

  // Get materials grouped by category
  const getMaterialsByGroup = useCallback(() => {
    const grouped: Record<MaterialCategory, MaterialItem[]> = {
      brick: [],
      cement: [],
      sand: [],
      steel: [],
      stone: [],
      wood: [],
      paint: [],
      tile: [],
      electrical: [],
      plumbing: [],
      other: [],
    };

    for (const material of materials) {
      if (grouped[material.category]) {
        grouped[material.category].push(material);
      }
    }

    return grouped;
  }, [materials]);

  return {
    materials,
    loading,
    error,
    loadMaterials,
    addMaterial,
    editMaterial,
    removeMaterial,
    getMaterial,
    getMaterialsByGroup,
    // Helper constants
    CATEGORY_LABELS,
    CATEGORY_ICONS,
    CATEGORY_COLORS,
  };
}

export default useMaterial;
