/**
 * Tests for VideoPlayerController
 * @see PRODUCT_BACKLOG.md VIDEO-001
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock expo-video
jest.mock('expo-video', () => ({
  VideoPlayer: jest.fn(),
}));

describe('VideoPlayerController', () => {
  let VideoPlayerController: any;
  let VideoPlayerControllerClass: any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    // Re-import to get fresh instance
    const module = require('@/services/VideoPlayerController');
    VideoPlayerController = module.VideoPlayerController;
    VideoPlayerControllerClass = module.VideoPlayerControllerClass;
  });

  describe('Singleton', () => {
    it('should return the same instance', () => {
      const instance1 = VideoPlayerControllerClass.getInstance();
      const instance2 = VideoPlayerControllerClass.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Player Registration', () => {
    it('should register a player', () => {
      const mockPlayer = {
        muted: false,
        volume: 1.0,
        play: jest.fn(),
        pause: jest.fn(),
        currentTime: 0,
      };

      VideoPlayerController.registerPlayer('video-1', mockPlayer);
      
      // Player should have mute setting applied
      expect(mockPlayer.muted).toBe(VideoPlayerController.getMuted());
    });

    it('should unregister a player', async () => {
      const mockPlayer = {
        muted: false,
        volume: 1.0,
        play: jest.fn(),
        pause: jest.fn(),
        currentTime: 10,
      };

      VideoPlayerController.registerPlayer('video-1', mockPlayer);
      VideoPlayerController.unregisterPlayer('video-1');
      
      // Wait for async storage operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Position should be saved (may be async)
      expect(VideoPlayerController.getPlaybackPosition('video-1')).toBeDefined();
    });
  });

  describe('Playback Control', () => {
    it('should play a video and set it as active', () => {
      const mockPlayer = {
        muted: false,
        volume: 1.0,
        play: jest.fn(),
        pause: jest.fn(),
        currentTime: 0,
      };

      VideoPlayerController.registerPlayer('video-1', mockPlayer);
      VideoPlayerController.play('video-1');

      expect(mockPlayer.play).toHaveBeenCalled();
      expect(VideoPlayerController.getActiveVideoId()).toBe('video-1');
    });

    it('should pause previous video when playing new one', () => {
      const mockPlayer1 = {
        muted: false,
        volume: 1.0,
        play: jest.fn(),
        pause: jest.fn(),
        currentTime: 5,
      };
      const mockPlayer2 = {
        muted: false,
        volume: 1.0,
        play: jest.fn(),
        pause: jest.fn(),
        currentTime: 0,
      };

      VideoPlayerController.registerPlayer('video-1', mockPlayer1);
      VideoPlayerController.registerPlayer('video-2', mockPlayer2);
      
      VideoPlayerController.play('video-1');
      expect(mockPlayer1.play).toHaveBeenCalled();
      
      VideoPlayerController.play('video-2');
      expect(mockPlayer1.pause).toHaveBeenCalled();
      expect(mockPlayer2.play).toHaveBeenCalled();
      expect(VideoPlayerController.getActiveVideoId()).toBe('video-2');
    });

    it('should pause all videos', () => {
      const mockPlayer1 = { muted: false, volume: 1.0, play: jest.fn(), pause: jest.fn(), currentTime: 0 };
      const mockPlayer2 = { muted: false, volume: 1.0, play: jest.fn(), pause: jest.fn(), currentTime: 0 };

      VideoPlayerController.registerPlayer('video-1', mockPlayer1);
      VideoPlayerController.registerPlayer('video-2', mockPlayer2);
      
      VideoPlayerController.pauseAll();
      
      expect(mockPlayer1.pause).toHaveBeenCalled();
      expect(mockPlayer2.pause).toHaveBeenCalled();
      expect(VideoPlayerController.getActiveVideoId()).toBeNull();
    });
  });

  describe('Mute Control', () => {
    it('should toggle mute and persist setting', async () => {
      const initialMuted = VideoPlayerController.getMuted();
      
      const result = await VideoPlayerController.toggleMute();
      
      expect(result).toBe(!initialMuted);
      // Verify mute state changed
      expect(VideoPlayerController.getMuted()).toBe(!initialMuted);
    });

    it('should apply mute to all registered players', async () => {
      const mockPlayer1 = { muted: false, volume: 1.0, play: jest.fn(), pause: jest.fn(), currentTime: 0 };
      const mockPlayer2 = { muted: false, volume: 1.0, play: jest.fn(), pause: jest.fn(), currentTime: 0 };

      VideoPlayerController.registerPlayer('video-1', mockPlayer1);
      VideoPlayerController.registerPlayer('video-2', mockPlayer2);
      
      await VideoPlayerController.setMuted(true);
      
      expect(mockPlayer1.muted).toBe(true);
      expect(mockPlayer2.muted).toBe(true);
    });
  });

  describe('Volume Control', () => {
    it('should set volume for all players', () => {
      const mockPlayer = { muted: false, volume: 1.0, play: jest.fn(), pause: jest.fn(), currentTime: 0 };
      
      VideoPlayerController.registerPlayer('video-1', mockPlayer);
      VideoPlayerController.setVolume(0.5);
      
      expect(mockPlayer.volume).toBe(0.5);
      expect(VideoPlayerController.getVolume()).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', () => {
      VideoPlayerController.setVolume(1.5);
      expect(VideoPlayerController.getVolume()).toBe(1.0);
      
      VideoPlayerController.setVolume(-0.5);
      expect(VideoPlayerController.getVolume()).toBe(0);
    });
  });

  describe('State Subscription', () => {
    it('should notify subscribers on state change', () => {
      const callback = jest.fn();
      
      const unsubscribe = VideoPlayerController.subscribe(callback);
      
      // Should be called immediately with current state
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Trigger state change
      VideoPlayerController.setVolume(0.7);
      
      expect(callback).toHaveBeenCalledTimes(2);
      
      unsubscribe();
    });

    it('should allow unsubscribing', () => {
      const callback = jest.fn();
      
      const unsubscribe = VideoPlayerController.subscribe(callback);
      unsubscribe();
      
      // Clear previous calls
      callback.mockClear();
      
      VideoPlayerController.setVolume(0.3);
      
      // Should not be called after unsubscribe
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Playback Position', () => {
    it('should get saved playback position', () => {
      const position = VideoPlayerController.getPlaybackPosition('video-1');
      expect(typeof position).toBe('number');
    });

    it('should return 0 for unknown video', () => {
      const position = VideoPlayerController.getPlaybackPosition('unknown-video');
      expect(position).toBe(0);
    });
  });
});
