/**
 * Device Compatibility & Performance Configuration
 * Tự động điều chỉnh hiệu suất theo thiết bị
 */

import React from "react";
import { Dimensions, PixelRatio, Platform } from "react-native";

// =================
// DEVICE DETECTION
// =================

interface DeviceInfo {
  platform: "ios" | "android" | "web";
  isTablet: boolean;
  screenSize: "small" | "medium" | "large" | "xlarge";
  density: "low" | "medium" | "high" | "xhigh";
  memoryClass: "low" | "medium" | "high";
  performanceClass: "low" | "medium" | "high";
}

export class DeviceProfiler {
  private static instance: DeviceProfiler;
  private deviceInfo: DeviceInfo | null = null;

  static getInstance(): DeviceProfiler {
    if (!DeviceProfiler.instance) {
      DeviceProfiler.instance = new DeviceProfiler();
    }
    return DeviceProfiler.instance;
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (this.deviceInfo) return this.deviceInfo;

    const { width, height } = Dimensions.get("window");
    const pixelRatio = PixelRatio.get();
    const screenDiagonal =
      Math.sqrt(width * width + height * height) / pixelRatio;

    // Determine screen size
    let screenSize: DeviceInfo["screenSize"];
    if (screenDiagonal < 5) screenSize = "small";
    else if (screenDiagonal < 7) screenSize = "medium";
    else if (screenDiagonal < 10) screenSize = "large";
    else screenSize = "xlarge";

    // Determine pixel density
    let density: DeviceInfo["density"];
    if (pixelRatio < 1.5) density = "low";
    else if (pixelRatio < 2.5) density = "medium";
    else if (pixelRatio < 3.5) density = "high";
    else density = "xhigh";

    // Determine memory class
    let memoryClass: DeviceInfo["memoryClass"] = "medium";
    try {
      // Fallback memory detection based on platform and screen size
      if (Platform.OS === "web") {
        // @ts-ignore - navigator memory is experimental
        const memory = (navigator as any).deviceMemory;
        if (memory) {
          if (memory < 2) memoryClass = "low";
          else if (memory > 6) memoryClass = "high";
        } else {
          memoryClass = "high"; // Assume high for web
        }
      } else {
        // Use screen size and density as proxy for memory on mobile
        if (screenSize === "small" && density === "low") memoryClass = "low";
        else if (screenSize === "xlarge" && density === "xhigh")
          memoryClass = "high";
      }
    } catch {
      // Fallback based on platform
      if (Platform.OS === "web") memoryClass = "high";
    }

    // Determine performance class
    let performanceClass: DeviceInfo["performanceClass"];
    if (memoryClass === "low" || screenSize === "small") {
      performanceClass = "low";
    } else if (
      memoryClass === "high" &&
      (screenSize === "large" || screenSize === "xlarge")
    ) {
      performanceClass = "high";
    } else {
      performanceClass = "medium";
    }

    this.deviceInfo = {
      platform: Platform.OS as any,
      isTablet: screenSize === "large" || screenSize === "xlarge",
      screenSize,
      density,
      memoryClass,
      performanceClass,
    };

    return this.deviceInfo;
  }
}

// =================
// PERFORMANCE CONFIGURATIONS
// =================

interface PerformanceConfig {
  // List rendering
  maxRenderBatch: number;
  initialNumToRender: number;
  windowSize: number;
  removeClippedSubviews: boolean;

  // Image loading
  imageQuality: "low" | "medium" | "high";
  imageCacheSize: number;
  enableImageCompression: boolean;

  // Animation
  enableAnimations: boolean;
  animationScale: number;
  useNativeDriver: boolean;

  // Network
  requestTimeout: number;
  maxConcurrentRequests: number;
  enableRequestDeduplication: boolean;

  // Memory
  enableMemoryWarning: boolean;
  gcInterval: number;
  cacheSize: number;
}

export class PerformanceManager {
  private static instance: PerformanceManager;
  private config: PerformanceConfig | null = null;

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  async getConfig(): Promise<PerformanceConfig> {
    if (this.config) return this.config;

    const deviceInfo = await DeviceProfiler.getInstance().getDeviceInfo();

    // Base configuration
    let config: PerformanceConfig = {
      maxRenderBatch: 10,
      initialNumToRender: 10,
      windowSize: 10,
      removeClippedSubviews: true,
      imageQuality: "medium",
      imageCacheSize: 50,
      enableImageCompression: true,
      enableAnimations: true,
      animationScale: 1,
      useNativeDriver: true,
      requestTimeout: 15000,
      maxConcurrentRequests: 6,
      enableRequestDeduplication: true,
      enableMemoryWarning: true,
      gcInterval: 5 * 60 * 1000,
      cacheSize: 100,
    };

    // Adjust based on performance class
    switch (deviceInfo.performanceClass) {
      case "low":
        config = {
          ...config,
          maxRenderBatch: 5,
          initialNumToRender: 5,
          windowSize: 5,
          imageQuality: "low",
          imageCacheSize: 20,
          enableAnimations: false,
          animationScale: 0.5,
          requestTimeout: 20000,
          maxConcurrentRequests: 3,
          gcInterval: 2 * 60 * 1000,
          cacheSize: 50,
        };
        break;

      case "high":
        config = {
          ...config,
          maxRenderBatch: 20,
          initialNumToRender: 20,
          windowSize: 20,
          imageQuality: "high",
          imageCacheSize: 100,
          enableImageCompression: false,
          animationScale: 1.2,
          requestTimeout: 10000,
          maxConcurrentRequests: 10,
          gcInterval: 10 * 60 * 1000,
          cacheSize: 200,
        };
        break;
    }

    // Platform-specific adjustments
    if (deviceInfo.platform === "web") {
      config.useNativeDriver = false;
      config.removeClippedSubviews = false;
    }

    if (deviceInfo.platform === "android") {
      // Android specific optimizations
      config.enableImageCompression = true;
      config.removeClippedSubviews = true;
    }

    this.config = config;
    return config;
  }

