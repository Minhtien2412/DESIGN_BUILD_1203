import { Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PromoBannerProps {
  image: any;
  onPress?: () => void;
  marginTop?: number;
  heightRatio?: number;
}

export function PromoBanner({
  image,
  onPress,
  marginTop = 12,
  heightRatio = 0.46,
}: PromoBannerProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[s.wrap, { marginTop }]}
    >
      <Image
        source={image}
        style={[s.image, { height: (SCREEN_WIDTH - 32) * heightRatio }]}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
  },
  image: {
    width: "100%",
    borderRadius: 14,
  },
});
