import { StyleSheet, View } from "react-native";

import { colors } from "../../shared/theme/colors";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import { ServiceItem, ServiceSectionData } from "../mock/home.types";
import SectionTitle from "./SectionTitle";
import ServiceGrid from "./ServiceGrid";

type ServiceSectionProps = {
  section: ServiceSectionData;
  compact?: boolean;
  onItemPress?: (item: ServiceItem, section: ServiceSectionData) => void;
  onActionPress?: (section: ServiceSectionData) => void;
};

export default function ServiceSection({
  section,
  compact = false,
  onItemPress,
  onActionPress,
}: ServiceSectionProps) {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.card,
          { backgroundColor: section.backgroundColor ?? colors.surface },
        ]}
      >
        <SectionTitle
          title={section.title}
          actionLabel={section.actionLabel}
          searchPillLabel={section.searchPillLabel}
          titleColor={section.titleColor}
          onActionPress={
            section.actionLabel ? () => onActionPress?.(section) : undefined
          }
        />
        <View style={styles.gridWrap}>
          <ServiceGrid
            items={section.items}
            compact={compact}
            onItemPress={(item) => onItemPress?.(item, section)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card,
  },
  gridWrap: {
    marginTop: 12,
  },
});