  async updateConfig(overrides: Partial<PerformanceConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    this.config = { ...currentConfig, ...overrides };
  }
}

// =================
// PERFORMANCE HOOKS
// =================

export const useDeviceOptimization = () => {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null);
  const [performanceConfig, setPerformanceConfig] =
    React.useState<PerformanceConfig | null>(null);
  const [memoryUsage, setMemoryUsage] = React.useState<{
    used: number;
    total: number;
  } | null>(null);

  React.useEffect(() => {
    const initializeDeviceInfo = async () => {
      try {
        const info = await DeviceProfiler.getInstance().getDeviceInfo();
        setDeviceInfo(info);

        const config = await PerformanceManager.getInstance().getConfig();
        setPerformanceConfig(config);

        // Get memory usage
        try {
          // Mock memory detection for demo
          const mockTotalMemory = 4 * 1024 * 1024 * 1024; // 4GB
          const mockUsedMemory = 2 * 1024 * 1024 * 1024; // 2GB
          setMemoryUsage({ used: mockUsedMemory, total: mockTotalMemory });
        } catch {
          // Memory info not available
        }
      } catch (error) {
        console.warn("Failed to initialize device optimization:", error);
      }
    };

    initializeDeviceInfo();
  }, []);

  const getFlatListProps = React.useMemo(() => {
    if (!performanceConfig) return {};

    return {
      removeClippedSubviews: performanceConfig.removeClippedSubviews,
      maxToRenderPerBatch: performanceConfig.maxRenderBatch,
      initialNumToRender: performanceConfig.initialNumToRender,
      windowSize: performanceConfig.windowSize,
      updateCellsBatchingPeriod: 50,
      getItemLayout: undefined, // Enable if you know exact item sizes
    };
  }, [performanceConfig]);

  const getImageProps = React.useMemo(() => {
    if (!performanceConfig) return {};

    const _quality =
      performanceConfig.imageQuality === "high"
        ? 1
        : performanceConfig.imageQuality === "medium"
          ? 0.8
          : 0.6;

    return {
      cachePolicy: "memory-disk" as const,
      contentFit: "cover" as const,
      transition: performanceConfig.enableAnimations ? 300 : 0,
    };
  }, [performanceConfig]);

  const getAnimationConfig = React.useMemo(() => {
    if (!performanceConfig) return {};

    return {
      useNativeDriver: performanceConfig.useNativeDriver,
      duration: performanceConfig.enableAnimations
        ? Math.round(300 * performanceConfig.animationScale)
        : 0,
    };
  }, [performanceConfig]);

  return {
    deviceInfo,
    performanceConfig,
    memoryUsage,
    getFlatListProps,
    getImageProps,
    getAnimationConfig,
    isLowPerformanceDevice: deviceInfo?.performanceClass === "low",
    isHighPerformanceDevice: deviceInfo?.performanceClass === "high",
  };
};

// =================
// PERFORMANCE MONITORING
// =================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private memoryCheckInterval: any = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    // Monitor memory usage
    this.memoryCheckInterval = setInterval(async () => {
      try {
        // Mock memory monitoring for demo
        const mockUsedMemory = Math.random() * 4 * 1024 * 1024 * 1024; // Random usage up to 4GB
        this.recordMetric("memory_usage", mockUsedMemory);

        // Trigger warning if memory usage is high
        const mockTotalMemory = 4 * 1024 * 1024 * 1024; // 4GB total
        const usagePercentage = (mockUsedMemory / mockTotalMemory) * 100;

        if (usagePercentage > 85) {
          this.triggerMemoryWarning(usagePercentage);
        }
      } catch {
        // Memory monitoring not available
      }
    }, 30000); // Check every 30 seconds
  }

  stopMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(
    name: string,
  ): { avg: number; min: number; max: number; latest: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1],
    };
  }

  private triggerMemoryWarning(usagePercentage: number): void {
    console.warn(`High memory usage detected: ${usagePercentage.toFixed(1)}%`);

    // Emit custom event for memory cleanup
    try {
      // Custom event emission without global EventEmitter
      if (typeof document !== "undefined") {
        const event = new CustomEvent("memoryWarning", {
          detail: { usagePercentage },
        });
        document.dispatchEvent(event);
      }
    } catch {
      // Event emission not available
    }
  }
}

// Export singleton instances
export const deviceProfiler = DeviceProfiler.getInstance();
export const performanceManager = PerformanceManager.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
