// User and Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'khach-hang' | 'nha-thau' | 'thau-phu' | 'cong-ty';
  isVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: User['role'];
}

export interface OTPRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  progress: number;
  ownerId: string;
  owner: User;
  team: ProjectMember[];
  address?: string;
  images: string[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  user: User;
  role: 'owner' | 'manager' | 'contractor' | 'worker';
  permissions: string[];
  joinedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  budget: number;
  address?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: Project['status'];
  progress?: number;
}

// Message and Chat types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'project';
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  user: User;
  role: 'admin' | 'member';
  joinedAt: string;
  lastReadAt?: string;
}

export interface SendMessageRequest {
  content: string;
  type?: Message['type'];
  metadata?: Record<string, any>;
}

// Contact types
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  status: 'online' | 'offline' | 'away';
  userId?: string;
  user?: User;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
  tags?: string[];
}

// File Upload types
export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploaderId: string;
  uploader: User;
  projectId?: string;
  createdAt: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  fileName: string;
  expiresIn: number;
}

export interface UploadFileRequest {
  fileName: string;
  fileType: string;
  projectId?: string;
}

// Document types
export interface Document {
  id: string;
  title: string;
  description?: string;
  type: 'contract' | 'blueprint' | 'permit' | 'invoice' | 'report' | 'other';
  fileId: string;
  file: UploadedFile;
  projectId?: string;
  uploaderId: string;
  uploader: User;
  version: number;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'project' | 'message' | 'system' | 'payment';
  isRead: boolean;
  userId: string;
  data?: Record<string, any>;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  status: number;
  statusText: string;
  url: string;
  detail: string;
  body: any;
}

// Socket Event types
export interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  error: (error: any) => void;
  
  // Message events
  new_message: (message: Message) => void;
  message_read: (data: { messageId: string; userId: string }) => void;
  typing_start: (data: { conversationId: string; userId: string }) => void;
  typing_stop: (data: { conversationId: string; userId: string }) => void;
  
  // Project events
  project_update: (project: Project) => void;
  project_member_joined: (data: { projectId: string; member: ProjectMember }) => void;
  project_member_left: (data: { projectId: string; userId: string }) => void;
  
  // User presence
  user_status_change: (data: { userId: string; status: 'online' | 'offline' | 'away' }) => void;
  
  // Notifications
  notification: (notification: Notification) => void;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type AppTabParamList = {
  Home: undefined;
  Messages: { conversationId?: string };
  Contacts: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ProjectDetail: { projectId: string };
  CreateProject: undefined;
  EditProject: { projectId: string };
};

export type MessagesStackParamList = {
  MessagesList: undefined;
  Conversation: { conversationId: string };
  CreateConversation: undefined;
};

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'phone' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
  options?: { label: string; value: string }[];
}

export interface FormErrors {
  [fieldName: string]: string;
}

// App State types
export interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    showPhoneNumber: boolean;
    showEmail: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
  };
}