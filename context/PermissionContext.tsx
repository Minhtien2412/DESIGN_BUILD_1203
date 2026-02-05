/**
 * Permission Management Context
 * Quản lý quyền người dùng: Camera, Location, Notifications
 * Tự động yêu cầu quyền hệ thống khi app khởi động
 * Chỉ hỏi lại khi thực sự cần dùng tính năng
 */

import { getItem, setItem } from "@/utils/storage";
import * as BackgroundTask from "expo-background-task";
import * as Camera from "expo-camera";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

// Lazy load expo-notifications to avoid Expo Go SDK 53+ crash
let Notifications: typeof import("expo-notifications") | null = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("[PermissionContext] expo-notifications not available");
  }
}

// ==================== BACKGROUND TASKS ====================

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";
const BACKGROUND_CALL_TASK = "BACKGROUND_CALL_TASK";

// Configure notification handler (only if Notifications available)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Register background tasks using expo-background-task (replaces deprecated expo-background-fetch)
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    // This will run in background to receive notifications
    console.log("[Background] Notification task running");
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error("[Background] Notification task error:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

TaskManager.defineTask(BACKGROUND_CALL_TASK, async () => {
  try {
    // This will run in background to receive calls
    console.log("[Background] Call task running");
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error("[Background] Call task error:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// ==================== TYPES ====================

interface PermissionState {
  camera: "granted" | "denied" | "undetermined";
  location: "granted" | "denied" | "undetermined";
  notifications: "granted" | "denied" | "undetermined";
}

interface PermissionContextType {
  permissions: PermissionState;
  requestCameraPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
  requestAllPermissions: () => Promise<void>;
  hasAllPermissions: boolean;
  showPermissionReminder: boolean;
  dismissReminder: () => void;
}

// ==================== CONTEXT ====================

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined,
);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return context;
};

// ==================== PROVIDER ====================

const STORAGE_KEY_PERMISSIONS = "permission_status";
const STORAGE_KEY_INITIAL_REQUEST_DONE = "initial_permission_request_done";

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: "undetermined",
    location: "undetermined",
    notifications: "undetermined",
  });
  const [showPermissionReminder, setShowPermissionReminder] = useState(false);

  const dismissReminder = useCallback(() => {
    setShowPermissionReminder(false);
  }, []);

  const loadPermissionStatus = useCallback(async () => {
    try {
      const saved = await getItem(STORAGE_KEY_PERMISSIONS);
      if (saved) {
        setPermissions(JSON.parse(saved));
      }
    } catch (error) {
      console.error("[Permissions] Failed to load saved status:", error);
    }
  }, []);

  const savePermissionStatus = useCallback(
    async (newPermissions: PermissionState) => {
      try {
        await setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(newPermissions));
      } catch (error) {
        console.error("[Permissions] Failed to save status:", error);
      }
    },
    [],
  );

  const checkPermissions = useCallback(async () => {
    try {
      // Use getCameraPermissionsAsync safely with SDK 54 changes
      let cameraStatus;
      try {
        // Check if method exists
        if ((Camera as any).getCameraPermissionsAsync) {
          cameraStatus = await (Camera as any).getCameraPermissionsAsync();
        } else {
          // Fallback - try accessing through Camera module differently
          cameraStatus = { status: "undetermined" as const };
        }
      } catch {
        cameraStatus = { status: "undetermined" as const };
      }

      const [locationStatus, notificationStatus] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Notifications
          ? Notifications.getPermissionsAsync()
          : Promise.resolve({ status: "undetermined" as const }),
      ]);

      const newPermissions: PermissionState = {
        camera: cameraStatus.status,
        location: locationStatus.status,
        notifications: notificationStatus.status,
      };

      setPermissions(newPermissions);
      await savePermissionStatus(newPermissions);
    } catch (error) {
      console.error("[Permissions] Failed to check permissions:", error);
    }
  }, [savePermissionStatus]);

  // Safe camera permission request with fallback for SDK changes
  const safeCameraPermissionRequest = async () => {
    try {
      // Try to get/request camera permissions with fallbacks for SDK 54
      if ((Camera as any).getCameraPermissionsAsync) {
        const status = await (Camera as any).getCameraPermissionsAsync();
        if (status.status !== "granted") {
          if ((Camera as any).requestCameraPermissionsAsync) {
            return await (Camera as any).requestCameraPermissionsAsync();
          }
        }
        return status;
      }
      // Last resort
      return { status: "undetermined" as const };
    } catch (e) {
      console.warn(
        "[Permissions] Camera permission request failed, using fallback:",
        e,
      );
      return { status: "undetermined" as const };
    }
  };

  // Request all permissions on first app launch
  const requestInitialPermissions = useCallback(async () => {
    try {
      const alreadyAsked = await getItem(STORAGE_KEY_INITIAL_REQUEST_DONE);

      if (alreadyAsked !== "true") {
        console.log("[Permissions] First launch - requesting all permissions");

        // Request all permissions from system with safe fallbacks
        const permissionPromises: Promise<any>[] = [
          safeCameraPermissionRequest(),
          Location.requestForegroundPermissionsAsync(),
        ];
        if (Notifications) {
          permissionPromises.push(Notifications.requestPermissionsAsync());
        }
        await Promise.allSettled(permissionPromises);

        // Mark as done so we don't ask again
        await setItem(STORAGE_KEY_INITIAL_REQUEST_DONE, "true");
        console.log("[Permissions] Initial permission request completed");
      }

      // Update permission status
      await checkPermissions();
    } catch (error) {
      console.error(
        "[Permissions] Failed to request initial permissions:",
        error,
      );
    }
  }, [checkPermissions]);

  // Setup background tasks for notifications and calls
  const setupBackgroundTasks = useCallback(async () => {
    try {
      // Check if notification permission is granted
      if (!Notifications) {
        console.log(
          "[Permissions] Notifications not available, skipping background tasks",
        );
        return;
      }
      const { status } = await Notifications.getPermissionsAsync();

      if (status === "granted") {
        // Register background task for notifications using expo-background-task
        await BackgroundTask.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
          minimumInterval: 60 * 15, // 15 minutes
        });

        // Register background task for calls
        await BackgroundTask.registerTaskAsync(BACKGROUND_CALL_TASK, {
          minimumInterval: 60 * 5, // 5 minutes
        });

        console.log("[Permissions] Background tasks registered successfully");
      }
    } catch (error) {
      console.error("[Permissions] Failed to setup background tasks:", error);
    }
  }, []);

  // Load saved permission status and request permissions on mount
  useEffect(() => {
    const initPermissions = async () => {
      await loadPermissionStatus();
      await requestInitialPermissions();
      await setupBackgroundTasks();
    };

    initPermissions();
  }, [loadPermissionStatus, requestInitialPermissions, setupBackgroundTasks]);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const result = await safeCameraPermissionRequest();
      const status = result.status || "undetermined";
      const newPermissions = { ...permissions, camera: status };
      setPermissions(newPermissions);
      await savePermissionStatus(newPermissions);
      return status === "granted";
    } catch (error) {
      console.error("[Permissions] Camera permission error:", error);
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const newPermissions = { ...permissions, location: status };
      setPermissions(newPermissions);
      await savePermissionStatus(newPermissions);
      return status === "granted";
    } catch (error) {
      console.error("[Permissions] Location permission error:", error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!Notifications) {
      console.log("[Permissions] Notifications not available in Expo Go");
      return false;
    }
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const newPermissions = { ...permissions, notifications: status };
      setPermissions(newPermissions);
      await savePermissionStatus(newPermissions);
      return status === "granted";
    } catch (error) {
      console.error("[Permissions] Notification permission error:", error);
      return false;
    }
  };

  const requestAllPermissions = async () => {
    console.log("[Permissions] Requesting all permissions...");
    await Promise.all([
      requestCameraPermission(),
      requestLocationPermission(),
      requestNotificationPermission(),
    ]);
    await checkPermissions();
    await setupBackgroundTasks();
  };

  const hasAllPermissions =
    permissions.camera === "granted" &&
    permissions.location === "granted" &&
    permissions.notifications === "granted";

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        requestCameraPermission,
        requestLocationPermission,
        requestNotificationPermission,
        requestAllPermissions,
        hasAllPermissions,
        showPermissionReminder,
        dismissReminder,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
