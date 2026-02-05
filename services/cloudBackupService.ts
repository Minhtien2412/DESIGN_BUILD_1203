/**
 * Cloud Backup Service
 * Backup and restore user data to/from cloud
 * @created 04/02/2026
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, post } from "./api";

// ============================================================================
// Types
// ============================================================================

export interface BackupMetadata {
  id: string;
  userId: string;
  createdAt: string;
  size: number;
  version: string;
  deviceId: string;
  deviceName: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  settings: Record<string, any>;
  favorites: string[];
  viewHistory: string[];
  cart: any[];
  searchHistory: string[];
  customPreferences: Record<string, any>;
}

export interface BackupResult {
  success: boolean;
  backupId?: string;
  error?: string;
  timestamp?: string;
}

export interface RestoreResult {
  success: boolean;
  error?: string;
  restoredItems?: string[];
}

// ============================================================================
// Constants
// ============================================================================

const BACKUP_KEYS = [
  "@app_settings",
  "@app_language",
  "@favorites",
  "@view_history",
  "@cart_items",
  "@search_history",
  "@user_preferences",
  "@theme_mode",
  "@notification_settings",
  "@privacy_settings",
];

const BACKUP_VERSION = "1.0.0";
const LAST_BACKUP_KEY = "@last_backup_timestamp";
const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Local Storage Functions
// ============================================================================

/**
 * Collect all data to be backed up
 */
async function collectBackupData(): Promise<Record<string, any>> {
  const data: Record<string, any> = {};

  try {
    const keys = await AsyncStorage.getAllKeys();
    const backupKeys = keys.filter((key) =>
      BACKUP_KEYS.some((prefix) => key.startsWith(prefix)),
    );

    const pairs = await AsyncStorage.multiGet(backupKeys);

    for (const [key, value] of pairs) {
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    }
  } catch (error) {
    console.error("Error collecting backup data:", error);
    throw error;
  }

  return data;
}

/**
 * Restore data from backup
 */
async function restoreBackupData(data: Record<string, any>): Promise<string[]> {
  const restored: string[] = [];

  try {
    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      try {
        const stringValue =
          typeof value === "string" ? value : JSON.stringify(value);
        await AsyncStorage.setItem(key, stringValue);
        restored.push(key);
      } catch (error) {
        console.warn(`Failed to restore ${key}:`, error);
      }
    }
  } catch (error) {
    console.error("Error restoring backup data:", error);
    throw error;
  }

  return restored;
}

// ============================================================================
// Cloud Backup API
// ============================================================================

/**
 * Create a cloud backup
 */
export async function createCloudBackup(
  userId: string,
  deviceId: string,
  deviceName: string,
): Promise<BackupResult> {
  try {
    // Collect local data
    const localData = await collectBackupData();

    // Create backup metadata
    const metadata: Omit<BackupMetadata, "id"> = {
      userId,
      createdAt: new Date().toISOString(),
      size: JSON.stringify(localData).length,
      version: BACKUP_VERSION,
      deviceId,
      deviceName,
    };

    // Send to cloud API
    const response = await post<{ backupId: string }>("/user/backup", {
      metadata,
      data: localData,
    });

    if (response.backupId) {
      // Store last backup timestamp
      await AsyncStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());

      return {
        success: true,
        backupId: response.backupId,
        timestamp: metadata.createdAt,
      };
    }

    return {
      success: false,
      error: "Failed to create backup",
    };
  } catch (error: any) {
    console.error("Cloud backup error:", error);
    return {
      success: false,
      error: error.message || "Backup failed",
    };
  }
}

/**
 * Restore from cloud backup
 */
export async function restoreFromCloud(
  userId: string,
  backupId?: string,
): Promise<RestoreResult> {
  try {
    // Fetch backup from cloud
    const endpoint = backupId
      ? `/user/backup/${backupId}`
      : `/user/backup/latest`;

    const response = await get<{ data: Record<string, any> }>(endpoint);

    if (response.data) {
      // Restore data locally
      const restoredItems = await restoreBackupData(response.data);

      return {
        success: true,
        restoredItems,
      };
    }

    return {
      success: false,
      error: "No backup data found",
    };
  } catch (error: any) {
    console.error("Cloud restore error:", error);
    return {
      success: false,
      error: error.message || "Restore failed",
    };
  }
}

/**
 * Get list of available backups
 */
export async function getBackupList(userId: string): Promise<BackupMetadata[]> {
  try {
    const response = await get<{ backups: BackupMetadata[] }>("/user/backups");
    return response.backups || [];
  } catch (error) {
    console.error("Failed to get backup list:", error);
    return [];
  }
}

/**
 * Delete a backup
 */
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    await post(`/user/backup/${backupId}/delete`, {});
    return true;
  } catch (error) {
    console.error("Failed to delete backup:", error);
    return false;
  }
}

/**
 * Get last backup timestamp
 */
export async function getLastBackupTimestamp(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

/**
 * Check if auto backup is due
 */
export async function isAutoBackupDue(): Promise<boolean> {
  try {
    const lastBackup = await getLastBackupTimestamp();
    if (!lastBackup) return true;

    const lastBackupTime = new Date(lastBackup).getTime();
    const now = Date.now();

    return now - lastBackupTime >= AUTO_BACKUP_INTERVAL;
  } catch {
    return true;
  }
}

// ============================================================================
// Local-Only Backup (Fallback)
// ============================================================================

/**
 * Create a local backup (when offline)
 */
export async function createLocalBackup(): Promise<string> {
  try {
    const data = await collectBackupData();
    const backup = {
      createdAt: new Date().toISOString(),
      version: BACKUP_VERSION,
      data,
    };

    const backupKey = `@local_backup_${Date.now()}`;
    await AsyncStorage.setItem(backupKey, JSON.stringify(backup));

    return backupKey;
  } catch (error) {
    console.error("Local backup error:", error);
    throw error;
  }
}

/**
 * Get local backups
 */
export async function getLocalBackups(): Promise<
  Array<{
    key: string;
    createdAt: string;
    size: number;
  }>
> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const backupKeys = keys.filter((k) => k.startsWith("@local_backup_"));

    const backups: Array<{
      key: string;
      createdAt: string;
      size: number;
    }> = [];

    for (const key of backupKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          backups.push({
            key,
            createdAt: parsed.createdAt,
            size: data.length,
          });
        } catch {}
      }
    }

    return backups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

/**
 * Restore from local backup
 */
export async function restoreFromLocalBackup(
  backupKey: string,
): Promise<RestoreResult> {
  try {
    const backupData = await AsyncStorage.getItem(backupKey);
    if (!backupData) {
      return { success: false, error: "Backup not found" };
    }

    const parsed = JSON.parse(backupData);
    const restoredItems = await restoreBackupData(parsed.data);

    return {
      success: true,
      restoredItems,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Restore failed",
    };
  }
}

/**
 * Delete local backup
 */
export async function deleteLocalBackup(backupKey: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(backupKey);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Export All Functions
// ============================================================================

export default {
  // Cloud
  createCloudBackup,
  restoreFromCloud,
  getBackupList,
  deleteBackup,
  getLastBackupTimestamp,
  isAutoBackupDue,
  // Local
  createLocalBackup,
  getLocalBackups,
  restoreFromLocalBackup,
  deleteLocalBackup,
};
