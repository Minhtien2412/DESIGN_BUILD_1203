/**
 * Conversation State Policy Evaluator
 * ====================================
 *
 * Evaluates moderation rules based on conversation state and participant roles.
 * State machine: NEW → MATCHED → NEGOTIATING → BOOKED → IN_PROGRESS → COMPLETED | DISPUTE
 *
 * Rules tighten or relax based on:
 * - Current conversation state
 * - Sender role (customer | worker | admin)
 * - What category of content is being moderated
 */

import { Injectable, Logger } from "@nestjs/common";
import {
    ConversationState,
    ModerationAction,
    ModerationRequest,
    RuleHit,
    RuleLabel,
    RuleSeverity,
} from "../moderation/types";

interface StatePolicyRule {
  /** Which rule labels should be enforced in this state */
  enforced: RuleLabel[];
  /** Which rule labels are relaxed (lower severity) in this state */
  relaxed: RuleLabel[];
  /** Extra rules that only apply in this state */
  extraRules: Array<{
    pattern: RegExp;
    label: RuleLabel;
    severity: RuleSeverity;
    riskDelta: number;
    explanation: string;
  }>;
}

type RoleStatePolicies = Record<
  string,
  Partial<Record<ConversationState, StatePolicyRule>>
>;

@Injectable()
export class ConversationStateEvaluator {
  private readonly logger = new Logger(ConversationStateEvaluator.name);

  private readonly policies: RoleStatePolicies = {
    // ── Customer policies ──
    customer: {
      [ConversationState.NEW]: {
        enforced: [
          RuleLabel.OFF_PLATFORM_CONTACT,
          RuleLabel.PII_LEAK,
          RuleLabel.EXTERNAL_LINK,
          RuleLabel.PAYMENT_BYPASS,
        ],
        relaxed: [],
        extraRules: [
          {
            pattern:
              /(?:giao\s*dịch|thanh\s*toán|chuyển\s*(?:khoản|tiền))\s*(?:riêng|ngoài|trực\s*tiếp)/gi,
            label: RuleLabel.PAYMENT_BYPASS,
            severity: RuleSeverity.HIGH,
            riskDelta: 50,
            explanation: "Payment bypass attempt in NEW conversation",
          },
        ],
      },
      [ConversationState.MATCHED]: {
        enforced: [RuleLabel.OFF_PLATFORM_CONTACT, RuleLabel.PAYMENT_BYPASS],
        relaxed: [RuleLabel.EXTERNAL_LINK],
        extraRules: [],
      },
      [ConversationState.NEGOTIATING]: {
        enforced: [
          RuleLabel.OFF_PLATFORM_CONTACT,
          RuleLabel.PAYMENT_BYPASS,
          RuleLabel.SUSPICIOUS_NEGOTIATION,
        ],
        relaxed: [],
        extraRules: [
          {
            pattern:
              /(?:giảm\s*giá|bớt|giá\s*(?:ngoài|riêng|khác)).*(?:không\s*qua|ngoài\s*(?:app|hệ\s*thống))/gi,
            label: RuleLabel.SUSPICIOUS_NEGOTIATION,
            severity: RuleSeverity.MEDIUM,
            riskDelta: 35,
            explanation: "Attempting to negotiate outside platform pricing",
          },
        ],
      },
      [ConversationState.BOOKED]: {
        enforced: [RuleLabel.PAYMENT_BYPASS, RuleLabel.SCAM_FRAUD],
        relaxed: [RuleLabel.PII_LEAK], // some PII may be needed for service delivery
        extraRules: [],
      },
      [ConversationState.IN_PROGRESS]: {
        enforced: [RuleLabel.PAYMENT_BYPASS, RuleLabel.ABUSE_TOXIC],
        relaxed: [RuleLabel.PII_LEAK, RuleLabel.EXTERNAL_LINK],
        extraRules: [],
      },
      [ConversationState.COMPLETED]: {
        enforced: [RuleLabel.ABUSE_TOXIC, RuleLabel.SCAM_FRAUD],
        relaxed: [
          RuleLabel.OFF_PLATFORM_CONTACT,
          RuleLabel.PII_LEAK,
          RuleLabel.EXTERNAL_LINK,
        ],
        extraRules: [],
      },
      [ConversationState.DISPUTE]: {
        enforced: [
          RuleLabel.ABUSE_TOXIC,
          RuleLabel.OFF_PLATFORM_CONTACT,
          RuleLabel.SCAM_FRAUD,
        ],
        relaxed: [],
        extraRules: [
          {
            pattern:
              /(?:xóa|gỡ|hủy)\s*(?:khiếu\s*nại|đánh\s*giá|review|feedback)/gi,
            label: RuleLabel.ABUSE_TOXIC,
            severity: RuleSeverity.HIGH,
            riskDelta: 45,
            explanation: "Pressuring to remove complaint/review during dispute",
          },
          {
            pattern:
              /(?:dàn\s*xếp|thỏa\s*thuận|deal)\s*(?:riêng|ngoài|bên\s*ngoài)/gi,
            label: RuleLabel.OFF_PLATFORM_CONTACT,
            severity: RuleSeverity.HIGH,
            riskDelta: 50,
            explanation: "Attempting off-platform settlement during dispute",
          },
          {
            pattern: /(?:đe\s*dọa|đ[oó]\s*nạt|uy\s*hiếp|kiện|luật\s*sư)/gi,
            label: RuleLabel.ABUSE_TOXIC,
            severity: RuleSeverity.CRITICAL,
            riskDelta: 55,
            explanation: "Threatening language during dispute",
          },
        ],
      },
    },
    // ── Worker policies ──
    worker: {
      [ConversationState.NEW]: {
        enforced: [
          RuleLabel.OFF_PLATFORM_CONTACT,
          RuleLabel.PII_LEAK,
          RuleLabel.PAYMENT_BYPASS,
          RuleLabel.SCAM_FRAUD,
        ],
        relaxed: [],
        extraRules: [
          {
            pattern:
              /(?:liên\s*hệ|gọi|nhắn)\s*(?:trực\s*tiếp|riêng|ngoài\s*app)/gi,
            label: RuleLabel.OFF_PLATFORM_CONTACT,
            severity: RuleSeverity.HIGH,
            riskDelta: 50,
            explanation:
              "Worker soliciting off-platform contact in NEW conversation",
          },
        ],
      },
      [ConversationState.MATCHED]: {
        enforced: [RuleLabel.OFF_PLATFORM_CONTACT, RuleLabel.PAYMENT_BYPASS],
        relaxed: [],
        extraRules: [],
      },
      [ConversationState.BOOKED]: {
        enforced: [RuleLabel.PAYMENT_BYPASS],
        relaxed: [RuleLabel.PII_LEAK], // worker may need to share work details
        extraRules: [],
      },
      [ConversationState.IN_PROGRESS]: {
        enforced: [RuleLabel.PAYMENT_BYPASS, RuleLabel.ABUSE_TOXIC],
        relaxed: [RuleLabel.PII_LEAK, RuleLabel.EXTERNAL_LINK],
        extraRules: [],
      },
      [ConversationState.DISPUTE]: {
        enforced: [RuleLabel.ABUSE_TOXIC, RuleLabel.OFF_PLATFORM_CONTACT],
        relaxed: [],
        extraRules: [
          {
            pattern: /(?:đe\s*dọa|đ[oó]\s*nạt|uy\s*hiếp)/gi,
            label: RuleLabel.ABUSE_TOXIC,
            severity: RuleSeverity.CRITICAL,
            riskDelta: 60,
            explanation: "Worker threatening language during dispute",
          },
        ],
      },
    },
    // ── Admin policies (minimal enforcement) ──
    admin: {
      [ConversationState.DISPUTE]: {
        enforced: [RuleLabel.ABUSE_TOXIC],
        relaxed: [
          RuleLabel.OFF_PLATFORM_CONTACT,
          RuleLabel.PII_LEAK,
          RuleLabel.EXTERNAL_LINK,
          RuleLabel.PAYMENT_BYPASS,
        ],
        extraRules: [],
      },
    },
  };

