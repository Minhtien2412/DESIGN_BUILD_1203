/**
 * useEstimate Hook - Quản lý save/load/edit estimates
 * Reusable hook for all calculator screens
 */

import {
    createEstimate,
    CreateEstimateInput,
    EstimateItem,
    EstimateType,
    getEstimateById,
    updateEstimate,
} from "@/services/estimateService";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface UseEstimateOptions {
  type: EstimateType;
  onDataLoaded?: (data: Record<string, any>) => void;
}

export function useEstimate(options: UseEstimateOptions) {
  const { type, onDataLoaded } = options;
  const { estimateId } = useLocalSearchParams<{ estimateId?: string }>();

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<EstimateItem | null>(
    null,
  );
  const [estimateName, setEstimateName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing estimate for editing
  useEffect(() => {
    if (estimateId) {
      loadEstimate(estimateId);
    }
  }, [estimateId]);

  const loadEstimate = async (id: string) => {
    try {
      const estimate = await getEstimateById(id);
      if (estimate) {
        setCurrentEstimate(estimate);
        setIsEditMode(true);
        setEstimateName(estimate.name);

        // Callback to restore form data
        if (onDataLoaded && estimate.data) {
          onDataLoaded(estimate.data);
        }
      }
    } catch (error) {
      console.error("Error loading estimate:", error);
      Alert.alert("Lỗi", "Không thể tải dự toán");
    }
  };

  const saveEstimate = useCallback(
    async (
      data: Record<string, any>,
      results: CreateEstimateInput["results"],
      name?: string,
    ) => {
      const finalName = name || estimateName;

      if (!finalName.trim()) {
        setShowSaveModal(true);
        return null;
      }

      setIsSaving(true);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (isEditMode && currentEstimate) {
          // Update existing
          const updated = await updateEstimate(currentEstimate.id, {
            name: finalName,
            data,
            results,
          });
          if (updated) {
            setCurrentEstimate(updated);
            Alert.alert("Thành công", "Đã cập nhật dự toán!");
          }
          return updated;
        } else {
          // Create new
          const newEstimate = await createEstimate({
            type,
            name: finalName,
            data,
            results,
            status: "draft",
          });
          setCurrentEstimate(newEstimate);
          setIsEditMode(true);
          Alert.alert(
            "Thành công",
            `Đã lưu dự toán #${newEstimate.localId}: ${finalName}`,
          );
          return newEstimate;
        }
      } catch (error) {
        console.error("Error saving estimate:", error);
        Alert.alert("Lỗi", "Không thể lưu dự toán");
        return null;
      } finally {
        setIsSaving(false);
        setShowSaveModal(false);
      }
    },
    [estimateName, isEditMode, currentEstimate, type],
  );

  const promptSave = useCallback(
    (
      data: Record<string, any>,
      results: CreateEstimateInput["results"],
      defaultName?: string,
    ) => {
      if (!estimateName.trim() && defaultName) {
        setEstimateName(defaultName);
      }
      setShowSaveModal(true);

      // Store pending data for when modal confirms
      return new Promise<EstimateItem | null>((resolve) => {
        // The modal will call saveEstimate with the name
        // For now, just show modal
      });
    },
    [estimateName],
  );

  return {
    // State
    isEditMode,
    currentEstimate,
    estimateName,
    showSaveModal,
    isSaving,

    // Setters
    setEstimateName,
    setShowSaveModal,

    // Actions
    loadEstimate,
    saveEstimate,
    promptSave,

    // Computed
    localId: currentEstimate?.localId,
  };
}

export default useEstimate;
