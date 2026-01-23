/**
 * Document Control Service
 * Frontend service for document control API endpoints
 * - Document management and versioning
 * - Document revisions
 * - Review and approval workflow
 * - Document distribution
 * - Comments and annotations
 * - Transmittals management
 */

import { get, patch, post, put } from "./api";

// ============ TYPES ============

export enum DocumentStatus {
  DRAFT = "DRAFT",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUPERSEDED = "SUPERSEDED",
  OBSOLETE = "OBSOLETE",
}

export enum DocumentCategory {
  SPECIFICATION = "SPECIFICATION",
  DRAWING = "DRAWING",
  SUBMITTAL = "SUBMITTAL",
  RFI = "RFI",
  CHANGE_ORDER = "CHANGE_ORDER",
  REPORT = "REPORT",
  CONTRACT = "CONTRACT",
  CORRESPONDENCE = "CORRESPONDENCE",
  MANUAL = "MANUAL",
  CERTIFICATE = "CERTIFICATE",
}

export enum TransmittalStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  RESPONDED = "RESPONDED",
  CLOSED = "CLOSED",
}

export enum TransmittalPurpose {
  FOR_REVIEW = "FOR_REVIEW",
  FOR_APPROVAL = "FOR_APPROVAL",
  FOR_INFORMATION = "FOR_INFORMATION",
  FOR_RECORD = "FOR_RECORD",
  FOR_ACTION = "FOR_ACTION",
  AS_REQUESTED = "AS_REQUESTED",
}

export interface DocumentRevision {
  id: number;
  revisionNumber: string;
  description?: string;
  fileUrl: string;
  uploadedById: number;
  uploadedByName: string;
  uploadedAt: string;
  changes?: string[];
  fileSize?: number;
}

export interface DocumentComment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  resolved: boolean;
  resolvedById?: number;
  resolvedByName?: string;
  resolvedAt?: string;
  resolution?: string;
  page?: number;
  position?: { x: number; y: number };
  createdAt: string;
}

export interface DocumentDistribution {
  id: number;
  documentId: number;
  recipientId: number;
  recipientName: string;
  recipientEmail?: string;
  purpose: TransmittalPurpose;
  distributedAt: string;
  distributedById: number;
  distributedByName: string;
  acknowledgedAt?: string;
  notes?: string;
}

