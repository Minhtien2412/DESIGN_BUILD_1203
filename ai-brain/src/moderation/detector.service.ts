/**
 * Deterministic Detectors
 * =======================
 *
 * Regex + heuristic detectors that run as the first layer (hard rules / fast path).
 * Organized by rule groups:
 * - Off-platform contact detection (phone, email, social)
 * - Scam / fraud detection
 * - Payment bypass detection
 * - Abuse / toxic / harassment
 * - Spam / flood detection
 * - External link detection
 * - PII leak detection
 */

import { Injectable, Logger } from "@nestjs/common";
import {
    ModerationAction,
    ModerationRequest,
    RuleHit,
    RuleLabel,
    RuleSeverity,
} from "./types";

interface DetectorRule {
  ruleId: string;
  label: RuleLabel;
  severity: RuleSeverity;
  riskDelta: number;
  patterns: RegExp[];
  recommendedAction: ModerationAction;
  explanation: string;
  /** Only match first pattern hit per rule group */
  matchOnce?: boolean;
}

@Injectable()
export class DetectorService {
  private readonly logger = new Logger(DetectorService.name);

  private readonly rules: DetectorRule[] = [
    // ── Off-platform contact: Phone ──
    {
      ruleId: "PII_PHONE",
      label: RuleLabel.PII_LEAK,
      severity: RuleSeverity.HIGH,
      riskDelta: 40,
      patterns: [
        /(?:0|\+84|84)\s*[.\-\s]*[1-9]\s*[.\-\s]*\d\s*[.\-\s]*\d\s*[.\-\s]*\d\s*[.\-\s]*\d\s*[.\-\s]*\d\s*[.\-\s]*\d\s*[.\-\s]*\d\s*[.\-\s]*\d?/gi,
        /(?:không|ko)\s*(?:chín|chin)\s*(?:tám|tam|bảy|bay|sáu|sau|năm|nam)/gi,
        /\b\d{3,4}[\s.]+\d{3}[\s.]+\d{3,4}\b/g,
      ],
      recommendedAction: ModerationAction.REJECT_MESSAGE,
      explanation: "Phone number detected",
      matchOnce: true,
    },

    // ── Off-platform contact: Email ──
    {
      ruleId: "PII_EMAIL",
      label: RuleLabel.PII_LEAK,
      severity: RuleSeverity.HIGH,
      riskDelta: 35,
      patterns: [
        /[a-zA-Z0-9._%+\-]+\s*[@＠at]\s*[a-zA-Z0-9.\-]+\s*[.]\s*[a-zA-Z]{2,}/gi,
      ],
      recommendedAction: ModerationAction.REJECT_MESSAGE,
      explanation: "Email address detected",
    },

    // ── Off-platform contact: Social handles ──
    {
      ruleId: "SOCIAL_ZALO",
      label: RuleLabel.OFF_PLATFORM_CONTACT,
      severity: RuleSeverity.HIGH,
      riskDelta: 35,
      patterns: [/(?:zalo|z[.@]lo|za\.lo)\s*[:\-]?\s*\S+/gi],
      recommendedAction: ModerationAction.REJECT_MESSAGE,
      explanation: "Zalo contact sharing detected",
    },
    {
      ruleId: "SOCIAL_TELEGRAM",
      label: RuleLabel.OFF_PLATFORM_CONTACT,
      severity: RuleSeverity.HIGH,
      riskDelta: 35,
      patterns: [/(?:telegram|tele|t\.me)\s*[:\-]?\s*\S+/gi],
      recommendedAction: ModerationAction.REJECT_MESSAGE,
      explanation: "Telegram contact sharing detected",
    },
    {
      ruleId: "SOCIAL_FACEBOOK",
      label: RuleLabel.OFF_PLATFORM_CONTACT,
      severity: RuleSeverity.MEDIUM,
      riskDelta: 30,
      patterns: [/(?:facebook|fb|face)\s*[:\-]?\s*\S+/gi],
      recommendedAction: ModerationAction.QUEUE_HUMAN_REVIEW,
      explanation: "Facebook contact sharing detected",
    },
    {
      ruleId: "SOCIAL_OTHER",
      label: RuleLabel.OFF_PLATFORM_CONTACT,
      severity: RuleSeverity.MEDIUM,
      riskDelta: 30,
      patterns: [/(?:whatsapp|viber|messenger|wechat|line)\s*[:\-]?\s*\S+/gi],
      recommendedAction: ModerationAction.QUEUE_HUMAN_REVIEW,
      explanation: "Messaging app contact sharing detected",
    },

    // ── Off-platform transaction intent ──
    {
      ruleId: "OFF_PLATFORM_TRANSACTION",
      label: RuleLabel.OFF_PLATFORM_CONTACT,
      severity: RuleSeverity.HIGH,
      riskDelta: 45,
      patterns: [
        /(?:giao\s*dịch|thanh\s*toán|chuyển\s*(?:khoản|tiền)|mua\s*bán)\s*(?:ngoài|riêng|bên\s*ngoài)/gi,
        /(?:liên\s*hệ|liên\s*lạc|inbox|ib|nhắn\s*tin)\s*(?:riêng|trực\s*tiếp|ngoài)/gi,
        /(?:gửi|cho|nhắn|add)\s*(?:số|sdt|sđt|phone|điện\s*thoại)/gi,
      ],
      recommendedAction: ModerationAction.REJECT_MESSAGE,
      explanation: "Off-platform transaction intent detected",
      matchOnce: true,
    },

    // ── Payment bypass ──
    {
      ruleId: "PAYMENT_BYPASS",
      label: RuleLabel.PAYMENT_BYPASS,
      severity: RuleSeverity.CRITICAL,
      riskDelta: 55,
      patterns: [
        /(?:trả|thanh\s*toán|chuyển)\s*(?:tiền\s*mặt|cash|ngoài\s*app|ngoài\s*hệ\s*thống)/gi,
        /(?:không\s*(?:cần|qua)|bỏ\s*qua|skip)\s*(?:app|hệ\s*thống|platform|nền\s*tảng)/gi,
        /(?:giá\s*(?:ngoài|riêng|khác)|deal\s*riêng|thỏa\s*thuận\s*riêng)/gi,
      ],
      recommendedAction: ModerationAction.REJECT_MESSAGE,
      explanation: "Payment bypass attempt detected",
      matchOnce: true,
    },

    // ── Scam / fraud indicators ──
    {
      ruleId: "SCAM_URGENCY",
      label: RuleLabel.SCAM_FRAUD,
      severity: RuleSeverity.HIGH,
      riskDelta: 40,
      patterns: [
        /(?:gấp|khẩn\s*cấp|ngay\s*bây\s*giờ|lập\s*tức).*(?:chuyển\s*tiền|thanh\s*toán|đặt\s*cọc)/gi,
        /(?:cơ\s*hội\s*cuối|chỉ\s*(?:hôm\s*nay|còn\s*\d)|giá\s*đặc\s*biệt).*(?:nhanh|gấp)/gi,
      ],
      recommendedAction: ModerationAction.QUEUE_HUMAN_REVIEW,
      explanation: "Urgency-based scam pattern detected",
      matchOnce: true,
    },
    {
      ruleId: "SCAM_IMPERSONATION",
      label: RuleLabel.SCAM_FRAUD,
      severity: RuleSeverity.CRITICAL,
      riskDelta: 50,
      patterns: [
        /(?:tôi\s*là|mình\s*là)\s*(?:admin|quản\s*trị|nhân\s*viên|support|hỗ\s*trợ).*(?:cần|phải|yêu\s*cầu)/gi,
        /(?:hệ\s*thống|app|admin)\s*(?:yêu\s*cầu|cần|bắt\s*buộc)\s*.*(?:xác\s*nhận|gửi|chuyển)/gi,
      ],
      recommendedAction: ModerationAction.REJECT_MESSAGE,
      explanation: "Impersonation / social engineering detected",
      matchOnce: true,
    },

    // ── Abuse / toxic / harassment ──
    {
      ruleId: "ABUSE_PROFANITY",
      label: RuleLabel.ABUSE_TOXIC,
      severity: RuleSeverity.MEDIUM,
      riskDelta: 25,
      patterns: [
        /(?:đ[ụúù]?\s*m[ẹeèéê]|đ[éeè]o|đ[ịi]t|c[ặăạ]c|l[ồôo]n|đ[ĩi]|ngu|b[ốồ]\s*m[ẹeèé])/gi,
        /(?:chết\s*(?:đi|mẹ|tiệt)|giam|giết|chém|đánh\s*(?:chết|gãy))/gi,
      ],
      recommendedAction: ModerationAction.ASK_USER_EDIT,
      explanation: "Profanity / abusive language detected",
      matchOnce: true,
    },
    {
      ruleId: "ABUSE_THREAT",
      label: RuleLabel.ABUSE_TOXIC,
      severity: RuleSeverity.CRITICAL,
      riskDelta: 60,
      patterns: [
        /(?:đe\s*dọa|dọa|uy\s*hiếp|sẽ\s*(?:giết|đánh|hại|trả\s*thù))/gi,
        /(?:biết\s*nhà|tìm\s*đến|biết\s*(?:ở\s*đâu|chỗ\s*nào))/gi,
      ],
      recommendedAction: ModerationAction.REJECT_MESSAGE,
      explanation: "Threatening language detected",
      matchOnce: true,
    },

    // ── Spam / flood indicators ──
    {
      ruleId: "SPAM_REPETITION",
      label: RuleLabel.SPAM_FLOOD,
      severity: RuleSeverity.LOW,
      riskDelta: 15,
      patterns: [
        /(.{3,})\1{3,}/gi, // same text repeated 4+ times
      ],
      recommendedAction: ModerationAction.ASK_USER_EDIT,
      explanation: "Repetitive content detected (possible spam)",
    },
    {
      ruleId: "SPAM_CAPS_FLOOD",
      label: RuleLabel.SPAM_FLOOD,
      severity: RuleSeverity.LOW,
      riskDelta: 10,
      patterns: [
        /[A-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ\s]{30,}/g,
      ],
      recommendedAction: ModerationAction.NONE,
      explanation: "Excessive capital letters detected",
    },

    // ── External links ──
    {
      ruleId: "EXTERNAL_LINK",
      label: RuleLabel.EXTERNAL_LINK,
      severity: RuleSeverity.LOW,
      riskDelta: 15,
      patterns: [/https?:\/\/[^\s]+/gi],
      recommendedAction: ModerationAction.NONE,
      explanation: "External link detected",
    },
  ];

