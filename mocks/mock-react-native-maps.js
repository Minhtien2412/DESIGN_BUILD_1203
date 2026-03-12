/**
 * Mock react-native-maps for web platform
 * Maps are native-only, this prevents import errors on web
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Mock MapView component
const MapView = React.forwardRef(({ children, style, ...props }, ref) => (
  <View ref={ref} style={[styles.container, style]} {...props}>
    <Text style={styles.text}>Maps not available on web</Text>
    {children}
  </View>
));

MapView.displayName = 'MapView';

// Mock Marker component
const Marker = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

// Mock Polyline component
const Polyline = () => null;

// Mock Polygon component
const Polygon = () => null;

// Mock Circle component
const Circle = () => null;

// Mock Callout component
const Callout = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

// Mock Overlay component
const Overlay = () => null;

// Mock Heatmap component
const Heatmap = () => null;

// Mock Geojson component
const Geojson = () => null;

// Constants
const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = null;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderRadius: 8,
  },
  text: {
    color: '#666',
    fontSize: 14,
  },
});

// Export everything
export default MapView;
export {
    Callout, Circle, Geojson, Heatmap, MapView,
    Marker, Overlay, Polygon, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE
};

