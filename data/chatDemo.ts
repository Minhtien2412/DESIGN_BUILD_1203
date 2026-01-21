/**
 * Chat Data Types - Production
 * Data from API only - no demo data
 */

export type ChatDemoThread = { id: string; name: string; preview: string; unread: number };
export type ChatDemoMessage = { id: string; sender: 'agent' | 'user'; name: string; text: string };
export type ChatListEntry = {
  id: string;
  name: string;
  subtext: string;
  time: string;
  status: 'online' | 'offline';
  iconUrl?: string;
};

// Empty arrays - data from API only
export const CHAT_DEMO_THREADS: ChatDemoThread[] = [];
export const CHAT_DEMO_MESSAGES: ChatDemoMessage[] = [];

export const getDemoThreadById = (id: string) => CHAT_DEMO_THREADS.find(t => t.id === id);

// Empty lists - data from API only
export const CHAT_MEETINGS_LIST: (ChatListEntry & { lastUpdate?: number })[] = [];
export const CHAT_INBOX_LIST: ChatListEntry[] = [];
