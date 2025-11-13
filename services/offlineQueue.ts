// Offline message queue for handling messages when network is unavailable
// Integrates with existing AsyncStorage patterns and socket manager

import { AppState, AppStateStatus } from 'react-native';
import socketManager from './socketManager';
import { storage } from './storage';

interface QueuedMessage {
  id: string;
  chatId: string;
  type: 'text' | 'image' | 'file';
  body: string;
  metadata?: any;
  clientId: string;
  timestamp: number;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'sending' | 'failed' | 'sent';
}

interface QueueStats {
  total: number;
  pending: number;
  failed: number;
  sending: number;
}

class OfflineQueue {
  private queue: QueuedMessage[] = [];
  private readonly QUEUE_KEY = 'offline_message_queue';
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly DEFAULT_MAX_RETRIES = 3;
  private isProcessing = false;
  private processingInterval: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: any = null;

  constructor() {
    this.setupAppStateHandler();
  }

  async initialize(): Promise<void> {
    await this.loadQueue();
    this.startProcessing();
    
    // Listen for socket connection changes
    socketManager.on('connect', () => {
      this.processQueue();
    });
  }

  private setupAppStateHandler(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this.startProcessing();
        this.processQueue();
      } else if (nextAppState === 'background') {
        this.stopProcessing();
      }
    });
  }

  private startProcessing(): void {
    if (this.processingInterval) return;

    // Process queue every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 30000);
  }

  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  async addMessage(message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<string> {
    const queuedMessage: QueuedMessage = {
      id: this.generateMessageId(),
      ...message,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
      maxRetries: message.maxRetries || this.DEFAULT_MAX_RETRIES,
    };

    // Check queue size limit
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      // Remove oldest failed/sent messages to make room
      this.cleanupQueue();
    }

    this.queue.push(queuedMessage);
    await this.saveQueue();

    // Try to send immediately if connected
    if (socketManager.isConnected()) {
      this.processQueue();
    }

    return queuedMessage.id;
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !socketManager.isConnected()) {
      return;
    }

    this.isProcessing = true;

    try {
      const pendingMessages = this.queue.filter(msg => msg.status === 'pending');
      
      for (const message of pendingMessages) {
        try {
          await this.sendQueuedMessage(message);
        } catch (error) {
          await this.handleFailedMessage(message, error);
        }
      }
    } catch (error) {
      console.error('Error processing message queue:', error);
    } finally {
      this.isProcessing = false;
      await this.saveQueue();
    }
  }

  private async sendQueuedMessage(message: QueuedMessage): Promise<void> {
    // Update status to sending
    message.status = 'sending';
    await this.saveQueue();

    try {
      const response = await socketManager.sendMessage(message.chatId, {
        type: message.type,
        body: message.body,
        metadata: message.metadata,
        clientId: message.clientId,
      });

      if (response.ok) {
        message.status = 'sent';
        this.emit('message:sent', { queueId: message.id, messageId: (response as any).messageId });
      } else {
        throw new Error((response as any).error || 'Failed to send message');
      }
    } catch (error) {
      message.status = 'pending'; // Reset to pending for retry
      throw error;
    }
  }

  private async handleFailedMessage(message: QueuedMessage, error: any): Promise<void> {
    message.retries++;
    
    if (message.retries >= message.maxRetries) {
      message.status = 'failed';
      console.error(`Message ${message.id} failed after ${message.retries} attempts:`, error);
      this.emit('message:failed', { queueId: message.id, error: error.message });
    } else {
      message.status = 'pending';
      console.warn(`Message ${message.id} failed, retry ${message.retries}/${message.maxRetries}:`, error);
    }
  }

  async retryMessage(messageId: string): Promise<boolean> {
    const message = this.queue.find(msg => msg.id === messageId);
    if (!message || message.status !== 'failed') {
      return false;
    }

    message.status = 'pending';
    message.retries = 0; // Reset retry count
    await this.saveQueue();

    if (socketManager.isConnected()) {
      this.processQueue();
    }

    return true;
  }

  async removeMessage(messageId: string): Promise<boolean> {
    const index = this.queue.findIndex(msg => msg.id === messageId);
    if (index === -1) return false;

    this.queue.splice(index, 1);
    await this.saveQueue();
    return true;
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  async clearFailedMessages(): Promise<void> {
    this.queue = this.queue.filter(msg => msg.status !== 'failed');
    await this.saveQueue();
  }

  private cleanupQueue(): void {
    // Remove old sent messages (older than 24 hours)
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    this.queue = this.queue.filter(msg => {
      return msg.status !== 'sent' || msg.timestamp > dayAgo;
    });

    // If still too large, remove oldest failed messages
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      const failedMessages = this.queue
        .filter(msg => msg.status === 'failed')
        .sort((a, b) => a.timestamp - b.timestamp);

      const toRemove = Math.min(failedMessages.length, this.queue.length - this.MAX_QUEUE_SIZE + 100);
      
      for (let i = 0; i < toRemove; i++) {
        const index = this.queue.indexOf(failedMessages[i]);
        if (index > -1) {
          this.queue.splice(index, 1);
        }
      }
    }
  }

  private generateMessageId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadQueue(): Promise<void> {
    try {
      const queueData = await storage.get(this.QUEUE_KEY);
      this.queue = queueData ? JSON.parse(queueData) : [];
      
      // Clean up on load
      this.cleanupQueue();
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await storage.set(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  // Event system for UI updates
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in queue event callback:', error);
        }
      });
    }
  }

  // Query methods
  getQueueLength(): number {
    return this.queue.length;
  }

  getQueueStats(): QueueStats {
    const stats: QueueStats = {
      total: this.queue.length,
      pending: 0,
      failed: 0,
      sending: 0,
    };

    this.queue.forEach(msg => {
      switch (msg.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'sending':
          stats.sending++;
          break;
      }
    });

    return stats;
  }

  getQueuedMessages(chatId?: string): QueuedMessage[] {
    let messages = [...this.queue];
    
    if (chatId) {
      messages = messages.filter(msg => msg.chatId === chatId);
    }
    
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  }

  getPendingMessages(chatId?: string): QueuedMessage[] {
    return this.getQueuedMessages(chatId).filter(msg => 
      msg.status === 'pending' || msg.status === 'sending'
    );
  }

  getFailedMessages(chatId?: string): QueuedMessage[] {
    return this.getQueuedMessages(chatId).filter(msg => msg.status === 'failed');
  }

  isMessageQueued(clientId: string): boolean {
    return this.queue.some(msg => msg.clientId === clientId);
  }

  // Cleanup
  destroy(): void {
    this.stopProcessing();
    this.listeners.clear();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Create singleton instance
export const offlineQueue = new OfflineQueue();

// Export types
export type { QueuedMessage, QueueStats };

// Default export
export default offlineQueue;