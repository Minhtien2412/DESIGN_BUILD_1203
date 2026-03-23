/**
 * AI Sales Chat — Type Definitions
 * Structured message types, response contracts, and intent taxonomy
 */

// ═══════════════════════════════════════════════════════════════
// MESSAGE BLOCK TYPES — what the chat can render
// ═══════════════════════════════════════════════════════════════

export type MessageBlockType =
  | "text"
  | "image"
  | "product_card"
  | "product_carousel"
  | "worker_card"
  | "worker_list"
  | "quick_replies"
  | "action_cta"
  | "system_status"
  | "summary_card"
  | "floor_plan_summary"
  | "cost_summary";

/** A single renderable block inside a chat message */
export interface MessageBlock {
  type: MessageBlockType;
  /** Plain or markdown text */
  text?: string;
  /** Image URI for image blocks */
  imageUri?: string;
  imageAlt?: string;
  /** Product data for product_card / product_carousel */
  product?: ProductCardData;
  products?: ProductCardData[];
  /** Worker data for worker_card / worker_list */
  worker?: WorkerCardData;
  workers?: WorkerCardData[];
  /** Quick reply chips */
  quickReplies?: QuickReplyOption[];
  /** CTA button */
  cta?: CTAAction;
  /** System status */
  statusType?: "info" | "success" | "warning" | "error" | "loading";
  statusMessage?: string;
  /** Summary card for architect flow */
  summary?: SummaryCardData;
  /** Floor plan summary */
  floorPlan?: FloorPlanData;
  /** Cost summary */
  costSummary?: CostSummaryData;
}

/** A chat message (user or assistant) with structured blocks */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  /** Legacy plain text — used for user messages and fallback */
  content: string;
  /** Rich blocks for assistant messages */
  blocks?: MessageBlock[];
  timestamp: Date;
  isTyping?: boolean;
  /** If the message had a tool failure */
  hasError?: boolean;
  /** Retry metadata */
  retryCount?: number;
}

// ═══════════════════════════════════════════════════════════════
// STRUCTURED AI RESPONSE CONTRACT
// ═══════════════════════════════════════════════════════════════

export type AIIntent =
  | "greeting"
  | "find_product"
  | "find_worker"
  | "repair_consultation"
  | "quotation_request"
  | "booking_request"
  | "service_followup"
  | "product_detail"
  | "worker_detail"
  | "cart_action"
  | "general_question"
  | "clarification_needed"
  | "architect_consultation"
  | "provide_land_size"
  | "provide_floors"
  | "provide_functions"
  | "provide_budget"
  | "provide_style"
  | "confirm_requirements"
  | "unknown";

export interface AIStructuredResponse {
  /** Main text response to display */
  message: string;
  /** Detected or chosen intent */
  intent: AIIntent;
  /** Quick reply suggestions for the user */
  quickReplies?: QuickReplyOption[];
  /** Products found / recommended */
  products?: ProductCardData[];
  /** Workers found / recommended */
  workers?: WorkerCardData[];
  /** Suggested next action */
  nextAction?: NextAction;
  /** Whether a human agent should be looped in */
  requiresHuman?: boolean;
  /** Extra metadata for logging */
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT & WORKER CARD DATA
// ═══════════════════════════════════════════════════════════════

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUri?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  discount?: number;
  badge?: string; // "Flash Sale", "Mới", "Best Seller"
  inStock?: boolean;
}

export interface WorkerCardData {
  id: string;
  name: string;
  avatarUri?: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  pricePerHour: number;
  distance?: string;
  estimatedArrival?: string;
  verified: boolean;
  online: boolean;
  skills?: string[];
  yearsExperience?: number;
}

// ═══════════════════════════════════════════════════════════════
// QUICK REPLIES & CTA
// ═══════════════════════════════════════════════════════════════

export interface QuickReplyOption {
  label: string;
  /** Value sent back to the AI when tapped */
  value: string;
  icon?: string; // Ionicons name
}

export interface CTAAction {
  label: string;
  action: "navigate" | "call" | "book" | "add_to_cart" | "create_lead";
  payload?: Record<string, unknown>;
}

export interface NextAction {
  type:
    | "ask_followup"
    | "show_products"
    | "show_workers"
    | "create_lead"
    | "create_booking"
    | "navigate";
  /** What the AI should ask next or do next */
  description?: string;
  payload?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// TOOL CALL TYPES
// ═══════════════════════════════════════════════════════════════

export interface ProductSearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export interface WorkerSearchParams {
  skill?: string;
  area?: string;
  serviceId?: string;
  /** Backend category key: construction, finishing, electrical, etc. */
  category?: string;
  /** Specific WorkerType enum value (e.g. THO_XAY) */
  workerType?: string;
  urgency?: "normal" | "urgent";
  limit?: number;
}

export interface LeadPayload {
  name?: string;
  phone?: string;
  email?: string;
  serviceType: string;
  description: string;
  budget?: string;
  location?: string;
  urgency?: "normal" | "urgent" | "flexible";
}

export interface BookingPayload {
  serviceId: string;
  workerId?: string;
  address: string;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════
// ARCHITECT CONSULTATION STATE
// ═══════════════════════════════════════════════════════════════

export type ArchitectStep =
  | "greeting"
  | "project_scope"
  | "land_size"
  | "floors"
  | "functions"
  | "budget"
  | "style"
  | "priority"
  | "special_needs"
  | "confirmation"
  | "result";

export interface ArchitectState {
  currentStep: ArchitectStep;
  buildType?: "new_build" | "renovation";
  landWidth?: number;
  landDepth?: number;
  landArea?: number;
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  livingRooms?: number;
  mainFunctions?: string[];
  specialNeeds?: string[];
  specialNeedsConfirmed?: boolean;
  hasGarage?: boolean;
  hasWorshipRoom?: boolean;
  hasRooftop?: boolean;
  hasSkylight?: boolean;
  hasElevator?: boolean;
  needsElderFriendly?: boolean;
  wantsGreenSpace?: boolean;
  budgetTier?: "economy" | "standard" | "premium" | "luxury";
  budgetAmount?: number;
  style?: string;
  priority?:
    | "cost"
    | "space"
    | "functionality"
    | "aesthetics"
    | "ventilation"
    | "privacy"
    | "feng_shui";
  isConfirmed?: boolean;
  location?: string;
  facingDirection?: string;
  usagePurpose?: "living" | "rental" | "business" | "mixed";
  consultationGoal?: "design_first" | "quote_first" | "layout_first";
}

// ═══════════════════════════════════════════════════════════════
// ARCHITECT RICH BLOCK DATA
// ═══════════════════════════════════════════════════════════════

export interface SummaryCardData {
  title: string;
  items: { label: string; value: string; icon?: string }[];
}

export interface FloorPlanData {
  floors: FloorLevelData[];
  totalArea: number;
  landCoverage: number;
}

export interface FloorLevelData {
  level: number;
  label: string;
  rooms: { name: string; area: number; icon?: string }[];
  totalArea: number;
}

export interface CostSummaryData {
  items: { label: string; amount: number; note?: string }[];
  total: number;
  pricePerM2: number;
  budgetFit: "under" | "fit" | "over";
}
