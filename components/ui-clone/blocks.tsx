import {
    AvatarCircle,
    BaseCard,
    Divider,
    EmptyQR,
    PriceText,
    SecondaryButton,
    SoftBadge,
    TabPill,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import {
    GalleryCard,
    LiveCardItem,
    PricingLine,
    ProductCardItem,
    TimelineNode,
    UtilityItem,
} from "@/data/uiCloneMock";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    Image,
    ImageBackground,
    ImageSourcePropType,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const t = uiCloneTheme;

function money(value?: number): string {
  if (!value && value !== 0) return "";
  return value.toLocaleString("vi-VN");
}

export function GalleryRow({
  images,
  extraLabel,
}: {
  images: ImageSourcePropType[];
  extraLabel?: string;
}) {
  return (
    <View style={styles.galleryRowWrap}>
      {images.map((img, idx) => (
        <ImageBackground
          key={`gal-${idx}`}
          source={img}
          style={styles.galleryThumb}
          imageStyle={styles.galleryThumbImage}
        >
          {idx === images.length - 1 && extraLabel ? (
            <View style={styles.galleryExtraOverlay}>
              <Text style={styles.galleryExtraLabel}>{extraLabel}</Text>
            </View>
          ) : null}
        </ImageBackground>
      ))}
    </View>
  );
}

export function PricingTable({
  rows,
  headers = ["Danh mục vật tư", "Đơn giá"],
  showQuantity = false,
  showAmount = false,
  totalLabel,
  totalValue,
}: {
  rows: PricingLine[];
  headers?: string[];
  showQuantity?: boolean;
  showAmount?: boolean;
  totalLabel?: string;
  totalValue?: string;
}) {
  const groupedRows = useMemo(() => {
    const groups = new Map<string, PricingLine[]>();
    rows.forEach((row) => {
      const key = row.group ?? "__default__";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(row);
    });
    return Array.from(groups.entries());
  }, [rows]);

  return (
    <BaseCard style={styles.tableCard} shadow="none">
      <View style={styles.tableHead}>
        <Text style={[styles.tableHeadText, { flex: 2.1 }]}>{headers[0]}</Text>
        {showQuantity ? (
          <Text
            style={[styles.tableHeadText, { flex: 0.8, textAlign: "right" }]}
          >
            SL
          </Text>
        ) : null}
        <Text style={[styles.tableHeadText, { flex: 1, textAlign: "right" }]}>
          {headers[1]}
        </Text>
        {showAmount ? (
          <Text
            style={[styles.tableHeadText, { flex: 1.2, textAlign: "right" }]}
          >
            Thành tiền
          </Text>
        ) : null}
      </View>

      {groupedRows.map(([groupName, groupRows], groupIndex) => (
        <View key={`${groupName}-${groupIndex}`}>
          {groupName !== "__default__" ? (
            <View style={styles.tableGroupRow}>
              <Text style={styles.tableGroupText}>{groupName}</Text>
            </View>
          ) : null}
          {groupRows.map((row, idx) => (
            <View
              key={row.id}
              style={[
                styles.tableRow,
                (idx + groupIndex) % 2 === 0 ? styles.tableRowAlt : null,
              ]}
            >
              <Text style={[styles.tableCell, { flex: 2.1 }]}>{row.name}</Text>
              {showQuantity ? (
                <Text
                  style={[styles.tableCell, { flex: 0.8, textAlign: "right" }]}
                >
                  {row.quantity ?? "-"}
                </Text>
              ) : null}
              <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                {money(row.unitPrice)}
              </Text>
              {showAmount ? (
                <Text
                  style={[
                    styles.tableCellStrong,
                    { flex: 1.2, textAlign: "right" },
                  ]}
                >
                  {money(row.amount ?? (row.quantity ?? 0) * row.unitPrice)}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ))}

      {totalLabel && totalValue ? (
        <View style={styles.tableTotalRow}>
          <Text style={styles.tableTotalLabel}>{totalLabel}</Text>
          <PriceText value={totalValue} size="sm" />
        </View>
      ) : null}
    </BaseCard>
  );
}

export function VerificationBlock({
  supplierName,
  supervisorName,
  supplierStatus = "Face ID Verified",
  supervisorStatus = "Ký xác nhận",
}: {
  supplierName: string;
  supervisorName: string;
  supplierStatus?: string;
  supervisorStatus?: string;
}) {
  return (
    <BaseCard>
      <View style={styles.verifyRoot}>
        <View style={styles.verifyColumn}>
          <Text style={styles.verifyHeading}>NHÀ CUNG CẤP</Text>
          <EmptyQR label={supplierStatus} dashed />
          <Text style={styles.verifyName}>{supplierName}</Text>
        </View>
        <View style={styles.verifyColumn}>
          <Text style={styles.verifyHeading}>KỸ SƯ GIÁM SÁT</Text>
          <EmptyQR label={supervisorStatus} dashed />
          <Text style={styles.verifyName}>{supervisorName}</Text>
        </View>
      </View>
    </BaseCard>
  );
}

export function TransportTimeline({
  nodes,
  activeBadge = "Hiện tại",
}: {
  nodes: TimelineNode[];
  activeBadge?: string;
}) {
  return (
    <BaseCard>
      {nodes.map((node, index) => (
        <View key={node.id} style={styles.timelineRow}>
          <View style={styles.timelineRail}>
            <View
              style={[
                styles.timelineDot,
                node.state === "done" ? styles.timelineDotDone : null,
                node.state === "active" ? styles.timelineDotActive : null,
              ]}
            />
            {index < nodes.length - 1 ? (
              <View style={styles.timelineLine} />
            ) : null}
          </View>

          <View style={styles.timelineBody}>
            <View style={styles.timelineTopRow}>
              <Text
                style={[
                  styles.timelineTitle,
                  node.state === "active" ? styles.timelineTitleActive : null,
                ]}
              >
                {node.title}
              </Text>
              {node.state === "active" ? (
                <SoftBadge label={activeBadge} tone="brand" />
              ) : null}
              <Text style={styles.timelineTime}>{node.time}</Text>
            </View>
            <Text style={styles.timelineSub}>{node.subtitle}</Text>
          </View>
        </View>
      ))}
    </BaseCard>
  );
}

export function StepProgress({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <View style={styles.stepRoot}>
      {steps.map((step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        return (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                done ? styles.stepCircleDone : null,
                active ? styles.stepCircleActive : null,
              ]}
            >
              <Ionicons
                name={done ? "checkmark" : active ? "car-outline" : "ellipse"}
                size={done || active ? 12 : 8}
                color={
                  done || active ? t.colors.textOnBrand : t.colors.textTertiary
                }
              />
            </View>
            <Text
              style={[styles.stepLabel, active ? styles.stepLabelActive : null]}
            >
              {step}
            </Text>
            {index < steps.length - 1 ? (
              <View
                style={[styles.stepLine, done ? styles.stepLineDone : null]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function DeliveryDriverCard({
  avatar,
  driverName,
  plate,
  rating,
}: {
  avatar?: ImageSourcePropType;
  driverName: string;
  plate: string;
  rating: string;
}) {
  return (
    <BaseCard style={styles.driverCard}>
      <View style={styles.driverLeft}>
        <AvatarCircle source={avatar} size={54} />
        <View style={{ flex: 1 }}>
          <Text style={styles.driverName}>{driverName}</Text>
          <View style={styles.driverMetaRow}>
            <Text style={styles.driverPlate}>{plate}</Text>
            <Text style={styles.driverRating}>{rating} ★</Text>
          </View>
        </View>
      </View>
      <View style={styles.driverActions}>
        <SecondaryButton
          label=""
          leftIcon="chatbox-ellipses-outline"
          style={styles.driverIconBtn}
        />
        <Pressable style={styles.driverCallBtn}>
          <Ionicons
            name="call-outline"
            size={18}
            color={t.colors.textOnBrand}
          />
        </Pressable>
      </View>
    </BaseCard>
  );
}

export function MapHeroCard({
  mapImage,
  overlay,
}: {
  mapImage?: ImageSourcePropType;
  overlay?: React.ReactNode;
}) {
  return (
    <View style={styles.mapRoot}>
      {mapImage ? (
        <Image source={mapImage} style={styles.mapImage} />
      ) : (
        <View style={styles.mapFallback}>
          <View style={styles.mapRoad1} />
          <View style={styles.mapRoad2} />
          <View style={styles.mapRoad3} />
        </View>
      )}
      <View style={styles.mapRoute} />
      <View style={styles.mapTruckMarker}>
        <Ionicons name="car-sport" size={16} color={t.colors.textOnBrand} />
      </View>
      {overlay ? <View style={styles.mapOverlay}>{overlay}</View> : null}
    </View>
  );
}

export function StatsGrid({
  items,
}: {
  items: Array<{ key: string; icon?: string; label: string; value: string }>;
}) {
  return (
    <View style={styles.statsGrid}>
      {items.map((item) => (
        <BaseCard key={item.key} style={styles.statsItem} shadow="xs">
          <View style={styles.statsTop}>
            {item.icon ? (
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={t.colors.brandStrong}
              />
            ) : null}
            <Text style={styles.statsLabel}>{item.label}</Text>
          </View>
          <Text style={styles.statsValue}>{item.value}</Text>
        </BaseCard>
      ))}
    </View>
  );
}

export function RewardMilestone({
  items,
  reachedCount,
  headerText,
  helperText,
}: {
  items: Array<{
    key: string;
    label: string;
    reward: string;
    reached?: boolean;
  }>;
  reachedCount: number;
  headerText: string;
  helperText?: string;
}) {
  return (
    <BaseCard>
      <Text style={styles.rewardHeader}>{headerText}</Text>
      {helperText ? (
        <Text style={styles.rewardHelper}>{helperText}</Text>
      ) : null}
      <View style={styles.milestoneTrack}>
        {items.map((item, index) => {
          const reached = item.reached ?? index < reachedCount;
          return (
            <View key={item.key} style={styles.milestoneNodeWrap}>
              <View
                style={[
                  styles.milestoneNode,
                  reached ? styles.milestoneNodeReached : null,
                ]}
              >
                <Ionicons
                  name={reached ? "checkmark" : "ellipse-outline"}
                  size={12}
                  color={reached ? t.colors.textOnBrand : t.colors.textTertiary}
                />
              </View>
              <Text style={styles.milestoneLabel}>{item.label}</Text>
              <Text style={styles.milestoneReward}>{item.reward}</Text>
              {index < items.length - 1 ? (
                <View
                  style={[
                    styles.milestoneLine,
                    reached ? styles.milestoneLineReached : null,
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </BaseCard>
  );
}

export function UtilityGrid({ items }: { items: UtilityItem[] }) {
  return (
    <View style={styles.utilityGrid}>
      {items.map((item) => (
        <BaseCard key={item.id} style={styles.utilityCard} shadow="xs">
          <View style={styles.utilityIconCircle}>
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={t.colors.brandStrong}
            />
          </View>
          <Text style={styles.utilityLabel}>{item.label}</Text>
        </BaseCard>
      ))}
    </View>
  );
}

export function ProductGrid({ items }: { items: ProductCardItem[] }) {
  return (
    <View style={styles.productGrid}>
      {items.map((item) => (
        <BaseCard key={item.id} style={styles.productCard} shadow="xs">
          <Image source={item.image} style={styles.productImage} />
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <PriceText value={item.price} size="sm" />
          <Text style={styles.productRating}>★ {item.rating}</Text>
        </BaseCard>
      ))}
    </View>
  );
}

export function LivePreviewRow({ items }: { items: LiveCardItem[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.liveScroll}
    >
      {items.map((item) => (
        <BaseCard key={item.id} style={styles.liveCard} shadow="sm">
          <ImageBackground
            source={item.image}
            style={styles.liveCover}
            imageStyle={styles.liveCoverImg}
          >
            <SoftBadge label={`👁 ${item.viewers}`} tone="neutral" />
          </ImageBackground>
          <Text style={styles.liveTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.livePlace}>{item.place}</Text>
        </BaseCard>
      ))}
    </ScrollView>
  );
}

export function ProjectGallery({ items }: { items: GalleryCard[] }) {
  return (
    <View style={styles.projectGrid}>
      {items.map((item) => (
        <BaseCard key={item.id} style={styles.projectCard} shadow="xs">
          <ImageBackground
            source={item.image}
            style={styles.projectImage}
            imageStyle={styles.projectImageStyle}
          >
            <View style={styles.projectOverlay}>
              <Text style={styles.projectTitle}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.projectSub}>{item.subtitle}</Text>
              ) : null}
            </View>
          </ImageBackground>
        </BaseCard>
      ))}
    </View>
  );
}

export type PayrollTableRow = {
  id: string;
  name: string;
  phone: string;
  salary: string;
  days: string[];
};

export function PayrollTableCard({
  title,
  subtitle,
  rows,
  paymentMethod,
  total,
}: {
  title: string;
  subtitle: string;
  rows: PayrollTableRow[];
  paymentMethod: string;
  total: string;
}) {
  return (
    <BaseCard>
      <Text style={styles.payrollTitle}>{title}</Text>
      <Text style={styles.payrollSub}>{subtitle}</Text>

      <View style={styles.payrollHead}>
        <Text style={[styles.payrollHeadText, { flex: 1.3 }]}>TÊN</Text>
        <Text style={[styles.payrollHeadText, { flex: 1.2 }]}>PHONE</Text>
        <Text style={[styles.payrollHeadText, { flex: 1, textAlign: "right" }]}>
          LƯƠNG
        </Text>
        <Text
          style={[styles.payrollHeadText, { flex: 1.4, textAlign: "right" }]}
        >
          NGÀY CÔNG
        </Text>
      </View>

      {rows.map((row) => (
        <View key={row.id} style={styles.payrollRow}>
          <Text style={[styles.payrollCell, { flex: 1.3 }]}>{row.name}</Text>
          <Text style={[styles.payrollCell, { flex: 1.2 }]}>{row.phone}</Text>
          <Text style={[styles.payrollCell, { flex: 1, textAlign: "right" }]}>
            {row.salary}
          </Text>
          <Text style={[styles.payrollCell, { flex: 1.4, textAlign: "right" }]}>
            {row.days.join(" ")}
          </Text>
        </View>
      ))}

      <Divider />
      <View style={styles.payrollFooter}>
        <View>
          <Text style={styles.payrollFooterLabel}>HÌNH THỨC THANH TOÁN</Text>
          <Text style={styles.payrollFooterValue}>{paymentMethod}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.payrollFooterLabel}>TỔNG CỘNG</Text>
          <PriceText value={total} size="md" />
        </View>
      </View>
    </BaseCard>
  );
}

export function RatingScoreTabs({
  tabs,
  activeId,
}: {
  tabs: Array<{ id: string; name: string; score: string }>;
  activeId: string;
}) {
  return (
    <View style={styles.ratingTabsRow}>
      {tabs.map((tab) => (
        <TabPill
          key={tab.id}
          label={tab.name}
          trailing={tab.score}
          active={tab.id === activeId}
        />
      ))}
    </View>
  );
}

export function RatingCriteriaBlock({
  criteria,
}: {
  criteria: Array<{ id: string; label: string; stars: number }>;
}) {
  return (
    <BaseCard>
      {criteria.map((item) => (
        <View key={item.id} style={styles.criteriaRow}>
          <Text style={styles.criteriaLabel}>{item.label}</Text>
          <Text style={styles.criteriaStars}>
            {"☆".repeat(5 - item.stars) + "★".repeat(item.stars)}
          </Text>
        </View>
      ))}
    </BaseCard>
  );
}

export function ProfileHeroCard({
  avatar,
  name,
  role,
  idLabel,
  extraBadge,
}: {
  avatar?: ImageSourcePropType;
  name: string;
  role: string;
  idLabel: string;
  extraBadge?: string;
}) {
  return (
    <BaseCard style={styles.profileHero}>
      <AvatarCircle source={avatar} size={90} />
      <Text style={styles.profileHeroName}>{name}</Text>
      <Text style={styles.profileHeroRole}>{role}</Text>
      <Text style={styles.profileHeroId}>{idLabel}</Text>
      {extraBadge ? <SoftBadge label={extraBadge} tone="brand" /> : null}
    </BaseCard>
  );
}

export function CertificateList({
  items,
}: {
  items: Array<{
    id: string;
    title: string;
    statusLabel: string;
    statusTone: string;
  }>;
}) {
  const toneColor = (tone: string) => {
    if (tone === "verified") return t.colors.success;
    if (tone === "upload") return t.colors.brandStrong;
    return t.colors.textSecondary;
  };

  return (
    <BaseCard>
      {items.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.certRow,
            index === items.length - 1 ? { borderBottomWidth: 0 } : null,
          ]}
        >
          <View style={styles.certLeft}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={t.colors.brandStrong}
            />
            <Text style={styles.certTitle}>{item.title}</Text>
          </View>
          <Text
            style={[styles.certStatus, { color: toneColor(item.statusTone) }]}
          >
            {item.statusLabel}
          </Text>
        </View>
      ))}
    </BaseCard>
  );
}

export function SalarySelector({
  options,
  selected,
}: {
  options: string[];
  selected: number;
}) {
  return (
    <View style={styles.salarySelectorRow}>
      {options.map((option, index) => (
        <View
          key={option}
          style={[
            styles.salaryOption,
            index === selected ? styles.salaryOptionActive : null,
          ]}
        >
          <Text
            style={[
              styles.salaryOptionText,
              index === selected ? styles.salaryOptionTextActive : null,
            ]}
          >
            {option}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  galleryRowWrap: {
    flexDirection: "row",
    gap: t.spacing.s4,
  },
  galleryThumb: {
    flex: 1,
    height: 112,
    borderRadius: t.radius.r5,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  galleryThumbImage: {
    borderRadius: t.radius.r5,
  },
  galleryExtraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: t.colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryExtraLabel: {
    ...t.typography.titleMd,
    color: t.colors.textOnDark,
  },
  tableCard: {
    overflow: "hidden",
    padding: 0,
  },
  tableHead: {
    flexDirection: "row",
    paddingHorizontal: t.spacing.s6,
    paddingVertical: t.spacing.s5,
    backgroundColor: t.colors.bgSurfaceSoft,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  tableHeadText: {
    ...t.typography.label,
    color: t.colors.textSecondary,
  },
  tableGroupRow: {
    paddingHorizontal: t.spacing.s6,
    paddingVertical: t.spacing.s4,
    backgroundColor: t.colors.bgSurfaceTint,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  tableGroupText: {
    ...t.typography.label,
    color: t.colors.brandDark,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: t.spacing.s6,
    paddingVertical: t.spacing.s5,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  tableRowAlt: {
    backgroundColor: t.colors.bgSurface,
  },
  tableCell: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
  },
  tableCellStrong: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
    fontWeight: "800",
  },
  tableTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: t.spacing.s6,
    paddingVertical: t.spacing.s5,
    backgroundColor: t.colors.bgSurfaceTint,
  },
  tableTotalLabel: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },

  verifyRoot: {
    flexDirection: "row",
    gap: t.spacing.s6,
  },
  verifyColumn: {
    flex: 1,
    gap: t.spacing.s4,
  },
  verifyHeading: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    fontWeight: "700",
    textAlign: "center",
  },
  verifyName: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
    textAlign: "center",
    fontWeight: "700",
  },

  timelineRow: {
    flexDirection: "row",
    gap: t.spacing.s5,
    minHeight: 78,
  },
  timelineRail: {
    width: 18,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 8,
    backgroundColor: t.colors.borderMuted,
    marginTop: 5,
  },
  timelineDotDone: {
    backgroundColor: t.colors.brandStrong,
  },
  timelineDotActive: {
    width: 14,
    height: 14,
    backgroundColor: t.colors.brandStrong,
    borderWidth: 3,
    borderColor: t.colors.brandSoft,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 3,
    backgroundColor: t.colors.borderSoft,
  },
  timelineBody: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
    paddingBottom: t.spacing.s4,
    marginBottom: t.spacing.s2,
  },
  timelineTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s4,
  },
  timelineTitle: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    flex: 1,
  },
  timelineTitleActive: {
    color: t.colors.brandStrong,
  },
  timelineTime: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    fontWeight: "700",
  },
  timelineSub: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    marginTop: 2,
  },

  stepRoot: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: t.spacing.s2,
    paddingBottom: t.spacing.s4,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepCircle: {
    width: 27,
    height: 27,
    borderRadius: t.radius.rPill,
    borderWidth: 1,
    borderColor: t.colors.borderMuted,
    backgroundColor: t.colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepCircleDone: {
    borderColor: t.colors.brandStrong,
    backgroundColor: t.colors.brandStrong,
  },
  stepCircleActive: {
    borderColor: t.colors.brandStrong,
    backgroundColor: t.colors.brand,
  },
  stepLabel: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    marginTop: t.spacing.s3,
    textAlign: "center",
  },
  stepLabelActive: {
    color: t.colors.brandStrong,
    fontWeight: "700",
  },
  stepLine: {
    position: "absolute",
    top: 13,
    left: "56%",
    right: "-44%",
    height: 2,
    backgroundColor: t.colors.borderMuted,
    zIndex: 1,
  },
  stepLineDone: {
    backgroundColor: t.colors.brand,
  },

  driverCard: {
    paddingVertical: t.spacing.s5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.spacing.s4,
  },
  driverLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s4,
    flex: 1,
  },
  driverName: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },
  driverMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s4,
    marginTop: 3,
  },
  driverPlate: {
    ...t.typography.bodyLg,
    color: t.colors.textSecondary,
  },
  driverRating: {
    ...t.typography.bodyLg,
    color: t.colors.warning,
    fontWeight: "700",
  },
  driverActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s3,
  },
  driverIconBtn: {
    minWidth: 40,
    minHeight: 40,
    paddingHorizontal: 0,
    borderRadius: t.radius.rPill,
  },
  driverCallBtn: {
    width: 40,
    height: 40,
    borderRadius: t.radius.rPill,
    backgroundColor: t.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },

  mapRoot: {
    height: 360,
    borderRadius: t.radius.r8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.borderSoft,
    backgroundColor: t.colors.bgMap,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: t.colors.bgMap,
  },
  mapRoad1: {
    position: "absolute",
    left: -40,
    right: -40,
    top: 95,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
    transform: [{ rotate: "18deg" }],
  },
  mapRoad2: {
    position: "absolute",
    left: -30,
    right: -20,
    top: 175,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.65)",
    transform: [{ rotate: "-14deg" }],
  },
  mapRoad3: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 245,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  mapRoute: {
    position: "absolute",
    left: "16%",
    top: "18%",
    width: "62%",
    height: "49%",
    borderWidth: 4,
    borderColor: t.colors.brandStrong,
    borderRadius: 120,
    borderStyle: "solid",
    opacity: 0.82,
  },
  mapTruckMarker: {
    position: "absolute",
    left: "49%",
    top: "37%",
    width: 30,
    height: 30,
    borderRadius: t.radius.rPill,
    backgroundColor: t.colors.brandStrong,
    alignItems: "center",
    justifyContent: "center",
    ...t.shadows.sm,
  },
  mapOverlay: {
    position: "absolute",
    left: t.spacing.s6,
    right: t.spacing.s6,
    bottom: t.spacing.s6,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.s4,
  },
  statsItem: {
    width: "48.7%",
    minHeight: 90,
  },
  statsTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s2,
  },
  statsLabel: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
  },
  statsValue: {
    ...t.typography.titleMd,
    color: t.colors.textPrimary,
    marginTop: t.spacing.s3,
  },

  rewardHeader: {
    ...t.typography.titleMd,
    color: t.colors.textPrimary,
  },
  rewardHelper: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    marginTop: t.spacing.s2,
  },
  milestoneTrack: {
    marginTop: t.spacing.s6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  milestoneNodeWrap: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  milestoneNode: {
    width: 28,
    height: 28,
    borderRadius: t.radius.rPill,
    borderWidth: 2,
    borderColor: t.colors.borderMuted,
    backgroundColor: t.colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  milestoneNodeReached: {
    borderColor: t.colors.brandStrong,
    backgroundColor: t.colors.brand,
  },
  milestoneLabel: {
    ...t.typography.bodySm,
    color: t.colors.textPrimary,
    marginTop: t.spacing.s3,
    textAlign: "center",
  },
  milestoneReward: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  milestoneLine: {
    position: "absolute",
    top: 13,
    left: "58%",
    right: "-42%",
    height: 2,
    backgroundColor: t.colors.borderMuted,
    zIndex: 1,
  },
  milestoneLineReached: {
    backgroundColor: t.colors.brandStrong,
  },

  utilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.s4,
  },
  utilityCard: {
    width: "22.8%",
    minHeight: 84,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: t.spacing.s2,
  },
  utilityIconCircle: {
    width: 34,
    height: 34,
    borderRadius: t.radius.rPill,
    backgroundColor: t.colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  utilityLabel: {
    ...t.typography.caption,
    color: t.colors.textPrimary,
    textAlign: "center",
    marginTop: t.spacing.s3,
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.s4,
  },
  productCard: {
    width: "48.8%",
    padding: t.spacing.s4,
  },
  productImage: {
    width: "100%",
    height: 112,
    borderRadius: t.radius.r5,
    marginBottom: t.spacing.s4,
  },
  productTitle: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
    minHeight: 40,
    fontWeight: "700",
  },
  productRating: {
    ...t.typography.bodySm,
    color: t.colors.warning,
    marginTop: 3,
  },

  liveScroll: {
    gap: t.spacing.s4,
    paddingRight: t.spacing.s3,
  },
  liveCard: {
    width: 130,
    padding: t.spacing.s3,
  },
  liveCover: {
    height: 155,
    borderRadius: t.radius.r5,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: t.spacing.s3,
  },
  liveCoverImg: {
    borderRadius: t.radius.r5,
  },
  liveTitle: {
    ...t.typography.bodySm,
    color: t.colors.textPrimary,
    fontWeight: "700",
    marginTop: t.spacing.s3,
  },
  livePlace: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: 2,
  },

  projectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.s4,
  },
  projectCard: {
    width: "48.8%",
    padding: t.spacing.s3,
  },
  projectImage: {
    width: "100%",
    height: 112,
    borderRadius: t.radius.r5,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  projectImageStyle: {
    borderRadius: t.radius.r5,
  },
  projectOverlay: {
    padding: t.spacing.s3,
    backgroundColor: "rgba(16, 24, 40, 0.42)",
  },
  projectTitle: {
    ...t.typography.bodyMd,
    color: t.colors.textOnDark,
    fontWeight: "700",
  },
  projectSub: {
    ...t.typography.caption,
    color: t.colors.textOnDark,
    marginTop: 1,
  },

  payrollTitle: {
    ...t.typography.titleMd,
    color: t.colors.textPrimary,
  },
  payrollSub: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    marginTop: 2,
    marginBottom: t.spacing.s4,
  },
  payrollHead: {
    flexDirection: "row",
    paddingVertical: t.spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  payrollHeadText: {
    ...t.typography.caption,
    color: t.colors.textTertiary,
    fontWeight: "700",
  },
  payrollRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: t.spacing.s5,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  payrollCell: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
  },
  payrollFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  payrollFooterLabel: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    fontWeight: "700",
  },
  payrollFooterValue: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    marginTop: 2,
  },

  ratingTabsRow: {
    flexDirection: "row",
    gap: t.spacing.s3,
    flexWrap: "wrap",
  },
  criteriaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: t.spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  criteriaLabel: {
    ...t.typography.bodyLg,
    color: t.colors.textPrimary,
  },
  criteriaStars: {
    ...t.typography.titleSm,
    color: t.colors.brandStrong,
    letterSpacing: 2,
  },

  profileHero: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileHeroName: {
    ...t.typography.titleMd,
    color: t.colors.textPrimary,
    marginTop: t.spacing.s5,
  },
  profileHeroRole: {
    ...t.typography.bodyLg,
    color: t.colors.brandStrong,
    marginTop: 2,
    fontWeight: "700",
  },
  profileHeroId: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    marginTop: 3,
    marginBottom: t.spacing.s4,
  },

  certRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: t.spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  certLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s3,
    flex: 1,
  },
  certTitle: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
  },
  certStatus: {
    ...t.typography.bodySm,
    fontWeight: "700",
  },

  salarySelectorRow: {
    flexDirection: "row",
    gap: t.spacing.s4,
  },
  salaryOption: {
    flex: 1,
    minHeight: t.dimensions.buttonHeightMd,
    borderRadius: t.radius.r4,
    borderWidth: 1,
    borderColor: t.colors.borderMuted,
    backgroundColor: t.colors.bgSurfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  salaryOptionActive: {
    borderColor: t.colors.brandStrong,
    backgroundColor: t.colors.brand,
  },
  salaryOptionText: {
    ...t.typography.label,
    color: t.colors.textSecondary,
  },
  salaryOptionTextActive: {
    color: t.colors.textOnBrand,
  },
});
