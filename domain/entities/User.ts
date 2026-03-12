/**
 * Domain Entity: User
 * ===================
 * Core user entity matching BE Prisma schema.
 * Only includes fields relevant to the mobile app.
 *
 * BE model: prisma/schema.prisma → model User
 * BE enum: Role
 */

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum UserRole {
  CLIENT = "CLIENT",
  SUPPLIER = "SUPPLIER",
  DESIGNER = "DESIGNER",
  ARCHITECT = "ARCHITECT",
  ENGINEER = "ENGINEER",
  CONTRACTOR = "CONTRACTOR",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

// ─────────────────────────────────────────────
// Entity
// ─────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  avatarThumbnail?: string;
  role: UserRole;
  emailVerified: boolean;
  phone?: string;
  zaloId?: string;
  location?: Record<string, any>;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Auth DTOs
// ─────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
