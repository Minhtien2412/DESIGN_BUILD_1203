/**
 * As-Built Service
 * Frontend service for as-built API endpoints
 * - As-built drawings management
 * - Revisions and versioning
 * - Review and approval workflow
 * - Comments and annotations
 * - Export packages
 */

import { get, patch, post, put } from "./api";

// ============ TYPES ============

export enum DrawingStatus {
  DRAFT = "DRAFT",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUPERSEDED = "SUPERSEDED",
}

export enum DrawingType {
  ARCHITECTURAL = "ARCHITECTURAL",
  STRUCTURAL = "STRUCTURAL",
  MEP = "MEP",
  ELECTRICAL = "ELECTRICAL",
  PLUMBING = "PLUMBING",
  CIVIL = "CIVIL",
  LANDSCAPE = "LANDSCAPE",
}

export enum ExportFormat {
  PDF = "PDF",
  DWG = "DWG",
  DXF = "DXF",
  ZIP = "ZIP",
}

export enum ExportStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface DrawingRevision {
  id: number;
  revisionNumber: string;
  description?: string;
  fileUrl: string;
  uploadedById: number;
  uploadedByName: string;
  uploadedAt: string;
  changes?: string[];
}

export interface DrawingComment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  position?: { x: number; y: number; page?: number };
  resolved: boolean;
  resolvedById?: number;
  resolvedByName?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

