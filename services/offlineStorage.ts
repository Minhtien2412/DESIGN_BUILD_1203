/**
 * Offline Storage Service
 * Xử lý lưu trữ dữ liệu offline cho các features chưa có BE
 * Hỗ trợ upload/download với local caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import ENV from '@/config/env';

// Keys for offline storage
const STORAGE_KEYS = {
  DOCUMENTS: '@offline_documents',
  BUDGET: '@offline_budget',
  CONTRACTS: '@offline_contracts',
  ANALYTICS: '@offline_analytics',
  SEARCH_HISTORY: '@offline_search_history',
  PENDING_UPLOADS: '@offline_pending_uploads',
  CACHED_FILES: '@offline_cached_files',
};

// Types
export interface OfflineDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  localUri?: string;
  fileName?: string;
  mimeType?: string;
  category?: string;
  description?: string;
  tags?: string[];
  folderId?: string;
  accessLevel?: string;
  metadata?: Record<string, any>;
  remoteUrl?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced' | 'error';
  projectId?: string;
}

export interface OfflineBudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense';
  date: string;
  projectId?: string;
  syncStatus: 'pending' | 'synced' | 'error';
}

export interface OfflineContract {
  id: string;
  title: string;
  parties: string[];
  value: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  projectId?: string;
  syncStatus: 'pending' | 'synced' | 'error';
}

export interface PendingUpload {
  id: string;
  type: 'document' | 'image' | 'avatar';
  localUri: string;
  targetEndpoint: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
  offlineDocId?: string;
  projectId?: string;
}

export interface CachedFile {
  id: string;
  remoteUrl: string;
  localUri: string;
  fileName: string;
  mimeType: string;
  cachedAt: string;
  expiresAt: string;
  size: number;
}

// === GENERIC STORAGE FUNCTIONS ===

async function getStorageData<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

async function setStorageData<T>(key: string, data: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
}

// === DOCUMENTS OFFLINE SERVICE ===

export const OfflineDocuments = {
  async getAll(): Promise<OfflineDocument[]> {
    return (await getStorageData<OfflineDocument[]>(STORAGE_KEYS.DOCUMENTS)) || [];
  },

  async getById(id: string): Promise<OfflineDocument | undefined> {
    const docs = await this.getAll();
    return docs.find(d => d.id === id);
  },

  async add(document: Omit<OfflineDocument, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<OfflineDocument> {
    const docs = await this.getAll();
    const newDoc: OfflineDocument = {
      ...document,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };
    docs.push(newDoc);
    await setStorageData(STORAGE_KEYS.DOCUMENTS, docs);
    return newDoc;
  },

  async update(id: string, updates: Partial<OfflineDocument>): Promise<OfflineDocument | null> {
    const docs = await this.getAll();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    docs[index] = {
      ...docs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await setStorageData(STORAGE_KEYS.DOCUMENTS, docs);
    return docs[index];
  },

  async delete(id: string): Promise<boolean> {
    const docs = await this.getAll();
    const filtered = docs.filter(d => d.id !== id);
    if (filtered.length === docs.length) return false;
    await setStorageData(STORAGE_KEYS.DOCUMENTS, filtered);
    return true;
  },

  async getByProject(projectId: string): Promise<OfflineDocument[]> {
    const docs = await this.getAll();
    return docs.filter(d => d.projectId === projectId);
  },
};

// === BUDGET OFFLINE SERVICE ===

export const OfflineBudget = {
  async getAll(): Promise<OfflineBudgetItem[]> {
    return (await getStorageData<OfflineBudgetItem[]>(STORAGE_KEYS.BUDGET)) || [];
  },

  async add(item: Omit<OfflineBudgetItem, 'id' | 'syncStatus'>): Promise<OfflineBudgetItem> {
    const items = await this.getAll();
    const newItem: OfflineBudgetItem = {
      ...item,
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      syncStatus: 'pending',
    };
    items.push(newItem);
    await setStorageData(STORAGE_KEYS.BUDGET, items);
    return newItem;
  },

  async update(id: string, updates: Partial<OfflineBudgetItem>): Promise<OfflineBudgetItem | null> {
    const items = await this.getAll();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    await setStorageData(STORAGE_KEYS.BUDGET, items);
    return items[index];
  },

  async delete(id: string): Promise<boolean> {
    const items = await this.getAll();
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) return false;
    await setStorageData(STORAGE_KEYS.BUDGET, filtered);
    return true;
  },

  async getSummary(): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const items = await this.getAll();
    const totalIncome = items.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = items.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  },
};

// === CONTRACTS OFFLINE SERVICE ===

export const OfflineContracts = {
  async getAll(): Promise<OfflineContract[]> {
    return (await getStorageData<OfflineContract[]>(STORAGE_KEYS.CONTRACTS)) || [];
  },

  async add(contract: Omit<OfflineContract, 'id' | 'syncStatus'>): Promise<OfflineContract> {
    const contracts = await this.getAll();
    const newContract: OfflineContract = {
      ...contract,
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      syncStatus: 'pending',
    };
    contracts.push(newContract);
    await setStorageData(STORAGE_KEYS.CONTRACTS, contracts);
    return newContract;
  },

  async update(id: string, updates: Partial<OfflineContract>): Promise<OfflineContract | null> {
    const contracts = await this.getAll();
    const index = contracts.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    contracts[index] = { ...contracts[index], ...updates };
    await setStorageData(STORAGE_KEYS.CONTRACTS, contracts);
    return contracts[index];
  },

  async delete(id: string): Promise<boolean> {
    const contracts = await this.getAll();
    const filtered = contracts.filter(c => c.id !== id);
    if (filtered.length === contracts.length) return false;
    await setStorageData(STORAGE_KEYS.CONTRACTS, filtered);
    return true;
  },
};

// === FILE UPLOAD/DOWNLOAD WITH CACHING ===

export const FileCache = {
  async getPendingUploads(): Promise<PendingUpload[]> {
    return (await getStorageData<PendingUpload[]>(STORAGE_KEYS.PENDING_UPLOADS)) || [];
  },

  async addPendingUpload(upload: Omit<PendingUpload, 'id' | 'createdAt' | 'retryCount'>): Promise<PendingUpload> {
    const uploads = await this.getPendingUploads();
    const newUpload: PendingUpload = {
      ...upload,
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    uploads.push(newUpload);
    await setStorageData(STORAGE_KEYS.PENDING_UPLOADS, uploads);
    return newUpload;
  },

  async updatePendingUpload(id: string, updates: Partial<PendingUpload>): Promise<void> {
    const uploads = await this.getPendingUploads();
    const index = uploads.findIndex(u => u.id === id);
    if (index !== -1) {
      uploads[index] = { ...uploads[index], ...updates };
      await setStorageData(STORAGE_KEYS.PENDING_UPLOADS, uploads);
    }
  },

  async removePendingUpload(id: string): Promise<void> {
    const uploads = await this.getPendingUploads();
    await setStorageData(STORAGE_KEYS.PENDING_UPLOADS, uploads.filter(u => u.id !== id));
  },

  async getCachedFiles(): Promise<CachedFile[]> {
    return (await getStorageData<CachedFile[]>(STORAGE_KEYS.CACHED_FILES)) || [];
  },

  async cacheFile(remoteUrl: string, fileName: string, mimeType: string): Promise<CachedFile | null> {
    if (Platform.OS === 'web') {
      console.log('File caching not supported on web');
      return null;
    }

    try {
      const cachedFiles = await this.getCachedFiles();
      const existing = cachedFiles.find(f => f.remoteUrl === remoteUrl);
      
      if (existing) {
        // Check if cached file still exists
        const info = await FileSystem.getInfoAsync(existing.localUri);
        if (info.exists) return existing;
      }

      // Download and cache
      const cacheDir = (FileSystem as { documentDirectory?: string }).documentDirectory || '';
      const localUri = `${cacheDir}cache_${Date.now()}_${fileName}`;
      const downloadResult = await FileSystem.downloadAsync(remoteUrl, localUri);
      
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      const fileInfo = await FileSystem.getInfoAsync(localUri);
      const newCachedFile: CachedFile = {
        id: `cache_${Date.now()}`,
        remoteUrl,
        localUri,
        fileName,
        mimeType,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        size: (fileInfo as any).size || 0,
      };

      cachedFiles.push(newCachedFile);
      await setStorageData(STORAGE_KEYS.CACHED_FILES, cachedFiles);
      return newCachedFile;
    } catch (error) {
      console.error('Error caching file:', error);
      return null;
    }
  },

  async getCachedFile(remoteUrl: string): Promise<CachedFile | null> {
    const cachedFiles = await this.getCachedFiles();
    const cached = cachedFiles.find(f => f.remoteUrl === remoteUrl);
    
    if (!cached) return null;
    
    // Check expiration
    if (new Date(cached.expiresAt) < new Date()) {
      await this.removeCachedFile(cached.id);
      return null;
    }
    
    // Check if file still exists
    if (Platform.OS !== 'web') {
      const info = await FileSystem.getInfoAsync(cached.localUri);
      if (!info.exists) {
        await this.removeCachedFile(cached.id);
        return null;
      }
    }
    
    return cached;
  },

  async removeCachedFile(id: string): Promise<void> {
    const cachedFiles = await this.getCachedFiles();
    const file = cachedFiles.find(f => f.id === id);
    
    if (file && Platform.OS !== 'web') {
      try {
        await FileSystem.deleteAsync(file.localUri, { idempotent: true });
      } catch (error) {
        console.error('Error deleting cached file:', error);
      }
    }
    
    await setStorageData(STORAGE_KEYS.CACHED_FILES, cachedFiles.filter(f => f.id !== id));
  },

  async clearExpiredCache(): Promise<number> {
    const cachedFiles = await this.getCachedFiles();
    const now = new Date();
    let cleared = 0;
    
    for (const file of cachedFiles) {
      if (new Date(file.expiresAt) < now) {
        await this.removeCachedFile(file.id);
        cleared++;
      }
    }
    
    return cleared;
  },

  async getCacheSize(): Promise<number> {
    const cachedFiles = await this.getCachedFiles();
    return cachedFiles.reduce((total, file) => total + file.size, 0);
  },
};

// === SYNC SERVICE ===

export const SyncService = {
  /**
   * Kiểm tra và sync pending data khi có network
   * Gọi khi app khởi động hoặc khi network thay đổi
   */
  async syncPendingData(apiBaseUrl: string, authToken: string): Promise<{
    documents: number;
    uploads: number;
    errors: string[];
  }> {
    const results = {
      documents: 0,
      uploads: 0,
      errors: [] as string[],
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
    };
    if (ENV.API_KEY) {
      headers['X-API-Key'] = ENV.API_KEY;
    }

    const uploadDocument = async (payload: {
      localUri: string;
      fileName: string;
      mimeType: string;
      projectId: string;
      name: string;
      description?: string;
      category?: string;
      folderId?: string;
      tags?: string[];
      accessLevel?: string;
      metadata?: Record<string, any>;
    }) => {
      const formData = new FormData();
      formData.append('file', {
        uri: payload.localUri,
        name: payload.fileName,
        type: payload.mimeType,
      } as any);
      formData.append('projectId', payload.projectId);
      formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      if (payload.category) formData.append('category', payload.category);
      if (payload.folderId) formData.append('folderId', payload.folderId);
      if (payload.tags?.length) formData.append('tags', JSON.stringify(payload.tags));
      if (payload.accessLevel) formData.append('accessLevel', payload.accessLevel);
      if (payload.metadata) formData.append('metadata', JSON.stringify(payload.metadata));

      const response = await fetch(`${apiBaseUrl}/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed (${response.status})`);
      }

      return response.json().catch(() => ({}));
    };

    // Sync pending uploads first (documents)
    const pendingUploads = await FileCache.getPendingUploads();
    const processedDocIds = new Set<string>();

    for (const upload of pendingUploads) {
      if (upload.retryCount >= 3) {
        results.errors.push(`Upload ${upload.id}: Max retries exceeded`);
        continue;
      }

      if (upload.type !== 'document') {
        await FileCache.updatePendingUpload(upload.id, {
          retryCount: upload.retryCount + 1,
          lastError: 'Unsupported upload type for sync',
        });
        continue;
      }

      try {
        const offlineDoc = upload.offlineDocId
          ? await OfflineDocuments.getById(upload.offlineDocId)
          : undefined;

        const projectId = upload.projectId || offlineDoc?.projectId;
        if (!projectId) {
          throw new Error('Missing projectId for document upload');
        }

        const responseData = await uploadDocument({
          localUri: upload.localUri,
          fileName: upload.fileName,
          mimeType: upload.mimeType || 'application/octet-stream',
          projectId,
          name: offlineDoc?.name || upload.fileName,
          description: offlineDoc?.description,
          category: offlineDoc?.category,
          folderId: offlineDoc?.folderId,
          tags: offlineDoc?.tags,
          accessLevel: offlineDoc?.accessLevel,
          metadata: offlineDoc?.metadata,
        });

        await FileCache.removePendingUpload(upload.id);

        if (offlineDoc) {
          const docData = responseData?.data ?? responseData;
          const remoteUrl =
            docData?.fileUrl || docData?.url || docData?.fileUrl;
          await OfflineDocuments.update(offlineDoc.id, {
            syncStatus: 'synced',
            remoteUrl: remoteUrl || offlineDoc.remoteUrl,
          });
          processedDocIds.add(offlineDoc.id);
          results.documents++;
        }

        results.uploads++;
      } catch (error) {
        results.errors.push(`Upload ${upload.id}: ${error}`);
        await FileCache.updatePendingUpload(upload.id, {
          retryCount: upload.retryCount + 1,
          lastError: String(error),
        });
      }
    }

    // Sync pending documents that are not tied to uploads
    const documents = await OfflineDocuments.getAll();
    const pendingDocs = documents.filter((d) => d.syncStatus === 'pending');

    for (const doc of pendingDocs) {
      if (processedDocIds.has(doc.id)) continue;
      if (!doc.localUri) continue;

      try {
        const projectId = doc.projectId;
        if (!projectId) throw new Error('Missing projectId for document sync');

        const responseData = await uploadDocument({
          localUri: doc.localUri,
          fileName: doc.fileName || doc.name,
          mimeType: doc.mimeType || 'application/octet-stream',
          projectId,
          name: doc.name,
          description: doc.description,
          category: doc.category,
          folderId: doc.folderId,
          tags: doc.tags,
          accessLevel: doc.accessLevel,
          metadata: doc.metadata,
        });

        const docData = responseData?.data ?? responseData;
        const remoteUrl = docData?.fileUrl || docData?.url || docData?.fileUrl;

        await OfflineDocuments.update(doc.id, {
          syncStatus: 'synced',
          remoteUrl: remoteUrl || doc.remoteUrl,
        });
        results.documents++;
      } catch (error) {
        results.errors.push(`Document ${doc.id}: ${error}`);
        await OfflineDocuments.update(doc.id, { syncStatus: 'error' });
      }
    }

    return results;
  },

  /**
   * Export tất cả offline data để backup
   */
  async exportAllData(): Promise<{
    documents: OfflineDocument[];
    budget: OfflineBudgetItem[];
    contracts: OfflineContract[];
    pendingUploads: PendingUpload[];
  }> {
    return {
      documents: await OfflineDocuments.getAll(),
      budget: await OfflineBudget.getAll(),
      contracts: await OfflineContracts.getAll(),
      pendingUploads: await FileCache.getPendingUploads(),
    };
  },

  /**
   * Clear tất cả offline data
   */
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.DOCUMENTS,
      STORAGE_KEYS.BUDGET,
      STORAGE_KEYS.CONTRACTS,
      STORAGE_KEYS.ANALYTICS,
      STORAGE_KEYS.PENDING_UPLOADS,
    ]);
  },
};

export default {
  OfflineDocuments,
  OfflineBudget,
  OfflineContracts,
  FileCache,
  SyncService,
};
