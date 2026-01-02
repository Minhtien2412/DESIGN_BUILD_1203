/**
 * Communication Hub Context - Updated to sync with Backend
 * Tích hợp tất cả modules giao tiếp: Messages, Calls, Video, Live
 * 
 * BE Namespaces:
 * - /chat: Chat/messaging WebSocket
 * - /call: Call/WebRTC WebSocket
 * 
 * @author AI Assistant
 * @date Updated: 26/12/2025
 */

import { Contact, ContactGroup, getContactGroups, getContacts, getFavoriteContacts, MOCK_CONTACTS, MOCK_GROUPS } from '@/services/unifiedContacts';
import { getItem } from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import socketIO from 'socket.io-client';
import { useAuth } from './AuthContext';

// Type for Socket.IO client socket
type SocketClient = ReturnType<typeof socketIO>;

// ==================== TYPES ====================

export type CommunicationType = 'message' | 'call' | 'video_call' | 'live';

export interface OnlineStatus {
  userId: number;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen?: string;
}

export interface TypingIndicator {
  roomId: number;
  userId: number;
  userName?: string;
}

export interface IncomingCall {
  id: number;
  callerId: number;
  callerName: string;
  callerAvatar?: string;
  type: 'audio' | 'video';
  roomId: string;
  timestamp: string;
}

export interface UnreadCounts {
  messages: number;
  calls: number;
  notifications: number;
}

export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  roomId: number;
  createdAt: string;
  type?: string;
}

export interface RecentCommunication {
  id: string;
  type: CommunicationType;
  contact: Contact;
  preview: string;
  timestamp: string;
  unread: boolean;
}

interface CommunicationHubContextValue {
  // Connection state
  connected: boolean;
  connectionError: string | null;
  
  // Sockets
  chatSocket: SocketClient | null;
  callSocket: SocketClient | null;
  
  // Contacts
  contacts: Contact[];
  favoriteContacts: Contact[];
  onlineContacts: Contact[];
  groups: ContactGroup[];
  
  // Online statuses (real-time)
  onlineStatuses: Map<number, OnlineStatus>;
  
  // Typing indicators (keyed by roomId)
  typingUsers: Map<number, TypingIndicator[]>;
  
  // Incoming calls
  incomingCall: IncomingCall | null;
  
  // Unread counts
  unreadCounts: UnreadCounts;
  
  // Recent communications
  recentCommunications: RecentCommunication[];
  
  // Actions
  refreshContacts: () => Promise<void>;
  setMyStatus: (status: 'online' | 'offline' | 'busy' | 'away') => void;
  
  // Chat actions - matching BE /chat events
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  sendMessage: (roomId: number, content: string, type?: string) => void;
  startTyping: (roomId: number) => void;
  stopTyping: (roomId: number) => void;
  markAsRead: (roomId: number, messageIds: number[]) => void;
  
  // Call actions - matching BE /call events
  registerForCalls: () => void;
  joinCall: (roomId: string) => void;
  leaveCall: (roomId: string) => void;
  sendCallSignal: (to: number, signal: unknown) => void;
  acceptCall: (callId: number) => void;
  rejectCall: (callId: number) => void;
  initiateCall: (targetUserId: number, type: 'audio' | 'video') => void;
  
  // Incoming call UI actions
  acceptIncomingCall: () => void;
  rejectIncomingCall: () => void;
  
  // Contact helpers
  openChat: (contactId: number) => void;
  getContactStatus: (contactId: number) => OnlineStatus | null;
  isContactOnline: (contactId: number) => boolean;
  
  // Group actions
  createGroup: (name: string, memberIds: number[]) => Promise<ContactGroup>;
}

const CommunicationHubContext = createContext<CommunicationHubContextValue | undefined>(undefined);

// WebSocket URL
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://baotienweb.cloud';

// ==================== PROVIDER ====================

