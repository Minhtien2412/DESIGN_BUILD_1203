/**
 * Moderation Types
 * ================
 * Shared types for the AI Brain moderation pipeline.
 * Must stay in sync with App Core's ai-internal types.
 */

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export enum ModerationDecision {
  ALLOW = "ALLOW",
  ALLOW_WITH_REDACTION = "ALLOW_WITH_REDACTION",
  SOFT_BLOCK = "SOFT_BLOCK",
  BLOCK = "BLOCK",
  ESCALATE_REVIEW = "ESCALATE_REVIEW",
}

export enum ModerationAction {
  NONE = "NONE",
  NOTIFY_USER_REDACTED = "NOTIFY_USER_REDACTED",
  ASK_USER_EDIT = "ASK_USER_EDIT",
  REJECT_MESSAGE = "REJECT_MESSAGE",
  QUEUE_HUMAN_REVIEW = "QUEUE_HUMAN_REVIEW",
}

export enum ConversationState {
  NEW = "NEW",
  MATCHED = "MATCHED",
  NEGOTIATING = "NEGOTIATING",
  BOOKED = "BOOKED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DISPUTE = "DISPUTE",
}

export enum ParticipantRole {
  CUSTOMER = "customer",
  WORKER = "worker",
  ADMIN = "admin",
}

export enum RuleSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum RuleLabel {
  OFF_PLATFORM_CONTACT = "OFF_PLATFORM_CONTACT",
  SCAM_FRAUD = "SCAM_FRAUD",
  PAYMENT_BYPASS = "PAYMENT_BYPASS",
  ABUSE_TOXIC = "ABUSE_TOXIC",
  SPAM_FLOOD = "SPAM_FLOOD",
  ROLE_VIOLATION = "ROLE_VIOLATION",
  STATE_VIOLATION = "STATE_VIOLATION",
  SUSPICIOUS_NEGOTIATION = "SUSPICIOUS_NEGOTIATION",
  REPEATED_EVASION = "REPEATED_EVASION",
  PII_LEAK = "PII_LEAK",
  EXTERNAL_LINK = "EXTERNAL_LINK",
}

// ──────────────────────────────────────────────
// Request (App Core → AI Brain)
// ──────────────────────────────────────────────

export interface RecentContextMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export interface ModerationRequest {
  traceId: string;
  userId: number;
  threadId: string;
  message: string;

  // Conversation-aware fields
  conversationId?: string;
  senderId?: number;
  senderRole?: string;
  receiverId?: number;
  receiverRole?: string;
  conversationState?: ConversationState;
  recentContext?: RecentContextMessage[];
  projectId?: string;

  attachments?: { type: string; url: string; mimeType?: string }[];
  metadata?: ModerationRequestMetadata;
}

export interface ModerationRequestMetadata {
  channel?: string;
  senderTrustScore?: number;
  recentMessages?: string[];
  locale?: string;
  messageId?: string;
  deviceId?: string;
  platform?: string;
  ip?: string;
  timestamp?: string;
}

// ──────────────────────────────────────────────
// Response (AI Brain → App Core)
// ──────────────────────────────────────────────

export interface ModerationResponse {
  traceId: string;
  decision: ModerationDecision;
  action: ModerationAction;
  riskScore: number;
  labels: RuleLabel[];
  safeUserNotice?: string;
  normalizedContent?: string;
  redactedText?: string;
  reasons: ModerationReason[];
  reviewRequired: boolean;
  matchedRuleIds: string[];
  policyVersion: string;
  latencyMs: number;
  usedFallback: boolean;
}

export interface ModerationReason {
  ruleId: string;
  label: RuleLabel;
  severity: RuleSeverity;
  riskDelta: number;
  matchedEvidence?: string;
  recommendedAction: ModerationAction;
  explanation: string;
}

// ──────────────────────────────────────────────
// Internal: Rule hit from detectors/evaluators
// ──────────────────────────────────────────────

export interface RuleHit {
  ruleId: string;
  label: RuleLabel;
  severity: RuleSeverity;
  riskDelta: number;
  matchedEvidence?: string;
  recommendedAction: ModerationAction;
  explanation: string;
}
