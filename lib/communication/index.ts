/**
 * Communication Module - Modern Open Source Integration
 * Unified module for Call, Chat, and LiveStream features
 * 
 * Technologies:
 * - WebRTC: Real-time video/audio calls
 * - Socket.IO: Real-time messaging
 * - HLS/RTMP: Live streaming
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

// Re-export all communication modules
export * from './media';
export * from './socket';
export * from './types';
export * from './webrtc';

// Version info
export const COMMUNICATION_VERSION = '2.0.0';

// Feature flags
export const FEATURES = {
  VIDEO_CALL: true,
  AUDIO_CALL: true,
  SCREEN_SHARE: true,
  GROUP_CALL: true,
  CHAT: true,
  GROUP_CHAT: true,
  FILE_SHARING: true,
  LIVE_STREAM: true,
  LIVE_CHAT: true,
  RECORDING: true,
} as const;
