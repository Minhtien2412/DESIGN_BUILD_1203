import type { ImageSourcePropType } from "react-native";

export type HomeRole = "worker" | "customer";

export interface HomeIconItem {
  id: string;
  label: string;
  icon: ImageSourcePropType;
}

export interface HomeLiveItem {
  id: string;
  image: ImageSourcePropType;
  badgeText?: string;
}

export interface HomeVideoItem {
  id: string;
  image: ImageSourcePropType;
  views: string;
}

export interface HomeProductItem {
  id: string;
  name: string;
  price: string;
  sold: string;
  image: ImageSourcePropType;
}

export interface HomePromoBanner {
  id: string;
  image: ImageSourcePropType;
}
