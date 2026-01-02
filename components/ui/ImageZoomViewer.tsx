/**
 * Image Zoom Viewer Component
 * Kết hợp Pinch Zoom + Double Tap Zoom cho product images
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ImageSourcePropType, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { DoubleTapZoom, PinchZoomView } from '../gestures';

interface ImageZoomViewerProps {
  source: ImageSourcePropType | { uri: string };
  thumbnailStyle?: any;
  fullscreenOnTap?: boolean;
}

export function ImageZoomViewer({ 
  source, 
  thumbnailStyle,
  fullscreenOnTap = true 
}: ImageZoomViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      {/* Thumbnail - Tap to fullscreen */}
      <Pressable onPress={() => fullscreenOnTap && setFullscreen(true)}>
        <Image source={source} style={thumbnailStyle} resizeMode="cover" />
      </Pressable>

      {/* Fullscreen Modal với Zoom */}
      <Modal
        visible={fullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable 
            style={styles.closeButton}
            onPress={() => setFullscreen(false)}
          >
            <Ionicons name="close-circle" size={40} color="#fff" />
          </Pressable>

          {/* Zoomable Image */}
          <PinchZoomView minScale={1} maxScale={5}>
            <DoubleTapZoom zoomScale={2.5}>
              <Image
                source={source}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            </DoubleTapZoom>
          </PinchZoomView>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Ionicons name="information-circle-outline" size={16} color="#fff" />
            <View style={{ marginLeft: 8 }}>
              <View style={styles.instructionText}>
                <Ionicons name="hand-left-outline" size={14} color="#fff" />
                <Text style={{ marginLeft: 4, opacity: 0.9, fontSize: 12, color: '#fff' }}>
                  Pinch to zoom
                </Text>
              </View>
              <View style={styles.instructionText}>
                <Ionicons name="hand-right-outline" size={14} color="#fff" />
                <Text style={{ marginLeft: 4, opacity: 0.9, fontSize: 12, color: '#fff' }}>
                  Double tap to zoom
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  instructionText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
});
