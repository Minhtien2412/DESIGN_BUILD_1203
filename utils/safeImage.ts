import { ImageSourcePropType } from "react-native";

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

/**
 * Returns true when `uri` is a non-empty string that could be a valid image URL.
 */
export function isValidImageUri(uri: unknown): uri is string {
  return typeof uri === "string" && uri.trim().length > 0;
}

/**
 * Wrap a potentially-empty URI so React Native's `<Image>` never receives
 * `source={{ uri: "" }}` or `source={{ uri: undefined }}`, both of which
 * trigger yellow-box warnings on Android.
 *
 * Returns `undefined` when there is no usable URI — the caller can then
 * hide the Image or show a placeholder component.
 */
export function getSafeImageSource(
  uri: string | null | undefined,
  fallbackUri?: string,
): ImageSourcePropType | undefined {
  if (isValidImageUri(uri)) return { uri };
  if (isValidImageUri(fallbackUri)) return { uri: fallbackUri };
  return undefined;
}
