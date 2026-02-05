/**
 * Unified Storage Service
 * Centralized storage management for the entire app
 *
 * Supports multiple providers:
 * - Backend Storage (default - uses existing API)
 * - Supabase Storage (per-user folders, real-time sync)
 * - AWS S3 (for large files, CDN delivery)
 * - Cloudinary (for image/video optimization)
 * - Local storage (offline fallback)
 *
 * @module services/storage
 */

export * from "./backendStorage";
export * from "./cloudinaryStorage";
export * from "./s3Storage";
export * from "./supabaseStorage";
export * from "./types";
export * from "./unifiedStorage";
export { default as storageService } from "./unifiedStorage";

