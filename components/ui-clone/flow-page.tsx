import { StatsGrid } from "@/components/ui-clone/blocks";
import {
    AppHeader,
    BaseCard,
    BottomNav,
    InfoRow,
    PrimaryButton,
    ScreenContainer,
    ScreenScroll,
    SecondaryButton,
    SectionHeading,
    SoftBadge,
} from "@/components/ui-clone/primitives";
import { uiCloneTheme } from "@/constants/uiCloneTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const t = uiCloneTheme;

type BadgeTone = "brand" | "success" | "warning" | "neutral";

export type FlowBadge = {
  label: string;
  tone?: BadgeTone;
};

export type FlowInfoRow = {
  label: string;
  value: string;
  valueColor?: string;
};

export type FlowAction = {
  label: string;
  route?: string;
  tone?: "primary" | "secondary";
  icon?: keyof typeof Ionicons.glyphMap;
};

export type FlowSection = {
  key: string;
  title: string;
  description?: string;
  rows?: FlowInfoRow[];
  bullets?: string[];
  chips?: FlowBadge[];
  metrics?: Array<{ key: string; label: string; value: string; icon?: string }>;
  note?: string;
  actions?: FlowAction[];
};

export function FlowPage({
  title,
  subtitle,
  badge,
  sections,
  footerActions,
  bottomNavKey,
}: {
  title: string;
  subtitle?: string;
  badge?: FlowBadge;
  sections: FlowSection[];
  footerActions?: FlowAction[];
  bottomNavKey?: string;
}) {
  const router = useRouter();

  const onActionPress = (action: FlowAction) => {
    if (!action.route) return;
    router.push(action.route as never);
  };

  return (
    <ScreenContainer>
      <ScreenScroll>
        <AppHeader title={title} subtitle={subtitle} />

        {badge ? (
          <BaseCard style={styles.heroCard}>
            <SoftBadge label={badge.label} tone={badge.tone ?? "brand"} />
            {subtitle ? <Text style={styles.heroSub}>{subtitle}</Text> : null}
          </BaseCard>
        ) : null}

        {sections.map((section) => (
          <View key={section.key}>
            <SectionHeading title={section.title} />
            <BaseCard>
              {section.description ? (
                <Text style={styles.sectionDescription}>
                  {section.description}
                </Text>
              ) : null}

              {section.rows?.map((row, idx) => (
                <InfoRow
                  key={`${section.key}-${row.label}-${idx}`}
                  label={row.label}
                  value={row.value}
                  valueColor={row.valueColor}
                  borderBottom={idx !== section.rows!.length - 1}
                />
              ))}

              {section.chips?.length ? (
                <View style={styles.chipRow}>
                  {section.chips.map((chip) => (
                    <SoftBadge
                      key={`${section.key}-${chip.label}`}
                      label={chip.label}
                      tone={chip.tone ?? "neutral"}
                    />
                  ))}
                </View>
              ) : null}

              {section.bullets?.length ? (
                <View style={styles.bulletWrap}>
                  {section.bullets.map((line) => (
                    <View
                      key={`${section.key}-${line}`}
                      style={styles.bulletRow}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color={t.colors.brandStrong}
                      />
                      <Text style={styles.bulletText}>{line}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {section.metrics?.length ? (
                <View style={styles.metricWrap}>
                  <StatsGrid items={section.metrics} />
                </View>
              ) : null}

              {section.note ? (
                <Text style={styles.sectionNote}>{section.note}</Text>
              ) : null}

              {section.actions?.length ? (
                <View style={styles.actionCol}>
                  {section.actions.map((action) =>
                    action.tone === "secondary" ? (
                      <SecondaryButton
                        key={`${section.key}-${action.label}`}
                        label={action.label}
                        leftIcon={action.icon}
                        onPress={() => onActionPress(action)}
                      />
                    ) : (
                      <PrimaryButton
                        key={`${section.key}-${action.label}`}
                        label={action.label}
                        leftIcon={action.icon}
                        onPress={() => onActionPress(action)}
                      />
                    ),
                  )}
                </View>
              ) : null}
            </BaseCard>
          </View>
        ))}

        {footerActions?.length ? (
          <BaseCard>
            <View style={styles.actionCol}>
              {footerActions.map((action) =>
                action.tone === "secondary" ? (
                  <SecondaryButton
                    key={`footer-${action.label}`}
                    label={action.label}
                    leftIcon={action.icon}
                    onPress={() => onActionPress(action)}
                  />
                ) : (
                  <PrimaryButton
                    key={`footer-${action.label}`}
                    label={action.label}
                    leftIcon={action.icon}
                    onPress={() => onActionPress(action)}
                  />
                ),
              )}
            </View>
          </BaseCard>
        ) : null}
      </ScreenScroll>

      {bottomNavKey ? <BottomNav activeKey={bottomNavKey} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: t.colors.bgSurfaceTint,
    borderColor: t.colors.borderBrand,
    gap: t.spacing.s3,
  },
  heroSub: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
  },
  sectionDescription: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    marginBottom: t.spacing.s4,
  },
  chipRow: {
    marginTop: t.spacing.s4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.s3,
  },
  bulletWrap: {
    marginTop: t.spacing.s4,
    gap: t.spacing.s3,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s3,
  },
  bulletText: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
    flex: 1,
  },
  metricWrap: {
    marginTop: t.spacing.s4,
  },
  sectionNote: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    marginTop: t.spacing.s4,
    fontStyle: "italic",
  },
  actionCol: {
    marginTop: t.spacing.s5,
    gap: t.spacing.s4,
  },
});