  getRuleCount(): number {
    return this.rules.length;
  }

  /**
   * Run all deterministic detectors against the message.
   */
  detect(request: ModerationRequest): RuleHit[] {
    const hits: RuleHit[] = [];
    const normalized = this.normalize(request.message);

    for (const rule of this.rules) {
      let matched = false;

      for (const pattern of rule.patterns) {
        // Reset regex lastIndex
        pattern.lastIndex = 0;
        const match = normalized.match(pattern);

        if (match) {
          // For EXTERNAL_LINK, filter internal links
          if (rule.ruleId === "EXTERNAL_LINK") {
            const externalLinks = match.filter(
              (link) => !link.includes("baotienweb.cloud"),
            );
            if (externalLinks.length === 0) continue;

            hits.push({
              ruleId: rule.ruleId,
              label: rule.label,
              severity: rule.severity,
              riskDelta: rule.riskDelta,
              matchedEvidence: externalLinks[0],
              recommendedAction: rule.recommendedAction,
              explanation: rule.explanation,
            });
            matched = true;
          } else {
            hits.push({
              ruleId: rule.ruleId,
              label: rule.label,
              severity: rule.severity,
              riskDelta: rule.riskDelta,
              matchedEvidence: match[0].substring(0, 100),
              recommendedAction: rule.recommendedAction,
              explanation: rule.explanation,
            });
            matched = true;
          }

          if (rule.matchOnce || matched) break;
        }
      }
    }

    return hits;
  }

