/**
 * WebSocket Manager với Token Refresh
 * ====================================
 *
 * Quản lý WebSocket connections với:
 * 1. Automatic token refresh trước khi connect
 * 2. Reconnection với exponential backoff
 * 3. Connection pooling
 * 4. Error isolation
 *
 * Giải quyết vấn đề:
 * - [CallGateway] Connection error: jwt expired
 * - Quá nhiều reconnection attempts
 * - Memory leaks từ abandoned connections
 *
 * @author ThietKeResort Team
 * @created 2026-01-29
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { doRefreshToken, getAccessToken } from "./apiClient";

// ============================================================================
// TYPES
// ============================================================================

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error"
  | "disabled";

export interface SocketConfig {
  namespace: string;
  requiresAuth: boolean;
  autoConnect: boolean;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  maxReconnectInterval: number;
  priority: "critical" | "normal" | "low";
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export interface ManagedSocket {
  id: string;
  socket: Socket | null;
  config: SocketConfig;
  state: ConnectionState;
  reconnectAttempts: number;
  lastError?: Error;
  lastConnected?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: Partial<SocketConfig> = {
  requiresAuth: true,
  autoConnect: false,
  maxReconnectAttempts: 3,
  reconnectInterval: 2000,
  maxReconnectInterval: 30000,
  priority: "normal",
};

const TOKEN_REFRESH_BUFFER = 60000; // 1 minute before expiry
const DISABLED_SOCKETS_KEY = "@disabled_sockets";

// ============================================================================
// WEBSOCKET MANAGER SERVICE
// ============================================================================

class WebSocketManagerService {
  private static instance: WebSocketManagerService;
  private sockets: Map<string, ManagedSocket> = new Map();
  private baseUrl: string = "";
  private disabledNamespaces: Set<string> = new Set();
  private isInitialized = false;
  private connectionQueue: string[] = [];
  private isProcessingQueue = false;

  private constructor() {
    this.loadDisabledSockets();
  }

  static getInstance(): WebSocketManagerService {
    if (!WebSocketManagerService.instance) {
      WebSocketManagerService.instance = new WebSocketManagerService();
    }
    return WebSocketManagerService.instance;
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  /**
   * Initialize the manager with base URL
   */
  initialize(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.isInitialized = true;
    console.log("[WSManager] Initialized with base URL:", this.baseUrl);
  }

  /**
   * Register a socket connection
   */
  register(
    id: string,
    config: Partial<SocketConfig> & { namespace: string },
  ): void {
    if (this.sockets.has(id)) {
      console.warn(`[WSManager] Socket ${id} already registered`);
      return;
    }

    const fullConfig: SocketConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    } as SocketConfig;

    this.sockets.set(id, {
      id,
      socket: null,
      config: fullConfig,
      state: this.disabledNamespaces.has(config.namespace)
        ? "disabled"
        : "disconnected",
      reconnectAttempts: 0,
    });

    console.log(`[WSManager] Registered socket: ${id} (${config.namespace})`);
  }

  /**
   * Connect a socket (with token validation)
   */
  async connect(id: string): Promise<boolean> {
    const managed = this.sockets.get(id);
    if (!managed) {
      console.error(`[WSManager] Socket ${id} not registered`);
      return false;
    }

    if (managed.state === "disabled") {
      console.log(`[WSManager] Socket ${id} is disabled, skipping connect`);
      return false;
    }

    if (managed.state === "connected" || managed.state === "connecting") {
      return managed.state === "connected";
    }

    // Queue connection to prevent overwhelming
    return this.queueConnection(id);
  }

  /**
   * Disconnect a socket
   */
  disconnect(id: string): void {
    const managed = this.sockets.get(id);
    if (!managed || !managed.socket) return;

    managed.socket.removeAllListeners();
    managed.socket.disconnect();
    managed.socket = null;
    managed.state = "disconnected";
    managed.reconnectAttempts = 0;

    console.log(`[WSManager] Disconnected: ${id}`);
  }

  /**
   * Disconnect all sockets
   */
  disconnectAll(): void {
    this.sockets.forEach((_, id) => this.disconnect(id));
    this.connectionQueue = [];
    console.log("[WSManager] All sockets disconnected");
  }

  /**
   * Get socket instance
   */
  getSocket(id: string): Socket | null {
    return this.sockets.get(id)?.socket || null;
  }

  /**
   * Get connection state
   */
  getState(id: string): ConnectionState {
    return this.sockets.get(id)?.state || "disconnected";
  }

  /**
   * Get all connection states
   */
  getAllStates(): Record<string, ConnectionState> {
    const states: Record<string, ConnectionState> = {};
    this.sockets.forEach((managed, id) => {
      states[id] = managed.state;
    });
    return states;
  }

  /**
   * Disable a socket (prevent auto-reconnect)
   */
  async disable(id: string): Promise<void> {
    const managed = this.sockets.get(id);
    if (managed) {
      this.disconnect(id);
      managed.state = "disabled";
      this.disabledNamespaces.add(managed.config.namespace);
      await this.saveDisabledSockets();
      console.log(`[WSManager] Disabled: ${id}`);
    }
  }

  /**
   * Enable a previously disabled socket
   */
  async enable(id: string): Promise<void> {
    const managed = this.sockets.get(id);
    if (managed && managed.state === "disabled") {
      managed.state = "disconnected";
      this.disabledNamespaces.delete(managed.config.namespace);
      await this.saveDisabledSockets();
      console.log(`[WSManager] Enabled: ${id}`);
    }
  }

  /**
   * Connect all registered sockets with priority
   */
  async connectAll(): Promise<void> {
    const sortedIds = Array.from(this.sockets.entries())
      .filter(([_, m]) => m.state !== "disabled")
      .sort((a, b) => {
        const priorityOrder = { critical: 0, normal: 1, low: 2 };
        return (
          priorityOrder[a[1].config.priority] -
          priorityOrder[b[1].config.priority]
        );
      })
      .map(([id]) => id);

    for (const id of sortedIds) {
      await this.connect(id);
      // Small delay between connections
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private async queueConnection(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.connectionQueue.push(id);

      const checkResult = () => {
        const managed = this.sockets.get(id);
        if (managed?.state === "connected") {
          resolve(true);
          return true;
        }
        if (managed?.state === "error" || managed?.state === "disabled") {
          resolve(false);
          return true;
        }
        return false;
      };

      // Process queue if not already processing
      if (!this.isProcessingQueue) {
        this.processConnectionQueue();
      }

      // Check periodically for result
      const interval = setInterval(() => {
        if (checkResult()) {
          clearInterval(interval);
        }
      }, 100);

      // Timeout after 30s
      setTimeout(() => {
        clearInterval(interval);
        resolve(this.sockets.get(id)?.state === "connected");
      }, 30000);
    });
  }

  private async processConnectionQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.connectionQueue.length > 0) {
      const id = this.connectionQueue.shift()!;
      await this.createConnection(id);
      // Small delay between connections
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    this.isProcessingQueue = false;
  }

  private async createConnection(id: string): Promise<void> {
    const managed = this.sockets.get(id);
    if (!managed || managed.state === "disabled") return;

    if (!this.isInitialized) {
      console.error("[WSManager] Not initialized");
      managed.state = "error";
      managed.lastError = new Error("WebSocket manager not initialized");
      return;
    }

    managed.state = "connecting";

    try {
      // Validate/refresh token if required
      if (managed.config.requiresAuth) {
        const tokenValid = await this.ensureValidToken();
        if (!tokenValid) {
          console.warn(`[WSManager] Token not valid for ${id}, skipping`);
          managed.state = "disconnected";
          return;
        }
      }

      // Get fresh token
      const token = await getAccessToken();
      const url = `${this.baseUrl}${managed.config.namespace}`;

      console.log(`[WSManager] Connecting to: ${url}`);

      const options: Partial<ManagerOptions & SocketOptions> = {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: false, // We handle reconnection ourselves
        timeout: 10000,
        forceNew: true,
      };

      if (token) {
        options.auth = { token };
        options.extraHeaders = { Authorization: `Bearer ${token}` };
      }

      const socket = io(url, options);

      // Setup event handlers
      this.setupSocketHandlers(id, socket);

      managed.socket = socket;
    } catch (error) {
      console.error(`[WSManager] Failed to create connection ${id}:`, error);
      managed.state = "error";
      managed.lastError = error as Error;
      this.scheduleReconnect(id);
    }
  }

  private setupSocketHandlers(id: string, socket: Socket): void {
    const managed = this.sockets.get(id);
    if (!managed) return;

    socket.on("connect", () => {
      console.log(`[WSManager] Connected: ${id}`);
      managed.state = "connected";
      managed.reconnectAttempts = 0;
      managed.lastConnected = Date.now();
      managed.config.onConnect?.();
    });

    socket.on("disconnect", (reason) => {
      console.log(`[WSManager] Disconnected: ${id} - ${reason}`);
      const wasDisabled = managed.state === "disabled";
      managed.state = "disconnected";
      managed.config.onDisconnect?.(reason);

      // Auto-reconnect unless intentionally disconnected or disabled
      if (reason !== "io client disconnect" && !wasDisabled) {
        this.scheduleReconnect(id);
      }
    });

    socket.on("connect_error", (error) => {
      console.error(`[WSManager] Connection error: ${id} -`, error.message);
      managed.state = "error";
      managed.lastError = error;
      managed.config.onError?.(error);

      // Handle specific errors
      if (
        error.message.includes("jwt expired") ||
        error.message.includes("Unauthorized")
      ) {
        // Token expired, try to refresh
        this.handleTokenExpired(id);
      } else {
        this.scheduleReconnect(id);
      }
    });
  }

  private async handleTokenExpired(id: string): Promise<void> {
    const managed = this.sockets.get(id);
    if (!managed) return;

    console.log(`[WSManager] Token expired for ${id}, refreshing...`);

    try {
      const refreshed = await doRefreshToken();
      if (refreshed) {
        // Reconnect with new token
        this.disconnect(id);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.createConnection(id);
      } else {
        console.warn(`[WSManager] Token refresh failed for ${id}`);
        managed.state = "disconnected";
      }
    } catch (error) {
      console.error(`[WSManager] Token refresh error for ${id}:`, error);
      managed.state = "error";
    }
  }

  private scheduleReconnect(id: string): void {
    const managed = this.sockets.get(id);
    if (!managed || managed.state === "disabled") return;

    if (managed.reconnectAttempts >= managed.config.maxReconnectAttempts) {
      console.log(`[WSManager] Max reconnect attempts reached for ${id}`);
      managed.state = "disconnected";
      return;
    }

    managed.reconnectAttempts++;
    managed.state = "reconnecting";

    const delay = Math.min(
      managed.config.reconnectInterval *
        Math.pow(2, managed.reconnectAttempts - 1),
      managed.config.maxReconnectInterval,
    );

    console.log(
      `[WSManager] Scheduling reconnect for ${id} in ${delay}ms (attempt ${managed.reconnectAttempts}/${managed.config.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      if (managed.state === "reconnecting") {
        this.createConnection(id);
      }
    }, delay);
  }

  private async ensureValidToken(): Promise<boolean> {
    try {
      const token = await getAccessToken();
      if (!token) return false;

      // Decode and check expiry
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();

      if (exp - now < TOKEN_REFRESH_BUFFER) {
        console.log("[WSManager] Token expiring soon, refreshing...");
        return !!(await doRefreshToken());
      }

      return true;
    } catch (error) {
      console.warn("[WSManager] Token validation failed:", error);
      return false;
    }
  }

  private async loadDisabledSockets(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(DISABLED_SOCKETS_KEY);
      if (data) {
        this.disabledNamespaces = new Set(JSON.parse(data));
      }
    } catch (error) {
      console.warn("[WSManager] Failed to load disabled sockets:", error);
    }
  }

  private async saveDisabledSockets(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        DISABLED_SOCKETS_KEY,
        JSON.stringify(Array.from(this.disabledNamespaces)),
      );
    } catch (error) {
      console.warn("[WSManager] Failed to save disabled sockets:", error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const wsManager = WebSocketManagerService.getInstance();
export default WebSocketManagerService;