  /**
   * Evaluate conversation-state-aware rules.
   * Returns additional RuleHits from state-specific patterns + severity adjustments.
   */
  evaluate(request: ModerationRequest, baseHits: RuleHit[]): RuleHit[] {
    const state = request.conversationState;
    const role = request.senderRole ?? "customer";

    if (!state) {
      // No conversation state — cannot apply state policy
      return [];
    }

    const rolePolicies = this.policies[role] ?? this.policies["customer"];
    const statePolicy = rolePolicies?.[state];

    if (!statePolicy) {
      return [];
    }

    const additionalHits: RuleHit[] = [];

    // 1. Run state-specific extra pattern rules
    for (const rule of statePolicy.extraRules) {
      const match = request.message.match(rule.pattern);
      if (match) {
        additionalHits.push({
          ruleId: `STATE_${state}_${rule.label}`,
          label: rule.label,
          severity: rule.severity,
          riskDelta: rule.riskDelta,
          matchedEvidence: match[0],
          recommendedAction:
            rule.severity === RuleSeverity.CRITICAL
              ? ModerationAction.REJECT_MESSAGE
              : ModerationAction.QUEUE_HUMAN_REVIEW,
          explanation: rule.explanation,
        });
      }
    }

    // 2. Amplify severity for enforced rules that were detected
    for (const hit of baseHits) {
      if (statePolicy.enforced.includes(hit.label)) {
        // Boost risk for enforced rules in this state
        additionalHits.push({
          ruleId: `STATE_ENFORCE_${state}_${hit.ruleId}`,
          label: RuleLabel.STATE_VIOLATION,
          severity: RuleSeverity.HIGH,
          riskDelta: Math.round(hit.riskDelta * 0.3), // 30% boost
          matchedEvidence: hit.matchedEvidence,
          recommendedAction: ModerationAction.QUEUE_HUMAN_REVIEW,
          explanation: `Rule ${hit.ruleId} enforced in state ${state} for role ${role}`,
        });
      }
    }

    // 3. Reduce risk for relaxed rules
    for (const hit of baseHits) {
      if (statePolicy.relaxed.includes(hit.label)) {
        additionalHits.push({
          ruleId: `STATE_RELAX_${state}_${hit.ruleId}`,
          label: hit.label,
          severity: RuleSeverity.LOW,
          riskDelta: -Math.round(hit.riskDelta * 0.5), // 50% reduction
          matchedEvidence: hit.matchedEvidence,
          recommendedAction: ModerationAction.NONE,
          explanation: `Rule ${hit.ruleId} relaxed in state ${state} for role ${role}`,
        });
      }
    }

    if (additionalHits.length > 0) {
      this.logger.debug(
        `State evaluator [${state}/${role}]: ${additionalHits.length} adjustments`,
      );
    }

    return additionalHits;
  }
}
