/**
 * Type augmentation for react-native-webrtc
 * 
 * The react-native-webrtc library extends native MediaStream with additional methods
 * that are not present in the standard TypeScript definitions.
 */

declare global {
  /**
   * Augment MediaStream interface with react-native-webrtc specific methods
   */
  interface MediaStream {
    /**
     * Converts the MediaStream to a URL string that can be used with RTCView
     * This is a react-native-webrtc specific method for rendering video.
     * 
     * @returns A URL string representation of the stream (e.g., "rtc://local-1234")
     * 
     * @example
     * ```typescript
     * const stream = new MediaStream([videoTrack, audioTrack]);
     * const streamURL = stream.toURL();
     * 
     * // Use with RTCView
     * <RTCView streamURL={streamURL} />
     * ```
     */
    toURL(): string;
    
    /**
     * Releases the media stream and stops all tracks
     * This is important for cleanup when the call ends.
     */
    release(): void;
  }
}

export { };

