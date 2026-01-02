/**
 * Unified Communication Hook
 * Kết hợp Messages, Calls, Contacts, Live thành một giao diện thống nhất
 * 
 * @author AI Assistant
 * @date 22/12/2025
 */

import { useCommunicationHub } from '@/context/CommunicationHubContext';
import { Contact, ContactGroup, getRecentContacts, RecentContact } from '@/services/unifiedContacts';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ConversationWithContact {
  id: string;
  contact: Contact;
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
    isMine: boolean;
  };
  unreadCount: number;
  isPinned?: boolean;
}

export interface CallLogWithContact {
  id: string;
  contact: Contact;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
  timestamp: string;
}

export function useUnifiedCommunication() {
  const hub = useCommunicationHub();
  
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load recent contacts on mount
  useEffect(() => {
    loadRecentContacts();
  }, []);
  
  const loadRecentContacts = async () => {
    try {
      setLoading(true);
      const recent = await getRecentContacts(20);
      setRecentContacts(recent);
    } catch (error) {
      console.error('[useUnifiedCommunication] Failed to load recent:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get conversations sorted by most recent
  const conversations = useMemo((): ConversationWithContact[] => {
    return hub.contacts
      .filter(c => c.unreadMessages || c.lastMessageAt)
      .sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      })
      .map(contact => ({
        id: `conv-${contact.id}`,
        contact,
        lastMessage: contact.lastMessageAt ? {
          content: 'Tin nhắn gần đây...',
          timestamp: contact.lastMessageAt,
          isRead: !contact.unreadMessages,
          isMine: false,
        } : undefined,
        unreadCount: contact.unreadMessages || 0,
      }));
  }, [hub.contacts]);
  
  // Get call logs sorted by most recent
  const callLogs = useMemo((): CallLogWithContact[] => {
    return hub.contacts
      .filter(c => c.missedCalls || c.lastCallAt)
      .sort((a, b) => {
        const aTime = a.lastCallAt ? new Date(a.lastCallAt).getTime() : 0;
        const bTime = b.lastCallAt ? new Date(b.lastCallAt).getTime() : 0;
        return bTime - aTime;
      })
      .map(contact => ({
        id: `call-${contact.id}`,
        contact,
        type: 'video' as const,
        direction: contact.missedCalls ? 'missed' as const : 'outgoing' as const,
        timestamp: contact.lastCallAt || new Date().toISOString(),
      }));
  }, [hub.contacts]);
  
  // Start a new chat
  const startChat = useCallback((contactId: number) => {
    router.push(`/messages/${contactId}`);
  }, []);
  
  // Start a call
  const startCall = useCallback((contactId: number, type: 'audio' | 'video' = 'audio') => {
    hub.initiateCall(contactId, type);
    router.push({
      pathname: '/call/[id]' as const,
      params: { id: String(contactId), type },
    } as any);
  }, [hub]);
  
  // Start video call
  const startVideoCall = useCallback((contactId: number) => {
    startCall(contactId, 'video');
  }, [startCall]);
  
  // Open group chat
  const openGroupChat = useCallback((groupId: string) => {
    router.push(`/messages/group/${groupId}`);
  }, []);
  
  // Create new group
  const createNewGroup = useCallback(async (name: string, memberIds: number[]) => {
    try {
      const group = await hub.createGroup(name, memberIds);
      router.push(`/messages/group/${group.id}`);
      return group;
    } catch (error) {
      console.error('[useUnifiedCommunication] Failed to create group:', error);
      throw error;
    }
  }, [hub]);
  
  // Search across all
  const search = useCallback((query: string): {
    contacts: Contact[];
    groups: ContactGroup[];
  } => {
    if (!query.trim()) {
      return { contacts: [], groups: [] };
    }
    
    const q = query.toLowerCase();
    
    const contacts = hub.contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
    
    const groups = hub.groups.filter(g =>
      g.name.toLowerCase().includes(q)
    );
    
    return { contacts, groups };
  }, [hub.contacts, hub.groups]);
  
  // Get contact by ID with status
  const getContact = useCallback((contactId: number): Contact | undefined => {
    return hub.contacts.find(c => c.id === contactId);
  }, [hub.contacts]);
  
  // Check if user is typing
  const getTypingUsers = useCallback((conversationId: string): string[] => {
    const typing = hub.typingUsers.get(Number(conversationId));
    return typing?.map(t => t.userName).filter((name): name is string => !!name) || [];
  }, [hub.typingUsers]);
  
  return {
    // State
    isConnected: hub.connected,
    connectionError: hub.connectionError,
    loading,
    
    // Contacts
    contacts: hub.contacts,
    favoriteContacts: hub.favoriteContacts,
    onlineContacts: hub.onlineContacts,
    groups: hub.groups,
    recentContacts,
    
    // Computed
    conversations,
    callLogs,
    
    // Counts
    unreadMessages: hub.unreadCounts.messages,
    missedCalls: hub.unreadCounts.calls,
    totalUnread: hub.unreadCounts.messages + hub.unreadCounts.calls,
    
    // Incoming call
    incomingCall: hub.incomingCall,
    acceptIncomingCall: hub.acceptIncomingCall,
    rejectIncomingCall: hub.rejectIncomingCall,
    
    // Actions
    startChat,
    startCall,
    startVideoCall,
    openGroupChat,
    createNewGroup,
    search,
    getContact,
    getTypingUsers,
    refreshContacts: hub.refreshContacts,
    
    // Typing
    startTyping: hub.startTyping,
    stopTyping: hub.stopTyping,
    
    // Status
    setMyStatus: hub.setMyStatus,
    isContactOnline: hub.isContactOnline,
  };
}

/**
 * Hook to get a single contact with real-time status
 */
export function useContact(contactId: number) {
  const hub = useCommunicationHub();
  
  const contact = useMemo(() => {
    return hub.contacts.find(c => c.id === contactId);
  }, [hub.contacts, contactId]);
  
  const status = useMemo(() => {
    return hub.getContactStatus(contactId);
  }, [hub, contactId]);
  
  const isOnline = hub.isContactOnline(contactId);
  
  return {
    contact,
    status,
    isOnline,
    initiateCall: (type: 'audio' | 'video') => hub.initiateCall(contactId, type),
  };
}

/**
 * Hook for typing indicator in a conversation
 */
export function useTypingIndicator(conversationId: string) {
  const hub = useCommunicationHub();
  
  const typingUsers = useMemo(() => {
    return hub.typingUsers.get(Number(conversationId)) || [];
  }, [hub.typingUsers, conversationId]);
  
  const isTyping = typingUsers.length > 0;
  
  const typingText = useMemo(() => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0].userName} đang nhập...`;
    if (typingUsers.length === 2) return `${typingUsers[0].userName} và ${typingUsers[1].userName} đang nhập...`;
    return `${typingUsers.length} người đang nhập...`;
  }, [typingUsers]);
  
  return {
    typingUsers,
    isTyping,
    typingText,
    startTyping: () => hub.startTyping(Number(conversationId)),
    stopTyping: () => hub.stopTyping(Number(conversationId)),
  };
}
