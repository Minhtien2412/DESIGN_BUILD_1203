/**
 * SignaturePad — Real touch-based signature canvas
 *
 * Uses react-native-svg (already installed) + PanResponder for
 * freehand drawing. Exports signature as base64 PNG data URI.
 *
 * @created 2026-03-16 — Round 5 production implementation
 */
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useRef, useState } from "react";
import {
    type GestureResponderEvent,
    type LayoutChangeEvent,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// ── Types ───────────────────────────────────────────────────────────────

export interface SignaturePadProps {
  /** Called with base64 data URI when user finishes a stroke */
  onSignatureChange?: (hasSignature: boolean) => void;
  /** Canvas height (default 200) */
  height?: number;
  /** Stroke color */
  strokeColor?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Whether the pad is disabled */
  disabled?: boolean;
}

export interface SignaturePadRef {
  /** Get signature as SVG path data string */
  getPathData: () => string[];
  /** Check if user has drawn anything */
  isEmpty: () => boolean;
  /** Clear the canvas */
  clear: () => void;
  /** Undo last stroke */
  undo: () => void;
  /** Get signature as base64 data URI (SVG wrapped in HTML for image conversion) */
  toDataURL: () => string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function pointToSvg(x: number, y: number, isFirst: boolean): string {
  return isFirst
    ? `M ${x.toFixed(1)} ${y.toFixed(1)}`
    : `L ${x.toFixed(1)} ${y.toFixed(1)}`;
}

// ── Component ───────────────────────────────────────────────────────────

function SignaturePadInner(
  {
    onSignatureChange,
    height = 200,
    strokeColor = "#1F2937",
    strokeWidth = 2.5,
    disabled = false,
  }: SignaturePadProps,
  ref: React.Ref<SignaturePadRef>,
) {
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef<string>("");
  const [currentPathDisplay, setCurrentPathDisplay] = useState<string>("");
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef<View>(null);

  const getLocationInCanvas = useCallback((evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    const { width, height: h } = layoutRef.current;
    // locationX/locationY are relative to the target view — no offset math needed
    return {
      x: Math.max(0, Math.min(locationX, width)),
      y: Math.max(0, Math.min(locationY, h)),
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,

      onPanResponderGrant: (evt) => {
        const point = getLocationInCanvas(evt);
        currentPath.current = pointToSvg(point.x, point.y, true);
        setCurrentPathDisplay(currentPath.current);
      },

      onPanResponderMove: (evt) => {
        const point = getLocationInCanvas(evt);
        currentPath.current += ` ${pointToSvg(point.x, point.y, false)}`;
        setCurrentPathDisplay(currentPath.current);
      },

      onPanResponderRelease: () => {
        if (currentPath.current) {
          setPaths((prev) => {
            const next = [...prev, currentPath.current];
            onSignatureChange?.(next.length > 0);
            return next;
          });
          currentPath.current = "";
          setCurrentPathDisplay("");
        }
      },
    }),
  ).current;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: lh } = e.nativeEvent.layout;
    layoutRef.current = { ...layoutRef.current, width, height: lh };
  }, []);

  const clear = useCallback(() => {
    setPaths([]);
    currentPath.current = "";
    setCurrentPathDisplay("");
    onSignatureChange?.(false);
  }, [onSignatureChange]);

  const undo = useCallback(() => {
    setPaths((prev) => {
      const next = prev.slice(0, -1);
      onSignatureChange?.(next.length > 0);
      return next;
    });
  }, [onSignatureChange]);

  const isEmpty = useCallback(() => paths.length === 0, [paths]);

  const toDataURL = useCallback((): string | null => {
    if (paths.length === 0) return null;
    const { width, height: h } = layoutRef.current;
    const w = width || 300;
    const svgH = h || height;
    const pathsMarkup = paths
      .map(
        (d) =>
          `<path d="${d}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${svgH}" viewBox="0 0 ${w} ${svgH}"><rect width="${w}" height="${svgH}" fill="white"/>${pathsMarkup}</svg>`;
    // Return as SVG data URI (universally supported for display & upload)
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml,${encoded}`;
  }, [paths, height, strokeColor, strokeWidth]);

  // Expose ref methods
  React.useImperativeHandle(
    ref,
    () => ({
      getPathData: () => paths,
      isEmpty,
      clear,
      undo,
      toDataURL,
    }),
    [paths, isEmpty, clear, undo, toDataURL],
  );

  const hasPaths = paths.length > 0;

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarLabel}>
          {hasPaths ? "Đã ký" : "Ký vào ô bên dưới"}
        </Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            onPress={undo}
            disabled={!hasPaths || disabled}
            style={styles.toolBtn}
            hitSlop={8}
          >
            <Ionicons
              name="arrow-undo-outline"
              size={18}
              color={hasPaths && !disabled ? "#6B7280" : "#D1D5DB"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={clear}
            disabled={!hasPaths || disabled}
            style={styles.toolBtn}
            hitSlop={8}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={hasPaths && !disabled ? "#EF4444" : "#D1D5DB"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View
        ref={canvasRef}
        style={[styles.canvas, { height }]}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          {/* Committed strokes */}
          {paths.map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Active stroke */}
          {currentPathDisplay ? (
            <Path
              d={currentPathDisplay}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>

        {/* Placeholder text when empty */}
        {!hasPaths && !currentPathDisplay && (
          <View style={styles.placeholder} pointerEvents="none">
            <Ionicons name="create-outline" size={28} color="#D1D5DB" />
            <Text style={styles.placeholderText}>Dùng ngón tay để ký</Text>
          </View>
        )}

        {/* Signature line */}
        <View style={styles.signatureLine} pointerEvents="none" />
      </View>
    </View>
  );
}

import React from "react";
export const SignaturePad = memo(React.forwardRef(SignaturePadInner));

// ── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  containerDisabled: {
    opacity: 0.5,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  toolbarLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  toolbarActions: {
    flexDirection: "row",
    gap: 12,
  },
  toolBtn: {
    padding: 4,
  },
  canvas: {
    width: "100%",
    backgroundColor: "#fff",
    position: "relative",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  placeholderText: {
    fontSize: 13,
    color: "#D1D5DB",
  },
  signatureLine: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
});
