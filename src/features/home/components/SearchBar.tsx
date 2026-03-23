import { Ionicons } from "@expo/vector-icons";
import {
    StyleProp,
    StyleSheet,
    TextInput,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

import { colors } from "../../shared/theme/colors";
import { radius } from "../../shared/theme/radius";
import { spacing } from "../../shared/theme/spacing";
import { typography } from "../../shared/theme/typography";

type SearchBarProps = {
  placeholder: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
};

export default function SearchBar({
  placeholder,
  style,
  inputStyle,
  onPress,
}: SearchBarProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.container, style]}
      onPress={onPress}
    >
      <Ionicons name="search" size={17} color={colors.textMuted} />
      <TextInput
        editable={false}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, inputStyle]}
        pointerEvents="none"
      />
      <Ionicons name="options-outline" size={17} color={colors.brandDark} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 46,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    color: colors.text,
  },
});
