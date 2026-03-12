import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: (id?: string) => ['user', id] as const,
  
  // Projects
  projects: ['projects'] as const,
  project: (id: string) => ['project', id] as const,
  projectsByUser: (userId: string) => ['projects', 'user', userId] as const,
  
  // Messages
  messages: ['messages'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  conversations: ['conversations'] as const,
  
  // Contacts
  contacts: ['contacts'] as const,
  contact: (id: string) => ['contact', id] as const,
  
  // Uploads
  uploads: ['uploads'] as const,
  upload: (id: string) => ['upload', id] as const,
};
