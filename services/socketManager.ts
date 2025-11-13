// Stub Socket Manager
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: 'text' | 'image' | 'file' | 'system';
  body: string;
  metadata?: any;
  createdAt: string;
  readBy?: string[];
}

export interface SocketConfig {
  token: string;
  onMessage?: (message: Message) => void;
  onMessageRead?: (data: any) => void;
  onNotification?: (notification: any) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: any) => void;
  onError?: (error: any) => void;
  onReconnect?: (attemptNumber: any) => void;
}

export const socketManager = {
  connect: (_config: SocketConfig) => {},
  disconnect: () => {},
  sendMessage: (_chatId: string, _payload: any) => Promise.resolve({ ok: false }),
  markAsRead: (_chatId: string, _messageId: string) => Promise.resolve({ ok: false }),
  isConnected: () => false,
  on: (_event: string, _callback: Function) => {},
  off: (_event: string, _callback: Function) => {},
};

export default socketManager;
