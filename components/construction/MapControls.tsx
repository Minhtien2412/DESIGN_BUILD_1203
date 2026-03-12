import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MapState } from '../../services/api/constructionMapApi';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  mapState: MapState | null;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Map Controls Component
 * Provides zoom, pan, and reset controls for the construction map
 */
export default function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  mapState,
  minZoom = 0.1,
  maxZoom = 5,
}: MapControlsProps) {
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  return (
    <View style={styles.container}>
      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        {/* Zoom In */}
        <TouchableOpacity
          style={[styles.controlButton, !canZoomIn && styles.controlButtonDisabled]}
          onPress={onZoomIn}
          disabled={!canZoomIn}
        >
          <Text style={[styles.controlIcon, !canZoomIn && styles.controlIconDisabled]}>
            ➕
          </Text>
        </TouchableOpacity>

        {/* Zoom Level Display */}
        <View style={styles.zoomDisplay}>
          <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
        </View>

        {/* Zoom Out */}
        <TouchableOpacity
          style={[styles.controlButton, !canZoomOut && styles.controlButtonDisabled]}
          onPress={onZoomOut}
          disabled={!canZoomOut}
        >
          <Text style={[styles.controlIcon, !canZoomOut && styles.controlIconDisabled]}>
            ➖
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reset View Button */}
      <View style={styles.resetControls}>
        <TouchableOpacity style={styles.resetButton} onPress={onResetView}>
          <Text style={styles.resetIcon}>🔄</Text>
          <Text style={styles.resetText}>Reset View</Text>
        </TouchableOpacity>
      </View>

      {/* Viewport Info */}
      {mapState && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            🔍 Zoom: {Math.round(zoom * 100)}%
          </Text>
          <Text style={styles.infoText}>
            📍 X: {Math.round(mapState.panX || 0)}, Y: {Math.round(mapState.panY || 0)}
          </Text>
          {mapState.viewport && (
            <Text style={styles.infoText}>
              📐 {Math.round(mapState.viewport.width)} × {Math.round(mapState.viewport.height)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 100,
  },
  zoomControls: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginVertical: 2,
  },
  controlButtonDisabled: {
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
  controlIcon: {
    fontSize: 20,
  },
  controlIconDisabled: {
    opacity: 0.4,
  },
  zoomDisplay: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  zoomText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  resetControls: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  resetIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  infoPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
  },
  infoText: {
    fontSize: 11,
    color: '#fff',
    marginVertical: 2,
    fontFamily: 'monospace',
  },
});
