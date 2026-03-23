import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppImage from "../../shared/components/AppImage";
import AppText from "../../shared/components/AppText";
import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { shadows } from "../../shared/theme/shadows";
import { spacing } from "../../shared/theme/spacing";
import { MediaCardData } from "../mock/home.types";

type VideoCardProps = {
  item: MediaCardData;
  onPress?: (item: MediaCardData) => void;
};

export default function VideoCard({ item, onPress }: VideoCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => onPress?.(item)}
    >
      <AppImage
        source={item.image}
        containerStyle={styles.imageWrap}
        style={styles.image}
      />
      <View style={styles.badge}>
        <Ionicons name="play" size={12} color={colors.white} />
        <AppText variant="micro" color={colors.white}>
          VIDEO
        </AppText>
      </View>
      <View style={styles.playButton}>
        <Ionicons name="play" size={18} color={colors.white} />
      </View>
      <View style={styles.content}>
        <AppText variant="title" numberOfLines={2}>
          {item.title}
        </AppText>
        <AppText
          variant="bodySmall"
          color={colors.textSecondary}
          numberOfLines={2}
        >
          {item.subtitle}
        </AppText>
        <View style={styles.metaRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.textSecondary}
          />
          <AppText variant="caption" color={colors.textSecondary}>
            {item.meta}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 266,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card,
  },
  imageWrap: {
    width: "100%",
    height: 126,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.video,
  },
  playButton: {
    position: "absolute",
    top: 48,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31, 41, 55, 0.55)",
  },
  content: {
    padding: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
});