export interface Document {
  id: number;
  projectId: number;
  documentNumber: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  currentRevision: string;
  revisions: DocumentRevision[];
  comments: DocumentComment[];
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  discipline?: string;
  originator?: string;
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

export interface TransmittalItem {
  documentId: number;
  documentNumber: string;
  title: string;
  currentRevision: string;
  copies?: number;
}

export interface Transmittal {
  id: number;
  projectId: number;
  transmittalNumber: string;
  subject: string;
  status: TransmittalStatus;
  purpose: TransmittalPurpose;
  fromId: number;
  fromName: string;
  fromCompany?: string;
  toId: number;
  toName: string;
  toCompany?: string;
  ccIds?: number[];
  ccNames?: string[];
  items: TransmittalItem[];
  message?: string;
  dueDate?: string;
  sentAt?: string;
  acknowledgedAt?: string;
  acknowledgedById?: number;
  acknowledgedByName?: string;
  response?: string;
  respondedAt?: string;
  respondedById?: number;
  respondedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentControlDashboard {
  totalDocuments: number;
  documentsByStatus: { status: DocumentStatus; count: number }[];
  documentsByCategory: { category: DocumentCategory; count: number }[];
  pendingReviews: number;
  recentApprovals: Document[];
  openTransmittals: number;
  recentTransmittals: Transmittal[];
  openComments: number;
}

// ============ DTOs ============

export interface QueryDocumentDto {
  projectId?: number;
  status?: DocumentStatus;
  category?: DocumentCategory;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateDocumentDto {
  projectId: number;
  documentNumber: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  discipline?: string;
  originator?: string;
  createdById: number;
}

export interface UpdateDocumentDto {
  title?: string;
  description?: string;
  category?: DocumentCategory;
  discipline?: string;
  originator?: string;
}

export interface UploadRevisionDto {
  description?: string;
  fileUrl: string;
  uploadedById: number;
  changes?: string[];
  fileSize?: number;
}

export interface ReviewDocumentDto {
  reviewedById: number;
  approved: boolean;
  notes?: string;
}

export interface DistributeDocumentDto {
  recipientId: number;
  purpose: TransmittalPurpose;
  distributedById: number;
  notes?: string;
}

export interface AddCommentDto {
  content: string;
  authorId: number;
  page?: number;
  position?: { x: number; y: number };
}

export interface ResolveCommentDto {
  resolvedById: number;
  resolution?: string;
}

export interface QueryTransmittalDto {
  projectId?: number;
  status?: TransmittalStatus;
  purpose?: TransmittalPurpose;
  fromDate?: string;
  toDate?: string;
}

export interface CreateTransmittalDto {
  projectId: number;
  subject: string;
  purpose: TransmittalPurpose;
  fromId: number;
  toId: number;
  ccIds?: number[];
  documentIds: number[];
  message?: string;
  dueDate?: string;
}

export interface UpdateTransmittalDto {
  subject?: string;
  purpose?: TransmittalPurpose;
  toId?: number;
  ccIds?: number[];
  documentIds?: number[];
  message?: string;
  dueDate?: string;
}

export interface SendTransmittalDto {
  sentById: number;
}

export interface AcknowledgeTransmittalDto {
  acknowledgedById: number;
  notes?: string;
}

export interface RespondTransmittalDto {
  respondedById: number;
  response: string;
}

// ============ API FUNCTIONS ============

const BASE_PATH = "/document-control";

/**
 * Get document control dashboard metrics
 */
export async function getDashboard(
  projectId?: number
): Promise<DocumentControlDashboard> {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", String(projectId));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/dashboard?${queryString}`
    : `${BASE_PATH}/dashboard`;

  return get<DocumentControlDashboard>(url);
}

// ============ DOCUMENTS ============

/**
 * Get documents with filtering
 */
export async function getDocuments(query: QueryDocumentDto = {}): Promise<{
  documents: Document[];
  total: number;
  hasMore: boolean;
}> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.status) params.append("status", query.status);
  if (query.category) params.append("category", query.category);
  if (query.search) params.append("search", query.search);
  if (query.limit) params.append("limit", String(query.limit));
  if (query.offset) params.append("offset", String(query.offset));

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/documents?${queryString}`
    : `${BASE_PATH}/documents`;

  return get(url);
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: number): Promise<Document> {
  return get<Document>(`${BASE_PATH}/documents/${id}`);
}

/**
 * Create a new document
 */
export async function createDocument(
  dto: CreateDocumentDto
): Promise<Document> {
  return post<Document>(`${BASE_PATH}/documents`, dto);
}

/**
 * Update a document
 */
export async function updateDocument(
  id: number,
  dto: UpdateDocumentDto
): Promise<Document> {
  return put<Document>(`${BASE_PATH}/documents/${id}`, dto);
}

/**
 * Upload a new revision
 */
export async function uploadRevision(
  documentId: number,
  dto: UploadRevisionDto
): Promise<DocumentRevision> {
  return post<DocumentRevision>(
    `${BASE_PATH}/documents/${documentId}/revisions`,
    dto
  );
}

/**
 * Get document revisions
 */
export async function getRevisions(
  documentId: number
): Promise<DocumentRevision[]> {
  return get<DocumentRevision[]>(
    `${BASE_PATH}/documents/${documentId}/revisions`
  );
}

/**
 * Submit document for review
 */
export async function submitForReview(documentId: number): Promise<Document> {
  return patch<Document>(
    `${BASE_PATH}/documents/${documentId}/submit-review`,
    {}
  );
}

/**
 * Review a document
 */
export async function reviewDocument(
  documentId: number,
  dto: ReviewDocumentDto
): Promise<Document> {
  return patch<Document>(`${BASE_PATH}/documents/${documentId}/review`, dto);
}

// ============ DISTRIBUTION ============

/**
 * Distribute document to recipient
 */
export async function distributeDocument(
  documentId: number,
  dto: DistributeDocumentDto
): Promise<DocumentDistribution> {
  return post<DocumentDistribution>(
    `${BASE_PATH}/documents/${documentId}/distribute`,
    dto
  );
}

/**
 * Get document distributions
 */
export async function getDistributions(
  documentId: number
): Promise<DocumentDistribution[]> {
  return get<DocumentDistribution[]>(
    `${BASE_PATH}/documents/${documentId}/distributions`
  );
}

// ============ COMMENTS ============

/**
 * Get document comments
 */
export async function getComments(
  documentId: number
): Promise<DocumentComment[]> {
  return get<DocumentComment[]>(
    `${BASE_PATH}/documents/${documentId}/comments`
  );
}

/**
 * Add comment to document
 */
export async function addComment(
  documentId: number,
  dto: AddCommentDto
): Promise<DocumentComment> {
  return post<DocumentComment>(
    `${BASE_PATH}/documents/${documentId}/comments`,
    dto
  );
}

/**
 * Resolve a comment
 */
export async function resolveComment(
  documentId: number,
  commentId: number,
  dto: ResolveCommentDto
): Promise<DocumentComment> {
  return patch<DocumentComment>(
    `${BASE_PATH}/documents/${documentId}/comments/${commentId}/resolve`,
    dto
  );
}

// ============ TRANSMITTALS ============

/**
 * Get transmittals with filtering
 */
export async function getTransmittals(
  query: QueryTransmittalDto = {}
): Promise<Transmittal[]> {
  const params = new URLSearchParams();
  if (query.projectId) params.append("projectId", String(query.projectId));
  if (query.status) params.append("status", query.status);
  if (query.purpose) params.append("purpose", query.purpose);
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/transmittals?${queryString}`
    : `${BASE_PATH}/transmittals`;

