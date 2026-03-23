import {
    Image,
    ImageProps,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

import { colors } from "../theme/colors";

type AppImageProps = {
  source: ImageSourcePropType | string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: ImageProps["resizeMode"];
  backgroundColor?: string;
};

export default function AppImage({
  source,
  style,
  containerStyle,
  resizeMode = "cover",
  backgroundColor = colors.borderSoft,
}: AppImageProps) {
  const resolvedSource = typeof source === "string" ? { uri: source } : source;

  return (
    <View style={[styles.container, { backgroundColor }, containerStyle]}>
      <Image
        source={resolvedSource}
        resizeMode={resizeMode}
        style={[styles.image, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
