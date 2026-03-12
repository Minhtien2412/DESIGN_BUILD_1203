/**
 * useAICommandCenter Hook
 * Hook quản lý state và logic của AI Command Center
 * Created: 19/01/2026
 */

import {
    aiRouterService,
    type AIRouterContext,
} from "@/services/aiRouterService";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useState } from "react";

interface UseAICommandCenterReturn {
  isVisible: boolean;
  open: (initialQuery?: string) => void;
  close: () => void;
  toggle: () => void;
  initialQuery: string;
  // Quick actions
  navigateToFeature: (featureId: string) => void;
  searchAndNavigate: (
    query: string,
    context?: AIRouterContext
  ) => Promise<void>;
}

export function useAICommandCenter(): UseAICommandCenterReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const open = useCallback((query?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInitialQuery(query || "");
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setInitialQuery("");
  }, []);

  const toggle = useCallback(() => {
    if (isVisible) {
      close();
    } else {
      open();
    }
  }, [isVisible, open, close]);

  const navigateToFeature = useCallback(
    (featureId: string) => {
      const feature = aiRouterService
        .getAllFeatures()
        .find((f) => f.id === featureId);
      if (feature) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        close();
        setTimeout(() => router.push(feature.route as any), 100);
      }
    },
    [close]
  );

  const searchAndNavigate = useCallback(
    async (query: string, context?: AIRouterContext) => {
      const result = await aiRouterService.routeQuery(query, context);
      if (result.feature && result.action === "navigate") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        close();
        setTimeout(() => router.push(result.feature!.route as any), 100);
      }
    },
    [close]
  );

  return {
    isVisible,
    open,
    close,
    toggle,
    initialQuery,
    navigateToFeature,
    searchAndNavigate,
  };
}

// Singleton pattern for global access
let globalCommandCenter: {
  open: (query?: string) => void;
  close: () => void;
} | null = null;

export function setGlobalAICommandCenter(handlers: typeof globalCommandCenter) {
  globalCommandCenter = handlers;
}

export function openGlobalAICommandCenter(query?: string) {
  globalCommandCenter?.open(query);
}

export function closeGlobalAICommandCenter() {
  globalCommandCenter?.close();
}
