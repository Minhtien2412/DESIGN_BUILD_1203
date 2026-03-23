/**
 * AI Sales Chat — Rich Message Renderers
 * Compact, mobile-first card/carousel/quickReply components.
 * Sits inside the existing chat bubble flow.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type {
    ChatMessage,
    CostSummaryData,
    CTAAction,
    FloorPlanData,
    MessageBlock,
    ProductCardData,
    QuickReplyOption,
    SummaryCardData,
    WorkerCardData,
} from "./types";

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const C = {
  bg: "#1a1a2e",
  surface: "#2a2a4e",
  card: "#232345",
  cardBorder: "rgba(139,92,246,0.25)",
  text: "#e0e0e0",
  textMuted: "#999",
  accent: "#8B5CF6",
  accentSoft: "rgba(139,92,246,0.15)",
  green: "#10B981",
  orange: "#F59E0B",
  red: "#EF4444",
  white: "#fff",
};

// ═══════════════════════════════════════════════════════════════
// FORMAT HELPERS
// ═══════════════════════════════════════════════════════════════

function formatPrice(price: number): string {
  if (price >= 1_000_000)
    return `${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}K`;
  return `${price}đ`;
}

function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    const ty = amount / 1_000_000_000;
    return `${ty % 1 === 0 ? ty : ty.toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    const tr = amount / 1_000_000;
    return `${tr % 1 === 0 ? tr : tr.toFixed(1)} triệu`;
  }
  return amount.toLocaleString("vi-VN") + "đ";
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT CARD
// ═══════════════════════════════════════════════════════════════

const ProductCard: React.FC<{
  product: ProductCardData;
  compact?: boolean;
  onPress?: (id: string) => void;
}> = ({ product, compact, onPress }) => (
  <TouchableOpacity
    style={[s.productCard, compact && s.productCardCompact]}
    activeOpacity={0.8}
    onPress={() => onPress?.(product.id)}
  >
    {product.imageUri ? (
      <Image source={{ uri: product.imageUri }} style={s.productImage} />
    ) : (
      <View style={[s.productImage, s.productImagePlaceholder]}>
        <Ionicons name="cube-outline" size={28} color={C.textMuted} />
      </View>
    )}
    <View style={s.productInfo}>
      {product.badge && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{product.badge}</Text>
        </View>
      )}
      <Text style={s.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={s.priceRow}>
        <Text style={s.price}>{formatVND(product.price)}</Text>
        {product.originalPrice && product.originalPrice > product.price && (
          <Text style={s.oldPrice}>{formatPrice(product.originalPrice)}</Text>
        )}
      </View>
      {product.rating != null && (
        <View style={s.ratingRow}>
          <Ionicons name="star" size={12} color={C.orange} />
          <Text style={s.ratingText}>{product.rating.toFixed(1)}</Text>
          {product.reviewCount != null && (
            <Text style={s.reviewCount}>({product.reviewCount})</Text>
          )}
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// ═══════════════════════════════════════════════════════════════
// PRODUCT CAROUSEL
// ═══════════════════════════════════════════════════════════════

const ProductCarousel: React.FC<{
  products: ProductCardData[];
  onPress?: (id: string) => void;
}> = ({ products, onPress }) => (
  <FlatList
    data={products}
    keyExtractor={(item) => item.id}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={s.carouselContent}
    renderItem={({ item }) => (
      <ProductCard product={item} compact onPress={onPress} />
    )}
  />
);

// ═══════════════════════════════════════════════════════════════
// WORKER CARD
// ═══════════════════════════════════════════════════════════════

const WorkerCard: React.FC<{
  worker: WorkerCardData;
  onPress?: (id: string) => void;
}> = ({ worker, onPress }) => (
  <TouchableOpacity
    style={s.workerCard}
    activeOpacity={0.8}
    onPress={() => onPress?.(worker.id)}
  >
    <View style={s.workerHeader}>
      {worker.avatarUri ? (
        <Image source={{ uri: worker.avatarUri }} style={s.workerAvatar} />
      ) : (
        <View style={[s.workerAvatar, s.workerAvatarPlaceholder]}>
          <Ionicons name="person" size={20} color={C.textMuted} />
        </View>
      )}
      <View style={s.workerHeaderInfo}>
        <View style={s.workerNameRow}>
          <Text style={s.workerName}>{worker.name}</Text>
          {worker.verified && (
            <Ionicons name="checkmark-circle" size={14} color={C.green} />
          )}
          {worker.online && <View style={s.onlineDot} />}
        </View>
        <Text style={s.workerSpecialty}>{worker.specialty}</Text>
      </View>
    </View>
    <View style={s.workerStats}>
      <View style={s.statItem}>
        <Ionicons name="star" size={12} color={C.orange} />
        <Text style={s.statText}>
          {worker.rating.toFixed(1)}
          {worker.reviewCount != null && ` (${worker.reviewCount})`}
        </Text>
      </View>
      <View style={s.statItem}>
        <Ionicons name="briefcase-outline" size={12} color={C.textMuted} />
        <Text style={s.statText}>{worker.completedJobs} việc</Text>
      </View>
      {worker.yearsExperience != null && worker.yearsExperience > 0 && (
        <View style={s.statItem}>
          <Ionicons name="time-outline" size={12} color={C.textMuted} />
          <Text style={s.statText}>{worker.yearsExperience} năm</Text>
        </View>
      )}
      <View style={s.statItem}>
        <Ionicons name="cash-outline" size={12} color={C.textMuted} />
        <Text style={s.statText}>{formatPrice(worker.pricePerHour)}/ngày</Text>
      </View>
      {worker.distance && (
        <View style={s.statItem}>
          <Ionicons name="location-outline" size={12} color={C.textMuted} />
          <Text style={s.statText}>{worker.distance}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// ═══════════════════════════════════════════════════════════════
// WORKER LIST
// ═══════════════════════════════════════════════════════════════

const WorkerList: React.FC<{
  workers: WorkerCardData[];
  onPress?: (id: string) => void;
}> = ({ workers, onPress }) => (
  <View style={s.workerList}>
    {workers.map((w) => (
      <WorkerCard key={w.id} worker={w} onPress={onPress} />
    ))}
  </View>
);

// ═══════════════════════════════════════════════════════════════
// QUICK REPLIES
// ═══════════════════════════════════════════════════════════════

const QuickReplies: React.FC<{
  options: QuickReplyOption[];
  onSelect: (value: string) => void;
}> = ({ options, onSelect }) => (
  <View style={s.quickReplies}>
    {options.map((opt, i) => (
      <TouchableOpacity
        key={`${opt.value}-${i}`}
        style={s.quickReplyChip}
        onPress={() => onSelect(opt.value)}
        activeOpacity={0.7}
      >
        <Text style={s.quickReplyText}>{opt.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ═══════════════════════════════════════════════════════════════
// ACTION CTA
// ═══════════════════════════════════════════════════════════════

const ActionCTA: React.FC<{
  cta: CTAAction;
  onPress: (cta: CTAAction) => void;
}> = ({ cta, onPress }) => (
  <TouchableOpacity
    style={s.ctaButton}
    onPress={() => onPress(cta)}
    activeOpacity={0.8}
  >
    <Text style={s.ctaText}>{cta.label}</Text>
    <Ionicons name="arrow-forward" size={16} color={C.white} />
  </TouchableOpacity>
);

// ═══════════════════════════════════════════════════════════════
// SYSTEM STATUS
// ═══════════════════════════════════════════════════════════════

const statusIcons: Record<string, { icon: string; color: string }> = {
  info: { icon: "information-circle", color: "#3B82F6" },
  success: { icon: "checkmark-circle", color: C.green },
  warning: { icon: "warning", color: C.orange },
  error: { icon: "close-circle", color: C.red },
  loading: { icon: "hourglass", color: C.accent },
};

const SystemStatus: React.FC<{ statusType: string; message: string }> = ({
  statusType,
  message,
}) => {
  const cfg = statusIcons[statusType] ?? statusIcons.info;
  return (
    <View style={[s.statusBox, { borderLeftColor: cfg.color }]}>
      <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
      <Text style={s.statusText}>{message}</Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// SUMMARY CARD — displays collected requirements
// ═══════════════════════════════════════════════════════════════

const SummaryCard: React.FC<{ data: SummaryCardData }> = ({ data }) => (
  <View style={s.summaryCard}>
    <Text style={s.summaryTitle}>{data.title}</Text>
    {data.items.map((item, i) => (
      <View key={`${item.label}-${i}`} style={s.summaryRow}>
        {item.icon && (
          <Ionicons
            name={item.icon as any}
            size={16}
            color={C.accent}
            style={s.summaryIcon}
          />
        )}
        <Text style={s.summaryLabel}>{item.label}</Text>
        <Text style={s.summaryValue}>{item.value}</Text>
      </View>
    ))}
  </View>
);

// ═══════════════════════════════════════════════════════════════
// FLOOR PLAN SUMMARY — floor-by-floor room layout
// ═══════════════════════════════════════════════════════════════

const FloorPlanSummary: React.FC<{ data: FloorPlanData }> = ({ data }) => (
  <View style={s.floorPlanCard}>
    <Text style={s.floorPlanTitle}>🏠 Sơ đồ bố trí sơ bộ</Text>
    <View style={s.floorPlanMeta}>
      <Text style={s.floorPlanMetaText}>
        Tổng DT sàn: {data.totalArea}m² · Mật độ xây dựng: {data.landCoverage}%
      </Text>
    </View>
    {data.floors.map((floor) => (
      <View key={floor.level} style={s.floorSection}>
        <Text style={s.floorLabel}>
          {floor.label} ({floor.totalArea}m²)
        </Text>
        <View style={s.roomGrid}>
          {floor.rooms.map((room, ri) => (
            <View key={`${floor.level}-${ri}`} style={s.roomChip}>
              <Text style={s.roomIcon}>{room.icon ?? "📦"}</Text>
              <Text style={s.roomName}>{room.name}</Text>
              <Text style={s.roomArea}>{room.area}m²</Text>
            </View>
          ))}
        </View>
      </View>
    ))}
  </View>
);

// ═══════════════════════════════════════════════════════════════
// COST SUMMARY — breakdown table with budget fit indicator
// ═══════════════════════════════════════════════════════════════

const CostSummary: React.FC<{ data: CostSummaryData }> = ({ data }) => {
  const fitColor =
    data.budgetFit === "over"
      ? C.red
      : data.budgetFit === "under"
        ? C.green
        : C.accent;
  const fitLabel =
    data.budgetFit === "over"
      ? "⚠️ Vượt ngân sách"
      : data.budgetFit === "under"
        ? "✅ Trong ngân sách"
        : "👍 Phù hợp ngân sách";

  return (
    <View style={s.costCard}>
      <Text style={s.costTitle}>💰 Dự toán chi phí sơ bộ</Text>
      <Text style={s.costPricePerM2}>
        Đơn giá: {formatVND(data.pricePerM2)}/m²
      </Text>
      {data.items.map((item, i) => (
        <View key={`cost-${i}`} style={s.costRow}>
          <Text style={s.costLabel}>{item.label}</Text>
          <View style={s.costAmountCol}>
            <Text style={s.costAmount}>{formatVND(item.amount)}</Text>
            {item.note && <Text style={s.costNote}>{item.note}</Text>}
          </View>
        </View>
      ))}
      <View style={s.costTotalRow}>
        <Text style={s.costTotalLabel}>TỔNG CỘNG</Text>
        <Text style={s.costTotalAmount}>{formatVND(data.total)}</Text>
      </View>
      <View style={[s.budgetFitBadge, { borderColor: fitColor }]}>
        <Text style={[s.budgetFitText, { color: fitColor }]}>{fitLabel}</Text>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// BLOCK RENDERER — renders a single MessageBlock
// ═══════════════════════════════════════════════════════════════

export const RenderBlock: React.FC<{
  block: MessageBlock;
  onQuickReply?: (value: string) => void;
  onProductPress?: (id: string) => void;
  onWorkerPress?: (id: string) => void;
  onCTAPress?: (cta: CTAAction) => void;
}> = ({ block, onQuickReply, onProductPress, onWorkerPress, onCTAPress }) => {
  switch (block.type) {
    case "text":
      return <Text style={s.blockText}>{block.text}</Text>;

    case "image":
      return block.imageUri ? (
        <Image
          source={{ uri: block.imageUri }}
          style={s.imageBlock}
          accessibilityLabel={block.imageAlt ?? "Hình ảnh"}
        />
      ) : null;

    case "product_card":
      return block.product ? (
        <ProductCard product={block.product} onPress={onProductPress} />
      ) : null;

    case "product_carousel":
      return block.products && block.products.length > 0 ? (
        <ProductCarousel products={block.products} onPress={onProductPress} />
      ) : null;

    case "worker_card":
      return block.worker ? (
        <WorkerCard worker={block.worker} onPress={onWorkerPress} />
      ) : null;

    case "worker_list":
      return block.workers && block.workers.length > 0 ? (
        <WorkerList workers={block.workers} onPress={onWorkerPress} />
      ) : null;

    case "quick_replies":
      return block.quickReplies && onQuickReply ? (
        <QuickReplies options={block.quickReplies} onSelect={onQuickReply} />
      ) : null;

    case "action_cta":
      return block.cta && onCTAPress ? (
        <ActionCTA cta={block.cta} onPress={onCTAPress} />
      ) : null;

    case "system_status":
      return block.statusMessage ? (
        <SystemStatus
          statusType={block.statusType ?? "info"}
          message={block.statusMessage}
        />
      ) : null;

    case "summary_card":
      return block.summary ? <SummaryCard data={block.summary} /> : null;

    case "floor_plan_summary":
      return block.floorPlan ? (
        <FloorPlanSummary data={block.floorPlan} />
      ) : null;

    case "cost_summary":
      return block.costSummary ? (
        <CostSummary data={block.costSummary} />
      ) : null;

    default:
      return null;
  }
};

// ═══════════════════════════════════════════════════════════════
// FULL MESSAGE RENDERER
// ═══════════════════════════════════════════════════════════════

export const RichMessageBubble: React.FC<{
  message: ChatMessage;
  onQuickReply?: (value: string) => void;
  onProductPress?: (id: string) => void;
  onWorkerPress?: (id: string) => void;
  onCTAPress?: (cta: CTAAction) => void;
  onRetry?: (messageId: string) => void;
}> = React.memo(
  ({
    message,
    onQuickReply,
    onProductPress,
    onWorkerPress,
    onCTAPress,
    onRetry,
  }) => {
    const isUser = message.role === "user";

    const formatTime = (d: Date) =>
      `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

    // User messages — plain bubble
    if (isUser) {
      return (
        <View style={[s.messageRow, s.messageRowUser]}>
          <View style={s.userBubble}>
            <Text style={s.userText}>{message.content}</Text>
            <Text style={s.timeUser}>{formatTime(message.timestamp)}</Text>
          </View>
        </View>
      );
    }

    // Typing indicator
    if (message.isTyping) {
      return (
        <View style={s.messageRow}>
          <View style={s.aiAvatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
          <View style={s.aiBubble}>
            <View style={s.typingDots}>
              <View style={[s.dot, s.dot1]} />
              <View style={[s.dot, s.dot2]} />
              <View style={[s.dot, s.dot3]} />
            </View>
          </View>
        </View>
      );
    }

    // Assistant messages with blocks
    const blocks = message.blocks;
    const hasBlocks = blocks && blocks.length > 0;

    return (
      <View style={s.messageRow}>
        <View style={s.aiAvatar}>
          <Text style={{ fontSize: 16 }}>🤖</Text>
        </View>
        <View style={s.assistantColumn}>
          {hasBlocks ? (
            blocks.map((block, idx) => (
              <RenderBlock
                key={`${message.id}-b${idx}`}
                block={block}
                onQuickReply={onQuickReply}
                onProductPress={onProductPress}
                onWorkerPress={onWorkerPress}
                onCTAPress={onCTAPress}
              />
            ))
          ) : (
            // Fallback to plain text
            <View style={s.aiBubble}>
              <Text style={s.aiText}>{message.content}</Text>
            </View>
          )}
          <View style={s.metaRow}>
            <Text style={s.timeAi}>{formatTime(message.timestamp)}</Text>
            {message.hasError && onRetry && (
              <TouchableOpacity
                onPress={() => onRetry(message.id)}
                style={s.retryBtn}
              >
                <Ionicons name="refresh" size={12} color={C.red} />
                <Text style={s.retryText}>Thử lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  // Message layout
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 2,
  },
  assistantColumn: {
    flex: 1,
    maxWidth: "85%",
    gap: 8,
  },
  userBubble: {
    backgroundColor: C.accent,
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: "80%",
  },
  userText: { color: C.white, fontSize: 15, lineHeight: 22 },
  timeUser: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    textAlign: "right",
  },
  aiBubble: {
    backgroundColor: C.surface,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  aiText: { color: C.text, fontSize: 15, lineHeight: 22 },
  timeAi: { fontSize: 10, color: C.textMuted },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  retryText: { color: C.red, fontSize: 11 },
  blockText: {
    color: C.text,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: C.surface,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    overflow: "hidden",
  },

  // Image
  imageBlock: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: C.card,
  },

  // Product card
  productCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
    width: "100%",
  },
  productCardCompact: {
    width: 160,
    marginRight: 10,
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: C.surface,
  },
  productImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 10,
    gap: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: C.red,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: C.white, fontSize: 10, fontWeight: "700" },
  productName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: { color: C.red, fontSize: 14, fontWeight: "700" },
  oldPrice: {
    color: C.textMuted,
    fontSize: 11,
    textDecorationLine: "line-through",
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { color: C.text, fontSize: 11 },
  reviewCount: { color: C.textMuted, fontSize: 11 },

  // Carousel
  carouselContent: { paddingRight: 8 },

  // Worker card
  workerCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 12,
    gap: 8,
  },
  workerHeader: { flexDirection: "row", gap: 10 },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
  },
  workerAvatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  workerHeaderInfo: { flex: 1, justifyContent: "center" },
  workerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  workerName: { color: C.text, fontSize: 14, fontWeight: "700" },
  workerSpecialty: { color: C.textMuted, fontSize: 12, marginTop: 1 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  workerStats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { color: C.textMuted, fontSize: 11 },
  workerList: { gap: 8 },

  // Quick replies
  quickReplies: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  quickReplyChip: {
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  quickReplyText: { color: C.accent, fontSize: 13, fontWeight: "500" },

  // CTA
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  ctaText: { color: C.white, fontSize: 15, fontWeight: "700" },

  // System status
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  statusText: { color: C.text, fontSize: 13, flex: 1 },

  // Typing
  typingDots: { flexDirection: "row", gap: 4, padding: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
    opacity: 0.5,
  },
  dot1: { opacity: 1 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 0.4 },

  // Summary card
  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    gap: 6,
  },
  summaryTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.cardBorder,
  },
  summaryIcon: { marginRight: 8 },
  summaryLabel: { color: C.textMuted, fontSize: 13, flex: 1 },
  summaryValue: { color: C.text, fontSize: 13, fontWeight: "600" },

  // Floor plan
  floorPlanCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    gap: 10,
  },
  floorPlanTitle: { color: C.text, fontSize: 15, fontWeight: "700" },
  floorPlanMeta: {
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 8,
  },
  floorPlanMetaText: {
    color: C.textMuted,
    fontSize: 12,
    textAlign: "center" as const,
  },
  floorSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.cardBorder,
    paddingTop: 8,
    gap: 6,
  },
  floorLabel: { color: C.accent, fontSize: 13, fontWeight: "700" },
  roomGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
  },
  roomChip: {
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center" as const,
    minWidth: 70,
  },
  roomIcon: { fontSize: 16 },
  roomName: { color: C.text, fontSize: 11, fontWeight: "600", marginTop: 2 },
  roomArea: { color: C.textMuted, fontSize: 10 },

  // Cost summary
  costCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    gap: 8,
  },
  costTitle: { color: C.text, fontSize: 15, fontWeight: "700" },
  costPricePerM2: { color: C.textMuted, fontSize: 12 },
  costRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    paddingVertical: 4,
  },
  costLabel: { color: C.text, fontSize: 13, flex: 1 },
  costAmountCol: { alignItems: "flex-end" as const },
  costAmount: { color: C.text, fontSize: 13, fontWeight: "600" },
  costNote: { color: C.textMuted, fontSize: 10 },
  costTotalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    borderTopWidth: 1,
    borderTopColor: C.accent,
    paddingTop: 8,
    marginTop: 4,
  },
  costTotalLabel: { color: C.text, fontSize: 14, fontWeight: "800" },
  costTotalAmount: { color: C.accent, fontSize: 16, fontWeight: "800" },
  budgetFitBadge: {
    alignSelf: "center" as const,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  budgetFitText: { fontSize: 13, fontWeight: "600" },
});