  /**
   * Detect spam/flood patterns using recentContext.
   */
  detectFlood(request: ModerationRequest): RuleHit[] {
    const hits: RuleHit[] = [];
    const context = request.recentContext ?? [];

    if (context.length < 3) return hits;

    // Check if sender sent too many messages in quick succession
    const senderMessages = context.filter((m) => m.role === "sender");
    if (senderMessages.length >= 5) {
      const lastFive = senderMessages.slice(-5);
      const uniqueContents = new Set(
        lastFive.map((m) => m.content.trim().toLowerCase()),
      );
      if (uniqueContents.size <= 2) {
        hits.push({
          ruleId: "FLOOD_REPEATED_MESSAGES",
          label: RuleLabel.SPAM_FLOOD,
          severity: RuleSeverity.MEDIUM,
          riskDelta: 25,
          matchedEvidence: `${senderMessages.length} similar messages in recent context`,
          recommendedAction: ModerationAction.ASK_USER_EDIT,
          explanation: "Repeated similar messages detected (flood pattern)",
        });
      }
    }

    return hits;
  }

  /**
   * Redact detected PII from message text.
   */
  redact(message: string, hits: RuleHit[]): string {
    let redacted = message;
    const redactableLabels: RuleLabel[] = [
      RuleLabel.PII_LEAK,
      RuleLabel.OFF_PLATFORM_CONTACT,
    ];

    for (const hit of hits) {
      if (redactableLabels.includes(hit.label) && hit.matchedEvidence) {
        redacted = redacted.replace(hit.matchedEvidence, "[***]");
      }
    }
    return redacted;
  }

  private normalize(text: string): string {
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
      .replace(/[._\-]{2,}/g, " ") // repeated separators
      .trim();
  }
}