  return get<Transmittal[]>(url);
}

/**
 * Get transmittal by ID
 */
export async function getTransmittalById(id: number): Promise<Transmittal> {
  return get<Transmittal>(`${BASE_PATH}/transmittals/${id}`);
}

/**
 * Create a new transmittal
 */
export async function createTransmittal(
  dto: CreateTransmittalDto
): Promise<Transmittal> {
  return post<Transmittal>(`${BASE_PATH}/transmittals`, dto);
}

/**
 * Update a transmittal
 */
export async function updateTransmittal(
  id: number,
  dto: UpdateTransmittalDto
): Promise<Transmittal> {
  return put<Transmittal>(`${BASE_PATH}/transmittals/${id}`, dto);
}

/**
 * Send a transmittal
 */
export async function sendTransmittal(
  id: number,
  dto: SendTransmittalDto
): Promise<Transmittal> {
  return patch<Transmittal>(`${BASE_PATH}/transmittals/${id}/send`, dto);
}

/**
 * Acknowledge a transmittal
 */
export async function acknowledgeTransmittal(
  id: number,
  dto: AcknowledgeTransmittalDto
): Promise<Transmittal> {
  return patch<Transmittal>(`${BASE_PATH}/transmittals/${id}/acknowledge`, dto);
}

/**
 * Respond to a transmittal
 */
export async function respondTransmittal(
  id: number,
  dto: RespondTransmittalDto
): Promise<Transmittal> {
  return patch<Transmittal>(`${BASE_PATH}/transmittals/${id}/respond`, dto);
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
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  uploadRevision,
  getRevisions,
  submitForReview,
  reviewDocument,
  distributeDocument,
  getDistributions,
  getComments,
  addComment,
  resolveComment,
  getTransmittals,
  getTransmittalById,
  createTransmittal,
  updateTransmittal,
  sendTransmittal,
  acknowledgeTransmittal,
  respondTransmittal,
  healthCheck,
};
