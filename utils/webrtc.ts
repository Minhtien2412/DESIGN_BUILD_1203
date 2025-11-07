// React Native WebRTC Wrapper for Expo
import {
    MediaStream,
    MediaStreamTrack,
    RTCIceCandidate,
    RTCPeerConnection,
    RTCSessionDescription,
    RTCView,
    mediaDevices,
    registerGlobals,
} from 'react-native-webrtc';

// Register WebRTC globals
registerGlobals();

// Export WebRTC APIs for use in VideoCallManager
export {
    MediaStream,
    MediaStreamTrack, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription,
    RTCView, mediaDevices
};

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