export interface AsBuiltDrawing {
  id: number;
  projectId: number;
  drawingNumber: string;
  title: string;
  description?: string;
  drawingType: DrawingType;
  status: DrawingStatus;
  currentRevision: string;
  revisions: DrawingRevision[];
  comments: DrawingComment[];
  fileUrl: string;
  thumbnailUrl?: string;
  zone?: string;
  level?: string;
  discipline?: string;
  scale?: string;
  submittedForReviewAt?: string;
  reviewedById?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportPackage {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  format: ExportFormat;
  status: ExportStatus;
  drawingIds: number[];
  includeRevisions: boolean;
  fileUrl?: string;
  fileSize?: number;
  requestedById: number;
  requestedByName: string;
  requestedAt: string;
  completedAt?: string;
  error?: string;
}

export interface AsBuiltDashboard {
  totalDrawings: number;
  drawingsByStatus: { status: DrawingStatus; count: number }[];
  drawingsByType: { type: DrawingType; count: number }[];
  pendingReviews: number;
  recentApprovals: AsBuiltDrawing[];
  recentExports: ExportPackage[];
  openComments: number;
}

// ============ DTOs ============

export interface QueryDrawingDto {
  projectId?: number;
  status?: DrawingStatus;
  drawingType?: DrawingType;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateDrawingDto {
  projectId: number;
  drawingNumber: string;
  title: string;
  description?: string;
  drawingType: DrawingType;
  fileUrl: string;
  thumbnailUrl?: string;
  zone?: string;
  level?: string;
  discipline?: string;
  scale?: string;
  createdById: number;
}

export interface UpdateDrawingDto {
  title?: string;
  description?: string;
  drawingType?: DrawingType;
  zone?: string;
  level?: string;
  discipline?: string;
  scale?: string;
}

export interface UploadRevisionDto {
  description?: string;
  fileUrl: string;
  uploadedById: number;
  changes?: string[];
}

export interface ReviewDrawingDto {
  reviewedById: number;
  approved: boolean;
  notes?: string;
}

export interface ApproveDrawingDto {
  approvedById: number;
  notes?: string;
}

export interface AddCommentDto {
  content: string;
  authorId: number;
  position?: { x: number; y: number; page?: number };
}

export interface ResolveCommentDto {
  resolvedById: number;
  resolution?: string;
}

export interface QueryExportDto {
  projectId?: number;
  requestedBy?: number;
}

export interface CreateExportPackageDto {
  projectId: number;
  name: string;
  description?: string;
  format: ExportFormat;
  drawingIds: number[];
  includeRevisions?: boolean;
  requestedById: number;
}

// ============ API FUNCTIONS ============

const BASE_PATH = "/as-built";

/**
 * Get as-built dashboard metrics
 */
export async function getDashboard(
  projectId?: number
): Promise<AsBuiltDashboard> {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", String(projectId));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/dashboard?${queryString}`
    : `${BASE_PATH}/dashboard`;

  return get<AsBuiltDashboard>(url);
}

// ============ DRAWINGS ============

/**
 * Get as-built drawings with filtering
 */
export async function getDrawings(query: QueryDrawingDto = {}): Promise<{
  drawings: AsBuiltDrawing[];
  total: number;
  hasMore: boolean;
}> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.status) params.append("status", query.status);
  if (query.drawingType) params.append("drawingType", query.drawingType);
  if (query.search) params.append("search", query.search);
  if (query.limit) params.append("limit", String(query.limit));
  if (query.offset) params.append("offset", String(query.offset));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/drawings?${queryString}`
    : `${BASE_PATH}/drawings`;

  return get(url);
}

/**
 * Get drawing by ID
 */
export async function getDrawingById(id: number): Promise<AsBuiltDrawing> {
  return get<AsBuiltDrawing>(`${BASE_PATH}/drawings/${id}`);
}

/**
 * Create a new as-built drawing
 */
export async function createDrawing(
  dto: CreateDrawingDto
): Promise<AsBuiltDrawing> {
  return post<AsBuiltDrawing>(`${BASE_PATH}/drawings`, dto);
}

/**
 * Update an as-built drawing
 */
export async function updateDrawing(
  id: number,
  dto: UpdateDrawingDto
): Promise<AsBuiltDrawing> {
  return put<AsBuiltDrawing>(`${BASE_PATH}/drawings/${id}`, dto);
}

/**
 * Upload a new revision for a drawing
 */
export async function uploadRevision(
  drawingId: number,
  dto: UploadRevisionDto
): Promise<DrawingRevision> {
  return post<DrawingRevision>(
    `${BASE_PATH}/drawings/${drawingId}/revisions`,
    dto
  );
}

/**
 * Get revisions for a drawing
 */
export async function getRevisions(
  drawingId: number
): Promise<DrawingRevision[]> {
  return get<DrawingRevision[]>(`${BASE_PATH}/drawings/${drawingId}/revisions`);
}

/**
 * Submit drawing for review
 */
export async function submitForReview(
  drawingId: number
): Promise<AsBuiltDrawing> {
  return patch<AsBuiltDrawing>(
    `${BASE_PATH}/drawings/${drawingId}/submit-review`,
    {}
  );
}

/**
 * Review a drawing
 */
export async function reviewDrawing(
  drawingId: number,
  dto: ReviewDrawingDto
): Promise<AsBuiltDrawing> {
  return patch<AsBuiltDrawing>(
    `${BASE_PATH}/drawings/${drawingId}/review`,
    dto
  );
}

/**
 * Approve a drawing
 */
export async function approveDrawing(
  drawingId: number,
  dto: ApproveDrawingDto
): Promise<AsBuiltDrawing> {
  return patch<AsBuiltDrawing>(
    `${BASE_PATH}/drawings/${drawingId}/approve`,
    dto
  );
}

// ============ COMMENTS ============

/**
 * Get comments for a drawing
 */
export async function getComments(
  drawingId: number
): Promise<DrawingComment[]> {
  return get<DrawingComment[]>(`${BASE_PATH}/drawings/${drawingId}/comments`);
}

/**
 * Add comment to a drawing
 */
export async function addComment(
  drawingId: number,
  dto: AddCommentDto
): Promise<DrawingComment> {
  return post<DrawingComment>(
    `${BASE_PATH}/drawings/${drawingId}/comments`,
    dto
  );
}

/**
 * Resolve a comment
 */
export async function resolveComment(
  drawingId: number,
  commentId: number,
  dto: ResolveCommentDto
): Promise<DrawingComment> {
  return patch<DrawingComment>(
    `${BASE_PATH}/drawings/${drawingId}/comments/${commentId}/resolve`,
    dto
  );
}

// ============ EXPORTS ============

/**
 * Get export packages
 */
export async function getExports(
  query: QueryExportDto = {}
): Promise<ExportPackage[]> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.requestedBy)
    params.append("requestedBy", String(query.requestedBy));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/exports?${queryString}`
    : `${BASE_PATH}/exports`;

  return get<ExportPackage[]>(url);
}

/**
 * Get export package by ID
 */
export async function getExportById(id: number): Promise<ExportPackage> {
  return get<ExportPackage>(`${BASE_PATH}/exports/${id}`);
}

/**
 * Create an export package
 */
export async function createExportPackage(
  dto: CreateExportPackageDto
): Promise<ExportPackage> {
  return post<ExportPackage>(`${BASE_PATH}/exports`, dto);
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{
  status: string;
  service: string;
  timestamp: string;
}> {
  return get(`${BASE_PATH}/health`);
}

export default {
  getDashboard,
  getDrawings,
  getDrawingById,
  createDrawing,
  updateDrawing,
  uploadRevision,
  getRevisions,
  submitForReview,
  reviewDrawing,
  approveDrawing,
  getComments,
  addComment,
  resolveComment,
  getExports,
  getExportById,
  createExportPackage,
  healthCheck,
};
