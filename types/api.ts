/**
 * Types for Design Build API - Based on Prisma Schema
 * Follows OpenAPI 3.1.0 spec and BigInt ID handling
 */

// Base types
export type ID = string; // BigInt converted to string for JS safety

// Enums from Prisma
export enum WorkOrderStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS', 
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export enum RoomType {
  DM = 'dm',
  GROUP = 'group',
  MEETING = 'meeting',
  LIVESTREAM = 'livestream'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

export enum StreamStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELED = 'canceled'
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

export enum ScheduleStatus {
  PLANNED = 'planned',
  REQUESTED = 'requested',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled'
}

export enum PostType {
  DESIGN_SHOWCASE = 'design_showcase',
  UPDATE = 'update',
  OFFER = 'offer'
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// API Error Response
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    requestId?: string;
  };
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Core Models
export interface User {
  id: ID;
  username: string;
  fullName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  status: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Role {
  id: ID;
  code: string; // admin, contractor, worker, customer
  name: string;
  createdAt: string;
}

export interface Permission {
  id: ID;
  code: string; // e.g. "chat.send", "stream.start", "user.block"
  name: string;
  createdAt: string;
}

export interface UserWithRoles extends User {
  roles: Role[];
  permissions: Permission[];
}

export interface Firm {
  id: ID;
  type: string; // contractor|company|supplier
  name: string;
  tax_code?: string;
  phone?: string;
  email?: string;
  address?: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: ID;
  firmId: ID;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budgetVnd?: string; // Decimal as string
  address?: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  firm?: Firm;
}

export interface WorkOrder {
  id: ID;
  projectId: ID;
  title: string;
  status: WorkOrderStatus;
  meta?: Record<string, any>;
  createdBy: ID;
  createdAt: string;
  updatedAt: string;
  project?: Project;
}

export interface Task {
  id: ID;
  projectId: ID;
  workOrderId?: ID;
  title: string;
  status: TaskStatus;
  assigneeId?: ID;
  startDate?: string;
  dueDate?: string;
  progress: number; // 0..100
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  project?: Project;
}

export interface PaymentSchedule {
  id: ID;
  projectId: ID;
  title: string;
  amountVnd: string; // Decimal as string
  dueDate?: string;
  status: ScheduleStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
  project?: Project;
}

export interface PaymentTransaction {
  id: ID;
  scheduleId?: ID;
  projectId: ID;
  amountVnd: string; // Decimal as string
  method: string; // bank_transfer|cash|momo|zalopay
  status: string;
  refCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: ID;
  type: RoomType;
  title?: string;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface Message {
  id: ID;
  chatId: ID;
  senderId: ID;
  type: MessageType;
  text?: string;
  mediaUrl?: string;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface StreamSession {
  id: ID;
  hostId: ID;
  status: StreamStatus;
  title: string;
  startedAt?: string;
  endedAt?: string;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface Product {
  id: ID;
  firmId?: ID;
  name: string;
  sku?: string;
  priceVnd: string; // Decimal as string
  stock: number;
  status: ProductStatus;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: ID;
  buyerId: ID;
  totalVnd: string; // Decimal as string
  status: OrderStatus;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: ID;
  orderId: ID;
  productId: ID;
  qty: number;
  priceVnd: string; // Decimal as string
}

export interface Post {
  id: ID;
  authorId: ID;
  type: PostType;
  status: PostStatus;
  title: string;
  content?: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: ID;
  ownerId?: ID;
  url: string;
  kind?: string; // image|video|file
  mime?: string;
  size?: number;
  createdAt: string;
}

// API Request/Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserWithRoles;
}

export interface CreateWorkOrderRequest {
  projectId: ID;
  title: string;
  meta?: Record<string, any>;
}

export interface UpdateWorkOrderRequest {
  title?: string;
  status?: WorkOrderStatus;
  meta?: Record<string, any>;
}

export interface LiveKitTokenResponse {
  url: string;
  token: string;
  identity: string;
  room: string;
}

// Query parameters
export interface WorkOrderListParams {
  projectId?: ID;
  status?: WorkOrderStatus;
  page?: number;
  limit?: number;
}

export interface TaskListParams {
  projectId?: ID;
  workOrderId?: ID;
  status?: TaskStatus;
  assigneeId?: ID;
  page?: number;
  limit?: number;
}

// Standard API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}