export function CommunicationHubProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  // Separate sockets for each namespace (matching BE)
  const chatSocketRef = useRef<SocketClient | null>(null);
  const callSocketRef = useRef<SocketClient | null>(null);
  
  // Connection state
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [favoriteContacts, setFavoriteContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>(MOCK_GROUPS);
  
  // Online statuses
  const [onlineStatuses, setOnlineStatuses] = useState<Map<number, OnlineStatus>>(new Map());
  
  // Typing indicators - keyed by roomId
  const [typingUsers, setTypingUsers] = useState<Map<number, TypingIndicator[]>>(new Map());
  
  // Incoming call
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  
  // Unread counts
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    messages: 0,
    calls: 0,
    notifications: 0,
  });
  
  // Recent communications
  const [recentCommunications, setRecentCommunications] = useState<RecentCommunication[]>([]);
  
  // Computed: online contacts
  const onlineContacts = contacts.filter(c => 
    onlineStatuses.get(c.id)?.status === 'online' || c.status === 'online'
  );
  
  // ==================== CHAT WEBSOCKET (namespace: /chat) ====================
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (chatSocketRef.current) {
        chatSocketRef.current.disconnect();
        chatSocketRef.current = null;
      }
      return;
    }
    
    // Connect to Chat namespace (BE: /chat)
    const chatSocket = socketIO(`${WS_URL}/chat`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      query: {
        userId: user.id.toString(),
      },
    });
    
    chatSocketRef.current = chatSocket;
    
    // Connection events
    chatSocket.on('connect', () => {
      console.log('[Chat] 🟢 Connected to /chat namespace');
      setConnected(true);
      setConnectionError(null);
    });
    
    chatSocket.on('disconnect', (reason: string) => {
      console.log('[Chat] 🔴 Disconnected:', reason);
      setConnected(false);
    });
    
    chatSocket.on('connect_error', (error: Error) => {
      console.error('[Chat] Connection error:', error.message);
      setConnectionError(error.message);
    });
    
    // User online/offline events (from BE)
    chatSocket.on('userOnline', (data: { userId: number; timestamp: Date }) => {
      setOnlineStatuses(prev => {
        const next = new Map(prev);
        next.set(data.userId, { userId: data.userId, status: 'online' });
        return next;
      });
    });
    
    chatSocket.on('userOffline', (data: { userId: number; timestamp: Date }) => {
      setOnlineStatuses(prev => {
        const next = new Map(prev);
        next.set(data.userId, { 
          userId: data.userId, 
          status: 'offline',
          lastSeen: new Date(data.timestamp).toISOString()
        });
        return next;
      });
    });
    
    // Typing events (from BE)
    chatSocket.on('userTyping', (data: { userId: number; roomId: number }) => {
      setTypingUsers(prev => {
        const next = new Map(prev);
        const existing = next.get(data.roomId) || [];
        if (!existing.find(t => t.userId === data.userId)) {
          next.set(data.roomId, [...existing, { roomId: data.roomId, userId: data.userId }]);
        }
        return next;
      });
    });
    
    chatSocket.on('userStoppedTyping', (data: { userId: number; roomId: number }) => {
      setTypingUsers(prev => {
        const next = new Map(prev);
        const existing = next.get(data.roomId) || [];
        next.set(data.roomId, existing.filter(t => t.userId !== data.userId));
        return next;
      });
    });
    
    // New message event (from BE)
    chatSocket.on('newMessage', (data: ChatMessage) => {
      console.log('[Chat] 📩 New message:', data);
      setUnreadCounts(prev => ({
        ...prev,
        messages: prev.messages + 1,
      }));
    });
    
    return () => {
      chatSocket.disconnect();
      chatSocketRef.current = null;
    };
  }, [isAuthenticated, user]);
  
  // ==================== CALL WEBSOCKET (namespace: /call) ====================
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (callSocketRef.current) {
        callSocketRef.current.disconnect();
        callSocketRef.current = null;
      }
      return;
    }
    
    // Get token from storage and connect
    const connectCallSocket = async () => {
      const token = await getItem('accessToken');
      
      // Connect to Call namespace (BE: /call)
      const callSocket = socketIO(`${WS_URL}/call`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        auth: {
          token: token || '',
        },
      });
      
      callSocketRef.current = callSocket;
      
      // Connection events
      callSocket.on('connect', () => {
        console.log('[Call] 🟢 Connected to /call namespace');
        callSocket.emit('register', { userId: user.id });
      });
      
      callSocket.on('connected', (data: { userId: number; socketId: string }) => {
        console.log('[Call] ✅ Registered as user:', data.userId);
      });
    
      callSocket.on('disconnect', (reason: string) => {
        console.log('[Call] 🔴 Disconnected:', reason);
      });
      
      callSocket.on('error', (error: { message: string }) => {
        console.error('[Call] Error:', error.message);
        setConnectionError(error.message);
      });
      
      // Incoming call (from BE)
      callSocket.on('incoming_call', (data: IncomingCall) => {
        console.log('[Call] 📞 Incoming call from:', data.callerName);
        setIncomingCall(data);
      });
      
      // Call accepted (from BE)
      callSocket.on('call_accepted', (data: { callId: number; roomId: string; callee: unknown }) => {
        console.log('[Call] ✅ Call accepted, room:', data.roomId);
      });
      
      // Call rejected (from BE)
      callSocket.on('call_rejected', (data: { callId: number; callee: unknown }) => {
        console.log('[Call] ❌ Call rejected');
        setIncomingCall(null);
      });
      
      // Call ended (from BE)
      callSocket.on('call_ended', (data: { callId: number; reason: string }) => {
        console.log('[Call] 📵 Call ended:', data.reason);
        setIncomingCall(null);
      });
      
      // WebRTC signal from peer (from BE)
      callSocket.on('call_signal', (data: { from: number; signal: unknown }) => {
        console.log('[Call] 📡 Signal from:', data.from);
      });
      
      // User joined call room
      callSocket.on('user_joined', (data: { socketId: string; userId: number }) => {
        console.log('[Call] 👤 User joined:', data.userId);
      });
      
      // User left call room
      callSocket.on('user_left', (data: { socketId: string; userId: number }) => {
        console.log('[Call] 👤 User left:', data.userId);
      });
      
      // Missed call
      callSocket.on('call_missed', () => {
        setUnreadCounts(prev => ({
          ...prev,
          calls: prev.calls + 1,
        }));
        setIncomingCall(null);
      });
    };
    
    connectCallSocket();
    
    return () => {
      if (callSocketRef.current) {
        callSocketRef.current.disconnect();
        callSocketRef.current = null;
      }
    };
  }, [isAuthenticated, user]);
  
  // ==================== APP STATE HANDLING ====================
  
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (chatSocketRef.current && user) {
        if (nextState === 'active') {
          chatSocketRef.current.emit('userOnline', { userId: user.id });
        } else if (nextState === 'background' || nextState === 'inactive') {
          chatSocketRef.current.emit('userOffline', { userId: user.id });
        }
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [user]);
  
  // ==================== LOAD CONTACTS ====================
  
  const refreshContacts = useCallback(async () => {
    try {
      const [allContacts, favorites, contactGroups] = await Promise.all([
        getContacts(),
        getFavoriteContacts(),
        getContactGroups(),
      ]);
      
      setContacts(allContacts);
      setFavoriteContacts(favorites);
      setGroups(contactGroups);
    } catch (error) {
      console.error('[CommunicationHub] Failed to refresh contacts:', error);
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      refreshContacts();
    }
  }, [isAuthenticated, refreshContacts]);
  
  // ==================== CHAT ACTIONS (matching BE /chat events) ====================
  
  const setMyStatus = useCallback((status: 'online' | 'offline' | 'busy' | 'away') => {
    if (chatSocketRef.current && user) {
      const event = status === 'online' ? 'userOnline' : 'userOffline';
      chatSocketRef.current.emit(event, { userId: user.id });
    }
  }, [user]);
  
  const joinRoom = useCallback((roomId: number) => {
    if (chatSocketRef.current && user) {
      chatSocketRef.current.emit('joinRoom', { roomId, userId: user.id });
    }
  }, [user]);
  
  const leaveRoom = useCallback((roomId: number) => {
    if (chatSocketRef.current && user) {
      chatSocketRef.current.emit('leaveRoom', { roomId, userId: user.id });
    }
  }, [user]);
  
  const sendMessage = useCallback((roomId: number, content: string, type?: string) => {
    if (chatSocketRef.current && user) {
      chatSocketRef.current.emit('sendMessage', { roomId, content, type: type || 'text' });
    }
  }, [user]);
  
  const startTyping = useCallback((roomId: number) => {
    if (chatSocketRef.current && user) {
      chatSocketRef.current.emit('typing', { roomId, userId: user.id });
    }
  }, [user]);
  
  const stopTyping = useCallback((roomId: number) => {
    if (chatSocketRef.current && user) {
      chatSocketRef.current.emit('stopTyping', { roomId, userId: user.id });
    }
  }, [user]);
  
  const markAsRead = useCallback((roomId: number, messageIds: number[]) => {
    if (chatSocketRef.current && user) {
      chatSocketRef.current.emit('markAsRead', { roomId, messageIds });
    }
  }, [user]);
  
  // ==================== CALL ACTIONS (matching BE /call events) ====================
  
  const registerForCalls = useCallback(() => {
    if (callSocketRef.current && user) {
      callSocketRef.current.emit('register', { userId: user.id });
    }
  }, [user]);
  
  const joinCall = useCallback((roomId: string) => {
    if (callSocketRef.current) {
      callSocketRef.current.emit('join_call', { roomId });
    }
  }, []);
  
  const leaveCall = useCallback((roomId: string) => {
    if (callSocketRef.current) {
      callSocketRef.current.emit('leave_call', { roomId });
    }
  }, []);
  
  const sendCallSignal = useCallback((to: number, signal: unknown) => {
    if (callSocketRef.current) {
      callSocketRef.current.emit('call_signal', { to, signal });
    }
  }, []);
  
  const initiateCall = useCallback((targetUserId: number, type: 'audio' | 'video') => {
    if (callSocketRef.current && user) {
      console.log('[Call] 📞 Initiating', type, 'call to user:', targetUserId);
      callSocketRef.current.emit('initiate_call', {
        callerId: typeof user.id === 'number' ? user.id : parseInt(String(user.id)) || 0,
        calleeId: targetUserId,
        type,
      });
    }
  }, [user]);
  
  const acceptCall = useCallback((callId: number) => {
    if (callSocketRef.current) {
      callSocketRef.current.emit('accept_call', { callId });
    }
  }, []);
  
  const rejectCall = useCallback((callId: number) => {
    if (callSocketRef.current) {
      callSocketRef.current.emit('reject_call', { callId });
    }
  }, []);
  
  const acceptIncomingCall = useCallback(() => {
    if (callSocketRef.current && incomingCall) {
      callSocketRef.current.emit('accept_call', { callId: incomingCall.id });
      setIncomingCall(null);
    }
  }, [incomingCall]);
  
  const rejectIncomingCall = useCallback(() => {
    if (callSocketRef.current && incomingCall) {
      callSocketRef.current.emit('reject_call', { callId: incomingCall.id });
      setIncomingCall(null);
    }
  }, [incomingCall]);
  
  const openChat = useCallback((contactId: number) => {
    console.log('[CommunicationHub] Open chat with:', contactId);
  }, []);
  
  const getContactStatus = useCallback((contactId: number): OnlineStatus | null => {
    return onlineStatuses.get(contactId) || null;
  }, [onlineStatuses]);
  
  const isContactOnline = useCallback((contactId: number): boolean => {
    const status = onlineStatuses.get(contactId);
    return status?.status === 'online';
  }, [onlineStatuses]);
  
  const createGroup = useCallback(async (name: string, memberIds: number[]): Promise<ContactGroup> => {
    const members = contacts.filter(c => memberIds.includes(c.id));
    const newGroup: ContactGroup = {
      id: `group-${Date.now()}`,
      name,
      members,
      createdAt: new Date().toISOString(),
      createdBy: typeof user?.id === 'number' ? user.id : parseInt(String(user?.id)) || 0,
    };
    
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  }, [contacts, user]);
  
  // ==================== CONTEXT VALUE ====================
  
  const value: CommunicationHubContextValue = {
    connected,
    connectionError,
    chatSocket: chatSocketRef.current,
    callSocket: callSocketRef.current,
    contacts,
    favoriteContacts,
    onlineContacts,
    groups,
    onlineStatuses,
    typingUsers,
    incomingCall,
    unreadCounts,
    recentCommunications,
    refreshContacts,
    setMyStatus,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    registerForCalls,
    joinCall,
    leaveCall,
    sendCallSignal,
    initiateCall,
    acceptCall,
    rejectCall,
    acceptIncomingCall,
    rejectIncomingCall,
    openChat,
    getContactStatus,
    isContactOnline,
    createGroup,
  };
  
  return (
    <CommunicationHubContext.Provider value={value}>
      {children}
    </CommunicationHubContext.Provider>
  );
}

// ==================== HOOK ====================

export function useCommunicationHub() {
  const context = useContext(CommunicationHubContext);
  if (context === undefined) {
    throw new Error('useCommunicationHub must be used within a CommunicationHubProvider');
  }
  return context;
}

// Export types
export type { CommunicationHubContextValue };
