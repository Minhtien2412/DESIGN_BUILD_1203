/**
 * AI Assistant Types
 * GPT-4 Vision integration for construction project analysis
 */

// ==================== Enums ====================

/**
 * AI Analysis types
 */
export enum AIAnalysisType {
  PROGRESS = 'PROGRESS',
  QUALITY = 'QUALITY',
  ERROR_DETECTION = 'ERROR_DETECTION',
  MATERIAL_ESTIMATION = 'MATERIAL_ESTIMATION',
  DRAWING_ANALYSIS = 'DRAWING_ANALYSIS',
  GENERAL_CHAT = 'GENERAL_CHAT',
}

/**
 * Analysis status
 */
export enum AIAnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Issue severity levels
 */
export enum IssueSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

// ==================== Request Types ====================

/**
 * Analyze construction progress from photos
 * POST /ai/analyze-progress
 */
export interface AnalyzeProgressRequest {
  projectId: string;
  imageUrls: string[];
  context?: string; // Additional context about the construction phase
}

/**
 * Generate AI report for project
 * POST /ai/generate-report
 */
export interface GenerateReportRequest {
  projectId: string;
  reportType: 'progress' | 'quality' | 'issues' | 'summary';
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * Chat with AI assistant
 * POST /ai/chat
 */
export interface AIChatRequest {
  projectId?: string;
  message: string;
  conversationId?: string;
  imageUrls?: string[]; // For GPT-4 Vision
}

/**
 * Detect construction errors
 * POST /ai/detect-errors
 */
export interface DetectErrorsRequest {
  projectId: string;
  imageUrls: string[];
  checklistType?: 'foundation' | 'structure' | 'mep' | 'finishing';
}

/**
 * Estimate material quantities
 * POST /ai/estimate-materials
 */
export interface EstimateMaterialsRequest {
  projectId: string;
  imageUrls: string[];
  materialTypes?: string[];
}

/**
 * Check construction quality
 * POST /ai/check-quality
 */
export interface CheckQualityRequest {
  projectId: string;
  imageUrls: string[];
  phase: string;
  standards?: string[];
}

/**
 * Analyze construction drawing
 * POST /ai/analyze-drawing
 */
export interface AnalyzeDrawingRequest {
  projectId: string;
  drawingUrl: string;
  drawingType: 'architectural' | 'structural' | 'mep' | 'site-plan';
}

// ==================== Response Types ====================

/**
 * Progress analysis result
 */
export interface ProgressAnalysisResult {
  id: string;
  projectId: string;
  completionPercentage: number;
  progressPercentage?: number; // Alias for completionPercentage
  phase: string;
  tasks: {
    name: string;
    status: 'completed' | 'in-progress' | 'not-started';
    percentage: number;
  }[];
  completedTasks?: number; // Number of completed tasks
  totalTasks?: number; // Total number of tasks
  issues: DetectedIssue[];
  detectedIssues?: DetectedIssue[]; // Alias for issues
  recommendations: string[];
  summary?: string; // Summary text
  confidenceScore?: number; // 0-1 confidence score
  analyzedAt: string;
  imageUrls: string[];
}

/**
 * AI report
 */
export interface AIReport {
  id: string;
  projectId: string;
  reportType: string;
  title: string;
  summary: string;
  sections: ReportSection[];
  charts?: ChartData[];
  generatedAt: string;
  generatedBy: string; // AI model version
}

/**
 * Report section
 */
export interface ReportSection {
  title: string;
  content: string;
  images?: string[];
  charts?: ChartData[]; // Charts for this section
  data?: Record<string, any>;
}

/**
 * Chart data for reports
 */
export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'radar';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

/**
 * Chat message
 */
export interface AIChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrls?: string[];
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Chat response
 */
export interface AIChatResponse {
  message: AIChatMessage;
  conversationId: string;
  suggestions?: string[];
}

/**
 * Detected issue
 */
export interface DetectedIssue {
  id: string;
  type: string;
  title?: string; // Issue title/summary
  severity: IssueSeverity;
  description: string;
  location?: string;
  imageUrl?: string;
  recommendations: string[];
  detectedAt: string;
}

/**
 * Error detection result
 */
export interface ErrorDetectionResult {
  id: string;
  projectId: string;
  issues: DetectedIssue[];
  detectedIssues?: DetectedIssue[]; // Alias for issues
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  analyzedAt: string;
}

/**
 * Material estimation
 */
export interface MaterialEstimation {
  id: string;
  projectId: string;
  materials: {
    name: string;
    category: string;
    estimatedQuantity: number;
    unit: string;
    confidence: number; // 0-100
    unitPrice?: number; // Price per unit
    specifications?: string; // Material specifications
  }[];
  totalCostEstimate?: number;
  confidenceScore?: number; // 0-1 overall confidence
  notes: string[];
  analyzedAt: string;
}

/**
 * Quality check result
 */
export interface QualityCheckResult {
  id: string;
  projectId: string;
  phase: string;
  overallQuality: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';
  score: number; // 0-100
  criteria: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    score: number;
    notes: string;
  }[];
  recommendations: string[];
  analyzedAt: string;
}

/**
 * Drawing analysis result
 */
export interface DrawingAnalysisResult {
  id: string;
  projectId: string;
  drawingType: string;
  elements: {
    type: string;
    count: number;
    details: string[];
  }[];
  dimensions: {
    area?: number;
    perimeter?: number;
    volume?: number;
  };
  compliance: {
    standard: string;
    status: 'compliant' | 'non-compliant' | 'needs-review';
    notes: string[];
  }[];
  suggestions: string[];
  analyzedAt: string;
}

// ==================== List/Pagination Types ====================

/**
 * Paginated AI reports list
 */
export interface AIReportsListResponse {
  reports: AIReport[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Chat history
 */
export interface ChatHistoryResponse {
  conversationId: string;
  messages: AIChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ==================== Error Types ====================

export interface AIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ==================== Analytics Types ====================

/**
 * AI usage statistics
 */
export interface AIUsageStats {
  totalAnalyses: number;
  analysesByType: Record<AIAnalysisType, number>;
  averageProcessingTime: number; // seconds
  successRate: number; // percentage
  mostUsedFeatures: {
    feature: string;
    count: number;
  }[];
}
