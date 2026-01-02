// React Native WebRTC Wrapper for Expo
// Safely handles missing native module (Expo Go limitation)
import React from 'react';
import { Platform, View } from 'react-native';

// Check if native WebRTC module is available
let WebRTCModule: any = null;
let hasNativeModule = false;

// Only load WebRTC on native platforms (iOS/Android)
if (Platform.OS !== 'web') {
  try {
    // Use LiveKit's WebRTC fork
    WebRTCModule = require('@livekit/react-native-webrtc');
    hasNativeModule = true;
    // Register WebRTC globals if available
    if (WebRTCModule.registerGlobals) {
      WebRTCModule.registerGlobals();
    }
  } catch (error) {
    console.warn('[WebRTC] Native module not available - WebRTC features disabled');
    console.warn('[WebRTC] To use WebRTC, create a development build: npx expo run:android');
  }
} else {
  console.warn('[WebRTC] Web platform detected - WebRTC features disabled');
}

// Export WebRTC APIs (with fallbacks for Expo Go)
export const MediaStream = WebRTCModule?.MediaStream || class MediaStreamFallback {};
export const MediaStreamTrack = WebRTCModule?.MediaStreamTrack || class MediaStreamTrackFallback {};
export const RTCIceCandidate = WebRTCModule?.RTCIceCandidate || class RTCIceCandidateFallback {};
export const RTCPeerConnection = WebRTCModule?.RTCPeerConnection || class RTCPeerConnectionFallback {
  constructor() {
    console.warn('[WebRTC] RTCPeerConnection not available - using fallback');
  }
};
export const RTCSessionDescription = WebRTCModule?.RTCSessionDescription || class RTCSessionDescriptionFallback {};

// Fallback RTCView component for web
const RTCViewFallback = ({ style, ...props }: any) => {
  return React.createElement(View, {
    style: [style, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }],
    ...props
  });
};

export const RTCView = WebRTCModule?.RTCView || RTCViewFallback;
export const mediaDevices = WebRTCModule?.mediaDevices || {
  getUserMedia: async () => {
    throw new Error('WebRTC not available in Expo Go. Use development build.');
  },
  enumerateDevices: async () => [],
};

export const isWebRTCAvailable = hasNativeModule;

// Extended MediaDevices interface for React Native
export const getMediaDevices = () => {
  return {
    getUserMedia: (constraints: any) => {
      return mediaDevices.getUserMedia(constraints);
    },
    
    getDisplayMedia: (constraints: any) => {
      // Screen sharing in React Native requires additional setup
      // This is a placeholder - implement based on your platform needs
      throw new Error('Screen sharing not implemented yet');
    },
    
    enumerateDevices: () => {
      return mediaDevices.enumerateDevices();
    },
  };
};

// Video component for React Native
export { RTCView as VideoView };
